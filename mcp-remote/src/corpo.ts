// Leitura do corpo da requisição com limite de bytes, sem confiar no Content-Length.

/** Lê o corpo como texto UTF-8. Devolve null se passar de `limite` bytes (e cancela a leitura). */
export async function lerCorpoLimitado(req: Request, limite: number): Promise<string | null> {
  if (!req.body) return "";
  const leitor = req.body.getReader();
  const partes: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await leitor.read();
    if (done) break;
    total += value.byteLength;
    if (total > limite) {
      await leitor.cancel().catch(() => {});
      return null;
    }
    partes.push(value);
  }
  const todo = new Uint8Array(total);
  let pos = 0;
  for (const p of partes) {
    todo.set(p, pos);
    pos += p.byteLength;
  }
  return new TextDecoder().decode(todo);
}
