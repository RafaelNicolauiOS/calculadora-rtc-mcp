# MCP remoto de consulta: plano de implementação

> **Para agentes:** SUB-SKILL OBRIGATÓRIA: use superpowers:subagent-driven-development (recomendado) ou superpowers:executing-plans para executar este plano tarefa por tarefa. Os passos usam checkbox (`- [ ]`) para acompanhamento.

**Objetivo:** publicar no Cloudflare Workers um MCP aberto que responde consultas da Calculadora RTC (classificações, anexos NCM/NBS, IS, Simples, erros, municípios) e gera o DANFSe, sem depender das APIs Java.

**Arquitetura:**
- Pacote novo `mcp-remote/` com dois Workers:
  - `calculadora-rtc-mcp`: Streamable HTTP sem estado, com limite por IP, R2 para os PDFs e um cron de limpeza;
  - `calculadora-rtc-danfse`: roda o WASM oficial e só é acessível por service binding.
- A lógica de consulta são funções puras sobre os JSON que o CI já gera em `site/data/`. Elas são testadas em Node com Vitest.
- O Worker é testado de ponta a ponta com `wrangler dev` e um script de fumaça.

**Stack:** TypeScript, `@modelcontextprotocol/sdk` 1.32.2, `zod` 4.6.7, Wrangler 4, Vitest 5, Cloudflare Workers (Rate Limiting, R2, service bindings, cron).

**Spec:** `docs/superpowers/specs/2026-11-24-mcp-remoto-design.md`

## Restrições globais

- Os nomes das ferramentas seguem o MCP local: `rtc_status`, `rtc_consultar_classificacao`, `rtc_buscar_classificacoes`, `rtc_validar_nomenclatura`, `rtc_consultar_nomenclatura`, `rtc_atividades_simples`, `rtc_explicar_erro`, `rtc_municipio`, `rtc_gerar_danfse`.
- Textos para o usuário em português do Brasil. Erros de entrada voltam como `isError: true`.
- `mcp-server/` não é alterado.
- Limites:
  - 60 requisições por minuto por IP (`CF-Connecting-IP`), com HTTP 429 e `Retry-After` acima disso;
  - corpo de `/mcp` até 2 MB (HTTP 413);
  - XML do DANFSe até 1 MB.
- PDF do DANFSe:
  - fica no R2 com chave de 32 caracteres hexadecimais aleatórios;
  - é servido em `/pdf/<id>` por no máximo 1 hora (3.600.000 ms);
  - um cron horário apaga os objetos mais antigos que isso.
- O XML do DANFSe nunca é gravado nem registrado em log.
- Listas: `rtc_buscar_classificacoes` devolve no máximo 50 itens e `rtc_municipio` no máximo 20.
- **Desvio consciente do spec:** os testes unitários rodam no Vitest em Node, não com `@cloudflare/vitest-pool-workers`, porque a lógica é pura. O runtime do Worker é coberto pelo script de fumaça com `wrangler dev`. A Tarefa 9 atualiza o spec para registrar isso.
- O deploy real não faz parte deste plano. O CI só roda `wrangler deploy --dry-run`.

## Mapa de arquivos

| Arquivo | Responsabilidade |
|---|---|
| `scripts/lib/erros.mjs` | Extrai os catálogos de erro REG/CAL/VAL/VSN do código Java em `upstream/` |
| `scripts/lib/erros.test.mjs` | Teste (node:test) da extração |
| `scripts/export-site-data.mjs` | (alterado) lê exceções de NBS e grava `site/data/erros.json` |
| `scripts/build-skill.mjs` | (alterado) usa `scripts/lib/erros.mjs` |
| `mcp-remote/package.json`, `tsconfig.json`, `vitest.config.ts` | Pacote do Worker |
| `mcp-remote/scripts/preparar.mjs` | Copia `site/data` (data mais recente) e o WASM para dentro do pacote |
| `mcp-remote/src/tipos.ts` | Tipos dos dados |
| `mcp-remote/src/dados.ts` | Carrega os JSON embutidos e monta índices |
| `mcp-remote/src/nomenclatura.ts` | Regra de aceitação NCM/NBS contra o anexo |
| `mcp-remote/src/texto.ts` | Normalização e busca sem acentos |
| `mcp-remote/src/consultas.ts` | Consultas puras usadas pelas ferramentas |
| `mcp-remote/src/server.ts` | Cria o `McpServer` e registra as ferramentas |
| `mcp-remote/src/pdf.ts` | Grava, lê e limpa PDFs no R2 |
| `mcp-remote/src/paginas.ts` | HTML de `/` e `/privacidade` |
| `mcp-remote/src/index.ts` | Worker: rotas, limite, `/mcp`, `/pdf`, cron |
| `mcp-remote/wrangler.toml` | Config do Worker MCP |
| `mcp-remote/danfse/src/index.ts`, `mcp-remote/danfse/wrangler.toml` | Worker do DANFSe |
| `mcp-remote/test/*.test.ts` | Testes unitários |
| `mcp-remote/test/paridade.test.ts` | Paridade com a API oficial (só roda com `RTC_PARIDADE_URL`) |
| `mcp-remote/test/fumaca.mjs` | Fumaça de ponta a ponta contra `wrangler dev` |

---

### Tarefa 1: catálogo de erros compartilhado, exceções de NBS e `erros.json`

**Arquivos:**
- Criar: `scripts/lib/erros.mjs`, `scripts/lib/erros.test.mjs`
- Alterar: `scripts/build-skill.mjs` (bloco "códigos de erro"), `scripts/export-site-data.mjs` (consulta de NBS e gravação de `erros.json`)

**Interfaces:**
- Produz: `extrairErros(root: string): Array<{codigo: string, titulo: string, campo: string, estado: string, descricao: string}>`, ordenado por `codigo`. Os itens VSN têm `campo: ""` e `estado: ""`.
- Produz: `site/data/erros.json`, com o mesmo array.
- Produz: entradas `nbs` de `vinculos`/`vinculosIs` no formato `[codigo]` ou `[codigo, [excecoes...]]`, igual ao NCM.

- [ ] **Passo 1: escrever o teste que falha**

`scripts/lib/erros.test.mjs`:
```js
import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { extrairErros } from "./erros.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

test("extrai REG, CAL e VSN do código oficial", () => {
  const erros = extrairErros(root);
  const reg011 = erros.find((e) => e.codigo === "REG-011");
  assert.equal(reg011.titulo, "NCM não vinculada");
  assert.equal(reg011.campo, "ncm");
  assert.equal(reg011.estado, "INCONSISTENCIA_ENTRADA");
  assert.ok(erros.some((e) => e.codigo === "CAL-001"));
  const vsn047 = erros.find((e) => e.codigo === "VSN-047");
  assert.equal(vsn047.titulo, "NCM não aplicável");
  assert.ok(erros.filter((e) => e.codigo.startsWith("REG")).length >= 35);
  assert.ok(erros.filter((e) => e.codigo.startsWith("VSN")).length >= 50);
  const codigos = erros.map((e) => e.codigo);
  assert.deepEqual(codigos, [...codigos].sort());
});
```

- [ ] **Passo 2: rodar o teste e ver que ele falha**

Rodar: `node --test scripts/lib/erros.test.mjs`
Esperado: FAIL com `Cannot find module '.../scripts/lib/erros.mjs'`.

- [ ] **Passo 3: implementar `scripts/lib/erros.mjs`**

```js
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

export function extrairErros(root) {
  const erros = [];
  // NOME(Excecao.class, "Título", "slug", new CodigoErro("REG-001", campo, EstadoItemEnum.X), "Descrição")
  const reProblem = new RegExp(
    `${STR}${S},${S}${STR}${S},${S}new CodigoErro\\(${S}"([A-Z]{3}-\\d{3})"${S},${S}(?:"([^"]*)"|null)${S},${S}EstadoItemEnum\\.(\\w+)\\)${S},${S}${STR}`,
    "g",
  );
  for (const m of lerJava(root, "regime-regular", "ProblemType.java").matchAll(reProblem))
    erros.push({ codigo: m[3], titulo: m[1], campo: m[4] ?? "", estado: m[5], descricao: m[6] });

  // NOME("VSN-001", "Título", "Descrição")
  const reVsn = new RegExp(`"(VSN-\\d{3})"${S},${S}${STR}${S},${S}${STR}`, "g");
  for (const m of lerJava(root, "simples-nacional", "CodigoValidacaoSimples.java").matchAll(reVsn))
    erros.push({ codigo: m[1], titulo: m[2], campo: "", estado: "", descricao: m[3] });

  return erros.sort((a, b) => a.codigo.localeCompare(b.codigo));
}
```

- [ ] **Passo 4: rodar o teste e ver que ele passa**

Rodar: `node --test scripts/lib/erros.test.mjs`
Esperado: PASS (1 teste).

- [ ] **Passo 5: fazer o `build-skill.mjs` usar o módulo**

Em `scripts/build-skill.mjs`:
- Acrescentar, junto aos imports do topo: `import { extrairErros } from "./lib/erros.mjs";`.
- Trocar o bloco inteiro que começa em `// ------------------------------------------------------------------ códigos de erro` e termina antes de `console.log(\`referências geradas` por:

