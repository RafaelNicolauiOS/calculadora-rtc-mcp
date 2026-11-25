// PDFs do DANFSe no R2: chave aleatória, servidos por no máximo 1 hora e apagados pelo cron.
export const VALIDADE_MS = 3_600_000;
export const ID_PDF = /^[0-9a-f]{32}$/;

const chave = (id: string) => `${id}.pdf`;

export async function salvarPdf(bucket: R2Bucket, pdf: ArrayBuffer, agora = Date.now()): Promise<{ id: string; expiraEm: string }> {
  const id = crypto.randomUUID().replaceAll("-", "");
  await bucket.put(chave(id), pdf, {
    httpMetadata: { contentType: "application/pdf" },
    customMetadata: { criadoEm: String(agora) },
  });
  return { id, expiraEm: new Date(agora + VALIDADE_MS).toISOString() };
}

export async function lerPdf(bucket: R2Bucket, id: string, agora = Date.now()): Promise<R2ObjectBody | null> {
  if (!ID_PDF.test(id)) return null;
  const obj = await bucket.get(chave(id));
  if (!obj) return null;
  const criado = Number(obj.customMetadata?.criadoEm ?? 0);
  return agora - criado < VALIDADE_MS ? obj : null;
}

export async function limparPdfs(bucket: R2Bucket, agora = Date.now()): Promise<number> {
  let apagados = 0;
  let cursor: string | undefined;
  do {
    const pagina = await bucket.list({ cursor, include: ["customMetadata"] });
    const velhos = pagina.objects
      .filter((o) => agora - Number(o.customMetadata?.criadoEm ?? 0) >= VALIDADE_MS)
      .map((o) => o.key);
    if (velhos.length) await bucket.delete(velhos);
    apagados += velhos.length;
    cursor = pagina.truncated ? pagina.cursor : undefined;
  } while (cursor);
  return apagados;
}
