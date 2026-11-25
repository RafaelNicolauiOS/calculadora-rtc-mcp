// Compara a regra local de NCM/NBS com o endpoint oficial da Calculadora para cada classificação com anexo.
// Só roda com RTC_PARIDADE_URL (ex.: http://localhost:8080/api), como no CI depois de subir as APIs.
import { describe, expect, it } from "vitest";
import { anexos, meta } from "../src/dados";
import { TAMANHO, validarNomenclatura } from "../src/nomenclatura";
import type { TipoNomenclatura } from "../src/tipos";

const BASE = process.env.RTC_PARIDADE_URL;
const completar = (codigo: string, tipo: TipoNomenclatura) => codigo.padEnd(TAMANHO[tipo], "0").slice(0, TAMANHO[tipo]);

describe.skipIf(!BASE)("paridade com a API oficial", () => {
  const casos: Array<{ cls: string; tipo: TipoNomenclatura; codigo: string }> = [];
  for (const [cls, a] of anexos("cbs-ibs")) {
    for (const tipo of ["ncm", "nbs"] as const) {
      if (!a[tipo].length) continue;
      const codigos = new Set<string>([completar("9".repeat(TAMANHO[tipo]), tipo)]);
      for (const [prefixo, exc] of a[tipo]) {
        codigos.add(completar(prefixo, tipo));
        for (const x of exc ?? []) codigos.add(completar(x, tipo));
      }
      for (const codigo of codigos) casos.push({ cls, tipo, codigo });
    }
  }

  it(`${casos.length} casos batem com /${"{ncm,nbs}"}-aplicavel`, async () => {
    const divergencias: string[] = [];
    for (const { cls, tipo, codigo } of casos) {
      const url = `${BASE}/calculadora/dados-abertos/classificacoes-tributarias/${tipo}-aplicavel?cClassTrib=${cls}&${tipo}=${codigo}&dataOcorrenciaFatoGerador=${meta.dataNomenclatura}`;
      const oficial = ((await (await fetch(url)).json()) as { valido: boolean }).valido;
      const local = validarNomenclatura(anexos("cbs-ibs").find(([c]) => c === cls)![1], tipo, codigo).aceito;
      if (oficial !== local) divergencias.push(`${cls} ${tipo} ${codigo}: oficial=${oficial} local=${local}`);
    }
    expect(divergencias).toEqual([]);
  }, 300_000);
});
