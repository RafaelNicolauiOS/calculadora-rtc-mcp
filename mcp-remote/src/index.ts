// Worker do MCP remoto: /mcp (Streamable HTTP sem estado), páginas, download de PDF e limpeza horária.
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { lerCorpoLimitado } from "./corpo";
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
  const tamanho = Number(request.headers.get("content-length"));
  if (Number.isFinite(tamanho) && tamanho > LIMITE_CORPO) return json({ erro: "Requisição acima de 2 MB." }, 413);
  const texto = await lerCorpoLimitado(request, LIMITE_CORPO);
  if (texto === null) return json({ erro: "Requisição acima de 2 MB." }, 413);
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

/** Padrão da rota para o log: nunca o caminho cru (evita registrar ids de PDF). */
function rotaDe(pathname: string): string {
  if (pathname === "/mcp" || pathname === "/" || pathname === "/privacidade") return pathname;
  if (/^\/pdf\/[^/]+$/.test(pathname)) return "/pdf/:id";
  return "outra";
}

async function tratar(request: Request, env: Env, url: URL): Promise<Response> {
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
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const inicio = Date.now();
    const url = new URL(request.url);
    let resposta: Response;
    try {
      resposta = await tratar(request, env, url);
    } catch {
      resposta = json({ erro: "Erro interno." }, 500);
    }
    // Único log por requisição: só rota (padrão), status e duração. Sem IP, user-agent, URL crua ou corpo.
    console.log(JSON.stringify({ rota: rotaDe(url.pathname), status: resposta.status, ms: Date.now() - inicio }));
    return resposta;
  },

  async scheduled(_evento: ScheduledController, env: Env): Promise<void> {
    const n = await limparPdfs(env.PDFS);
    console.log(JSON.stringify({ evento: "limpeza-pdf", apagados: n }));
  },
} satisfies ExportedHandler<Env>;