```js
// ------------------------------------------------------------------ códigos de erro
{
  const todos = extrairErros(root);
  let md = cabecalho("Códigos de erro da Calculadora RTC");
  md +=
    "`estadoItem` diz o que fazer: **INCONSISTENCIA_ENTRADA** = corrigir os dados enviados; " +
    "**NAO_IMPLEMENTADO** = a classificação ainda não é calculada pela Calculadora (não é erro do usuário); " +
    "**FALHA_TECNICA** = problema na base ou na Calculadora, não nos dados.\n";
  for (const pref of ["REG", "CAL", "VAL"]) {
    const lista = todos.filter((e) => e.codigo.startsWith(pref));
    if (!lista.length) continue;
    const nome = { REG: "regras de entrada", CAL: "cálculo", VAL: "validação" }[pref];
    md += `\n## ${pref} — ${nome} (regime regular)\n\n| Código | Erro | Campo | Estado | Significado |\n|---|---|---|---|---|\n`;
    for (const e of lista) md += `| ${e.codigo} | ${e.titulo} | ${e.campo} | ${e.estado} | ${e.descricao} |\n`;
  }
  md += `\n## VSN — Simples Nacional\n\n| Código | Erro | Significado |\n|---|---|---|\n`;
  for (const e of todos.filter((e) => e.codigo.startsWith("VSN"))) md += `| ${e.codigo} | ${e.titulo} | ${e.descricao} |\n`;
  writeFileSync(path.join(out, "erros.md"), md);
  console.log(`erros: ${todos.length} códigos`);
}
```

Remover do topo de `build-skill.mjs` o import de `readdirSync`, se ele não for mais usado.

- [ ] **Passo 6: gravar `erros.json` e ler as exceções de NBS no export**

Em `scripts/export-site-data.mjs`:
- Acrescentar o import `import { extrairErros } from "./lib/erros.mjs";`.
- Trocar a consulta de NBS (o segundo `for (const r of db.prepare(...` do bloco de vínculos) por:

```js
for (const r of db
  .prepare(
    `SELECT c.CLTR_CD cls, n.NBSA_NBS_CD cod, ${ehIs},
            (SELECT group_concat(e.ENBS_NBS_CD) FROM EXCECAO_NBS_APLICAVEL e WHERE e.ENBS_NBSA_ID = n.NBSA_ID AND ${vigente("e.ENBS", dataNom)}) exc
       FROM NBS_APLICAVEL n JOIN CLASSIFICACAO_TRIBUTARIA c ON c.CLTR_ID = n.NBSA_CLTR_ID
      WHERE ${vigente("n.NBSA", dataNom)} ORDER BY 1, 2`,
  )
  .all()) {
  ((destino(r)[r.cls] ??= { ncm: [], nbs: [] }).nbs).push(r.exc ? [r.cod, r.exc.split(",")] : [r.cod]);
}
```

- Logo depois de `await save("vinculos-nomenclatura.json", ...)`, acrescentar:

```js
await save("erros.json", extrairErros(root));
```

- [ ] **Passo 7: regenerar e conferir**

Rodar (com as APIs no ar, `./scripts/run.sh`):
```bash
node scripts/export-site-data.mjs && node scripts/build-skill.mjs && node -e 'const e=require("./site/data/erros.json");console.log(e.length, e.find(x=>x.codigo==="REG-011").titulo)'
```
Esperado: o export termina com `Pronto.`, o build-skill imprime `erros: 101 códigos`, e o último comando imprime `101 NCM não vinculada`. `git diff skill/` não mostra mudança em `erros.md`.

- [ ] **Passo 8: commit**

```bash
git add scripts/lib scripts/build-skill.mjs scripts/export-site-data.mjs
git commit -m "Catálogo de erros compartilhado, erros.json e exceções de NBS no export"
```

---

### Tarefa 2: pacote `mcp-remote` e carga dos dados

**Arquivos:**
- Criar: `mcp-remote/package.json`, `mcp-remote/tsconfig.json`, `mcp-remote/vitest.config.ts`, `mcp-remote/.gitignore`, `mcp-remote/scripts/preparar.mjs`, `mcp-remote/src/tipos.ts`, `mcp-remote/src/dados.ts`, `mcp-remote/test/dados.test.ts`
- Alterar: `.gitignore` da raiz

**Interfaces:**
- Consome: `site/data/*.json` (Tarefa 1), `site/wasm/danfse.wasm`, `site/wasm/wasm_exec.js`.
- Produz (`src/tipos.ts`): `Tributo`, `Vinculo`, `Anexo`, `Classificacao`, `Situacao`, `AtividadeSimples`, `ErroCatalogo`, `Meta`.
- Produz (`src/dados.ts`):
  - `meta: Meta`;
  - `classificacoes(t: Tributo): Classificacao[]` e `classificacao(t: Tributo, codigo: string): Classificacao | undefined`;
  - `anexo(t: Tributo, codigo: string): Anexo | undefined`, `anexos(t: Tributo): Array<[string, Anexo]>` e `situacoes(): Situacao[]` (IBS/CBS, com a lista de cClassTrib);
  - `situacoesIs(): Array<{codigo: string; descricao: string}>`;
  - `descricaoNomenclatura(tipo: "ncm" | "nbs", codigo: string): string | undefined`;
  - `atividadesSimples(): AtividadeSimples[]` e `erros(): ErroCatalogo[]`;
  - `municipios(): Array<{codigo: number; nome: string; uf: string}>`.
- Produz: comando `npm run preparar`, que gera `mcp-remote/data/*.json` e `mcp-remote/danfse/vendor/{danfse.wasm,wasm_exec.js}`.

- [ ] **Passo 1: criar o pacote**

`mcp-remote/package.json`:
```json
{
  "name": "calculadora-rtc-mcp-remote",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "description": "MCP remoto (Cloudflare Workers) de consulta à Calculadora RTC. Projeto não oficial.",
  "license": "MIT",
  "scripts": {
    "preparar": "node scripts/preparar.mjs",
    "test": "npm run preparar && vitest run",
    "typecheck": "tsc --noEmit",
    "dev": "npm run preparar && wrangler dev -c wrangler.toml -c danfse/wrangler.toml",
    "fumaca": "node test/fumaca.mjs",
    "verificar-deploy": "npm run preparar && wrangler deploy --dry-run -c wrangler.toml --outdir .wrangler/dry && wrangler deploy --dry-run -c danfse/wrangler.toml --outdir .wrangler/dry-danfse"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "1.32.2",
    "zod": "4.6.7"
  }
}
```

Instalar as dependências de desenvolvimento com versões fixas:
```bash
cd mcp-remote && npm install --save-dev --save-exact wrangler@4 vitest@5 typescript@7.0.2 @cloudflare/workers-types@latest @types/node@26.6.6
```

`mcp-remote/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2023",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noEmit": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "noUncheckedSideEffectImports": false,
    "types": ["@cloudflare/workers-types", "node"]
  },
  "include": ["src", "danfse/src", "test"]
}
```

`mcp-remote/vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: { include: ["test/**/*.test.ts"], environment: "node" },
});
```

`mcp-remote/.gitignore`:
```
node_modules/
data/
danfse/vendor/
.wrangler/
```

Na raiz, acrescentar ao `.gitignore`:
```
# MCP remoto
mcp-remote/node_modules/
```

- [ ] **Passo 2: script `preparar.mjs`**

`mcp-remote/scripts/preparar.mjs`:
```js
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
```

Rodar: `cd mcp-remote && npm run preparar`
Esperado: `dados de 2027-01-01 copiados para mcp-remote/data/`.

- [ ] **Passo 3: escrever o teste que falha**

`mcp-remote/test/dados.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import * as dados from "../src/dados";

describe("dados", () => {
  it("carrega classificações de IBS/CBS com CST", () => {
    const c = dados.classificacao("cbs-ibs", "200028");
    expect(c?.descricao).toContain("educação");
    expect(c?.cst).toBe("200");
  });
  it("separa IBS/CBS e IS com o mesmo código", () => {
    expect(dados.classificacao("is", "000001")?.descricao).toContain("Primeiro fornecimento");
    expect(dados.anexo("cbs-ibs", "000001")).toBeUndefined();
    expect(dados.anexo("is", "000001")?.ncm.length).toBeGreaterThan(0);
  });
  it("descreve NCM e NBS", () => {
    expect(dados.descricaoNomenclatura("ncm", "10063021")).toBeTruthy();
    expect(dados.descricaoNomenclatura("nbs", "122011200")).toBeTruthy();
    expect(dados.descricaoNomenclatura("ncm", "00000000")).toBeUndefined();
  });
  it("traz erros, atividades, municípios e meta", () => {
    expect(dados.erros().some((e) => e.codigo === "REG-011")).toBe(true);
    expect(dados.atividadesSimples().length).toBeGreaterThan(10);
    expect(dados.municipios().find((m) => m.codigo === 4314902)).toEqual({ codigo: 4314902, nome: "Porto Alegre", uf: "RS" });
    expect(dados.meta.regimeRegular.versaoDb).toMatch(/^V\d+/);
  });
});
```

- [ ] **Passo 4: rodar o teste e ver que ele falha**

Rodar: `cd mcp-remote && npx vitest run test/dados.test.ts`
Esperado: FAIL com `Failed to resolve import "../src/dados"`.

- [ ] **Passo 5: implementar `tipos.ts` e `dados.ts`**

`mcp-remote/src/tipos.ts`:
```ts
export type Tributo = "cbs-ibs" | "is";
export type TipoNomenclatura = "ncm" | "nbs";
/** Prefixo aceito pelo anexo, com exceções opcionais (formato de vinculos-nomenclatura.json). */
export type Vinculo = [string] | [string, string[]];
export interface Anexo {
  ncm: Vinculo[];
  nbs: Vinculo[];
}
export interface Fundamentacao {
  texto: string;
  textoCurto: string;
  referenciaNormativa?: string;
}
export interface Classificacao {
  codigo: string;
  cst?: string;
  descricao: string;
  descricaoTratamentoTributario: string;
  tipoAliquota: string;
  nomenclatura: string | null;
  possuiPercentualReducao: boolean;
  percentualReducaoCbs?: number;
  percentualReducaoIbsUf?: number;
  percentualReducaoIbsMun?: number;
  creditoOperacaoAntecedente?: string;
  exigeGrupoDesoneracao: boolean;
  incompativelComSuspensao: boolean;
  indicaApropriacaoCreditoAdquirenteCbs: boolean;
  indicaApropriacaoCreditoAdquirenteIbs: boolean;
  indicaCreditoPresumidoFornecedor: boolean;
  indicaCreditoPresumidoAdquirente: boolean;
  tiposDfeClassificacao: Array<{ sigla: string; tipo: number; descricao: string }>;
  fundamentacoes?: Fundamentacao[];
}
export interface Situacao {
  codigo: string;
  descricao: string;
  classificacoes: string[];
}
export interface AtividadeSimples {
  codigo: string;
  descricao: string;
  rotuloAnexo: string;
  anexoSemFatorR: string | null;
  anexoComFatorR: string | null;
  sujeitaFatorR: boolean;
  tpDocsAdmissiveis: string[];
}
export interface ErroCatalogo {
  codigo: string;
  titulo: string;
  campo: string;
  estado: string;
  descricao: string;
}
export interface Meta {
  geradoEm: string;
  dataNomenclatura: string;
  regimeRegular: { versaoApp: string; versaoDb: string; descricaoVersaoDb: string; dataVersaoDb: string };
}
```

`mcp-remote/src/dados.ts`:
```ts
// Dados da Calculadora RTC embutidos no bundle (gerados por scripts/preparar.mjs a partir de site/data).
import classificacoesJson from "../data/classificacoes.json";
import errosJson from "../data/erros.json";
import isJson from "../data/imposto-seletivo.json";
import localidadesJson from "../data/localidades.json";
import metaJson from "../data/meta.json";
import nbsJson from "../data/nbs.json";
import ncmJson from "../data/ncm.json";
import simplesJson from "../data/simples-atividades.json";
import situacoesJson from "../data/situacoes.json";
import vinculosJson from "../data/vinculos.json";
import type { Anexo, AtividadeSimples, Classificacao, ErroCatalogo, Meta, Situacao, TipoNomenclatura, Tributo } from "./tipos";

