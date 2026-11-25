import { describe, expect, it } from "vitest";
import * as dados from "../src/dados";

describe("dados", () => {
  it("carrega classificações de IBS/CBS com CST", () => {
    const c = dados.classificacao("cbs-ibs", "200028");
    expect(c?.descricao).toContain("educação");
    expect(c?.cst).toBe("200");
  });
  it("separa IBS/CBS e IS com o mesmo código", () => {
    expect(dados.classificacao("is", "000001")?.descricao).toContain("Primeiro fornecimento");
    expect(dados.anexo("cbs-ibs", "000001")).toBeUndefined();
    expect(dados.anexo("is", "000001")?.ncm.length).toBeGreaterThan(0);
  });
  it("descreve NCM e NBS", () => {
    expect(dados.descricaoNomenclatura("ncm", "10063021")).toBeTruthy();
    expect(dados.descricaoNomenclatura("nbs", "122011200")).toBeTruthy();
    expect(dados.descricaoNomenclatura("ncm", "00000000")).toBeUndefined();
  });
  it("traz erros, atividades, municípios e meta", () => {
    expect(dados.erros().some((e) => e.codigo === "REG-011")).toBe(true);
    expect(dados.atividadesSimples().length).toBeGreaterThan(10);
    expect(dados.municipios().find((m) => m.codigo === 4314902)).toEqual({ codigo: 4314902, nome: "Porto Alegre", uf: "RS" });
    expect(dados.meta.regimeRegular.versaoDb).toMatch(/^V\d+/);
  });
});
