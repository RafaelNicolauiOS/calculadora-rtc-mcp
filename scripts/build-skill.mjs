#!/usr/bin/env node
// Gera os arquivos de referência da skill (skill/reforma-tributaria-ibs-cbs/reference/*.md)
// a partir de site/data/*.json e dos catálogos de erro do código oficial em upstream/.
// Rode depois de scripts/export-site-data.mjs:  node scripts/build-skill.mjs
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const data = (f) => JSON.parse(readFileSync(path.join(root, "site/data", f), "utf8"));
const out = path.join(root, "skill/reforma-tributaria-ibs-cbs/reference");
mkdirSync(out, { recursive: true });

const meta = data("meta.json");
const DATA = meta.dataNomenclatura; // data de vigência usada na exportação
const classificacoes = data(`classificacoes-${DATA}.json`);
const situacoes = data(`situacoes-${DATA}.json`);
const is = data(`imposto-seletivo-${DATA}.json`);
const { vinculos, vinculosIs = {} } = data("vinculos-nomenclatura.json");
// O anexo repete o vínculo genérico uma vez por exceção (ex.: 0207 exceto A; 0207 exceto B).
// Pela regra da Calculadora (NcmAplicavelService), um NCM coberto por qualquer exceção é rejeitado,
// salvo se outro vínculo do mesmo prefixo não tiver exceção. Junta tudo numa entrada por prefixo.
const juntaVinculos = (lista = []) => {
  const m = new Map();
  for (const [pref, exc] of lista) {
    const atual = m.get(pref);
    if (!exc?.length) m.set(pref, null); // vínculo sem exceção: aceita o prefixo inteiro
    else if (atual !== null) m.set(pref, new Set([...(atual ?? []), ...exc]));
  }
  return [...m].map(([pref, exc]) => (exc?.size ? `${pref} (exceto ${[...exc].sort().join(", ")})` : pref));
};
const fmtLista = (lista) => juntaVinculos(lista).join(", ");
const atividades = data("simples-atividades.json");

const cabecalho = (titulo) =>
  `# ${titulo}\n\n> Gerado de ${meta.regimeRegular.descricaoVersaoDb} (base ${meta.regimeRegular.versaoDb}, ` +
  `calculadora ${meta.regimeRegular.versaoApp}), vigência consultada em ${DATA}. ` +
  `Fonte: dados abertos da Calculadora RTC (Receita Federal, licença MIT).\n\n`;

const pct = (n) => `${Number(n).toLocaleString("pt-BR")}%`;
const limpa = (s = "") => String(s).replace(/\\n/g, " ").replace(/\s+/g, " ").trim();
const corta = (s, n) => (s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s);

// ------------------------------------------------------------------ CST e cClassTrib
{
  const porCodigo = new Map(classificacoes.map((c) => [c.codigo, c]));
  let md = cabecalho("CST e classificações tributárias (cClassTrib) de IBS e CBS");
  md +=
    "Cada cClassTrib pertence a um único CST (os 3 primeiros dígitos). Use o campo **Nomenclatura** " +
    "para saber se o item exige NCM (bens), NBS (serviços) ou qualquer um, e **DF-e** para conferir se a " +
    "classificação pode ser usada no documento (erro REG-029/VSN quando não pode). Os NCM/NBS aceitos por " +
    "classificação estão em `vinculos-ncm-nbs.md`.\n\n## Índice de CST\n\n| CST | Descrição | Classificações |\n|---|---|---|\n";
  for (const s of situacoes) md += `| ${s.codigo} | ${s.descricao} | ${s.classificacoes.length} |\n`;
  for (const s of situacoes) {
    md += `\n## CST ${s.codigo} — ${s.descricao}\n`;
    for (const cod of s.classificacoes) {
      const c = porCodigo.get(cod);
      if (!c) continue;
      const reducao = c.possuiPercentualReducao
        ? `CBS ${pct(c.percentualReducaoCbs)} · IBS UF ${pct(c.percentualReducaoIbsUf)} · IBS Mun ${pct(c.percentualReducaoIbsMun)}`
        : "sem redução";
      const creditos = [
        c.indicaApropriacaoCreditoAdquirenteCbs && "adquirente apropria crédito de CBS",
        c.indicaApropriacaoCreditoAdquirenteIbs && "adquirente apropria crédito de IBS",
        c.indicaCreditoPresumidoFornecedor && "crédito presumido do fornecedor",
        c.indicaCreditoPresumidoAdquirente && "crédito presumido do adquirente",
      ].filter(Boolean);
      const flags = [
        c.exigeGrupoDesoneracao && "exige grupo de desoneração",
        c.incompativelComSuspensao && "incompatível com suspensão",
      ].filter(Boolean);
      const dfe = (c.tiposDfeClassificacao ?? []).map((d) => `${d.sigla.trim()} (${d.tipo})`).join(", ") || "—";
      const fund = (c.fundamentacoes ?? [])
        .map((f) => `${limpa(f.textoCurto)}: ${corta(limpa(f.texto), 280)}`)
        .join(" | ");
      md += `\n### ${c.codigo} — ${limpa(c.descricao)}\n`;
      md += `- Tratamento: ${limpa(c.descricaoTratamentoTributario)} · Alíquota: ${c.tipoAliquota} · Redução: ${reducao}\n`;
      md += `- Nomenclatura: ${c.nomenclatura ?? "—"} · Crédito na operação antecedente: ${c.creditoOperacaoAntecedente ?? "—"}\n`;
      if (creditos.length || flags.length) md += `- ${[...creditos, ...flags].join(" · ")}\n`;
      md += `- DF-e: ${dfe}\n`;
      if (fund) md += `- Fundamentação (LC 214/2025): ${fund}\n`;
    }
  }
  writeFileSync(path.join(out, "cst-cclasstrib.md"), md);
}

