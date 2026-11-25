import { describe, expect, it } from "vitest";
import { lerCorpoLimitado } from "../src/corpo";

const enc = new TextEncoder();
function req(body: BodyInit | ReadableStream<Uint8Array>): Request {
  return new Request("http://x/mcp", { method: "POST", body: body as BodyInit, duplex: "half" } as RequestInit);
}
function fluxo(pedacos: Uint8Array[]): ReadableStream<Uint8Array> {
  let i = 0;
  return new ReadableStream({
    pull(c) {
      if (i < pedacos.length) c.enqueue(pedacos[i++]);
      else c.close();
    },
  });
}

describe("lerCorpoLimitado", () => {
  it("lê corpo abaixo do limite", async () => {
    expect(await lerCorpoLimitado(req('{"a":1}'), 100)).toBe('{"a":1}');
  });
  it("aceita exatamente o limite", async () => {
    expect(await lerCorpoLimitado(req("a".repeat(100)), 100)).toBe("a".repeat(100));
  });
  it("rejeita acima do limite", async () => {
    expect(await lerCorpoLimitado(req("a".repeat(101)), 100)).toBeNull();
  });
  it("rejeita fluxo em pedaços sem Content-Length", async () => {
    const r = req(fluxo(Array.from({ length: 10 }, () => enc.encode("a".repeat(30)))));
    expect(r.headers.get("content-length")).toBeNull();
    expect(await lerCorpoLimitado(r, 100)).toBeNull();
  });
  it("conta bytes, não caracteres", async () => {
    expect(await lerCorpoLimitado(req("ç".repeat(50)), 100)).toBe("ç".repeat(50));
    expect(await lerCorpoLimitado(req("ç".repeat(51)), 100)).toBeNull();
  });
  it("corpo vazio ou ausente devolve string vazia", async () => {
    expect(await lerCorpoLimitado(new Request("http://x/", { method: "POST" }), 100)).toBe("");
  });
});
