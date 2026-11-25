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
