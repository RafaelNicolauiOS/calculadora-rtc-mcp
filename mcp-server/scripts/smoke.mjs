// Teste de fumaça: sobe o servidor MCP via stdio e chama cada ferramenta contra as APIs locais.
// Pré-requisito: APIs rodando (scripts/run.sh ou docker compose up).
//   npm run build && npm run smoke
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { existsSync, statSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../..");

const client = new Client({ name: "smoke", version: "0.0.0" });
await client.connect(new StdioClientTransport({ command: "node", args: [path.join(here, "../dist/index.js")] }));

const { tools } = await client.listTools();
console.log(`${tools.length} ferramentas: ${tools.map((t) => t.name).join(", ")}\n`);

const aliq = { cbs: 8.8, ibsEstadual: 0.05, ibsMunicipal: 0.05 };
const operacao = {
  id: "smoke-1",
  versao: "1.0.0",
  dhFatoGerador: "2027-03-10T10:00:00-03:00",
  municipio: 4314902,
  uf: "RS",
  itens: [
    { numero: 1, ncm: "10063021", cst: "200", cClassTrib: "200003", baseCalculo: 100, quantidade: 20, unidade: "KG", aliquotasNominais: aliq },
    { numero: 2, nbs: "122011200", cst: "200", cClassTrib: "200028", baseCalculo: 1200, aliquotasNominais: aliq },
  ],
};
const pdf = path.join(tmpdir(), `smoke-danfse-${process.pid}.pdf`);

let estrito;
const casos = [
  ["rtc_status", {}, (t) => t.includes("regime-regular: OK") && t.includes("simples-nacional: OK") && t.includes("gerador-danfse: OK")],
  ["rtc_esquema_entrada", { endpoint: "simples-nacional" }, (t) => t.includes("aliquotasEfetivas")],
  ["rtc_calcular_regime_geral", { operacao }, (t) => t.includes('"vCBS": "42.24"')],
  [
    "rtc_calcular_regime_geral",
    // Exemplo oficial de erro: NCM 02013000 não vinculada à cClassTrib 200035.
    { operacao: { ...operacao, itens: [{ numero: 1, ncm: "02013000", cst: "200", cClassTrib: "200035", baseCalculo: 80, aliquotasNominais: aliq }] } },
    (t) => t.includes("REG-011"),
  ],
  ["rtc_calcular_regime_geral", { operacao, modo: "estrito" }, (t) => ((estrito = JSON.parse(t.split("\n\nAviso")[0])), true)],
  ["rtc_base_calculo_unificada", { entrada: { anoFatoGerador: 2027, tipoDocumento: 55, natureza: "bem", vProd: 1000, vICMS: 180 } }, (t) => t.includes("baseRG")],
  ["rtc_consultar_classificacao", { cClassTrib: "200028", data: "2027-01-01" }, (t) => t.includes("educação")],
  ["rtc_buscar_classificacoes", { criterio: "cst", cst: "200", data: "2027-01-01" }, (t) => t.includes("200028")],
  ["rtc_validar_nomenclatura", { cClassTrib: "200035", ncm: "02013000", data: "2027-01-01" }, () => true],
  ["rtc_consultar_nomenclatura", { tipo: "ncm", codigo: "22030000", data: "2027-01-01" }, (t) => t.includes("Cervejas")],
  ["rtc_consultar_aliquotas", { esfera: "uf", codigo: "43", data: "2026-06-01" }, (t) => !t.startsWith("HTTP")],
  ["rtc_dados_abertos", { caminho: "/dados-abertos/ufs" }, (t) => t.includes("RS")],
  ["rtc_explicar_erro", { codigo: "REG-011" }, (t) => t.includes("NCM")],
  ["rtc_explicar_erro", { codigo: "VSN-034" }, (t) => !t.startsWith("HTTP 5")],
  [
    "rtc_calcular_simples_nacional",
    {
      operacao: {
        id: "smoke-sn", versao: "3.0.0", data: "2027-03-15", tpDoc: "55", CRT: "1",
        aliquotasEfetivas: { fatorR: true, impedimentoSublimite: false, anexoI: { pCBSSN: "1.1612", pIBSSN: "0.0129" } },
        itens: [{ numero: 1, cAtivSN: "01", cClassTrib: "000001", baseCalculo: "1000.00", valorImpostoSeletivo: "0.00" }],
      },
    },
    (t) => t.includes('"vCBSSN": "11.61"'),
  ],
  ["rtc_atividades_simples", { data: "2027-03-15", codigo: "01" }, (t) => !t.startsWith("HTTP")],
  ["rtc_gerar_danfse", { xml_path: path.join(repoRoot, "examples/nfse-ficticia.xml"), saida: pdf }, () => existsSync(pdf) && statSync(pdf).size > 1000],
];

let falhas = 0;
for (const [nome, args, ok] of casos) {
  const r = await client.callTool({ name: nome, arguments: args });
  const texto = r.content?.map((c) => c.text ?? "").join("\n") ?? "";
  const passou = !r.isError && ok(texto);
  if (!passou) falhas++;
  console.log(`${passou ? "PASSOU" : "FALHOU"}  ${nome} ${JSON.stringify(args).slice(0, 70)}`);
  if (!passou) console.log("   ", texto.slice(0, 600).replaceAll("\n", "\n    "));
}

// Gera e valida o XML a partir do cálculo estrito.
if (estrito) {
  const g = await client.callTool({ name: "rtc_gerar_xml", arguments: { tipo: "nfe", resultado_calculo: estrito } });
  const xml = g.content?.[0]?.text ?? "";
  const okG = !g.isError && xml.includes("<");
  console.log(`${okG ? "PASSOU" : "FALHOU"}  rtc_gerar_xml`);
  if (!okG) { falhas++; console.log("   ", xml.slice(0, 600)); }
  const v = await client.callTool({ name: "rtc_validar_xml", arguments: { tipo: "nfe", subtipo: "grupo", xml } });
  const okV = !v.isError;
  console.log(`${okV ? "PASSOU" : "FALHOU"}  rtc_validar_xml -> ${v.content?.[0]?.text?.slice(0, 200)}`);
  if (!okV) falhas++;
}

if (existsSync(pdf)) unlinkSync(pdf);
await client.close();
console.log(falhas ? `\n${falhas} falha(s).` : "\nTudo certo.");
process.exit(falhas ? 1 : 0);
