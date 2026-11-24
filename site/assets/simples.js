import { $, el, dados, chamarApi, erroBox, fmtBRL, fmtPct } from "./app.js";

// Exemplos oficiais da especificação OpenAPI do calculadora-rtc-simples-nacional.
const EXEMPLOS = {
  "NF-e — CRT 1 (Anexo I)": {
    id: "op-2",
    versao: "3.0.0",
    data: "2027-03-15",
    tpDoc: "55",
    CRT: "1",
    aliquotasEfetivas: { fatorR: true, impedimentoSublimite: false, anexoI: { pCBSSN: "1.1612", pIBSSN: "0.0129" } },
    itens: [{ numero: 1, cAtivSN: "01", cClassTrib: "000001", baseCalculo: "1000.00", valorImpostoSeletivo: "0.00" }],
  },
  "NFS-e — construção civil com isenção municipal": {
    id: "op-1",
    versao: "3.0.0",
    data: "2027-03-15",
    tpDoc: "91",
    opSimpNac: "3",
    regApIBSCBSSN: "1",
    regApTribSN: "1",
    aliquotasEfetivas: {
      fatorR: false,
      impedimentoSublimite: false,
      anexoIII: { pCBSSN: "2.3874", pIBSSN: "0.0263", semRedistribuicaoISS: { pCBSSN: "2.3591", pIBSSN: "0.0260" } },
    },
    itens: [{ numero: 1, cAtivSN: "12", cClassTrib: "000001", nbs: "114051000", baseCalculo: "10000.00", tribISSQN: "1", tpRetISSQN: "1", tpBM: "1" }],
  },
};

export async function iniciar() {
  const atividades = await dados("simples-atividades.json");
  $("#sn-atividades tbody").replaceChildren(
    ...atividades.map((a) =>
      el(
        "tr",
        {},
        el("td", { class: "mono" }, a.codigo),
        el("td", {}, a.descricao),
        el("td", {}, a.rotuloAnexo ?? a.anexoSemFatorR ?? "—"),
        el("td", {}, a.sujeitaFatorR ? `Sim (≥ 28%: Anexo ${a.anexoComFatorR})` : "Não"),
        el("td", {}, (a.tpDocsAdmissiveis ?? []).join(", ")),
      ),
    ),
  );

  const sel = $("#sn-exemplo");
  sel.replaceChildren(...Object.keys(EXEMPLOS).map((k) => el("option", { value: k }, k)));
  const carregar = () => ($("#sn-json").value = JSON.stringify(EXEMPLOS[sel.value], null, 2));
  sel.addEventListener("change", carregar);
  carregar();
  $("#sn-calcular").addEventListener("click", calcular);
}

async function calcular() {
  const alvo = $("#sn-resultado");
  let op;
  try {
    op = JSON.parse($("#sn-json").value);
  } catch (e) {
    alvo.replaceChildren(erroBox(`JSON inválido: ${e.message}`));
    return;
  }
  const btn = $("#sn-calcular");
  btn.disabled = true;
  alvo.replaceChildren(el("p", { class: "sutil" }, "Calculando…"));
  try {
    const r = await chamarApi("/simples/calculadora/observabilidade/simples-nacional/nao-assistido", op);
    if (r.status >= 400 || !r.json) {
      alvo.replaceChildren(erroBox(`A API recusou a requisição (HTTP ${r.status}).`), el("pre", { class: "cmd" }, r.texto));
      return;
    }
    const res = r.json;
    const itens = (res.objetos ?? []).map((o) => {
      const t = o.tribCalc ?? {};
      const resol = res.resolucaoAliquotas?.itens?.find((i) => i.numero === o.nObj);
      return el(
        "article",
        { class: "item-res" },
        el(
          "header",
          {},
          el("h3", {}, `Item ${o.nObj}`),
          el("span", { class: `badge ${o.erros?.length ? "erro" : "ok"}` }, o.estadoItem),
          resol ? el("span", { class: "sutil" }, `Anexo ${resol.anexoAplicado} · ${resol.regraAliquota}`) : null,
        ),
        o.erros?.length
          ? o.erros.map((e) => el("div", { class: "erro-box" }, el("code", {}, e.code), ` ${e.title ?? ""}`, el("br"), e.detail ?? ""))
          : el(
              "div",
              { class: "numeros" },
              [
                ["Receita bruta", fmtBRL(t.vRBSNitem)],
                ["CBS", `${fmtBRL(t.vCBSSN)} (${fmtPct(t.pCBSSN)})`],
                ["IBS", `${fmtBRL(t.vIBSSN)} (${fmtPct(t.pIBSSN)})`],
                ["Total do item", fmtBRL(t.totalItem)],
              ].map(([k, v]) => el("div", { class: "numero" }, el("small", {}, k), el("strong", {}, v))),
            ),
        t.memoriaCalculo
          ? el(
              "div",
              { class: "memoria" },
              Object.entries(t.memoriaCalculo).map(([k, v]) => el("p", {}, el("strong", {}, `${k.toUpperCase()}: `), v)),
            )
          : null,
      );
    });
    alvo.replaceChildren(
      el("div", { class: "resultado" }, el("h2", {}, "Resultado"), el("p", { class: "sutil" }, `Regime de apuração: ${res.oper?.regimeApuracao ?? "—"}`), itens),
      el("details", { class: "bruto" }, el("summary", {}, "Resposta completa da API (JSON)"), el("pre", {}, JSON.stringify(res, null, 2))),
    );
  } catch (e) {
    alvo.replaceChildren(erroBox(e.message));
  } finally {
    btn.disabled = false;
  }
}
