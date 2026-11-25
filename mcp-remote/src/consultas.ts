// Consultas puras sobre os dados embutidos. As ferramentas MCP (server.ts) só formatam o resultado.
import * as dados from "./dados";
import { consolidarAnexo, validarNomenclatura } from "./nomenclatura";
import { contemTodos } from "./texto";
import type { AtividadeSimples, Classificacao, ErroCatalogo, TipoNomenclatura, Tributo } from "./tipos";

export const LIMITE_BUSCA = 50;
export const LIMITE_MUNICIPIOS = 20;
export const AVISO =
  "Projeto não oficial, baseado nos dados abertos da Calculadora RTC (Receita Federal/Serpro). " +
  "Não substitui orientação profissional nem os sistemas oficiais de autorização de documentos fiscais.";

export interface Resumo {
  codigo: string;
  cst: string | null;
  descricao: string;
  reducao: string;
  nomenclatura: string | null;
  dfe: string[];
}

const pct = (n?: number) => `${Number(n ?? 0).toLocaleString("pt-BR")}%`;

export function resumir(c: Classificacao): Resumo {
  return {
    codigo: c.codigo,
    cst: c.cst ?? null,
    descricao: c.descricao.trim(),
    reducao: c.possuiPercentualReducao
      ? `CBS ${pct(c.percentualReducaoCbs)} · IBS UF ${pct(c.percentualReducaoIbsUf)} · IBS Mun ${pct(c.percentualReducaoIbsMun)}`
      : "sem redução",
    nomenclatura: c.nomenclatura ?? null,
    dfe: (c.tiposDfeClassificacao ?? []).map((d) => `${d.sigla.trim()} (${d.tipo})`),
  };
}

export function detalharClassificacao(t: Tributo, codigo: string): object | null {
  const c = dados.classificacao(t, codigo);
  if (!c) return null;
  const a = dados.anexo(t, codigo);
  return {
    ...c,
    tributo: t,
    anexo: a ? { ncm: consolidarAnexo(a.ncm), nbs: consolidarAnexo(a.nbs) } : null,
    base: `${dados.meta.regimeRegular.versaoDb} (vigência consultada em ${dados.meta.dataNomenclatura})`,
  };
}

function aceitamComAnexo(t: Tributo, tipo: TipoNomenclatura, codigo: string): Classificacao[] {
  return dados
    .anexos(t)
    .filter(([, a]) => a[tipo].length > 0 && validarNomenclatura(a, tipo, codigo).aceito)
    .map(([cod]) => dados.classificacao(t, cod))
    .filter((c): c is Classificacao => Boolean(c));
}

export function buscarClassificacoes(f: { tributo: Tributo; cst?: string; texto?: string; ncm?: string; nbs?: string }): {
  total: number;
  itens: Resumo[];
  nota?: string;
} {
  let achadas: Classificacao[];
  let nota: string | undefined;
  if (f.cst) {
    const sit = f.tributo === "cbs-ibs" ? dados.situacoes().find((s) => s.codigo === f.cst) : undefined;
    achadas = sit
      ? sit.classificacoes.map((c) => dados.classificacao("cbs-ibs", c)).filter((c): c is Classificacao => Boolean(c))
      : dados.classificacoes(f.tributo).filter((c) => c.codigo.startsWith(f.cst!));
  } else if (f.texto) {
    achadas = dados
      .classificacoes(f.tributo)
      .filter((c) =>
        contemTodos(
          // A fundamentação entra na busca: "cesta básica" só aparece no texto do art. 125, não na descrição da 200003.
          [c.descricao, c.descricaoTratamentoTributario, ...(c.fundamentacoes ?? []).map((x) => x.texto)].join(" "),
          f.texto!,
        ),
      );
  } else {
    const tipo: TipoNomenclatura = f.ncm ? "ncm" : "nbs";
    achadas = aceitamComAnexo(f.tributo, tipo, (f.ncm ?? f.nbs)!);
    nota =
      "Lista só as classificações com anexo que aceitam o código. Classificações sem anexo (como 000001) " +
      "aceitam qualquer código vigente e não aparecem aqui.";
  }
  return { total: achadas.length, itens: achadas.slice(0, LIMITE_BUSCA).map(resumir), ...(nota ? { nota } : {}) };
}

export function consultarNomenclatura(tipo: TipoNomenclatura, codigo: string) {
  return {
    codigo,
    descricao: dados.descricaoNomenclatura(tipo, codigo) ?? null,
    classificacoesComAnexo: aceitamComAnexo("cbs-ibs", tipo, codigo).map(resumir),
  };
}

export function atividade(codigo?: string): AtividadeSimples | AtividadeSimples[] | null {
  const todas = dados.atividadesSimples();
  if (codigo === undefined) return todas;
  return todas.find((a) => a.codigo === codigo) ?? null;
}

export function explicarErro(codigo: string): ErroCatalogo | null {
  const c = codigo.trim().toUpperCase();
  return dados.erros().find((e) => e.codigo === c) ?? null;
}

export function buscarMunicipio(f: { codigo?: number; nome?: string; uf?: string }) {
  const uf = f.uf?.toUpperCase();
  return dados
    .municipios()
    .filter((m) => (f.codigo ? m.codigo === f.codigo : contemTodos(m.nome, f.nome ?? "")) && (!uf || m.uf === uf))
    .slice(0, LIMITE_MUNICIPIOS);
}

export function status() {
  return {
    servico: "calculadora-rtc (MCP remoto de consulta)",
    base: dados.meta.regimeRegular,
    vigenciaConsultada: dados.meta.dataNomenclatura,
    dadosGeradosEm: dados.meta.geradoEm,
    naoIncluido: "Cálculo de CBS/IBS/IS e geração/validação de XML: use o MCP local com as APIs oficiais.",
    aviso: AVISO,
  };
}
