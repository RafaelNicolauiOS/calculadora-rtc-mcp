import { $, el, dados, chamarApi, erroBox, fmtBRL, fmtPct, testarApi } from "./app.js";

let localidades;
let classesPorData = {};
let meta;
let contador = 0;

const ESTADOS = {
  CALCULADO: ["ok", "Calculado"],
  CALCULO_SIMULADO: ["sim", "Cálculo simulado"],
  INCONSISTENCIA_ENTRADA: ["erro", "Inconsistência na entrada"],
  NAO_IMPLEMENTADO: ["aviso", "Não implementado"],
  FALHA_TECNICA: ["erro", "Falha técnica"],
};

export async function iniciar() {
  [meta, localidades] = await Promise.all([dados("meta.json"), dados("localidades.json")]);

  const hoje = new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
  $("#calc-data").value = hoje;

  const selUf = $("#calc-uf");
  selUf.replaceChildren(...localidades.ufs.map(([cod, sigla, nome]) => el("option", { value: cod, dataset: { sigla } }, `${sigla} — ${nome}`)));
  selUf.value = String(localidades.ufs.find(([, s]) => s === "SP")?.[0] ?? localidades.ufs[0][0]);
  selUf.addEventListener("change", preencherMunicipios);
  preencherMunicipios();

  $("#calc-data").addEventListener("change", atualizarData);
  $("#calc-add").addEventListener("click", () => adicionarItem());
  $("#calc-exemplo").addEventListener("click", carregarExemplo);
  $("#calc-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const op = montarOperacao();
    if (op) enviar(op);
  });
  $("#calc-form").addEventListener("input", () => atualizarJson());
  $("#calc-enviar-json").addEventListener("click", () => {
    let op;
    try {
      op = JSON.parse($("#calc-json").value);
    } catch (e) {
      $("#calc-resultado").replaceChildren(erroBox(`JSON inválido: ${e.message}`));
      return;
    }
    enviar(op);
  });

  adicionarItem();
  await atualizarData();
  testarApi();
}

function preencherMunicipios(codigoPreferido) {
  const uf = Number($("#calc-uf").value);
  const sel = $("#calc-mun");
  const muns = localidades.municipios.filter(([, u]) => u === uf);
  sel.replaceChildren(...muns.map(([cod, , nome]) => el("option", { value: cod }, nome)));
  // Pré-seleciona a capital quando possível (o código IBGE da capital nem sempre é o menor).
  const capitais = { 11: 1100205, 12: 1200401, 13: 1302603, 14: 1400100, 15: 1501402, 16: 1600303, 17: 1721000, 21: 2111300, 22: 2211001, 23: 2304400, 24: 2408102, 25: 2507507, 26: 2611606, 27: 2704302, 28: 2800308, 29: 2927408, 31: 3106200, 32: 3205309, 33: 3304557, 35: 3550308, 41: 4106902, 42: 4205407, 43: 4314902, 50: 5002704, 51: 5103403, 52: 5208707, 53: 5300108 };
  const alvo = typeof codigoPreferido === "number" ? codigoPreferido : capitais[uf];
  if (alvo && muns.some(([c]) => c === alvo)) sel.value = String(alvo);
  atualizarJson();
}

/** Escolhe o snapshot de classificações mais próximo (e não posterior) à data informada. */
function dataSnapshot(data) {
  const ds = [...meta.datas].sort();
  return ds.filter((d) => d <= data).at(-1) ?? ds[0];
}

async function atualizarData() {
  const data = $("#calc-data").value;
  const ano = Number(data.slice(0, 4));
  $("#calc-aliq").hidden = !(ano >= 2027);
  const snap = dataSnapshot(data);
  classesPorData[snap] ??= await dados(`classificacoes-${snap}.json`);
  const classes = classesPorData[snap];
  $("#dl-classificacoes").replaceChildren(...classes.map((c) => el("option", { value: c.codigo }, `${c.codigo} — ${c.descricao}`)));
  for (const linha of document.querySelectorAll(".item")) descreverItem(linha);
  atualizarJson();
}

function classesAtuais() {
  return classesPorData[dataSnapshot($("#calc-data").value)] ?? [];
}

