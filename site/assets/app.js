// Núcleo do site: roteamento por hash, carregamento de dados e utilitários de DOM.

/** Cria um elemento. Filhos string viram nós de texto (nunca HTML), o que evita injeção. */
export function el(tag, attrs = {}, ...filhos) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs ?? {})) {
    if (v === undefined || v === null || v === false) continue;
    if (k === "class") n.className = v;
    else if (k === "dataset") Object.assign(n.dataset, v);
    else if (k.startsWith("on") && typeof v === "function") n.addEventListener(k.slice(2), v);
    else if (v === true) n.setAttribute(k, "");
    else n.setAttribute(k, String(v));
  }
  for (const f of filhos.flat(Infinity)) {
    if (f === undefined || f === null || f === false) continue;
    n.append(f instanceof Node ? f : document.createTextNode(String(f)));
  }
  return n;
}

export const $ = (sel, raiz = document) => raiz.querySelector(sel);

/** Substitui os filhos de um nó, achatando arrays e ignorando null/false (ao contrário de replaceChildren). */
export function trocar(no, ...filhos) {
  no.replaceChildren(
    ...filhos
      .flat(Infinity)
      .filter((f) => f !== undefined && f !== null && f !== false)
      .map((f) => (f instanceof Node ? f : document.createTextNode(String(f)))),
  );
}

const cache = new Map();
/** Carrega um JSON de data/ uma única vez. */
export function dados(nome) {
  if (!cache.has(nome)) {
    cache.set(
      nome,
      fetch(`data/${nome}`).then((r) => {
        if (!r.ok) throw new Error(`Não foi possível carregar data/${nome} (HTTP ${r.status}).`);
        return r.json();
      }),
    );
  }
  return cache.get(nome);
}

export const fmtPct = (v) =>
  v === null || v === undefined || v === "" ? "—" : `${Number(v).toLocaleString("pt-BR", { maximumFractionDigits: 4 })}%`;
export const fmtBRL = (v) =>
  v === null || v === undefined || v === ""
    ? "—"
    : Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });
export const fmtData = (iso) => (iso ? new Date(`${iso}T12:00:00`).toLocaleDateString("pt-BR") : "—");

/** Normaliza texto para busca sem acento e sem caixa. */
export const norm = (s) =>
  String(s ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

export function debounce(fn, ms = 150) {
  let t;
  return (...a) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...a), ms);
  };
}

export function erroBox(msg) {
  return el("div", { class: "erro-box", role: "alert" }, msg);
}

// ---------------------------------------------------------------- API (calculadora e Simples)
const CHAVE_API = "rtc.apiUrl";
export function apiUrl() {
  const campo = $("#api-url");
  const v = (campo?.value || "").trim().replace(/\/+$/, "");
  return v || "http://localhost:8079";
}
export function lembrarApi() {
  try {
    localStorage.setItem(CHAVE_API, apiUrl());
  } catch {
    /* armazenamento indisponível */
  }
}
function restaurarApi() {
  try {
    const v = localStorage.getItem(CHAVE_API);
    if (v) $("#api-url").value = v;
  } catch {
    /* armazenamento indisponível */
  }
}

/** Chama a API pelo proxy. Devolve { status, json, texto, aviso }. */
export async function chamarApi(caminho, corpo) {
  let res;
  try {
    res = await fetch(`${apiUrl()}${caminho}`, {
      method: corpo === undefined ? "GET" : "POST",
      headers: corpo === undefined ? {} : { "Content-Type": "application/json" },
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
    });
  } catch {
    throw new Error(
      `Não foi possível conectar em ${apiUrl()}. Verifique se as APIs e o proxy estão rodando (./scripts/run.sh) e se o endereço está correto.`,
    );
  }
  const texto = await res.text();
  let json;
  try {
    json = JSON.parse(texto);
  } catch {
    /* resposta não JSON */
  }
  return { status: res.status, json, texto, aviso: res.headers.get("x-warning-dados-simulados") };
}

export async function testarApi() {
  const st = $("#api-status");
  st.textContent = "testando…";
  st.className = "status";
  lembrarApi();
  try {
    const r = await chamarApi("/regime/calculadora/dados-abertos/versao");
    if (r.status !== 200 || !r.json) throw new Error(`HTTP ${r.status}`);
    st.textContent = `conectado · versão ${r.json.versaoApp}`;
    st.className = "status ok";
    return true;
  } catch (e) {
    st.textContent = "sem conexão";
    st.className = "status erro";
    st.title = e.message;
    return false;
  }
}

// ---------------------------------------------------------------- roteamento
const paginas = {
  inicio: () => import("./inicio.js"),
  classificacoes: () => import("./classificacoes.js"),
  nomenclaturas: () => import("./nomenclaturas.js"),
  calculadora: () => import("./calculadora.js"),
  simples: () => import("./simples.js"),
  danfse: () => import("./danfse.js"),
};
const iniciadas = new Map(); // nome -> promessa do módulo já iniciado

async function mostrar() {
  const nome = location.hash.replace(/^#/, "") || "inicio";
  const alvo = paginas[nome] ? nome : "inicio";
  for (const s of document.querySelectorAll(".pagina")) s.hidden = s.dataset.pagina !== alvo;
  for (const a of document.querySelectorAll("nav a")) {
    if (a.getAttribute("href") === `#${alvo}`) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  }
  $("nav").classList.remove("aberto");
  $(".menu-btn").setAttribute("aria-expanded", "false");
  document.title = alvo === "inicio" ? "Calculadora RTC aberta" : `${$(`nav a[href="#${alvo}"]`).textContent} · Calculadora RTC aberta`;
  const secao = $(`#pg-${alvo}`);
  if (!iniciadas.has(alvo)) {
    iniciadas.set(
      alvo,
      paginas[alvo]().then(async (mod) => {
        await mod.iniciar(secao);
        return mod;
      }),
    );
  } else {
    try {
      (await iniciadas.get(alvo)).aoMostrar?.();
    } catch {
      /* erro já exibido na primeira carga */
    }
  }
  try {
    await iniciadas.get(alvo);
  } catch (e) {
    if (!secao.querySelector(".erro-box")) secao.append(erroBox(`Falha ao carregar esta seção: ${e.message}`));
  }
}

restaurarApi();
$(".menu-btn").addEventListener("click", (e) => {
  const aberto = $("nav").classList.toggle("aberto");
  e.currentTarget.setAttribute("aria-expanded", String(aberto));
});
$("#api-testar")?.addEventListener("click", testarApi);
$("#api-url")?.addEventListener("change", lembrarApi);
window.addEventListener("hashchange", () => {
  mostrar();
  $("#conteudo").focus({ preventScroll: true });
  window.scrollTo(0, 0);
});
mostrar();