export const meta = metaJson as unknown as Meta;

const lista: Record<Tributo, Classificacao[]> = {
  "cbs-ibs": classificacoesJson as unknown as Classificacao[],
  is: (isJson as unknown as { classificacoes: Classificacao[] }).classificacoes,
};
const anexosPorTributo: Record<Tributo, Record<string, Anexo>> = {
  "cbs-ibs": (vinculosJson as unknown as { vinculos: Record<string, Anexo> }).vinculos,
  is: (vinculosJson as unknown as { vinculosIs?: Record<string, Anexo> }).vinculosIs ?? {},
};

let porCodigo: Record<Tributo, Map<string, Classificacao>> | undefined;
function indice(t: Tributo): Map<string, Classificacao> {
  porCodigo ??= {
    "cbs-ibs": new Map(lista["cbs-ibs"].map((c) => [c.codigo, c])),
    is: new Map(lista.is.map((c) => [c.codigo, c])),
  };
  return porCodigo[t];
}

export const classificacoes = (t: Tributo): Classificacao[] => lista[t];
export const classificacao = (t: Tributo, codigo: string): Classificacao | undefined => indice(t).get(codigo);
export const anexo = (t: Tributo, codigo: string): Anexo | undefined => anexosPorTributo[t][codigo];
export const anexos = (t: Tributo): Array<[string, Anexo]> => Object.entries(anexosPorTributo[t]);
export const situacoes = (): Situacao[] => situacoesJson as unknown as Situacao[];
export const situacoesIs = (): Array<{ codigo: string; descricao: string }> =>
  (isJson as unknown as { situacoes: Array<{ codigo: string; descricao: string }> }).situacoes;

let nomenclaturas: Record<TipoNomenclatura, Map<string, string>> | undefined;
export function descricaoNomenclatura(tipo: TipoNomenclatura, codigo: string): string | undefined {
  nomenclaturas ??= {
    ncm: new Map(ncmJson as unknown as Array<[string, string]>),
    nbs: new Map(nbsJson as unknown as Array<[string, string]>),
  };
  return nomenclaturas[tipo].get(codigo);
}

export const atividadesSimples = (): AtividadeSimples[] => simplesJson as unknown as AtividadeSimples[];
export const erros = (): ErroCatalogo[] => errosJson as unknown as ErroCatalogo[];

let cacheMunicipios: Array<{ codigo: number; nome: string; uf: string }> | undefined;
export function municipios(): Array<{ codigo: number; nome: string; uf: string }> {
  if (!cacheMunicipios) {
    const loc = localidadesJson as unknown as { ufs: Array<[number, string, string]>; municipios: Array<[number, number, string]> };
    const sigla = new Map(loc.ufs.map(([cod, uf]) => [cod, uf]));
    cacheMunicipios = loc.municipios.map(([codigo, uf, nome]) => ({ codigo, nome, uf: sigla.get(uf) ?? "" }));
  }
  return cacheMunicipios;
}
```

- [ ] **Passo 6: rodar o teste e ver que ele passa**

Rodar: `cd mcp-remote && npx vitest run test/dados.test.ts && npx tsc --noEmit`
Esperado: PASS (4 testes) e nenhum erro de tipo.

- [ ] **Passo 7: commit**

```bash
git add .gitignore mcp-remote
git commit -m "mcp-remote: pacote do Worker e carga dos dados da Calculadora"
```

---

### Tarefa 3: regra de aceitação NCM/NBS

**Arquivos:**
- Criar: `mcp-remote/src/nomenclatura.ts`, `mcp-remote/test/nomenclatura.test.ts`

**Interfaces:**
- Consome: `Anexo`, `Vinculo`, `TipoNomenclatura` de `src/tipos.ts`.
- Produz:
  - `TAMANHO: Record<TipoNomenclatura, number>` (`{ ncm: 8, nbs: 9 }`);
  - `interface ResultadoNomenclatura { aceito: boolean; motivo: string; erroEquivalente: "REG-011" | "REG-012" | "REG-015" | "REG-016" | null }`;
  - `validarNomenclatura(anexo: Anexo | undefined, tipo: TipoNomenclatura, codigo: string): ResultadoNomenclatura`;
  - `consolidarAnexo(lista: Vinculo[]): Array<{ prefixo: string; excecoes: string[] }>`.

- [ ] **Passo 1: escrever o teste que falha**

`mcp-remote/test/nomenclatura.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { anexo } from "../src/dados";
import { consolidarAnexo, validarNomenclatura } from "../src/nomenclatura";
import type { Anexo } from "../src/tipos";

const sintetico: Anexo = {
  ncm: [["0207", ["02074300"]], ["0207", ["02075300"]], ["1006"], ["0302", ["03021"]], ["0302"]],
  nbs: [["122011"]],
};

describe("validarNomenclatura", () => {
  it("aceita qualquer código quando não há anexo", () => {
    expect(validarNomenclatura(undefined, "ncm", "10063021")).toMatchObject({ aceito: true, erroEquivalente: null });
    expect(validarNomenclatura({ ncm: [], nbs: [["1"]] }, "ncm", "10063021").aceito).toBe(true);
  });
  it("exige código completo quando há anexo (REG-015/REG-016)", () => {
    expect(validarNomenclatura(sintetico, "ncm", "1006").erroEquivalente).toBe("REG-015");
    expect(validarNomenclatura(sintetico, "nbs", "122011").erroEquivalente).toBe("REG-016");
  });
  it("aceita por prefixo", () => {
    expect(validarNomenclatura(sintetico, "ncm", "10063021").aceito).toBe(true);
    expect(validarNomenclatura(sintetico, "nbs", "122011200").aceito).toBe(true);
  });
  it("rejeita fora do anexo (REG-011/REG-012)", () => {
    expect(validarNomenclatura(sintetico, "ncm", "22030000").erroEquivalente).toBe("REG-011");
    expect(validarNomenclatura(sintetico, "nbs", "101011100").erroEquivalente).toBe("REG-012");
  });
  it("rejeita exceção quando não há vínculo sem exceção (E e não S)", () => {
    expect(validarNomenclatura(sintetico, "ncm", "02074300").erroEquivalente).toBe("REG-011");
    expect(validarNomenclatura(sintetico, "ncm", "02075300").erroEquivalente).toBe("REG-011");
    expect(validarNomenclatura(sintetico, "ncm", "02071100").aceito).toBe(true);
  });
  it("aceita exceção quando outro vínculo do mesmo prefixo não tem exceção (E e S)", () => {
    expect(validarNomenclatura(sintetico, "ncm", "03021100").aceito).toBe(true);
  });
  it("rejeita entrada que não é só dígitos", () => {
    expect(validarNomenclatura(sintetico, "ncm", "1006.30.21").aceito).toBe(false);
  });
  it("bate com dados reais: 200003 aceita arroz e rejeita 02074300", () => {
    const a = anexo("cbs-ibs", "200003");
    expect(validarNomenclatura(a, "ncm", "10063021").aceito).toBe(true);
    expect(validarNomenclatura(a, "ncm", "02074300").aceito).toBe(false);
  });
});

describe("consolidarAnexo", () => {
  it("junta exceções do mesmo prefixo e zera quando há vínculo sem exceção", () => {
    expect(consolidarAnexo(sintetico.ncm)).toEqual([
      { prefixo: "0207", excecoes: ["02074300", "02075300"] },
      { prefixo: "1006", excecoes: [] },
      { prefixo: "0302", excecoes: [] },
    ]);
  });
});
```

- [ ] **Passo 2: rodar o teste e ver que ele falha**

Rodar: `cd mcp-remote && npx vitest run test/nomenclatura.test.ts`
Esperado: FAIL com `Failed to resolve import "../src/nomenclatura"`.

- [ ] **Passo 3: implementar `src/nomenclatura.ts`**

```ts
// Porta fiel da regra do NcmAplicavelService da Calculadora RTC (regime regular):
// A = algum vínculo cobre o código; E = alguma exceção de vínculo que cobre o código o cobre;
// S = algum vínculo que cobre o código não tem exceções. Rejeita quando !A ou (E e !S).
import type { Anexo, TipoNomenclatura, Vinculo } from "./tipos";

export const TAMANHO: Record<TipoNomenclatura, number> = { ncm: 8, nbs: 9 };

export interface ResultadoNomenclatura {
  aceito: boolean;
  motivo: string;
  erroEquivalente: "REG-011" | "REG-012" | "REG-015" | "REG-016" | null;
}

const ERRO = {
  ncm: { fora: "REG-011", incompleto: "REG-015" },
  nbs: { fora: "REG-012", incompleto: "REG-016" },
} as const;

export function validarNomenclatura(anexo: Anexo | undefined, tipo: TipoNomenclatura, codigo: string): ResultadoNomenclatura {
  const nome = tipo.toUpperCase();
  if (!/^\d+$/.test(codigo))
    return { aceito: false, motivo: `${nome} deve ter só dígitos, sem pontos ou espaços.`, erroEquivalente: null };
  const vinculos = anexo?.[tipo] ?? [];
  if (vinculos.length === 0)
    return { aceito: true, motivo: `A classificação não tem anexo de ${nome}: qualquer código vigente é aceito.`, erroEquivalente: null };
  if (codigo.length !== TAMANHO[tipo])
    return {
      aceito: false,
      motivo: `A classificação tem anexo e exige ${nome} completo, com ${TAMANHO[tipo]} dígitos.`,
      erroEquivalente: ERRO[tipo].incompleto,
    };
  const cobrem = vinculos.filter(([prefixo]) => codigo.startsWith(prefixo));
  const a = cobrem.length > 0;
  const e = cobrem.some(([, exc]) => (exc ?? []).some((x) => codigo.startsWith(x)));
  const s = cobrem.some(([, exc]) => !exc || exc.length === 0);
  if (!a)
    return { aceito: false, motivo: `${nome} ${codigo} não consta do anexo da classificação.`, erroEquivalente: ERRO[tipo].fora };
  if (e && !s)
    return {
      aceito: false,
      motivo: `${nome} ${codigo} está entre as exceções do anexo da classificação.`,
      erroEquivalente: ERRO[tipo].fora,
    };
  return { aceito: true, motivo: `${nome} ${codigo} consta do anexo da classificação.`, erroEquivalente: null };
}

