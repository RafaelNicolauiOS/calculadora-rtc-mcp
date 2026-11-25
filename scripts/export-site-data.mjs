#!/usr/bin/env node
// Gera os dados estáticos do site (site/data/*.json) a partir das APIs oficiais rodando localmente
// e do banco SQLite gerado pelo build. As consultas passam pela própria API sempre que existe um
// endpoint para isso, para que o site mostre exatamente o que a Calculadora usa.
//
// Uso (com as APIs no ar, ver scripts/run.sh):
//   node scripts/export-site-data.mjs
// Variáveis: RTC_REGIME_URL (padrão http://localhost:8080/api), RTC_SIMPLES_URL (http://localhost:8082/api)
import { mkdir, writeFile, copyFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "site", "data");
const wasmOut = path.join(root, "site", "wasm");
const dbPath = path.join(root, "dist", "calculadora", "db", "calculadora-pro.db");
const REGIME = (process.env.RTC_REGIME_URL ?? "http://localhost:8080/api").replace(/\/+$/, "");
const SIMPLES = (process.env.RTC_SIMPLES_URL ?? "http://localhost:8082/api").replace(/\/+$/, "");

// Datas de referência: hoje (fuso de Brasília) e 01/01 do ano seguinte.
const hoje = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
const proximoAno = `${Number(hoje.slice(0, 4)) + 1}-01-01`;
const DATAS = [...new Set([hoje, proximoAno])];

