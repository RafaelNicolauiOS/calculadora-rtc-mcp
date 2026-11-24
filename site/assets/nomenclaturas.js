import { $, el, dados, debounce, norm } from "./app.js";

const LIMITE = 200;
let tabelas = {};
let vinculos = {};
let descClasse = {};

export async function iniciar() {
  const meta = await dados("meta.json");
  const [v, classes] = await Promise.all([dados("vinculos-nomenclatura.json"), dados(`classificacoes-${meta.datas.at(-1)}.json`)]);
  vinculos = v.vinculos;
  descClasse = Object.fromEntries(classes.map((c) => [c.codigo, c.descricao]));
  $("#nom-tipo").addEventListener("change", render);
  $("#nom-busca").addEventListener("input", debounce(render, 200));
  await render();
}

/** cClassTrib cujos vínculos (código exato ou prefixo, menos exceções) cobrem o código informado. */
function classesDoCodigo(tipo, codigo) {
  const out = [];
  for (const [cls, v] of Object.entries(vinculos)) {
    for (const [pref, exc] of v[tipo] ?? []) {
      if (codigo.startsWith(pref) && !(exc ?? []).some((e) => codigo.startsWith(e))) {
        out.push(cls);
        break;
      }
    }
  }
  return out;
}

async function render() {
  const tipo = $("#nom-tipo").value;
  const contagem = $("#nom-contagem");
  if (!tabelas[tipo]) {
    contagem.textContent = "Carregando tabela…";
    tabelas[tipo] = await dados(`${tipo}.json`);
  }
  const termo = norm($("#nom-busca").value.trim());
  const soDigitos = termo.replace(/[.\s-]/g, "");
  const linhas = tabelas[tipo];
  const achados = !termo
    ? linhas
    : /^\d+$/.test(soDigitos)
      ? linhas.filter(([c]) => c.startsWith(soDigitos))
      : linhas.filter(([, d]) => norm(d).includes(termo));
  contagem.textContent = `${achados.length.toLocaleString("pt-BR")} códigos${achados.length > LIMITE ? ` (mostrando os primeiros ${LIMITE})` : ""}`;

  $("#nom-tabela tbody").replaceChildren(
    ...achados.slice(0, LIMITE).map(([cod, desc]) => {
      const classes = classesDoCodigo(tipo, cod);
      return el(
        "tr",
        {},
        el("td", { class: "mono" }, cod),
        el("td", {}, desc),
        el(
          "td",
          {},
          classes.length
            ? el(
                "div",
                { class: "chips" },
                classes.map((c) =>
                  el(
                    "a",
                    {
                      class: "chip",
                      href: "#classificacoes",
                      title: descClasse[c] ?? "",
                      onclick: () => sessionStorage.setItem("rtc.abrirClasse", c),
                    },
                    c,
                  ),
                ),
              )
            : el("span", { class: "sutil" }, "Sem vínculo específico"),
        ),
      );
    }),
  );
}