/** Uma entrada por prefixo: exceções somadas, ou nenhuma se algum vínculo do prefixo não tem exceção. */
export function consolidarAnexo(lista: Vinculo[]): Array<{ prefixo: string; excecoes: string[] }> {
  const m = new Map<string, Set<string> | null>();
  for (const [prefixo, exc] of lista) {
    const atual = m.get(prefixo);
    if (!exc || exc.length === 0) m.set(prefixo, null);
    else if (atual !== null) m.set(prefixo, new Set([...(atual ?? []), ...exc]));
  }
  return [...m].map(([prefixo, exc]) => ({ prefixo, excecoes: exc ? [...exc].sort() : [] }));
}
```

- [ ] **Passo 4: rodar o teste e ver que ele passa**

Rodar: `cd mcp-remote && npx vitest run test/nomenclatura.test.ts`
Esperado: PASS (9 testes).

- [ ] **Passo 5: commit**

```bash
git add mcp-remote/src/nomenclatura.ts mcp-remote/test/nomenclatura.test.ts
git commit -m "mcp-remote: regra de aceitação de NCM/NBS contra o anexo"
```

---

### Tarefa 4: consultas puras

**Arquivos:**
- Criar: `mcp-remote/src/texto.ts`, `mcp-remote/src/consultas.ts`, `mcp-remote/test/consultas.test.ts`

**Interfaces:**
- Consome: `src/dados.ts`, `validarNomenclatura` e `consolidarAnexo` de `src/nomenclatura.ts`.
- Produz (`src/texto.ts`): `normalizar(s: string): string` e `contemTodos(alvo: string, termos: string): boolean`.
- Produz (`src/consultas.ts`):
  - `LIMITE_BUSCA = 50`, `LIMITE_MUNICIPIOS = 20`;
  - `type Resumo = { codigo: string; cst: string | null; descricao: string; reducao: string; nomenclatura: string | null; dfe: string[] }`;
  - `resumir(c: Classificacao): Resumo`;
  - `detalharClassificacao(t: Tributo, codigo: string): object | null`;
  - `buscarClassificacoes(f: { tributo: Tributo; cst?: string; texto?: string; ncm?: string; nbs?: string }): { total: number; itens: Resumo[]; nota?: string }`;
  - `consultarNomenclatura(tipo: TipoNomenclatura, codigo: string): { codigo: string; descricao: string | null; classificacoesComAnexo: Resumo[] }`;
  - `atividade(codigo?: string): AtividadeSimples | AtividadeSimples[] | null`;
  - `explicarErro(codigo: string): ErroCatalogo | null`;
  - `buscarMunicipio(f: { codigo?: number; nome?: string; uf?: string }): Array<{ codigo: number; nome: string; uf: string }>`;
  - `status(): object`.

- [ ] **Passo 1: escrever o teste que falha**

`mcp-remote/test/consultas.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import * as q from "../src/consultas";
import { contemTodos, normalizar } from "../src/texto";

describe("texto", () => {
  it("remove acentos e caixa", () => {
    expect(normalizar("Educação BÁSICA")).toBe("educacao basica");
    expect(contemTodos("Fornecimento dos serviços de educação", "servico educacao")).toBe(true);
    expect(contemTodos("Fornecimento dos serviços de educação", "saude")).toBe(false);
  });
});

describe("consultas", () => {
  it("detalha classificação com anexo consolidado e base", () => {
    const d = q.detalharClassificacao("cbs-ibs", "200003") as any;
    expect(d.codigo).toBe("200003");
    expect(d.anexo.ncm.find((x: any) => x.prefixo === "0207").excecoes).toContain("02074300");
    expect(d.base).toMatch(/^V\d+/);
    expect(q.detalharClassificacao("cbs-ibs", "999999")).toBeNull();
  });
  it("busca por CST, texto, NCM e NBS", () => {
    expect(q.buscarClassificacoes({ tributo: "cbs-ibs", cst: "200" }).itens.every((r) => r.cst === "200")).toBe(true);
    expect(q.buscarClassificacoes({ tributo: "cbs-ibs", texto: "educacao" }).itens.map((r) => r.codigo)).toContain("200028");
    expect(q.buscarClassificacoes({ tributo: "cbs-ibs", texto: "cesta basica" }).itens.map((r) => r.codigo)).toContain("200003");
    expect(q.buscarClassificacoes({ tributo: "cbs-ibs", ncm: "10063021" }).itens.map((r) => r.codigo)).toContain("200003");
    expect(q.buscarClassificacoes({ tributo: "cbs-ibs", nbs: "122011200" }).itens.map((r) => r.codigo)).toContain("200028");
    expect(q.buscarClassificacoes({ tributo: "cbs-ibs", cst: "200" }).itens.length).toBeLessThanOrEqual(q.LIMITE_BUSCA);
  });
  it("resume com redução legível", () => {
    const r = q.buscarClassificacoes({ tributo: "cbs-ibs", texto: "educacao" }).itens.find((x) => x.codigo === "200028")!;
    expect(r.reducao).toBe("CBS 60% · IBS UF 60% · IBS Mun 60%");
    expect(r.dfe).toContain("NFS-e (91)");
  });
  it("consulta nomenclatura com classificações que a aceitam", () => {
    const n = q.consultarNomenclatura("ncm", "10063021");
    expect(n.descricao).toBeTruthy();
    expect(n.classificacoesComAnexo.map((r) => r.codigo)).toContain("200003");
  });
  it("explica erro existente e devolve null para inexistente", () => {
    expect(q.explicarErro("reg-011")?.titulo).toBe("NCM não vinculada");
    expect(q.explicarErro("REG-999")).toBeNull();
  });
  it("busca município por código, por nome sem acento e com UF", () => {
    expect(q.buscarMunicipio({ codigo: 4314902 })).toEqual([{ codigo: 4314902, nome: "Porto Alegre", uf: "RS" }]);
    expect(q.buscarMunicipio({ nome: "sao paulo", uf: "SP" }).map((m) => m.codigo)).toContain(3550308);
    expect(q.buscarMunicipio({ nome: "santa" }).length).toBeLessThanOrEqual(q.LIMITE_MUNICIPIOS);
  });
  it("atividade do Simples por código e lista", () => {
    expect((q.atividade("01") as any).codigo).toBe("01");
    expect(Array.isArray(q.atividade())).toBe(true);
    expect(q.atividade("zz")).toBeNull();
  });
  it("status traz versão da base e aviso", () => {
    const s = q.status() as any;
    expect(s.base.versaoDb).toMatch(/^V\d+/);
    expect(s.aviso).toContain("não oficial");
  });
});
```

- [ ] **Passo 2: rodar o teste e ver que ele falha**

Rodar: `cd mcp-remote && npx vitest run test/consultas.test.ts`
Esperado: FAIL com `Failed to resolve import "../src/consultas"`.

- [ ] **Passo 3: implementar `src/texto.ts`**

```ts
export function normalizar(s: string): string {
  return s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/\s+/g, " ").trim();
}

/** Verdadeiro se todos os termos (separados por espaço) aparecem no alvo, ignorando acentos e caixa. */
export function contemTodos(alvo: string, termos: string): boolean {
  const a = normalizar(alvo);
  return normalizar(termos).split(" ").filter(Boolean).every((t) => a.includes(t));
}
```

- [ ] **Passo 4: implementar `src/consultas.ts`**

```ts
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
```

- [ ] **Passo 5: rodar o teste e ver que ele passa**

Rodar: `cd mcp-remote && npx vitest run test/consultas.test.ts && npx tsc --noEmit`
Esperado: PASS (9 testes) e nenhum erro de tipo.

- [ ] **Passo 6: commit**

```bash
git add mcp-remote/src/texto.ts mcp-remote/src/consultas.ts mcp-remote/test/consultas.test.ts
git commit -m "mcp-remote: consultas de classificação, nomenclatura, Simples, erros e municípios"
```

---

### Tarefa 5: servidor MCP e ferramentas

**Arquivos:**
- Criar: `mcp-remote/src/server.ts`, `mcp-remote/test/server.test.ts`

**Interfaces:**
- Consome: `src/consultas.ts`, `validarNomenclatura` e `TAMANHO` de `src/nomenclatura.ts`, `src/dados.ts`.
- Produz:
  - `interface GeradorDanfse { (xml: string, stc: 0 | 1 | 2, canhoto: boolean): Promise<{ url: string; bytes: number; expiraEm: string }> }`;
  - `LIMITE_XML = 1_000_000`;
  - `criarServidor(opcoes?: { gerarDanfse?: GeradorDanfse }): McpServer`. A ferramenta `rtc_gerar_danfse` só é registrada quando `gerarDanfse` é passado.

- [ ] **Passo 1: escrever o teste que falha**

`mcp-remote/test/server.test.ts`:
```ts
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { describe, expect, it } from "vitest";
import { criarServidor, LIMITE_XML, type GeradorDanfse } from "../src/server";

async function conectar(gerarDanfse?: GeradorDanfse) {
  const server = criarServidor({ gerarDanfse });
  const [a, b] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "teste", version: "0.0.0" });
  await Promise.all([server.connect(a), client.connect(b)]);
  return client;
}
const texto = (r: any) => r.content[0].text as string;

