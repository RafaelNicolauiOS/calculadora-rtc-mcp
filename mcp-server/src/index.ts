#!/usr/bin/env node
// Servidor MCP (stdio) para a Calculadora de Tributos da Reforma Tributária do Consumo.
// Projeto NÃO OFICIAL: apenas encaminha chamadas para as APIs de código aberto (MIT)
// publicadas pela Receita Federal do Brasil, rodando localmente ou onde você apontar.
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadEndpoints } from "./http.js";
import { registerTools } from "./tools.js";

const server = new McpServer(
  { name: "calculadora-rtc", version: "0.1.0" },
  {
    instructions: [
      "Ferramentas da Calculadora de Tributos da Reforma Tributária do Consumo (CBS, IBS e Imposto Seletivo — LC 214/2025),",
      "baseadas no código aberto da Receita Federal. Projeto não oficial: os resultados não substituem orientação profissional",
      "nem os sistemas oficiais de autorização de documentos fiscais.",
      "Fluxo típico: rtc_consultar_classificacao / rtc_buscar_classificacoes para escolher CST e cClassTrib;",
      "rtc_validar_nomenclatura para conferir NCM/NBS; rtc_calcular_regime_geral ou rtc_calcular_simples_nacional;",
      "rtc_explicar_erro para códigos REG-/VSN-; rtc_gerar_xml e rtc_validar_xml para o grupo do DF-e;",
      "rtc_gerar_danfse para o PDF da NFS-e. Em dúvida sobre o formato, chame rtc_esquema_entrada.",
      "Se algo falhar por conexão, chame rtc_status.",
    ].join(" "),
  },
);

registerTools(server, loadEndpoints());

await server.connect(new StdioServerTransport());
