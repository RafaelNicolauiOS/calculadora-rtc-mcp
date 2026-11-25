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
