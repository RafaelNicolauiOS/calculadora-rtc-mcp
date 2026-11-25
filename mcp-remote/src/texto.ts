export function normalizar(s: string): string {
  return s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/\s+/g, " ").trim();
}

/** Verdadeiro se todos os termos (separados por espaço) aparecem no alvo, ignorando acentos e caixa. */
export function contemTodos(alvo: string, termos: string): boolean {
  const a = normalizar(alvo);
  return normalizar(termos).split(" ").filter(Boolean).every((t) => a.includes(t));
}
