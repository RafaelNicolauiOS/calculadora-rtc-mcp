// Web Worker que carrega o WASM oficial do gerador de DANFSe e gera PDFs fora da thread da página.
/* global Go, danfseWasm */
importScripts("../wasm/wasm_exec.js");

let pronto = null;

async function carregar() {
  const go = new Go();
  const resp = await fetch("../wasm/danfse.wasm");
  if (!resp.ok) throw new Error(`Não foi possível baixar o danfse.wasm (HTTP ${resp.status}).`);
  const total = Number(resp.headers.get("content-length")) || 0;
  // Lê em partes para informar o progresso do download (o arquivo tem dezenas de MB).
  const leitor = resp.body.getReader();
  const partes = [];
  let recebido = 0;
  for (;;) {
    const { done, value } = await leitor.read();
    if (done) break;
    partes.push(value);
    recebido += value.length;
    postMessage({ tipo: "progresso", recebido, total });
  }
  const bytes = new Uint8Array(recebido);
  let pos = 0;
  for (const p of partes) {
    bytes.set(p, pos);
    pos += p.length;
  }
  const { instance } = await WebAssembly.instantiate(bytes, go.importObject);
  go.run(instance); // não resolve: o main do Go fica vivo com select{}
  for (let i = 0; i < 200 && typeof danfseWasm === "undefined"; i++) await new Promise((r) => setTimeout(r, 10));
  if (typeof danfseWasm === "undefined" || !danfseWasm.ready) {
    throw new Error(`Falha ao iniciar o WASM: ${globalThis.danfseWasm?.error || "módulo não respondeu"}`);
  }
}

onmessage = async ({ data }) => {
  try {
    pronto ??= carregar().catch((e) => {
      pronto = null; // permite tentar de novo depois de uma falha no download
      throw e;
    });
    await pronto;
    postMessage({ tipo: "pronto" });
    if (data.tipo !== "gerar") return;
    const r = danfseWasm.gerarPdf(JSON.stringify({ xml: data.xml, stc: data.stc, canhoto: data.canhoto }));
    if (r.error) throw new Error(r.error);
    const bin = atob(r.pdf);
    const pdf = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) pdf[i] = bin.charCodeAt(i);
    postMessage({ tipo: "pdf", pdf }, [pdf.buffer]);
  } catch (e) {
    postMessage({ tipo: "erro", mensagem: e instanceof Error ? e.message : String(e) });
  }
};
