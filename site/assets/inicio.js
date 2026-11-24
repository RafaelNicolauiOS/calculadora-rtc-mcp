import { $, el, dados, fmtData } from "./app.js";

export async function iniciar() {
  const dl = $("#versoes");
  try {
    const m = await dados("meta.json");
    const r = m.regimeRegular ?? {};
    const s = m.simplesNacional ?? {};
    const linhas = [
      ["Regime regular", r.versaoApp],
      ["Simples Nacional", s.versaoApp ?? s.versao ?? s.versaoAplicacao],
      ["Base de dados", r.versaoDb ? `${r.versaoDb} — ${fmtData(r.dataVersaoDb)}` : null],
      ["Última mudança na base", r.descricaoVersaoDb],
      ["Datas de vigência no site", m.datas?.map(fmtData).join(" e ")],
      ["Dados gerados em", m.geradoEm ? new Date(m.geradoEm).toLocaleString("pt-BR") : null],
    ];
    dl.replaceChildren(...linhas.filter(([, v]) => v).flatMap(([k, v]) => [el("dt", {}, k), el("dd", {}, v)]));
  } catch (e) {
    dl.replaceChildren(el("dt", {}, "Erro"), el("dd", {}, e.message));
  }
}
