import { describe, expect, it } from "vitest";
import { ID_PDF, VALIDADE_MS, lerPdf, limparPdfs, salvarPdf } from "../src/pdf";

/** Bucket R2 mínimo em memória, só com o que pdf.ts usa. */
function bucketFalso() {
  const m = new Map<string, { body: ArrayBuffer; customMetadata: Record<string, string> }>();
  return {
    m,
    async put(key: string, body: ArrayBuffer, o: { customMetadata: Record<string, string> }) { m.set(key, { body, customMetadata: o.customMetadata }); },
    async get(key: string) { const v = m.get(key); return v ? { ...v, arrayBuffer: async () => v.body } : null; },
    async delete(keys: string | string[]) { for (const k of [keys].flat()) m.delete(k); },
    async list(o?: { cursor?: string; include?: string[] }) {
      return { objects: [...m].map(([key, v]) => ({ key, customMetadata: v.customMetadata })), truncated: false, cursor: undefined };
    },
  } as any;
}

describe("pdf", () => {
  it("salva com id aleatório e lê dentro da validade", async () => {
    const b = bucketFalso();
    const { id, expiraEm } = await salvarPdf(b, new TextEncoder().encode("%PDF-1.7").buffer, 1_000);
    expect(id).toMatch(ID_PDF);
    expect(expiraEm).toBe(new Date(1_000 + VALIDADE_MS).toISOString());
    expect(await lerPdf(b, id, 1_000 + VALIDADE_MS - 1)).not.toBeNull();
  });
  it("não serve expirado nem id inválido", async () => {
    const b = bucketFalso();
    const { id } = await salvarPdf(b, new ArrayBuffer(4), 0);
    expect(await lerPdf(b, id, VALIDADE_MS + 1)).toBeNull();
    expect(await lerPdf(b, "../segredo", 0)).toBeNull();
  });
  it("limpa só os expirados", async () => {
    const b = bucketFalso();
    await salvarPdf(b, new ArrayBuffer(1), 0);
    const novo = await salvarPdf(b, new ArrayBuffer(1), VALIDADE_MS);
    expect(await limparPdfs(b, VALIDADE_MS + 10)).toBe(1);
    expect([...b.m.keys()]).toEqual([`${novo.id}.pdf`]);
  });
});