function adicionarItem(v = {}) {
  contador++;
  const n = document.querySelectorAll(".item").length + 1;
  const id = `it${contador}`;
  const linha = el(
    "div",
    { class: "item", dataset: { id } },
    el("span", { class: "item-num" }, `#${n}`),
    el(
      "label",
      {},
      "Tipo",
      el("select", { name: "tipo" }, el("option", { value: "ncm" }, "Bem (NCM)"), el("option", { value: "nbs" }, "Serviço (NBS)")),
    ),
    el("label", {}, "Código", el("input", { name: "codigo", inputmode: "numeric", placeholder: "ex.: 10063021", required: true })),
    el(
      "label",
      { class: "cclass" },
      "Classificação (cClassTrib)",
      el("input", { name: "cClassTrib", list: "dl-classificacoes", placeholder: "Digite código ou descrição", required: true, autocomplete: "off" }),
    ),
    el("label", {}, "CST", el("input", { name: "cst", inputmode: "numeric", placeholder: "auto" })),
    el("label", {}, "Base de cálculo (R$)", el("input", { name: "base", type: "number", step: "0.01", min: "0", inputmode: "decimal", required: true })),
    el("button", { type: "button", class: "btn-icone", "aria-label": `Remover item ${n}`, title: "Remover item", onclick: () => removerItem(linha) }, "×"),
    el("p", { class: "item-desc" }),
  );
  linha.querySelector("[name=tipo]").value = v.tipo ?? "ncm";
  linha.querySelector("[name=codigo]").value = v.codigo ?? "";
  linha.querySelector("[name=cClassTrib]").value = v.cClassTrib ?? "";
  linha.querySelector("[name=cst]").value = v.cst ?? "";
  linha.querySelector("[name=base]").value = v.base ?? "";
  linha.querySelector("[name=cClassTrib]").addEventListener("change", () => {
    const campo = linha.querySelector("[name=cClassTrib]");
    campo.value = campo.value.trim().slice(0, 6);
    const c = classesAtuais().find((x) => x.codigo === campo.value);
    if (c?.cst) linha.querySelector("[name=cst]").value = c.cst;
    descreverItem(linha);
    atualizarJson();
  });
  $("#calc-itens").append(linha);
  descreverItem(linha);
  atualizarJson();
}

function removerItem(linha) {
  if (document.querySelectorAll(".item").length === 1) return;
  linha.remove();
  document.querySelectorAll(".item").forEach((l, i) => {
    l.querySelector(".item-num").textContent = `#${i + 1}`;
    l.querySelector(".btn-icone").setAttribute("aria-label", `Remover item ${i + 1}`);
  });
  atualizarJson();
}

function descreverItem(linha) {
  const cod = linha.querySelector("[name=cClassTrib]").value.trim();
  const c = classesAtuais().find((x) => x.codigo === cod);
  linha.querySelector(".item-desc").textContent = c
    ? `${c.descricao} · ${c.descricaoTratamentoTributario}${c.nomenclatura ? ` · exige ${c.nomenclatura}` : ""}`
    : cod
      ? "Classificação não encontrada para esta data."
      : "";
}

function montarOperacao(silencioso = false) {
  const data = $("#calc-data").value;
  const hora = $("#calc-hora").value || "10:00";
  const ano = Number(data.slice(0, 4));
  const uf = $("#calc-uf").selectedOptions[0]?.dataset.sigla;
  const aliq = {
    cbs: $("#aliq-cbs").value,
    ibsEstadual: $("#aliq-ibsuf").value,
    ibsMunicipal: $("#aliq-ibsmun").value,
  };
  const precisaAliq = ano >= 2027;
  if (!silencioso && precisaAliq && Object.values(aliq).some((v) => v === "")) {
    $("#calc-resultado").replaceChildren(erroBox("A partir de 2027 informe as três alíquotas nominais (CBS, IBS estadual e IBS municipal)."));
    return null;
  }
  const itens = [...document.querySelectorAll(".item")].map((l, i) => {
    const tipo = l.querySelector("[name=tipo]").value;
    const item = {
      numero: i + 1,
      [tipo]: l.querySelector("[name=codigo]").value.replace(/\D/g, ""),
      cst: l.querySelector("[name=cst]").value.trim(),
      cClassTrib: l.querySelector("[name=cClassTrib]").value.trim(),
      baseCalculo: Number(l.querySelector("[name=base]").value || 0),
    };
    if (precisaAliq) {
      item.aliquotasNominais = {
        cbs: Number(aliq.cbs),
        ibsEstadual: Number(aliq.ibsEstadual),
        ibsMunicipal: Number(aliq.ibsMunicipal),
      };
    }
    return item;
  });
  if (!silencioso) {
    const vazio = itens.find((it) => !it.cClassTrib || !it.cst || !(it.ncm || it.nbs));
    if (vazio) {
      $("#calc-resultado").replaceChildren(erroBox(`Preencha código, classificação e CST do item ${vazio.numero}.`));
      return null;
    }
  }
  return {
    id: `site-${Date.now()}`,
    versao: "1.0.0",
    dhFatoGerador: `${data}T${hora}:00-03:00`,
    municipio: Number($("#calc-mun").value),
    uf,
    itens,
  };
}

