// Extrai os catálogos de erro da Calculadora RTC do código Java oficial em upstream/.
// REG/CAL/VAL: ProblemType.java (regime regular). VSN: CodigoValidacaoSimples.java (Simples Nacional).
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

function lerJava(root, dir, nome) {
  const walk = (d) =>
    readdirSync(d, { withFileTypes: true }).flatMap((e) =>
      e.isDirectory() ? walk(path.join(d, e.name)) : e.name === nome ? [path.join(d, e.name)] : [],
    );
  // Pode haver mais de um arquivo com o mesmo nome; fica o que contém o catálogo.
  const f = walk(path.join(root, "upstream", dir, "src/main")).find((p) =>
    /"(REG|VSN)-\d{3}"/.test(readFileSync(p, "utf8")),
  );
  if (!f) throw new Error(`${nome} com catálogo de erros não encontrado em upstream/${dir}`);
  return readFileSync(f, "utf8");
}

const STR = '"((?:[^"\\\\]|\\\\.)*)"';
const S = String.raw`\s*`;
// Literais Java podem ser concatenadas com "+" (ex.: descrições longas do VSN).
const CONCAT = `(?:${S}\\+${S}${STR})*`;

export function extrairErros(root) {
  const erros = [];
  // NOME(Excecao.class, "Título", "slug", new CodigoErro("REG-001", campo, EstadoItemEnum.X), "Descrição")
  const reProblem = new RegExp(
    `${STR}${S},${S}${STR}${S},${S}new CodigoErro\\(${S}"([A-Z]{3}-\\d{3})"${S},${S}(?:"([^"]*)"|null)${S},${S}EstadoItemEnum\\.(\\w+)\\)${S},${S}${STR}`,
    "g",
  );
  for (const m of lerJava(root, "regime-regular", "ProblemType.java").matchAll(reProblem))
    erros.push({ codigo: m[3], titulo: m[1], campo: m[4] ?? "", estado: m[5], descricao: m[6] });

  // NOME("VSN-001", "Título", "Descrição" [+ "Descrição em outra linha"])
  const reVsn = new RegExp(`"(VSN-\\d{3})"${S},${S}${STR}${S},${S}(${STR}${CONCAT})`, "g");
  const reLiteral = new RegExp(STR, "g");
  for (const m of lerJava(root, "simples-nacional", "CodigoValidacaoSimples.java").matchAll(reVsn)) {
    const descricao = [...m[3].matchAll(reLiteral)].map((l) => l[1]).join("");
    erros.push({ codigo: m[1], titulo: m[2], campo: "", estado: "", descricao });
  }

  return erros.sort((a, b) => a.codigo.localeCompare(b.codigo));
}
