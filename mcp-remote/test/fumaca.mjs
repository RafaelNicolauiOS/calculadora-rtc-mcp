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