async function get(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(60_000) });
  if (!res.ok) throw new Error(`GET ${url} -> HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return res.json();
}
const abertos = (p, data) => get(`${REGIME}/calculadora/dados-abertos${p}${data ? `${p.includes("?") ? "&" : "?"}data=${data}` : ""}`);

async function save(nome, dados) {
  const file = path.join(out, nome);
  await writeFile(file, JSON.stringify(dados));
  console.log(`  ${nome.padEnd(32)} ${(JSON.stringify(dados).length / 1024).toFixed(0).padStart(6)} KB`);
}

await mkdir(out, { recursive: true });
console.log(`Exportando dados para ${path.relative(root, out)}/ (datas: ${DATAS.join(", ")})`);

const versao = await abertos("/versao");
const versaoSimples = await get(`${SIMPLES}/versao`).catch(() => null);

// ---------------------------------------------------------------- por data
for (const data of DATAS) {
  const [classificacoes, situacoes, fundamentacoes, is, isClass] = await Promise.all([
    abertos("/classificacoes-tributarias/cbs-ibs", data),
    abertos("/situacoes-tributarias/cbs-ibs", data),
    abertos("/fundamentacoes-legais", data),
    abertos("/situacoes-tributarias/imposto-seletivo", data).catch(() => []),
    abertos("/classificacoes-tributarias/imposto-seletivo", data).catch(() => []),
  ]);

  // CST de cada cClassTrib, a partir da tabela de situações.
  const cstPorClasse = {};
  for (const s of situacoes) for (const c of s.classificacoesTributarias ?? []) cstPorClasse[c.codigo] = s.codigo;
  // Fundamentação legal de cada cClassTrib.
  const fundPorClasse = {};
  for (const f of fundamentacoes) (fundPorClasse[f.codigoClassificacaoTributaria] ??= []).push({
    texto: f.texto,
    textoCurto: f.textoCurto,
    referenciaNormativa: f.referenciaNormativa,
  });

  await save(`classificacoes-${data}.json`, classificacoes.map((c) => ({
    ...c,
    cst: cstPorClasse[c.codigo] ?? null,
    fundamentacoes: fundPorClasse[c.codigo] ?? [],
  })));
  await save(`situacoes-${data}.json`, situacoes.map(({ classificacoesTributarias, ...s }) => ({
    ...s,
    classificacoes: (classificacoesTributarias ?? []).map((c) => c.codigo),
  })));
  await save(`imposto-seletivo-${data}.json`, { situacoes: is, classificacoes: isClass });
}

// ---------------------------------------------------------------- nomenclaturas (data mais recente)
const dataNom = DATAS.at(-1);
const [ncm, nbs] = await Promise.all([abertos("/ncm/vigentes", dataNom), abertos("/nbs/lista", dataNom)]);
await save("ncm.json", ncm.map((n) => [n.ncm, n.descricao]));
await save("nbs.json", nbs.map((n) => [n.nbs ?? n.codigo, n.descricao]));

// ---------------------------------------------------------------- tabelas sem endpoint de listagem (SQLite)
const db = new DatabaseSync(dbPath, { readOnly: true });
const vigente = (prefixo, data) =>
  `${prefixo}_INICIO_VIGENCIA <= '${data}' AND (${prefixo}_FIM_VIGENCIA IS NULL OR ${prefixo}_FIM_VIGENCIA >= '${data}')`;

// NCM/NBS vinculados a cada cClassTrib (códigos podem ser prefixos: capítulo, posição etc.).
// IBS/CBS e Imposto Seletivo reutilizam os mesmos códigos de cClassTrib (ex.: 000001 existe nos dois),
// então os vínculos são separados pelo tributo da situação tributária da classificação.
const vinculos = {};
const vinculosIs = {};
const ehIs = `EXISTS (SELECT 1 FROM TRIBUTO_SITUACAO_TRIBUTARIA x JOIN TRIBUTO t ON t.TBTO_ID = x.TRST_TBTO_ID
                      WHERE x.TRST_SITR_ID = c.CLTR_SITR_ID AND t.TBTO_SIGLA = 'IS') is_is`;
const destino = (r) => (r.is_is ? vinculosIs : vinculos);
for (const r of db
  .prepare(
    `SELECT c.CLTR_CD cls, n.NCMA_NCM_CD cod, ${ehIs},
            (SELECT group_concat(e.ENCM_NCM_CD) FROM EXCECAO_NCM_APLICAVEL e WHERE e.ENCM_NCMA_ID = n.NCMA_ID AND ${vigente("e.ENCM", dataNom)}) exc
       FROM NCM_APLICAVEL n JOIN CLASSIFICACAO_TRIBUTARIA c ON c.CLTR_ID = n.NCMA_CLTR_ID
      WHERE ${vigente("n.NCMA", dataNom)} ORDER BY 1, 2`,
  )
  .all()) {
  ((destino(r)[r.cls] ??= { ncm: [], nbs: [] }).ncm).push(r.exc ? [r.cod, r.exc.split(",")] : [r.cod]);
}
for (const r of db
  .prepare(
    `SELECT c.CLTR_CD cls, n.NBSA_NBS_CD cod, ${ehIs}
       FROM NBS_APLICAVEL n JOIN CLASSIFICACAO_TRIBUTARIA c ON c.CLTR_ID = n.NBSA_CLTR_ID
      WHERE ${vigente("n.NBSA", dataNom)} ORDER BY 1, 2`,
  )
  .all()) {
  ((destino(r)[r.cls] ??= { ncm: [], nbs: [] }).nbs).push([r.cod]);
}
await save("vinculos-nomenclatura.json", { data: dataNom, vinculos, vinculosIs });

const ufs = db.prepare("SELECT UF_CD cod, UF_SIGLA sigla, UF_NOME nome FROM UF ORDER BY UF_SIGLA").all();
const municipios = db
  .prepare(`SELECT MUNI_CD cod, MUNI_UF_CD uf, MUNI_NOME nome FROM MUNICIPIO WHERE ${vigente("MUNI", dataNom)} ORDER BY MUNI_NOME`)
  .all();
await save("localidades.json", {
  ufs: ufs.map((u) => [u.cod, u.sigla, u.nome]),
  municipios: municipios.map((m) => [m.cod, m.uf, m.nome]),
});
db.close();

// ---------------------------------------------------------------- Simples Nacional
const atividades = await get(`${SIMPLES}/calculadora/simples-nacional/atividades?data=${dataNom}`).catch(() => []);
await save("simples-atividades.json", atividades);

await save("meta.json", {
  geradoEm: new Date().toISOString(),
  datas: DATAS,
  dataNomenclatura: dataNom,
  regimeRegular: versao,
  simplesNacional: versaoSimples,
});

// ---------------------------------------------------------------- WASM do DANFSe
await mkdir(wasmOut, { recursive: true });
for (const f of ["danfse.wasm", "wasm_exec.js"]) {
  const src = path.join(root, "dist", f);
  if (existsSync(src)) {
    await copyFile(src, path.join(wasmOut, f));
    console.log(`  wasm/${f}`);
  } else console.warn(`  AVISO: ${path.relative(root, src)} não encontrado (rode scripts/build.sh)`);
}
// ---------------------------------------------------------------- NFS-e fictícia para o botão de exemplo
await mkdir(path.join(root, "site", "examples"), { recursive: true });
await copyFile(path.join(root, "examples", "nfse-ficticia.xml"), path.join(root, "site", "examples", "nfse-ficticia.xml"));
console.log("  examples/nfse-ficticia.xml");
console.log("Pronto.");
