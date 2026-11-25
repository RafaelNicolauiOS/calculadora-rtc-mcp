#!/usr/bin/env node
// Copia para dentro do pacote os dados do site (data mais recente) e o WASM do DANFSe,
// com nomes fixos, para o bundle do Worker importá-los estaticamente.
// Pré-requisito: node scripts/export-site-data.mjs (raiz) já rodou.
import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const pkg = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const site = path.resolve(pkg, "../site");
const dataDir = path.join(site, "data");
if (!existsSync(path.join(dataDir, "meta.json"))) {
  console.error("site/data não existe. Rode antes: node scripts/export-site-data.mjs (na raiz, com as APIs no ar).");
  process.exit(1);
}
const meta = JSON.parse(readFileSync(path.join(dataDir, "meta.json"), "utf8"));
const d = meta.dataNomenclatura;

const arquivos = {
  "meta.json": "meta.json",
  "classificacoes.json": `classificacoes-${d}.json`,
  "situacoes.json": `situacoes-${d}.json`,
  "imposto-seletivo.json": `imposto-seletivo-${d}.json`,
  "vinculos.json": "vinculos-nomenclatura.json",
  "ncm.json": "ncm.json",
  "nbs.json": "nbs.json",
  "localidades.json": "localidades.json",
  "simples-atividades.json": "simples-atividades.json",
  "erros.json": "erros.json",
};
mkdirSync(path.join(pkg, "data"), { recursive: true });
for (const [destino, origem] of Object.entries(arquivos))
  copyFileSync(path.join(dataDir, origem), path.join(pkg, "data", destino));

const vendor = path.join(pkg, "danfse", "vendor");
mkdirSync(vendor, { recursive: true });
for (const f of ["danfse.wasm", "wasm_exec.js"]) {
  const origem = path.join(site, "wasm", f);
  if (existsSync(origem)) copyFileSync(origem, path.join(vendor, f));
  else console.warn(`aviso: ${origem} não existe; o Worker do DANFSe não vai compilar.`);
}
console.log(`dados de ${d} copiados para mcp-remote/data/`);
