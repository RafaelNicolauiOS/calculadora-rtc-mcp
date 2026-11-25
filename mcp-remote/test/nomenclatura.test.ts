import { describe, expect, it } from "vitest";
import { anexo } from "../src/dados";
import { consolidarAnexo, validarNomenclatura } from "../src/nomenclatura";
import type { Anexo } from "../src/tipos";

const sintetico: Anexo = {
  ncm: [["0207", ["02074300"]], ["0207", ["02075300"]], ["1006"], ["0302", ["03021"]], ["0302"]],
  nbs: [["122011"]],
};

describe("validarNomenclatura", () => {
  it("aceita qualquer código quando não há anexo", () => {
    expect(validarNomenclatura(undefined, "ncm", "10063021")).toMatchObject({ aceito: true, erroEquivalente: null });
    expect(validarNomenclatura({ ncm: [], nbs: [["1"]] }, "ncm", "10063021").aceito).toBe(true);
  });
  it("exige código completo quando há anexo (REG-015/REG-016)", () => {
    expect(validarNomenclatura(sintetico, "ncm", "1006").erroEquivalente).toBe("REG-015");
    expect(validarNomenclatura(sintetico, "nbs", "122011").erroEquivalente).toBe("REG-016");
  });
  it("aceita por prefixo", () => {
    expect(validarNomenclatura(sintetico, "ncm", "10063021").aceito).toBe(true);
    expect(validarNomenclatura(sintetico, "nbs", "122011200").aceito).toBe(true);
  });
  it("rejeita fora do anexo (REG-011/REG-012)", () => {
    expect(validarNomenclatura(sintetico, "ncm", "22030000").erroEquivalente).toBe("REG-011");
    expect(validarNomenclatura(sintetico, "nbs", "101011100").erroEquivalente).toBe("REG-012");
  });
  it("rejeita exceção quando não há vínculo sem exceção (E e não S)", () => {
    expect(validarNomenclatura(sintetico, "ncm", "02074300").erroEquivalente).toBe("REG-011");
    expect(validarNomenclatura(sintetico, "ncm", "02075300").erroEquivalente).toBe("REG-011");
    expect(validarNomenclatura(sintetico, "ncm", "02071100").aceito).toBe(true);
  });
  it("aceita exceção quando outro vínculo do mesmo prefixo não tem exceção (E e S)", () => {
    expect(validarNomenclatura(sintetico, "ncm", "03021100").aceito).toBe(true);
  });
  it("rejeita entrada que não é só dígitos", () => {
    expect(validarNomenclatura(sintetico, "ncm", "1006.30.21").aceito).toBe(false);
  });
  it("bate com dados reais: 200003 aceita arroz e rejeita 02074300", () => {
    const a = anexo("cbs-ibs", "200003");
    expect(validarNomenclatura(a, "ncm", "10063021").aceito).toBe(true);
    expect(validarNomenclatura(a, "ncm", "02074300").aceito).toBe(false);
  });
});

describe("consolidarAnexo", () => {
  it("junta exceções do mesmo prefixo e zera quando há vínculo sem exceção", () => {
    expect(consolidarAnexo(sintetico.ncm)).toEqual([
      { prefixo: "0207", excecoes: ["02074300", "02075300"] },
      { prefixo: "1006", excecoes: [] },
      { prefixo: "0302", excecoes: [] },
    ]);
  });
});
