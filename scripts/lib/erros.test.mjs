import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { extrairErros } from "./erros.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

test("extrai REG, CAL e VSN do código oficial", () => {
  const erros = extrairErros(root);
  const reg011 = erros.find((e) => e.codigo === "REG-011");
  assert.equal(reg011.titulo, "NCM não vinculada");
  assert.equal(reg011.campo, "ncm");
  assert.equal(reg011.estado, "INCONSISTENCIA_ENTRADA");
  assert.ok(erros.some((e) => e.codigo === "CAL-001"));
  const vsn047 = erros.find((e) => e.codigo === "VSN-047");
  assert.equal(vsn047.titulo, "NCM não aplicável");
  assert.ok(erros.filter((e) => e.codigo.startsWith("REG")).length >= 35);
  assert.ok(erros.filter((e) => e.codigo.startsWith("VSN")).length >= 50);
  const codigos = erros.map((e) => e.codigo);
  assert.deepEqual(codigos, [...codigos].sort());
});

test("descrições VSN concatenadas em várias linhas saem inteiras", () => {
  const vsn002 = extrairErros(root).find((e) => e.codigo === "VSN-002");
  assert.match(vsn002.descricao, /até 2 casas decimais, sem notação científica\)\.$/);
});
