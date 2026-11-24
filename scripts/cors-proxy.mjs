#!/usr/bin/env node
// Proxy HTTP sem dependências que expõe as três APIs da Calculadora RTC numa única porta, com CORS.
// A API do regime regular não envia cabeçalhos CORS, então um site em outro domínio (ex.: GitHub Pages)
// não consegue chamá-la direto. Este proxy resolve isso sem alterar o código oficial.
//
//   /regime/*   -> RTC_REGIME_URL  (padrão http://localhost:8080/api)
//   /simples/*  -> RTC_SIMPLES_URL (padrão http://localhost:8082/api)
//   /danfse/*   -> RTC_DANFSE_URL  (padrão http://localhost:8090/api)
//
// Variáveis:
//   RTC_PROXY_PORT    porta (padrão 8079)
//   RTC_PROXY_HOST    interface (padrão 127.0.0.1; use 0.0.0.0 só atrás de um proxy reverso com HTTPS)
//   RTC_CORS_ORIGINS  origens liberadas, separadas por vírgula. Aceita * no fim de um prefixo,
//                     ex.: "https://fulano.github.io,http://localhost:*". Padrão: GitHub Pages + localhost.
import http from "node:http";

const PORT = Number(process.env.RTC_PROXY_PORT ?? 8079);
const HOST = process.env.RTC_PROXY_HOST ?? "127.0.0.1";
const MAX_BODY = 6 * 1024 * 1024; // um pouco acima do limite de XML do DANFSe (5 MiB)

const strip = (u) => u.replace(/\/+$/, "");
const ALVOS = {
  regime: strip(process.env.RTC_REGIME_URL ?? "http://localhost:8080/api"),
  simples: strip(process.env.RTC_SIMPLES_URL ?? "http://localhost:8082/api"),
  danfse: strip(process.env.RTC_DANFSE_URL ?? "http://localhost:8090/api"),
};

const ORIGENS = (process.env.RTC_CORS_ORIGINS ?? "https://*.github.io,http://localhost:*,http://127.0.0.1:*")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

function origemPermitida(origin) {
  if (!origin) return false;
  return ORIGENS.some((padrao) => {
    if (padrao === "*") return true;
    // Converte o padrão em regex: * casa qualquer sequência sem "/" (subdomínio ou porta).
    const re = new RegExp("^" + padrao.split("*").map((p) => p.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join("[^/]*") + "$");
    return re.test(origin);
  });
}

function cors(req, res) {
  const origin = req.headers.origin;
  if (!origemPermitida(origin)) return false;
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Expose-Headers", "Content-Type, x-warning-dados-simulados");
  res.setHeader("Access-Control-Max-Age", "3600");
  // Chrome (Private Network Access): site público chamando localhost exige este cabeçalho no preflight.
  if (req.headers["access-control-request-private-network"]) {
    res.setHeader("Access-Control-Allow-Private-Network", "true");
  }
  return true;
}

const server = http.createServer(async (req, res) => {
  const permitido = cors(req, res);
  if (req.method === "OPTIONS") {
    res.writeHead(permitido ? 204 : 403).end();
    return;
  }
  if (req.headers.origin && !permitido) {
    res.writeHead(403, { "Content-Type": "application/json" }).end(JSON.stringify({ erro: "Origem não permitida", origem: req.headers.origin }));
    return;
  }

  const url = new URL(req.url ?? "/", "http://proxy");
  if (url.pathname === "/" || url.pathname === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify({ status: "ok", alvos: Object.keys(ALVOS) }));
    return;
  }
  const [, api, ...resto] = url.pathname.split("/");
  const base = ALVOS[api];
  if (!base || resto.some((s) => s === "..") || !["GET", "POST"].includes(req.method ?? "")) {
    res.writeHead(404, { "Content-Type": "application/json" }).end(JSON.stringify({ erro: "Rota desconhecida. Use /regime/, /simples/ ou /danfse/." }));
    return;
  }

  // Lê o corpo com limite de tamanho.
  const partes = [];
  let total = 0;
  for await (const parte of req) {
    total += parte.length;
    if (total > MAX_BODY) {
      res.writeHead(413).end();
      return;
    }
    partes.push(parte);
  }

  try {
    const alvo = `${base}/${resto.join("/")}${url.search}`;
    const resposta = await fetch(alvo, {
      method: req.method,
      headers: req.headers["content-type"] ? { "Content-Type": req.headers["content-type"] } : {},
      body: req.method === "POST" ? Buffer.concat(partes) : undefined,
      signal: AbortSignal.timeout(60_000),
    });
    const cabecalhos = { "Content-Type": resposta.headers.get("content-type") ?? "application/octet-stream" };
    const aviso = resposta.headers.get("x-warning-dados-simulados");
    if (aviso) cabecalhos["x-warning-dados-simulados"] = aviso;
    res.writeHead(resposta.status, cabecalhos).end(Buffer.from(await resposta.arrayBuffer()));
  } catch (err) {
    res.writeHead(502, { "Content-Type": "application/json" }).end(
      JSON.stringify({ erro: `API '${api}' indisponível: ${err instanceof Error ? err.message : String(err)}` }),
    );
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Proxy CORS da Calculadora RTC em http://${HOST}:${PORT}`);
  for (const [k, v] of Object.entries(ALVOS)) console.log(`  /${k}/  ->  ${v}/`);
  console.log(`  origens liberadas: ${ORIGENS.join(", ")}`);
});
