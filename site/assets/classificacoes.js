import { $, el, dados, debounce, fmtData, fmtPct, norm, trocar } from "./app.js";

let lista = [];
let vinculos = {};
let selecionada = null;

export async function iniciar() {
  const meta = await dados("meta.json");
  const selData = $("#cls-data");
  selData.replaceChildren(...meta.datas.map((d) => el("option", { value: d }, fmtData(d))));
  selData.value = meta.datas.at(-1);
  vinculos = (await dados("vinculos-nomenclatura.json")).vinculos;

  $("#cls-busca").addEventListener("input", debounce(render));
  $("#cls-cst").addEventListener("change", render);
  selData.addEventListener("change", carregar);

  await carregar();
  aoMostrar();
}

/** Abre a cClassTrib pedida por outra seção (ex.: clique num chip da aba NCM/NBS). */
export function aoMostrar() {
  let pedida = null;
  try {
    pedida = sessionStorage.getItem("rtc.abrirClasse");
    sessionStorage.removeItem("rtc.abrirClasse");
  } catch {
    /* armazenamento indisponível */
  }
  if (!pedida) return;
  $("#cls-busca").value = pedida;
  render();
  abrir(pedida);
}

async function carregar() {
  const data = $("#cls-data").value;
  lista = await dados(`classificacoes-${data}.json`);
  const csts = [...new Set(lista.map((c) => c.cst).filter(Boolean))].sort();
  const sel = $("#cls-cst");
  const atual = sel.value;
  sel.replaceChildren(el("option", { value: "" }, "Todos"), ...csts.map((c) => el("option", { value: c }, c)));
  sel.value = csts.includes(atual) ? atual : "";
  render();
  if (selecionada) abrir(selecionada.codigo);
}

function render() {
  const termo = norm($("#cls-busca").value.trim());
  const cst = $("#cls-cst").value;
  const filtradas = lista.filter(
    (c) =>
      (!cst || c.cst === cst) &&
      (!termo || c.codigo.startsWith(termo) || norm(c.descricao).includes(termo) || norm(c.descricaoTratamentoTributario).includes(termo)),
  );
  $("#cls-contagem").textContent = `${filtradas.length} de ${lista.length} classificações`;
  const ul = $("#cls-lista");
  ul.replaceChildren(
    ...filtradas.map((c) =>
      el(
        "li",
        {},
        el(
          "button",
          { type: "button", "aria-current": selecionada?.codigo === c.codigo ? "true" : null, onclick: () => abrir(c.codigo) },
          el("span", { class: "cod" }, c.codigo),
          c.cst ? el("span", { class: "cst" }, `CST ${c.cst}`) : null,
          el("span", { class: "desc" }, c.descricao),
        ),
      ),
    ),
  );
}

function sim(v, rotulo) {
  return el("span", { class: `chip ${v ? "sim" : "nao"}` }, `${v ? "✓" : "✗"} ${rotulo}`);
}

function abrir(codigo) {
  const c = lista.find((x) => x.codigo === codigo);
  const det = $("#cls-detalhe");
  if (!c) {
    det.replaceChildren(el("p", { class: "sutil" }, `A classificação ${codigo} não está vigente nesta data.`));
    return;
  }
  selecionada = c;
  for (const b of document.querySelectorAll("#cls-lista button")) {
    b.toggleAttribute("aria-current", b.querySelector(".cod").textContent === codigo);
    if (b.hasAttribute("aria-current")) b.setAttribute("aria-current", "true");
  }

  const v = vinculos[c.codigo];
  const listaCodigos = (itens) =>
    el(
      "p",
      { class: "codigos" },
      itens.map(([cod, exc], i) => [i ? ", " : "", cod, exc ? ` (exceto ${exc.join(", ")})` : ""]),
    );

  trocar(
    det,
    el("h2", {}, `${c.codigo} — ${c.descricao}`),
    el(
      "div",
      { class: "chips" },
      c.cst ? el("span", { class: "chip" }, `CST ${c.cst}`) : null,
      el("span", { class: "chip" }, c.descricaoTratamentoTributario),
      el("span", { class: "chip" }, `Alíquota: ${c.tipoAliquota}`),
      c.nomenclatura ? el("span", { class: "chip" }, `Exige ${c.nomenclatura}`) : null,
    ),
    el(
      "div",
      { class: "numeros" },
      [
        ["Redução CBS", c.percentualReducaoCbs],
        ["Redução IBS UF", c.percentualReducaoIbsUf],
        ["Redução IBS Mun.", c.percentualReducaoIbsMun],
      ].map(([r, val]) => el("div", { class: "numero" }, el("small", {}, r), el("strong", {}, fmtPct(val)))),
    ),
    el("h3", {}, "Crédito e indicadores"),
    el("p", {}, `Crédito da operação antecedente: ${c.creditoOperacaoAntecedente ?? "—"}`),
    el(
      "div",
      { class: "chips" },
      sim(c.indicaApropriacaoCreditoAdquirenteCbs, "crédito do adquirente (CBS)"),
      sim(c.indicaApropriacaoCreditoAdquirenteIbs, "crédito do adquirente (IBS)"),
      sim(c.indicaCreditoPresumidoFornecedor, "crédito presumido fornecedor"),
      sim(c.indicaCreditoPresumidoAdquirente, "crédito presumido adquirente"),
      sim(c.exigeGrupoDesoneracao, "exige grupo de desoneração"),
      sim(c.incompativelComSuspensao, "incompatível com suspensão"),
    ),
    c.tiposDfeClassificacao?.length
      ? [
          el("h3", {}, "Documentos fiscais em que pode ser usada"),
          el("div", { class: "chips" }, c.tiposDfeClassificacao.map((d) => el("span", { class: "chip", title: d.descricao }, d.sigla))),
        ]
      : null,
    v?.ncm?.length ? [el("h3", {}, `NCM vinculados (${v.ncm.length})`), listaCodigos(v.ncm)] : null,
    v?.nbs?.length ? [el("h3", {}, `NBS vinculados (${v.nbs.length})`), listaCodigos(v.nbs)] : null,
    c.fundamentacoes?.length
      ? [
          el("h3", {}, "Fundamentação legal"),
          c.fundamentacoes.map((f) =>
            el(
              "div",
              { class: "fund" },
              el("strong", {}, `${f.textoCurto ?? ""}${f.texto ? ` — ${f.texto}` : ""}`),
              f.referenciaNormativa ? el("pre", {}, f.referenciaNormativa.replaceAll("\\n", "\n")) : null,
            ),
          ),
        ]
      : null,
    el("p", { class: "sutil" }, `Atualizada em ${fmtData(c.dataAtualizacao)}.`),
  );
  if (window.matchMedia("(max-width: 900px)").matches) det.scrollIntoView({ behavior: "smooth", block: "start" });
}