describe("servidor MCP", () => {
  it("lista as ferramentas de consulta e só inclui o DANFSe quando há gerador", async () => {
    const sem = (await (await conectar()).listTools()).tools.map((t) => t.name).sort();
    expect(sem).toEqual([
      "rtc_atividades_simples", "rtc_buscar_classificacoes", "rtc_consultar_classificacao", "rtc_consultar_nomenclatura",
      "rtc_explicar_erro", "rtc_municipio", "rtc_status", "rtc_validar_nomenclatura",
    ]);
    const com = (await (await conectar(async () => ({ url: "x", bytes: 1, expiraEm: "y" }))).listTools()).tools;
    expect(com.map((t) => t.name)).toContain("rtc_gerar_danfse");
  });
  it("valida nomenclatura com erro equivalente", async () => {
    const c = await conectar();
    const r = await c.callTool({ name: "rtc_validar_nomenclatura", arguments: { cClassTrib: "200003", ncm: "02074300" } });
    expect(JSON.parse(texto(r))).toMatchObject({ aceito: false, erroEquivalente: "REG-011" });
  });
  it("recusa ncm e nbs juntos", async () => {
    const c = await conectar();
    const r = await c.callTool({ name: "rtc_validar_nomenclatura", arguments: { cClassTrib: "200003", ncm: "10063021", nbs: "122011200" } });
    expect(r.isError).toBe(true);
    expect(texto(r)).toContain("exatamente um");
  });
  it("classificação inexistente vira isError", async () => {
    const c = await conectar();
    const r = await c.callTool({ name: "rtc_consultar_classificacao", arguments: { cClassTrib: "999999" } });
    expect(r.isError).toBe(true);
  });
  it("busca por texto", async () => {
    const c = await conectar();
    const r = await c.callTool({ name: "rtc_buscar_classificacoes", arguments: { texto: "educação" } });
    expect(texto(r)).toContain("200028");
  });
  it("explica erro e acha município", async () => {
    const c = await conectar();
    expect(texto(await c.callTool({ name: "rtc_explicar_erro", arguments: { codigo: "VSN-047" } }))).toContain("NCM não aplicável");
    expect(texto(await c.callTool({ name: "rtc_municipio", arguments: { nome: "porto alegre" } }))).toContain("4314902");
  });
  it("DANFSe repassa ao gerador e recusa XML grande", async () => {
    const chamadas: unknown[] = [];
    const c = await conectar(async (xml, stc, canhoto) => {
      chamadas.push({ tamanho: xml.length, stc, canhoto });
      return { url: "https://exemplo/pdf/abc", bytes: 1234, expiraEm: "2026-11-25T02:00:00.000Z" };
    });
    const ok = await c.callTool({ name: "rtc_gerar_danfse", arguments: { xml: "<NFSe/>", situacao: "cancelada" } });
    expect(texto(ok)).toContain("https://exemplo/pdf/abc");
    expect(chamadas).toEqual([{ tamanho: 7, stc: 1, canhoto: true }]);
    const grande = await c.callTool({ name: "rtc_gerar_danfse", arguments: { xml: "x".repeat(LIMITE_XML + 1) } });
    expect(grande.isError).toBe(true);
  });
});
```

- [ ] **Passo 2: rodar o teste e ver que ele falha**

Rodar: `cd mcp-remote && npx vitest run test/server.test.ts`
Esperado: FAIL com `Failed to resolve import "../src/server"`.

- [ ] **Passo 3: implementar `src/server.ts`**

```ts
// Servidor MCP remoto: uma instância por requisição (transporte sem estado).
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import * as q from "./consultas";
import * as dados from "./dados";
import { TAMANHO, validarNomenclatura } from "./nomenclatura";

export type GeradorDanfse = (xml: string, stc: 0 | 1 | 2, canhoto: boolean) => Promise<{ url: string; bytes: number; expiraEm: string }>;
export const LIMITE_XML = 1_000_000;

const LEITURA = { readOnlyHint: true, openWorldHint: false } as const;
const ok = (dado: unknown): CallToolResult => ({ content: [{ type: "text", text: JSON.stringify(dado, null, 2) }] });
const erro = (msg: string): CallToolResult => ({ content: [{ type: "text", text: msg }], isError: true });
const cClassTrib = z.string().regex(/^\d{6}$/, "cClassTrib tem 6 dígitos");
const tributo = z.enum(["cbs-ibs", "is"]).default("cbs-ibs");

async function guard(fn: () => Promise<CallToolResult> | CallToolResult): Promise<CallToolResult> {
  try {
    return await fn();
  } catch (e) {
    return erro(`Erro inesperado: ${e instanceof Error ? e.message : String(e)}`);
  }
}

export function criarServidor(opcoes: { gerarDanfse?: GeradorDanfse } = {}): McpServer {
  const server = new McpServer(
    { name: "calculadora-rtc", version: "0.1.0" },
    {
      instructions:
        "Consulta aos dados abertos da Calculadora RTC da Reforma Tributária do Consumo (CBS, IBS e IS — LC 214/2025). " +
        "Use rtc_buscar_classificacoes e rtc_consultar_classificacao para escolher CST/cClassTrib, rtc_validar_nomenclatura " +
        "antes de usar um NCM/NBS com uma classificação, rtc_explicar_erro para códigos REG/CAL/VAL/VSN. " +
        "Este servidor não calcula tributos. " + q.AVISO,
    },
  );

  server.registerTool(
    "rtc_status",
    { title: "Versão da base", description: "Versão da tabela de classificações, data da vigência consultada e o que este servidor não faz.", inputSchema: {}, annotations: LEITURA },
    async () => ok(q.status()),
  );

  server.registerTool(
    "rtc_consultar_classificacao",
    {
      title: "Consultar classificação tributária (cClassTrib)",
      description: "Detalha uma cClassTrib: tratamento, redução de CBS/IBS, créditos, documentos aceitos, fundamentação na LC 214/2025 e o anexo de NCM/NBS consolidado. tributo 'cbs-ibs' (padrão) ou 'is'.",
      inputSchema: { cClassTrib, tributo },
      annotations: LEITURA,
    },
    async (a) => guard(() => {
      const d = q.detalharClassificacao(a.tributo, a.cClassTrib);
      return d ? ok(d) : erro(`cClassTrib ${a.cClassTrib} não existe na base (${a.tributo}).`);
    }),
  );

  server.registerTool(
    "rtc_buscar_classificacoes",
    {
      title: "Buscar classificações tributárias",
      description: "Lista cClassTrib por exatamente um critério: 'cst' (ex.: 200), 'texto' (palavras da descrição, sem acento: 'cesta basica', 'educacao'), 'ncm' ou 'nbs' (classificações com anexo que aceitam o código). Máximo de 50 itens.",
      inputSchema: { cst: z.string().regex(/^\d{3}$/).optional(), texto: z.string().min(2).optional(), ncm: z.string().optional(), nbs: z.string().optional(), tributo },
      annotations: LEITURA,
    },
    async (a) => guard(() => {
      const n = [a.cst, a.texto, a.ncm, a.nbs].filter(Boolean).length;
      if (n !== 1) return erro("Informe exatamente um critério: cst, texto, ncm ou nbs.");
      return ok(q.buscarClassificacoes(a));
    }),
  );

  server.registerTool(
    "rtc_validar_nomenclatura",
    {
      title: "Validar NCM/NBS para uma cClassTrib",
      description: "Diz se um NCM (8 dígitos) ou NBS (9 dígitos) pode ser usado com a cClassTrib, com a mesma regra da Calculadora (anexo, exceções e código completo). Devolve o erro equivalente (REG-011/012/015/016) quando não pode.",
      inputSchema: { cClassTrib, ncm: z.string().optional(), nbs: z.string().optional(), tributo },
      annotations: LEITURA,
    },
    async (a) => guard(() => {
      if (!a.ncm === !a.nbs) return erro("Informe exatamente um: ncm ou nbs.");
      if (!dados.classificacao(a.tributo, a.cClassTrib)) return erro(`cClassTrib ${a.cClassTrib} não existe na base (${a.tributo}).`);
      const tipo = a.ncm ? "ncm" : "nbs";
      return ok({ cClassTrib: a.cClassTrib, [tipo]: a.ncm ?? a.nbs, ...validarNomenclatura(dados.anexo(a.tributo, a.cClassTrib), tipo, (a.ncm ?? a.nbs)!) });
    }),
  );

  server.registerTool(
    "rtc_consultar_nomenclatura",
    {
      title: "Consultar NCM ou NBS",
      description: "Descrição de um NCM (8 dígitos) ou NBS (9 dígitos) e as classificações com anexo que o aceitam.",
      inputSchema: { tipo: z.enum(["ncm", "nbs"]), codigo: z.string().regex(/^\d+$/, "só dígitos") },
      annotations: LEITURA,
    },
    async (a) => guard(() => {
      if (a.codigo.length !== TAMANHO[a.tipo]) return erro(`${a.tipo.toUpperCase()} tem ${TAMANHO[a.tipo]} dígitos.`);
      return ok(q.consultarNomenclatura(a.tipo, a.codigo));
    }),
  );

  server.registerTool(
    "rtc_atividades_simples",
    {
      title: "Atividades do Simples Nacional",
      description: "Atividades do Simples (cAtivSN) com anexo, Fator R e documentos admitidos. Sem 'codigo', lista todas.",
      inputSchema: { codigo: z.string().optional() },
      annotations: LEITURA,
    },
    async (a) => guard(() => {
      const r = q.atividade(a.codigo);
      return r ? ok(r) : erro(`Atividade ${a.codigo} não existe.`);
    }),
  );

  server.registerTool(
    "rtc_explicar_erro",
    {
      title: "Explicar código de erro",
      description: "Significado de um código de erro da Calculadora: REG-xxx, CAL-xxx, VAL-xxx (regime regular) ou VSN-xxx (Simples Nacional).",
      inputSchema: { codigo: z.string().regex(/^(REG|CAL|VAL|VSN)-\d{3}$/i, "formato REG-000, CAL-000, VAL-000 ou VSN-000") },
      annotations: LEITURA,
    },
    async (a) => guard(() => {
      const e = q.explicarErro(a.codigo);
      return e ? ok(e) : erro(`Código ${a.codigo.toUpperCase()} não está no catálogo.`);
    }),
  );

  server.registerTool(
    "rtc_municipio",
    {
      title: "Município (código IBGE)",
      description: "Código IBGE de 7 dígitos a partir do nome (sem acento, 'uf' opcional) ou o nome a partir do código. Máximo de 20 resultados.",
      inputSchema: { codigo: z.number().int().optional(), nome: z.string().min(2).optional(), uf: z.string().length(2).optional() },
      annotations: LEITURA,
    },
    async (a) => guard(() => {
      if (!a.codigo === !a.nome) return erro("Informe exatamente um: codigo ou nome.");
      return ok(q.buscarMunicipio(a));
    }),
  );

  if (opcoes.gerarDanfse) {
    const gerar = opcoes.gerarDanfse;
    server.registerTool(
      "rtc_gerar_danfse",
      {
        title: "Gerar DANFSe (PDF)",
        description: "Gera o PDF do DANFSe a partir do XML da NFS-e (até 1 MB) com o gerador oficial e devolve um link que expira em 1 hora. O XML não é guardado.",
        inputSchema: {
          xml: z.string().min(1).describe("Conteúdo do XML da NFS-e."),
          situacao: z.enum(["valida", "cancelada", "substituida"]).default("valida"),
          canhoto: z.boolean().default(true),
        },
        annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
      },
      async (a) => guard(async () => {
        if (a.xml.length > LIMITE_XML) return erro("XML acima de 1 MB.");
        const stc = ({ valida: 0, cancelada: 1, substituida: 2 } as const)[a.situacao];
        const r = await gerar(a.xml, stc, a.canhoto);
        return ok({ ...r, aviso: "O link expira em 1 hora e o PDF é apagado depois." });
      }),
    );
  }

  return server;
}
```

- [ ] **Passo 4: rodar o teste e ver que ele passa**

Rodar: `cd mcp-remote && npx vitest run && npx tsc --noEmit`
Esperado: todos os testes passam (dados, nomenclatura, consultas e server) e nenhum erro de tipo.

- [ ] **Passo 5: commit**

```bash
git add mcp-remote/src/server.ts mcp-remote/test/server.test.ts
git commit -m "mcp-remote: servidor MCP com as ferramentas de consulta e DANFSe opcional"
```

---

### Tarefa 6: PDFs temporários no R2

**Arquivos:**
- Criar: `mcp-remote/src/pdf.ts`, `mcp-remote/test/pdf.test.ts`

**Interfaces:**
- Consome: o tipo `R2Bucket` de `@cloudflare/workers-types`.
- Produz:
  - `VALIDADE_MS = 3_600_000`;
  - `ID_PDF = /^[0-9a-f]{32}$/`;
  - `salvarPdf(bucket: R2Bucket, pdf: ArrayBuffer, agora?: number): Promise<{ id: string; expiraEm: string }>`;
  - `lerPdf(bucket: R2Bucket, id: string, agora?: number): Promise<R2ObjectBody | null>`;
  - `limparPdfs(bucket: R2Bucket, agora?: number): Promise<number>`, que devolve quantos apagou.

- [ ] **Passo 1: escrever o teste que falha**

`mcp-remote/test/pdf.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { ID_PDF, VALIDADE_MS, lerPdf, limparPdfs, salvarPdf } from "../src/pdf";