// ------------------------------------------------------------------ vínculos NCM/NBS
{
  let md = cabecalho("NCM e NBS aceitos por classificação tributária");
  md +=
    "Classificações que só aceitam uma lista fechada de códigos. Cada entrada é um **prefixo**: o NCM/NBS do " +
    "item é aceito se começar por ele, salvo as exceções entre parênteses. Classificações que não aparecem aqui " +
    "aceitam qualquer NCM/NBS vigente compatível com o campo Nomenclatura. Um código fora da lista gera " +
    "REG-011/REG-012 (regime regular) ou VSN-047/VSN-048 (Simples).\n";
  for (const [cod, v] of Object.entries(vinculos).sort()) {
    const desc = classificacoes.find((c) => c.codigo === cod)?.descricao;
    md += `\n## ${cod}${desc ? ` — ${limpa(desc)}` : ""}\n`;
    if (v.ncm?.length) md += `- NCM: ${fmtLista(v.ncm)}\n`;
    if (v.nbs?.length) md += `- NBS: ${fmtLista(v.nbs)}\n`;
  }
  writeFileSync(path.join(out, "vinculos-ncm-nbs.md"), md);
}

// ------------------------------------------------------------------ Imposto Seletivo
{
  let md = cabecalho("Imposto Seletivo (IS): CST e classificações");
  md += "O IS começa a valer em 2027. Antes disso a tabela de IS está vazia e o grupo `impostoSeletivo` não deve ser informado (REG-014).\n\n";
  md += "## CST do IS\n\n| CST | Descrição |\n|---|---|\n";
  for (const s of is.situacoes) md += `| ${s.codigo} | ${s.descricao} |\n`;
  md += "\n## Classificações do IS\n\n| cClassTrib | Descrição | Tratamento | Alíquota | Nomenclatura |\n|---|---|---|---|---|\n";
  for (const c of is.classificacoes)
    md += `| ${c.codigo} | ${limpa(c.descricao)} | ${limpa(c.descricaoTratamentoTributario)} | ${c.tipoAliquota} | ${c.nomenclatura ?? "—"} |\n`;
  const vIs = Object.entries(vinculosIs).sort();
  if (vIs.length) {
    md +=
      "\n## NCM/NBS sujeitos ao IS por classificação\n\nMesma leitura de `vinculos-ncm-nbs.md`: prefixos, com exceções entre parênteses. " +
      "Um item cujo NCM/NBS aparece aqui deve levar o grupo `impostoSeletivo` (REG-013 se faltar; REG-032 se o tpDoc não admitir IS).\n";
    for (const [cod, v] of vIs) {
      const desc = is.classificacoes.find((c) => c.codigo === cod)?.descricao;
      md += `\n### IS ${cod}${desc ? ` — ${limpa(desc)}` : ""}\n`;
      if (v.ncm?.length) md += `- NCM: ${fmtLista(v.ncm)}\n`;
      if (v.nbs?.length) md += `- NBS: ${fmtLista(v.nbs)}\n`;
    }
  }
  writeFileSync(path.join(out, "imposto-seletivo.md"), md);
}

