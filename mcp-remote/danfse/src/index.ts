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
let goAtual: { exited?: boolean } | null = null;

// O gerador em Go escreve logs e stack traces com trechos do XML em stdout/stderr.
// O wasm_exec.js os envia ao console; aqui a saída é descartada.
function silenciarSaidaDoGo(): void {
  const fs = (globalThis as any).fs;
  fs.writeSync = (_fd: number, buf: Uint8Array) => buf.length;
  fs.write = (_fd: number, buf: Uint8Array, offset: number, length: number, position: number | null, callback: (e: Error | null, n?: number) => void) => {
    callback(null, buf.length);
  };
}

function reiniciar(): void {
  pronto = null;
  goAtual = null;
  globalThis.danfseWasm = undefined;
}

async function iniciar(): Promise<void> {
  globalThis.danfseWasm = undefined;
  silenciarSaidaDoGo();
  const go = new globalThis.Go();
  goAtual = go as unknown as { exited?: boolean };
  const instancia = await WebAssembly.instantiate(modulo, go.importObject);
  void go.run(instancia); // não resolve: o main do Go fica vivo com select{}
  for (let i = 0; i < 300 && !globalThis.danfseWasm; i++) await new Promise((r) => setTimeout(r, 10));
  const w = globalThis.danfseWasm as DanfseWasm | undefined;
  if (!w?.ready) throw new Error(`Falha ao iniciar o WASM: ${w?.error ?? "módulo não respondeu"}`);
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
      if (goAtual?.exited) reiniciar();
      pronto ??= iniciar().catch((e) => {
        reiniciar();
        throw e;
      });
      await pronto;
    } catch {
      return json({ erro: "Falha ao iniciar o gerador de DANFSe." }, 500);
    }
    try {
      const r = globalThis.danfseWasm!.gerarPdf(JSON.stringify({ xml: corpo.xml, stc: corpo.stc, canhoto: corpo.canhoto !== false }));
      if (goAtual?.exited) {
        reiniciar();
        return json({ erro: "Falha ao gerar o DANFSe." }, 500);
      }
      if (r.error || !r.pdf) return json({ erro: r.error ?? "gerador não devolveu PDF" }, 422);
      const bin = atob(r.pdf);
      const pdf = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) pdf[i] = bin.charCodeAt(i);
      return new Response(pdf, { headers: { "content-type": "application/pdf" } });
    } catch {
      reiniciar();
      return json({ erro: "Falha ao gerar o DANFSe." }, 500);
    }
  },
} satisfies ExportedHandler;
