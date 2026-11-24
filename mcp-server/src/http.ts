// Cliente HTTP mínimo para as três APIs da Calculadora RTC.

export interface Endpoints {
  regime: string; // ex.: http://localhost:8080/api
  simples: string; // ex.: http://localhost:8082/api
  danfse: string; // ex.: http://localhost:8090/api
}

export function loadEndpoints(env: NodeJS.ProcessEnv = process.env): Endpoints {
  const strip = (u: string) => u.replace(/\/+$/, "");
  return {
    regime: strip(env.RTC_REGIME_URL ?? "http://localhost:8080/api"),
    simples: strip(env.RTC_SIMPLES_URL ?? "http://localhost:8082/api"),
    danfse: strip(env.RTC_DANFSE_URL ?? "http://localhost:8090/api"),
  };
}

const TIMEOUT_MS = Number(process.env.RTC_HTTP_TIMEOUT_MS ?? 60_000);

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly body?: string,
  ) {
    super(message);
  }
}

export interface ApiResponse {
  status: number;
  contentType: string;
  headers: Headers;
  text?: string;
  bytes?: Uint8Array;
}

type Query = Record<string, string | number | boolean | undefined | null>;

export function withQuery(url: string, query?: Query): string {
  if (!query) return url;
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
  }
  const s = qs.toString();
  return s ? `${url}?${s}` : url;
}

export async function request(
  url: string,
  init: { method?: "GET" | "POST"; json?: unknown; body?: string; contentType?: string; binary?: boolean } = {},
): Promise<ApiResponse> {
  const headers: Record<string, string> = { Accept: "application/json, application/xml, application/pdf, */*" };
  let body: string | undefined;
  if (init.json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(init.json);
  } else if (init.body !== undefined) {
    headers["Content-Type"] = init.contentType ?? "text/plain";
    body = init.body;
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method: init.method ?? (body !== undefined ? "POST" : "GET"),
      headers,
      body,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (err) {
    const cause = err instanceof Error ? err.message : String(err);
    throw new ApiError(
      `Não foi possível conectar em ${new URL(url).origin} (${cause}). ` +
        "Verifique se as APIs estão rodando (scripts/run.sh ou docker compose up) " +
        "e se RTC_REGIME_URL / RTC_SIMPLES_URL / RTC_DANFSE_URL estão corretas.",
    );
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (init.binary && res.ok) {
    return { status: res.status, contentType, headers: res.headers, bytes: new Uint8Array(await res.arrayBuffer()) };
  }
  return { status: res.status, contentType, headers: res.headers, text: await res.text() };
}