function atualizarJson() {
  const op = montarOperacao(true);
  if (op) $("#calc-json").value = JSON.stringify(op, null, 2);
}

function carregarExemplo() {
  const ano = Number($("#calc-data").value.slice(0, 4));
  $("#calc-itens").replaceChildren();
  $("#calc-uf").value = "43";
  preencherMunicipios(4314902);
  adicionarItem({ tipo: "ncm", codigo: "10063021", cClassTrib: "200003", cst: "200", base: "100.00" });
  adicionarItem({ tipo: "nbs", codigo: "122011200", cClassTrib: "200028", cst: "200", base: "1200.00" });
  adicionarItem({ tipo: "ncm", codigo: "02013000", cClassTrib: "200035", cst: "200", base: "80.00" });
  if (ano >= 2027) {
    $("#aliq-cbs").value = "8.8";
    $("#aliq-ibsuf").value = "0.05";
    $("#aliq-ibsmun").value = "0.05";
  }
  atualizarJson();
  $("#calc-resultado").replaceChildren(
    el("p", { class: "sutil" }, "Exemplo da documentação oficial: arroz (cesta básica), mensalidade escolar (redução de 60%) e um item com erro proposital (NCM não vinculada). Clique em Calcular."),
  );
}

async function enviar(op) {
  const alvo = $("#calc-resultado");
  const btn = $("#calc-form button[type=submit]");
  btn.disabled = true;
  alvo.replaceChildren(el("p", { class: "sutil" }, "Calculando…"));
  try {
    const r = await chamarApi("/regime/calculadora/observabilidade/regime-geral", op);
    if (r.status >= 400 || !r.json?.objetos) {
      alvo.replaceChildren(
        erroBox(`A API recusou a requisição (HTTP ${r.status}).`),
        el("details", { class: "bruto", open: true }, el("summary", {}, "Resposta"), el("pre", {}, r.json ? JSON.stringify(r.json, null, 2) : r.texto)),
      );
      return;
    }
    await renderResultado(alvo, r.json, op, r.aviso);
  } catch (e) {
    alvo.replaceChildren(erroBox(e.message));
  } finally {
    btn.disabled = false;
  }
}

const codigoItem = (op, n) => {
  const it = op.itens?.find((i) => i.numero === n);
  return it ? `${it.ncm ? `NCM ${it.ncm}` : `NBS ${it.nbs}`} · cClassTrib ${it.cClassTrib}` : "";
};

async function renderResultado(alvo, res, op, aviso) {
  const tot = res.total?.tribCalc ?? {};
  const ibscbs = tot.IBSCBSTot ?? {};
  const totais = [
    ["Base CBS/IBS", ibscbs.vBCIBSCBS],
    ["CBS", ibscbs.gCBS?.vCBS],
    ["IBS", ibscbs.gIBS?.vIBS],
    tot.ISTot ? ["Imposto Seletivo", tot.ISTot.vIS] : null,
  ].filter(Boolean);

  const itens = await Promise.all(res.objetos.map((o) => renderItem(o, op)));
  alvo.replaceChildren(
    el(
      "div",
      { class: "resultado" },
      el("h2", {}, "Resultado"),
      aviso ? el("div", { class: "aviso", role: "note" }, "Cálculo simulado: as alíquotas foram informadas por você, não são as oficiais de referência.") : null,
      el(
        "div",
        { class: "totais" },
        totais.map(([r, v]) => el("div", { class: "total" }, el("small", {}, r), el("strong", {}, fmtBRL(v)))),
      ),
      el("p", { class: "sutil" }, "Os totais somam apenas os itens calculados."),
      itens,
      el("details", { class: "bruto" }, el("summary", {}, "Resposta completa da API (JSON)"), el("pre", {}, JSON.stringify(res, null, 2))),
    ),
  );
  alvo.scrollIntoView({ behavior: "smooth", block: "start" });
}

