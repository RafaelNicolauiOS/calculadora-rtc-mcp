import { $, el, erroBox, trocar } from "./app.js";

let worker;
let urlPdf;

function status(texto, progresso) {
  const st = $("#danfse-status");
  trocar(
    st,
    texto,
    progresso !== undefined ? el("div", { class: "progresso", "aria-hidden": "true" }, el("span", { style: `width:${Math.round(progresso * 100)}%` })) : null,
  );
}

function obterWorker() {
  if (worker) return worker;
  worker = new Worker("assets/danfse-worker.js");
  return worker;
}

export async function iniciar() {
  const entrada = $("#danfse-arquivo");
  const zona = $("#danfse-soltar");
  entrada.addEventListener("change", () => entrada.files[0] && lerArquivo(entrada.files[0]));
  for (const ev of ["dragenter", "dragover"]) zona.addEventListener(ev, (e) => (e.preventDefault(), zona.classList.add("arrastando")));
  for (const ev of ["dragleave", "drop"]) zona.addEventListener(ev, () => zona.classList.remove("arrastando"));
  zona.addEventListener("drop", (e) => {
    e.preventDefault();
    const f = e.dataTransfer?.files?.[0];
    if (f) lerArquivo(f);
  });
  $("#danfse-exemplo").addEventListener("click", async () => {
    const r = await fetch("examples/nfse-ficticia.xml");
    $("#danfse-xml").value = await r.text();
    status("NFS-e fictícia carregada. Clique em Gerar PDF.");
  });
  $("#danfse-gerar").addEventListener("click", gerar);
}

async function lerArquivo(f) {
  if (f.size > 5 * 1024 * 1024) {
    status("Arquivo maior que 5 MB, o limite do gerador.");
    return;
  }
  $("#danfse-xml").value = await f.text();
  status(`Arquivo ${f.name} carregado.`);
}

function gerar() {
  const xml = $("#danfse-xml").value.trim();
  if (!xml) {
    status("Escolha um arquivo ou cole o XML da NFS-e.");
    return;
  }
  const btn = $("#danfse-gerar");
  btn.disabled = true;
  status("Carregando o gerador (WebAssembly)…", 0);
  const w = obterWorker();
  w.onmessage = ({ data }) => {
    if (data.tipo === "progresso") {
      const mb = (n) => (n / 1048576).toFixed(1);
      status(
        data.total ? `Baixando o gerador: ${mb(data.recebido)} de ${mb(data.total)} MB` : `Baixando o gerador: ${mb(data.recebido)} MB`,
        data.total ? data.recebido / data.total : undefined,
      );
    } else if (data.tipo === "pronto") {
      status("Gerando PDF…");
    } else if (data.tipo === "pdf") {
      btn.disabled = false;
      mostrarPdf(data.pdf);
    } else if (data.tipo === "erro") {
      btn.disabled = false;
      status("");
      $("#danfse-saida").replaceChildren(erroBox(`Não foi possível gerar o DANFSe: ${data.mensagem}`));
    }
  };
  w.onerror = (e) => {
    btn.disabled = false;
    $("#danfse-saida").replaceChildren(erroBox(`Erro no gerador: ${e.message}`));
  };
  w.postMessage({
    tipo: "gerar",
    xml,
    stc: Number($("#danfse-stc").value),
    canhoto: $("#danfse-canhoto").checked,
  });
}

function mostrarPdf(bytes) {
  if (urlPdf) URL.revokeObjectURL(urlPdf);
  urlPdf = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
  status(`PDF gerado (${(bytes.length / 1024).toFixed(0)} KB).`);
  $("#danfse-saida").replaceChildren(
    el("div", { class: "acoes" }, el("a", { class: "btn", href: urlPdf, download: "danfse.pdf" }, "Baixar PDF"), el("a", { class: "btn-sec", href: urlPdf, target: "_blank", rel: "noopener" }, "Abrir em nova aba")),
    el("iframe", { src: urlPdf, title: "Pré-visualização do DANFSe" }),
  );
}
