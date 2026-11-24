// Formatação das respostas das APIs para o cliente MCP.
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { ApiError, type ApiResponse } from "./http.js";

const MAX_CHARS = Number(process.env.RTC_MAX_RESPONSE_CHARS ?? 60_000);

export function textResult(text: string, isError = false): CallToolResult {
  return { content: [{ type: "text", text }], isError };
}

function truncate(text: string): string {
  if (text.length <= MAX_CHARS) return text;
  return (
    text.slice(0, MAX_CHARS) +
    `\n\n[... resposta truncada: ${text.length.toLocaleString("pt-BR")} caracteres no total. ` +
    "Refine a consulta (filtros, código específico) para ver menos dados.]"
  );
}

function pretty(text: string, contentType: string): string {
  if (contentType.includes("json")) {
    try {
      return JSON.stringify(JSON.parse(text), null, 2);
    } catch {
      /* devolve como veio */
    }
  }
  return text;
}

/** Converte a resposta HTTP em resultado MCP; status >= 400 vira isError com o corpo da API. */
export function apiResult(res: ApiResponse, extraNote?: string): CallToolResult {
  const body = pretty(res.text ?? "", res.contentType);
  const notes: string[] = [];
  const simulado = res.headers.get("x-warning-dados-simulados");
  if (simulado) notes.push(`Aviso da API (x-warning-dados-simulados): ${simulado}`);
  if (extraNote) notes.push(extraNote);
  const prefix = res.status >= 400 ? `HTTP ${res.status} — a API rejeitou a requisição:\n` : "";
  const suffix = notes.length ? `\n\n${notes.join("\n")}` : "";
  return textResult(truncate(prefix + body) + suffix, res.status >= 400);
}

export async function guard(fn: () => Promise<CallToolResult>): Promise<CallToolResult> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof ApiError) return textResult(err.message, true);
    return textResult(`Erro inesperado: ${err instanceof Error ? err.message : String(err)}`, true);
  }
}