/** Bucket R2 mínimo em memória, só com o que pdf.ts usa. */
function bucketFalso() {
  const m = new Map<string, { body: ArrayBuffer; customMetadata: Record<string, string> }>();
  return {
    m,
    async put(key: string, body: ArrayBuffer, o: { customMetadata: Record<string, string> }) { m.set(key, { body, customMetadata: o.customMetadata }); },
    async get(key: string) { const v = m.get(key); return v ? { ...v, arrayBuffer: async () => v.body } : null; },
    async delete(keys: string | string[]) { for (const k of [keys].flat()) m.delete(k); },
    async list(o?: { cursor?: string; include?: string[] }) {
      return { objects: [...m].map(([key, v]) => ({ key, customMetadata: v.customMetadata })), truncated: false, cursor: undefined };
    },
  } as any;
}

describe("pdf", () => {
  it("salva com id aleatório e lê dentro da validade", async () => {
    const b = bucketFalso();
    const { id, expiraEm } = await salvarPdf(b, new TextEncoder().encode("%PDF-1.7").buffer, 1_000);
    expect(id).toMatch(ID_PDF);
    expect(expiraEm).toBe(new Date(1_000 + VALIDADE_MS).toISOString());
    expect(await lerPdf(b, id, 1_000 + VALIDADE_MS - 1)).not.toBeNull();
  });
  it("não serve expirado nem id inválido", async () => {
    const b = bucketFalso();
    const { id } = await salvarPdf(b, new ArrayBuffer(4), 0);
    expect(await lerPdf(b, id, VALIDADE_MS + 1)).toBeNull();
    expect(await lerPdf(b, "../segredo", 0)).toBeNull();
  });
  it("limpa só os expirados", async () => {
    const b = bucketFalso();
    await salvarPdf(b, new ArrayBuffer(1), 0);
    const novo = await salvarPdf(b, new ArrayBuffer(1), VALIDADE_MS);
    expect(await limparPdfs(b, VALIDADE_MS + 10)).toBe(1);
    expect([...b.m.keys()]).toEqual([`${novo.id}.pdf`]);
  });
});
```

- [ ] **Passo 2: rodar o teste e ver que ele falha**

Rodar: `cd mcp-remote && npx vitest run test/pdf.test.ts`
Esperado: FAIL com `Failed to resolve import "../src/pdf"`.

- [ ] **Passo 3: implementar `src/pdf.ts`**

```ts
// PDFs do DANFSe no R2: chave aleatória, servidos por no máximo 1 hora e apagados pelo cron.
export const VALIDADE_MS = 3_600_000;
export const ID_PDF = /^[0-9a-f]{32}$/;

const chave = (id: string) => `${id}.pdf`;

export async function salvarPdf(bucket: R2Bucket, pdf: ArrayBuffer, agora = Date.now()): Promise<{ id: string; expiraEm: string }> {
  const id = crypto.randomUUID().replaceAll("-", "");
  await bucket.put(chave(id), pdf, {
    httpMetadata: { contentType: "application/pdf" },
    customMetadata: { criadoEm: String(agora) },
  });
  return { id, expiraEm: new Date(agora + VALIDADE_MS).toISOString() };
}

export async function lerPdf(bucket: R2Bucket, id: string, agora = Date.now()): Promise<R2ObjectBody | null> {
  if (!ID_PDF.test(id)) return null;
  const obj = await bucket.get(chave(id));
  if (!obj) return null;
  const criado = Number(obj.customMetadata?.criadoEm ?? 0);
  return agora - criado < VALIDADE_MS ? obj : null;
}

export async function limparPdfs(bucket: R2Bucket, agora = Date.now()): Promise<number> {
  let apagados = 0;
  let cursor: string | undefined;
  do {
    const pagina = await bucket.list({ cursor, include: ["customMetadata"] });
    const velhos = pagina.objects
      .filter((o) => agora - Number(o.customMetadata?.criadoEm ?? 0) >= VALIDADE_MS)
      .map((o) => o.key);
    if (velhos.length) await bucket.delete(velhos);
    apagados += velhos.length;
    cursor = pagina.truncated ? pagina.cursor : undefined;
  } while (cursor);
  return apagados;
}
```

- [ ] **Passo 4: rodar o teste e ver que ele passa**

Rodar: `cd mcp-remote && npx vitest run test/pdf.test.ts && npx tsc --noEmit`
Esperado: PASS (3 testes) e nenhum erro de tipo.

- [ ] **Passo 5: commit**

```bash
git add mcp-remote/src/pdf.ts mcp-remote/test/pdf.test.ts
git commit -m "mcp-remote: PDFs temporários no R2 com validade de 1 hora"
```

---

### Tarefa 7: Worker MCP (rotas, limite, páginas) e fumaça sem DANFSe

**Arquivos:**
- Criar: `mcp-remote/src/paginas.ts`, `mcp-remote/src/index.ts`, `mcp-remote/wrangler.toml`, `mcp-remote/test/fumaca.mjs`

**Interfaces:**
- Consome: `criarServidor` e `GeradorDanfse` (Tarefa 5); `salvarPdf`, `lerPdf` e `limparPdfs` (Tarefa 6).
- Produz:
  - `interface Env { RATE_LIMITER: RateLimit; PDFS: R2Bucket; DANFSE: Fetcher }`;
  - `default export { fetch, scheduled }`;
  - script `npm run fumaca` com `BASE` (padrão `http://localhost:8787`) e `FUMACA_DANFSE=1` opcional.
- **Nota:** o binding `DANFSE` só existe de verdade a partir da Tarefa 8. Até lá, `rtc_gerar_danfse` aparece, mas falha se for chamada; a fumaça desta tarefa não a chama.

- [ ] **Passo 1: `wrangler.toml` do Worker MCP**

`mcp-remote/wrangler.toml`:
```toml
name = "calculadora-rtc-mcp"
main = "src/index.ts"
compatibility_date = "2026-11-01"
compatibility_flags = ["nodejs_compat"]

[[ratelimits]]
name = "RATE_LIMITER"
namespace_id = "1001"
simple = { limit = 60, period = 60 }

[[r2_buckets]]
binding = "PDFS"
bucket_name = "calculadora-rtc-danfse-pdf"

[[services]]
binding = "DANFSE"
service = "calculadora-rtc-danfse"

[triggers]
crons = ["0 * * * *"]

[observability]
enabled = true
head_sampling_rate = 1
```

- [ ] **Passo 2: páginas**

