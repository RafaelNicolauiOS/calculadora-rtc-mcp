import { describe, expect, it } from "vitest";
import * as q from "../src/consultas";
import { contemTodos, normalizar } from "../src/texto";

describe("texto", () => {
  it("remove acentos e caixa", () => {
    expect(normalizar("Educação BÁSICA")).toBe("educacao basica");
    expect(contemTodos("Fornecimento dos serviços de educação", "servico educacao")).toBe(true);
    expect(contemTodos("Fornecimento dos serviços de educação", "saude")).toBe(false);
  });
});

describe("consultas", () => {
  it("detalha classificação com anexo consolidado e base", () => {
    const d = q.detalharClassificacao("cbs-ibs", "200003") as any;
    expect(d.codigo).toBe("200003");
    expect(d.anexo.ncm.find((x: any) => x.prefixo === "0207").excecoes).toContain("02074300");
    expect(d.base).toMatch(/^V\d+/);
    expect(q.detalharClassificacao("cbs-ibs", "999999")).toBeNull();
  });
  it("busca por CST, texto, NCM e NBS", () => {
    expect(q.buscarClassificacoes({ tributo: "cbs-ibs", cst: "200" }).itens.every((r) => r.cst === "200")).toBe(true);
    expect(q.buscarClassificacoes({ tributo: "cbs-ibs", texto: "educacao" }).itens.map((r) => r.codigo)).toContain("200028");
    expect(q.buscarClassificacoes({ tributo: "cbs-ibs", texto: "cesta basica" }).itens.map((r) => r.codigo)).toContain("200003");
    expect(q.buscarClassificacoes({ tributo: "cbs-ibs", ncm: "10063021" }).itens.map((r) => r.codigo)).toContain("200003");
    expect(q.buscarClassificacoes({ tributo: "cbs-ibs", nbs: "122011200" }).itens.map((r) => r.codigo)).toContain("200028");
    expect(q.buscarClassificacoes({ tributo: "cbs-ibs", cst: "200" }).itens.length).toBeLessThanOrEqual(q.LIMITE_BUSCA);
  });
  it("resume com redução legível", () => {
    const r = q.buscarClassificacoes({ tributo: "cbs-ibs", texto: "educacao" }).itens.find((x) => x.codigo === "200028")!;
    expect(r.reducao).toBe("CBS 60% · IBS UF 60% · IBS Mun 60%");
    expect(r.dfe).toContain("NFS-e (91)");
  });
  it("consulta nomenclatura com classificações que a aceitam", () => {
    const n = q.consultarNomenclatura("ncm", "10063021");
    expect(n.descricao).toBeTruthy();
    expect(n.classificacoesComAnexo.map((r) => r.codigo)).toContain("200003");
  });
  it("explica erro existente e devolve null para inexistente", () => {
    expect(q.explicarErro("reg-011")?.titulo).toBe("NCM não vinculada");
    expect(q.explicarErro("REG-999")).toBeNull();
  });
  it("busca município por código, por nome sem acento e com UF", () => {
    expect(q.buscarMunicipio({ codigo: 4314902 })).toEqual([{ codigo: 4314902, nome: "Porto Alegre", uf: "RS" }]);
    expect(q.buscarMunicipio({ nome: "sao paulo", uf: "SP" }).map((m) => m.codigo)).toContain(3550308);
    expect(q.buscarMunicipio({ nome: "santa" }).length).toBeLessThanOrEqual(q.LIMITE_MUNICIPIOS);
  });
  it("atividade do Simples por código e lista", () => {
    expect((q.atividade("01") as any).codigo).toBe("01");
    expect(Array.isArray(q.atividade())).toBe(true);
    expect(q.atividade("zz")).toBeNull();
  });
  it("status traz versão da base e aviso", () => {
    const s = q.status() as any;
    expect(s.base.versaoDb).toMatch(/^V\d+/);
    expect(s.aviso).toContain("não oficial");
  });
});