const explicacoes = new Map();
async function explicarErro(codigo) {
  if (!codigo) return null;
  if (!explicacoes.has(codigo)) {
    explicacoes.set(
      codigo,
      chamarApi(`/regime/calculadora/observabilidade/erros?codigo=${encodeURIComponent(codigo)}`)
        .then((r) => r.json?.descricao ?? null)
        .catch(() => null),
    );
  }
  return explicacoes.get(codigo);
}

async function renderItem(o, op) {
  const [classe, rotulo] = ESTADOS[o.estadoItem] ?? ["aviso", o.estadoItem];
  const cab = el(
    "header",
    {},
    el("h3", {}, `Item ${o.nObj}`),
    el("span", { class: `badge ${classe}` }, rotulo),
    el("span", { class: "sutil" }, codigoItem(op, o.nObj)),
  );

  if (o.erros?.length) {
    const erros = await Promise.all(
      o.erros.map(async (e) => {
        const expl = await explicarErro(e.code);
        return el(
          "div",
          { class: "erro-box" },
          el("code", {}, e.code ?? "erro"),
          ` ${e.title ?? ""}`,
          el("br"),
          e.detail ?? "",
          expl ? el("div", { class: "sutil" }, expl) : null,
        );
      }),
    );
    return el("article", { class: "item-res" }, cab, erros);
  }

  const ibscbs = o.tribCalc?.IBSCBS;
  const g = ibscbs?.gIBSCBS ?? {};
  const linhaTrib = (nome, grupo, pKey, vKey) =>
    grupo
      ? el(
          "tr",
          {},
          el("th", { scope: "row" }, nome),
          el("td", { class: "num" }, fmtPct(grupo[pKey])),
          el("td", { class: "num" }, grupo.gRed ? fmtPct(grupo.gRed.pRedAliq) : "—"),
          el("td", { class: "num" }, grupo.gRed ? fmtPct(grupo.gRed.pAliqEfet) : fmtPct(grupo[pKey])),
          el("td", { class: "num" }, fmtBRL(grupo[vKey])),
        )
      : null;

  const is = o.tribCalc?.IS;
  const mem = ibscbs?.memoriaCalculo ?? {};
  return el(
    "article",
    { class: "item-res" },
    cab,
    el("p", { class: "sutil" }, `CST ${ibscbs?.CST ?? "—"} · cClassTrib ${ibscbs?.cClassTrib ?? "—"} · base ${fmtBRL(g.vBC)}`),
    el(
      "div",
      { class: "tabela-wrap" },
      el(
        "table",
        { class: "tabela" },
        el(
          "thead",
          {},
          el("tr", {}, ["Tributo", "Alíquota", "Redução", "Alíquota efetiva", "Valor"].map((h) => el("th", { scope: "col" }, h))),
        ),
        el(
          "tbody",
          {},
          linhaTrib("CBS", g.gCBS, "pCBS", "vCBS"),
          linhaTrib("IBS estadual", g.gIBSUF, "pIBSUF", "vIBSUF"),
          linhaTrib("IBS municipal", g.gIBSMun, "pIBSMun", "vIBSMun"),
          is ? el("tr", {}, el("th", { scope: "row" }, "Imposto Seletivo"), el("td", { class: "num" }, fmtPct(is.pIS ?? is.pISEspec)), el("td", {}, "—"), el("td", {}, "—"), el("td", { class: "num" }, fmtBRL(is.vIS))) : null,
        ),
      ),
    ),
    Object.keys(mem).length
      ? el(
          "div",
          { class: "memoria" },
          el("h3", {}, "Memória de cálculo"),
          Object.entries(mem).map(([k, t]) => el("p", {}, el("strong", {}, `${{ cbs: "CBS", ibsUF: "IBS UF", ibsMun: "IBS Mun.", is: "IS" }[k] ?? k}: `), t)),
        )
      : null,
  );
}