`mcp-remote/src/paginas.ts`:
```ts
const layout = (titulo: string, corpo: string) => `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>${titulo}</title>
<style>body{font:16px/1.6 system-ui,sans-serif;max-width:46rem;margin:2rem auto;padding:0 1rem;color:#1f2328;background:#fff}
code,pre{background:#f3f4f6;border-radius:4px;padding:.1rem .3rem}pre{padding:.8rem;overflow:auto}
@media (prefers-color-scheme:dark){body{color:#e6edf3;background:#0d1117}code,pre{background:#161b22}}</style>
</head><body>${corpo}</body></html>`;

export function paginaInicial(origem: string): string {
  return layout(
    "Calculadora RTC — MCP",
    `<h1>Calculadora RTC — MCP remoto</h1>
<p>Servidor MCP aberto com os dados da Calculadora da Reforma Tributária do Consumo (CBS, IBS e IS — LC 214/2025):
classificações tributárias, anexos de NCM/NBS, Imposto Seletivo, Simples Nacional, códigos de erro, municípios e geração do DANFSe.</p>
<h2>Como conectar</h2>
<p>URL do servidor (Streamable HTTP): <code>${origem}/mcp</code></p>
<p>Claude Code:</p><pre>claude mcp add --transport http calculadora-rtc ${origem}/mcp</pre>
<p>Outros clientes: adicione um servidor MCP remoto com a URL acima. Não há login.</p>
<p>Limite: 60 requisições por minuto por IP. Este servidor não calcula tributos.</p>
<p><a href="/privacidade">Privacidade</a> · Projeto não oficial: não é mantido nem endossado pela Receita Federal ou pelo Serpro.</p>`,
  );
}

export function paginaPrivacidade(): string {
  return layout(
    "Privacidade — Calculadora RTC MCP",
    `<h1>Privacidade</h1>
<ul>
<li>As consultas usam só dados públicos. Nada do que você envia nelas é guardado.</li>
<li>No DANFSe, o XML da NFS-e é usado apenas para gerar o PDF e não é gravado nem registrado em log.</li>
<li>O PDF gerado fica disponível por um link aleatório durante 1 hora e é apagado depois.</li>
<li>Os registros técnicos guardam só a rota, o status e a duração das requisições.</li>
<li>Projeto não oficial: não substitui orientação profissional nem os sistemas oficiais de documentos fiscais.</li>
</ul>`,
  );
}
```

- [ ] **Passo 3: Worker `src/index.ts`**

```ts
// Worker do MCP remoto: /mcp (Streamable HTTP sem estado), páginas, download de PDF e limpeza horária.
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { paginaInicial, paginaPrivacidade } from "./paginas";
import { lerPdf, limparPdfs, salvarPdf } from "./pdf";
import { criarServidor, type GeradorDanfse } from "./server";

export interface Env {
  RATE_LIMITER: RateLimit;
  PDFS: R2Bucket;
  DANFSE: Fetcher;
}

const LIMITE_CORPO = 2_000_000;
const html = (corpo: string) => new Response(corpo, { headers: { "content-type": "text/html; charset=utf-8" } });
const json = (dado: unknown, status: number, extra: HeadersInit = {}) =>
  new Response(JSON.stringify(dado), { status, headers: { "content-type": "application/json", ...extra } });

function gerador(env: Env, origem: string): GeradorDanfse {
  return async (xml, stc, canhoto) => {
    const r = await env.DANFSE.fetch("https://danfse.interno/", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ xml, stc, canhoto }),
    });
    if (!r.ok) {
      const corpo = (await r.json().catch(() => ({}))) as { erro?: string };
      throw new Error(corpo.erro ?? `gerador de DANFSe respondeu HTTP ${r.status}`);
    }
    const pdf = await r.arrayBuffer();
    const { id, expiraEm } = await salvarPdf(env.PDFS, pdf);
    return { url: `${origem}/pdf/${id}`, bytes: pdf.byteLength, expiraEm };
  };
}

async function mcp(request: Request, env: Env, origem: string): Promise<Response> {
  if (request.method !== "POST") return json({ erro: "Use POST (servidor sem estado)." }, 405, { allow: "POST" });
  const tamanho = Number(request.headers.get("content-length") ?? 0);
  if (tamanho > LIMITE_CORPO) return json({ erro: "Requisição acima de 2 MB." }, 413);
  const texto = await request.text();
  if (texto.length > LIMITE_CORPO) return json({ erro: "Requisição acima de 2 MB." }, 413);
  let corpo: unknown;
  try {
    corpo = JSON.parse(texto);
  } catch {
    return json({ jsonrpc: "2.0", error: { code: -32700, message: "JSON inválido" }, id: null }, 400);
  }
  const server = criarServidor({ gerarDanfse: gerador(env, origem) });
  const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
  await server.connect(transport);
  return transport.handleRequest(request, { parsedBody: corpo });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origem = url.origin;
    const ip = request.headers.get("cf-connecting-ip") ?? "local";
    const { success } = await env.RATE_LIMITER.limit({ key: ip });
    if (!success) return json({ erro: "Limite de 60 requisições por minuto excedido." }, 429, { "retry-after": "60" });

    if (url.pathname === "/mcp") return mcp(request, env, origem);
    if (url.pathname === "/" && request.method === "GET") return html(paginaInicial(origem));
    if (url.pathname === "/privacidade" && request.method === "GET") return html(paginaPrivacidade());
    const m = url.pathname.match(/^\/pdf\/([^/]+)$/);
    if (m && request.method === "GET") {
      const obj = await lerPdf(env.PDFS, m[1]);
      if (!obj) return new Response("Link expirado ou inexistente.", { status: 404 });
      return new Response(obj.body, {
        headers: {
          "content-type": "application/pdf",
          "content-disposition": 'attachment; filename="danfse.pdf"',
          "cache-control": "no-store",
        },
      });
    }
    return new Response("Não encontrado.", { status: 404 });
  },

  async scheduled(_evento: ScheduledController, env: Env): Promise<void> {
    const n = await limparPdfs(env.PDFS);
    console.log(JSON.stringify({ evento: "limpeza-pdf", apagados: n }));
  },
} satisfies ExportedHandler<Env>;
```

- [ ] **Passo 4: script de fumaça**

`mcp-remote/test/fumaca.mjs`:
```js
#!/usr/bin/env node
// Fumaça de ponta a ponta contra um Worker no ar (wrangler dev ou deploy).
// Uso: BASE=http://localhost:8787 [FUMACA_DANFSE=1] node test/fumaca.mjs
import { readFileSync } from "node:fs";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const BASE = process.env.BASE ?? "http://localhost:8787";
const falhas = [];
const conferir = (nome, cond, detalhe = "") => {
  console.log(`${cond ? "ok  " : "FALHA"} ${nome}${detalhe ? ` — ${detalhe}` : ""}`);
  if (!cond) falhas.push(nome);
};

const client = new Client({ name: "fumaca", version: "0.0.0" });
await client.connect(new StreamableHTTPClientTransport(new URL(`${BASE}/mcp`)));
const nomes = (await client.listTools()).tools.map((t) => t.name);
conferir("tools/list", nomes.length >= 9, nomes.join(", "));

const chamar = async (name, args) => {
  const r = await client.callTool({ name, arguments: args });
  return { erro: Boolean(r.isError), texto: r.content?.[0]?.text ?? "" };
};
let r = await chamar("rtc_status", {});
conferir("rtc_status", !r.erro && r.texto.includes("versaoDb"));
r = await chamar("rtc_consultar_classificacao", { cClassTrib: "200028" });
conferir("rtc_consultar_classificacao", !r.erro && r.texto.includes("educação"));
r = await chamar("rtc_buscar_classificacoes", { texto: "cesta basica" });
conferir("rtc_buscar_classificacoes", !r.erro && r.texto.includes("200003"));
r = await chamar("rtc_validar_nomenclatura", { cClassTrib: "200003", ncm: "02074300" });
conferir("rtc_validar_nomenclatura", !r.erro && r.texto.includes("REG-011"));
r = await chamar("rtc_consultar_nomenclatura", { tipo: "nbs", codigo: "122011200" });
conferir("rtc_consultar_nomenclatura", !r.erro && r.texto.includes("200028"));
r = await chamar("rtc_atividades_simples", { codigo: "01" });
conferir("rtc_atividades_simples", !r.erro && r.texto.includes("Revenda"));
r = await chamar("rtc_explicar_erro", { codigo: "REG-037" });
conferir("rtc_explicar_erro", !r.erro && r.texto.includes("aliquotasNominais"));
r = await chamar("rtc_municipio", { nome: "porto alegre", uf: "RS" });
conferir("rtc_municipio", !r.erro && r.texto.includes("4314902"));

if (process.env.FUMACA_DANFSE) {
  const xml = readFileSync(new URL("../../examples/nfse-ficticia.xml", import.meta.url), "utf8");
  r = await chamar("rtc_gerar_danfse", { xml });
  const link = !r.erro && JSON.parse(r.texto).url;
  conferir("rtc_gerar_danfse", Boolean(link), r.erro ? r.texto : link);
  if (link) {
    const pdf = await fetch(link);
    const ini = new TextDecoder().decode((await pdf.arrayBuffer()).slice(0, 5));
    conferir("download do PDF", pdf.ok && ini === "%PDF-", `${pdf.status} ${ini}`);
  }
}

for (const [rota, esperado] of [["/", 200], ["/privacidade", 200], ["/pdf/" + "0".repeat(32), 404]]) {
  const s = (await fetch(BASE + rota)).status;
  conferir(`GET ${rota}`, s === esperado, String(s));
}
const get = await fetch(`${BASE}/mcp`);
conferir("GET /mcp responde 405", get.status === 405, String(get.status));

await client.close();
if (falhas.length) {
  console.error(`\n${falhas.length} falha(s): ${falhas.join(", ")}`);
  process.exit(1);
}
console.log("\nfumaça ok");
```

- [ ] **Passo 5: rodar o Worker e a fumaça**

Rodar num terminal: `cd mcp-remote && npm run preparar && npx wrangler dev -c wrangler.toml --port 8787`
Em outro: `cd mcp-remote && npm run fumaca`
Esperado: todas as linhas com `ok` e a última linha `fumaça ok`. O `wrangler dev` avisa que o serviço `calculadora-rtc-danfse` não está rodando, o que é esperado nesta tarefa.

Rodar também: `npx tsc --noEmit` (esperado: sem erros).

- [ ] **Passo 6: commit**

```bash
git add mcp-remote/src/index.ts mcp-remote/src/paginas.ts mcp-remote/wrangler.toml mcp-remote/test/fumaca.mjs
git commit -m "mcp-remote: Worker com /mcp, limite por IP, páginas, /pdf e limpeza horária"
```

---

### Tarefa 8: Worker do DANFSe

**Arquivos:**
- Criar: `mcp-remote/danfse/wrangler.toml`, `mcp-remote/danfse/src/index.ts`, `mcp-remote/danfse/src/wasm.d.ts`

**Interfaces:**
- Consome: `danfse/vendor/danfse.wasm` e `danfse/vendor/wasm_exec.js` (copiados pelo `preparar`, Tarefa 2). A API global do WASM é `globalThis.danfseWasm.gerarPdf(json: string): { pdf?: string /* base64 */; size?: number; error?: string }` e `globalThis.danfseWasm.ready: boolean` (ver `upstream/gerador-danfse/cmd/danfse-wasm/main.go`).
- Produz: Worker `calculadora-rtc-danfse`. `POST /` recebe `{xml: string, stc: 0|1|2, canhoto: boolean}` e devolve 200 `application/pdf`, 422 `{erro}` ou 400 `{erro}`. Esse é o contrato usado por `gerador()` em `src/index.ts` (Tarefa 7).

**Risco conhecido:** o Workers compila módulos WASM na inicialização. Um módulo de 29 MB pode estourar o limite de tempo de inicialização no deploy real, mesmo funcionando no `wrangler dev`. Se o `wrangler deploy --dry-run` acusar tamanho acima do limite, ou se a inicialização falhar, **pare e informe o usuário**: a alternativa é o Cloudflare Containers com o binário nativo do gerador, e isso exige uma decisão dele.

- [ ] **Passo 1: configuração**

`mcp-remote/danfse/wrangler.toml`:
```toml
name = "calculadora-rtc-danfse"
main = "src/index.ts"
compatibility_date = "2026-11-01"
workers_dev = false
preview_urls = false

[limits]
cpu_ms = 30000

[observability]
enabled = true
head_sampling_rate = 1
```

`mcp-remote/danfse/src/wasm.d.ts`:
```ts
declare module "*.wasm" {
  const modulo: WebAssembly.Module;
  export default modulo;
}
```

- [ ] **Passo 2: Worker `danfse/src/index.ts`**

```ts
// Worker interno (só service binding) que gera o DANFSe com o WASM oficial do gerador da Receita.
// O XML recebido não é gravado nem registrado em log.
import "../vendor/wasm_exec.js";
import modulo from "../vendor/danfse.wasm";

interface DanfseWasm {
  ready: boolean;
  error?: string;
  gerarPdf(json: string): { pdf?: string; size?: number; error?: string };
}
declare global {
  // eslint-disable-next-line no-var
  var danfseWasm: DanfseWasm | undefined;
  // eslint-disable-next-line no-var
  var Go: new () => { importObject: WebAssembly.Imports; run(instance: WebAssembly.Instance): Promise<void> };
}

let pronto: Promise<void> | null = null;

async function iniciar(): Promise<void> {
  const go = new globalThis.Go();
  const instancia = await WebAssembly.instantiate(modulo, go.importObject);
  void go.run(instancia); // não resolve: o main do Go fica vivo com select{}
  for (let i = 0; i < 300 && !globalThis.danfseWasm; i++) await new Promise((r) => setTimeout(r, 10));
  if (!globalThis.danfseWasm?.ready) throw new Error(`Falha ao iniciar o WASM: ${globalThis.danfseWasm?.error ?? "módulo não respondeu"}`);
}

const json = (dado: unknown, status: number) =>
  new Response(JSON.stringify(dado), { status, headers: { "content-type": "application/json" } });

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== "POST") return json({ erro: "Use POST." }, 405);
    let corpo: { xml?: unknown; stc?: unknown; canhoto?: unknown };
    try {
      corpo = await request.json();
    } catch {
      return json({ erro: "JSON inválido." }, 400);
    }
    if (typeof corpo.xml !== "string" || ![0, 1, 2].includes(corpo.stc as number))
      return json({ erro: "Campos obrigatórios: xml (texto) e stc (0, 1 ou 2)." }, 400);
    try {
      pronto ??= iniciar().catch((e) => {
        pronto = null;
        throw e;
      });
      await pronto;
    } catch (e) {
      return json({ erro: e instanceof Error ? e.message : String(e) }, 500);
    }
    const r = globalThis.danfseWasm!.gerarPdf(JSON.stringify({ xml: corpo.xml, stc: corpo.stc, canhoto: corpo.canhoto !== false }));
    if (r.error || !r.pdf) return json({ erro: r.error ?? "gerador não devolveu PDF" }, 422);
    const bin = atob(r.pdf);
    const pdf = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) pdf[i] = bin.charCodeAt(i);
    return new Response(pdf, { headers: { "content-type": "application/pdf" } });
  },
} satisfies ExportedHandler;
```

- [ ] **Passo 3: rodar os dois Workers e a fumaça completa**

Rodar num terminal: `cd mcp-remote && npm run dev`
Esse comando sobe os dois Workers com o service binding local. O R2 é simulado localmente.
Em outro: `cd mcp-remote && FUMACA_DANFSE=1 npm run fumaca`
Esperado: inclui `ok   rtc_gerar_danfse — http://localhost:8787/pdf/<32 hex>` e `ok   download do PDF — 200 %PDF-`, e termina com `fumaça ok`.

- [ ] **Passo 4: conferir o bundle para deploy**

Rodar: `cd mcp-remote && npm run verificar-deploy`
Esperado: os dois `--dry-run` terminam sem erro. Anote o tamanho comprimido (`Total Upload: ... / gzip: ...`) do `calculadora-rtc-danfse`: ele precisa ficar abaixo de 10 MB (gzip). Se passar disso, pare e informe o usuário (ver "Risco conhecido").

- [ ] **Passo 5: commit**

```bash
git add mcp-remote/danfse/wrangler.toml mcp-remote/danfse/src
git commit -m "mcp-remote: Worker interno do DANFSe com o WASM oficial"
```

---

### Tarefa 9: paridade com a API oficial, CI e documentação

**Arquivos:**
- Criar: `mcp-remote/test/paridade.test.ts`
- Alterar: `.github/workflows/ci.yml`, `README.md`, `skill/reforma-tributaria-ibs-cbs/SKILL.md` (seção "Ferramentas opcionais"), `docs/superpowers/specs/2026-11-24-mcp-remoto-design.md` (seção "Testes")

**Interfaces:**
- Consome: `anexos`, `classificacao` (Tarefa 2) e `validarNomenclatura`, `TAMANHO` (Tarefa 3).
- Produz: um teste que só roda quando `RTC_PARIDADE_URL` estiver definida (ex.: `http://localhost:8080/api`).

- [ ] **Passo 1: escrever o teste de paridade**

`mcp-remote/test/paridade.test.ts`:
```ts
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
```

- [ ] **Passo 2: rodar a paridade localmente**

Rodar (com as APIs no ar): `cd mcp-remote && RTC_PARIDADE_URL=http://localhost:8080/api npx vitest run test/paridade.test.ts`
Esperado: PASS, com o nome do teste mostrando o número de casos. Se houver divergências, a mensagem lista cada uma; corrija `src/nomenclatura.ts` (Tarefa 3) até zerar.
Rodar sem a variável: `npx vitest run test/paridade.test.ts`
Esperado: `skipped`.

- [ ] **Passo 3: CI**

Em `.github/workflows/ci.yml`:
- No `actions/setup-node@v4`, trocar `cache-dependency-path: mcp-server/package-lock.json` por:

```yaml
          cache-dependency-path: |
            mcp-server/package-lock.json
            mcp-remote/package-lock.json
```

- Logo depois do passo `Gerar dados do site`, acrescentar:

```yaml
      - name: Testar MCP remoto (unitários e paridade com a API oficial)
        working-directory: mcp-remote
        env:
          RTC_PARIDADE_URL: http://localhost:8080/api
        run: npm ci && npm test && npx tsc --noEmit

      - name: Conferir bundle do MCP remoto (dry-run)
        working-directory: mcp-remote
        run: npm run verificar-deploy
```

- No fim do arquivo, acrescentar o job de deploy, que só roda com o secret configurado:

```yaml
  deploy-mcp-remoto:
    needs: build-and-smoke
    if: github.ref == 'refs/heads/main' && github.event_name != 'pull_request'
    runs-on: ubuntu-latest
    env:
      CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
      CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
    steps:
      - name: Verificar credenciais
        id: cred
        run: |
          if [ -z "$CLOUDFLARE_API_TOKEN" ]; then echo "Sem CLOUDFLARE_API_TOKEN: deploy pulado."; echo "ok=false" >> "$GITHUB_OUTPUT"; else echo "ok=true" >> "$GITHUB_OUTPUT"; fi
      - uses: actions/checkout@v4
        if: steps.cred.outputs.ok == 'true'
      - uses: actions/download-artifact@v4
        if: steps.cred.outputs.ok == 'true'
        with:
          name: mcp-remote-pacote
          path: mcp-remote
      - uses: actions/setup-node@v4
        if: steps.cred.outputs.ok == 'true'
        with:
          node-version: "24"
      - name: Deploy dos Workers
        if: steps.cred.outputs.ok == 'true'
        working-directory: mcp-remote
        run: |
          npm ci
          npx wrangler deploy -c danfse/wrangler.toml
          npx wrangler deploy -c wrangler.toml
```

- No job `build-and-smoke`, logo depois do passo `Conferir bundle do MCP remoto (dry-run)`, publicar os dados preparados para o job de deploy:

```yaml
      - name: Publicar pacote do MCP remoto
        uses: actions/upload-artifact@v4
        with:
          name: mcp-remote-pacote
          path: |
            mcp-remote/data
            mcp-remote/danfse/vendor
```

- [ ] **Passo 4: documentação**

No `README.md`, logo antes de `## Ferramentas`, acrescentar:

````markdown
## MCP remoto (sem instalar nada)

Também existe uma versão hospedada, só de consulta: classificações, anexos de NCM/NBS, Imposto Seletivo, Simples Nacional, códigos de erro, municípios e geração do DANFSe. O código fica em [`mcp-remote/`](mcp-remote/) e roda no Cloudflare Workers. Ela **não calcula** tributos: para isso, use o MCP local acima.

```bash
claude mcp add --transport http calculadora-rtc https://<url-do-worker>/mcp
```

Não há login. O limite é de 60 requisições por minuto por IP. O PDF do DANFSe fica disponível por 1 hora e o XML não é guardado (veja `/privacidade` no próprio servidor).

Desenvolvimento local, depois de gerar `site/data` com `node scripts/export-site-data.mjs`:

```bash
cd mcp-remote && npm install && npm test && npm run dev
```

Para publicar, é preciso uma conta Cloudflare com Workers Paid, o bucket R2 `calculadora-rtc-danfse-pdf` e os secrets `CLOUDFLARE_API_TOKEN` e `CLOUDFLARE_ACCOUNT_ID` no repositório. O CI publica a cada push no `main`.
````

Em `skill/reforma-tributaria-ibs-cbs/SKILL.md`, na seção "## Ferramentas opcionais", trocar o primeiro parágrafo por:

```markdown
Se o agente do usuário tiver o servidor MCP **calculadora-rtc** conectado (ferramentas `rtc_*`), prefira as ferramentas às contas na mão. Há duas versões. A **remota** só faz consultas: `rtc_buscar_classificacoes`, `rtc_consultar_classificacao`, `rtc_validar_nomenclatura`, `rtc_consultar_nomenclatura`, `rtc_explicar_erro`, `rtc_atividades_simples`, `rtc_municipio` e `rtc_gerar_danfse`. A **local**, que roda as APIs oficiais na máquina do usuário, também calcula (`rtc_calcular_regime_geral`, `rtc_calcular_simples_nacional`) e gera e valida XML (`rtc_gerar_xml`, `rtc_validar_xml`).
```

No spec, seção "## Testes", trocar o item "**Unitários** (`vitest` com `@cloudflare/vitest-pool-workers`)" por "**Unitários** (`vitest` em Node, porque a lógica é pura; o runtime do Worker é coberto pela fumaça com `wrangler dev`)".

- [ ] **Passo 5: rodar tudo**

Rodar:
```bash
cd mcp-remote && npm test && npx tsc --noEmit && npm run verificar-deploy
```
Esperado: todos os testes passam (a paridade aparece como skipped se `RTC_PARIDADE_URL` não estiver definida), sem erros de tipo e com os dois dry-runs concluídos.

- [ ] **Passo 6: commit**

```bash
git add mcp-remote/test/paridade.test.ts .github/workflows/ci.yml README.md skill/reforma-tributaria-ibs-cbs/SKILL.md docs/superpowers/specs/2026-11-24-mcp-remoto-design.md
git commit -m "mcp-remote: paridade com a API oficial, CI com dry-run e deploy condicional, documentação"
```

---

## Fora deste plano (dependem do usuário)

1. Criar a conta Cloudflare, assinar o Workers Paid e criar o bucket R2 `calculadora-rtc-danfse-pdf`.
2. Criar o token de API (Workers Scripts: Edit; Workers R2 Storage: Edit) e cadastrar `CLOUDFLARE_API_TOKEN` e `CLOUDFLARE_ACCOUNT_ID` nos secrets do GitHub.
3. Depois do primeiro deploy, pôr a URL real no README, no `SKILL.md`, regerar o zip e atualizar o anúncio no Agensi.