// ------------------------------------------------------------------ Simples Nacional
{
  let md = cabecalho("Atividades do Simples Nacional (cAtivSN)");
  md +=
    "A Calculadora não calcula a alíquota efetiva do Simples (isso é do PGDAS-D). Ela usa os percentuais " +
    "pCBSSN/pIBSSN do anexo correspondente à atividade. Atividades sujeitas ao Fator R mudam de anexo conforme ele.\n\n" +
    "| cAtivSN | Atividade | Anexo | Fator R | Documentos (tpDoc) |\n|---|---|---|---|---|\n";
  for (const a of atividades) {
    const fator = a.sujeitaFatorR ? `sim (${a.anexoSemFatorR} sem / ${a.anexoComFatorR} com)` : "não";
    md += `| ${a.codigo} | ${limpa(a.descricao)} | ${a.rotuloAnexo} | ${fator} | ${(a.tpDocsAdmissiveis ?? []).join(", ")} |\n`;
  }
  writeFileSync(path.join(out, "simples-atividades.md"), md);
}

// ------------------------------------------------------------------ códigos de erro
{
  const java = (dir, nome) => {
    const walk = (d) =>
      readdirSync(d, { withFileTypes: true }).flatMap((e) =>
        e.isDirectory() ? walk(path.join(d, e.name)) : e.name === nome ? [path.join(d, e.name)] : [],
      );
    // Pode haver mais de um arquivo com o mesmo nome; fica o que contém o catálogo.
    const f = walk(path.join(root, "upstream", dir, "src/main")).find((p) =>
      /"(REG|VSN)-\d{3}"/.test(readFileSync(p, "utf8")),
    );
    if (!f) throw new Error(`${nome} não encontrado em upstream/${dir}`);
    return readFileSync(f, "utf8");
  };
  const str = '"((?:[^"\\\\]|\\\\.)*)"';
  const s = String.raw`\s*`;

  // ProblemType.java: NOME(Excecao.class, "Título", "slug", new CodigoErro("REG-001", campo, Estado.X), "Descrição")
  const reg = [];
  const reProblem = new RegExp(
    `${str}${s},${s}${str}${s},${s}new CodigoErro\\(${s}"([A-Z]{3}-\\d{3})"${s},${s}(?:"([^"]*)"|null)${s},${s}EstadoItemEnum\\.(\\w+)\\)${s},${s}${str}`,
    "g",
  );
  for (const m of java("regime-regular", "ProblemType.java").matchAll(reProblem))
    reg.push({ codigo: m[3], titulo: m[1], campo: m[4] ?? "", estado: m[5], descricao: m[6] });

  // CodigoValidacaoSimples.java: NOME("VSN-001", "Título", "Descrição")
  const vsn = [];
  const reVsn = new RegExp(`"(VSN-\\d{3})"${s},${s}${str}${s},${s}${str}`, "g");
  for (const m of java("simples-nacional", "CodigoValidacaoSimples.java").matchAll(reVsn))
    vsn.push({ codigo: m[1], titulo: m[2], descricao: m[3] });

  const ordena = (a, b) => a.codigo.localeCompare(b.codigo);
  let md = cabecalho("Códigos de erro da Calculadora RTC");
  md +=
    "`estadoItem` diz o que fazer: **INCONSISTENCIA_ENTRADA** = corrigir os dados enviados; " +
    "**NAO_IMPLEMENTADO** = a classificação ainda não é calculada pela Calculadora (não é erro do usuário); " +
    "**FALHA_TECNICA** = problema na base ou na Calculadora, não nos dados.\n";
  for (const pref of ["REG", "CAL", "VAL"]) {
    const lista = reg.filter((e) => e.codigo.startsWith(pref)).sort(ordena);
    if (!lista.length) continue;
    const nome = { REG: "regras de entrada", CAL: "cálculo", VAL: "validação" }[pref];
    md += `\n## ${pref} — ${nome} (regime regular)\n\n| Código | Erro | Campo | Estado | Significado |\n|---|---|---|---|---|\n`;
    for (const e of lista) md += `| ${e.codigo} | ${e.titulo} | ${e.campo} | ${e.estado} | ${e.descricao} |\n`;
  }
  md += `\n## VSN — Simples Nacional\n\n| Código | Erro | Significado |\n|---|---|---|\n`;
  for (const e of vsn.sort(ordena)) md += `| ${e.codigo} | ${e.titulo} | ${e.descricao} |\n`;
  writeFileSync(path.join(out, "erros.md"), md);
  console.log(`erros: ${reg.length} do regime regular, ${vsn.length} do Simples`);
}

console.log(`referências geradas em ${path.relative(root, out)}`);
