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
