// Porta fiel da regra do NcmAplicavelService da Calculadora RTC (regime regular):
// A = algum vínculo cobre o código; E = alguma exceção de vínculo que cobre o código o cobre;
// S = algum vínculo que cobre o código não tem exceções. Rejeita quando !A ou (E e !S).
import type { Anexo, TipoNomenclatura, Vinculo } from "./tipos";

export const TAMANHO: Record<TipoNomenclatura, number> = { ncm: 8, nbs: 9 };

export interface ResultadoNomenclatura {
  aceito: boolean;
  motivo: string;
  erroEquivalente: "REG-011" | "REG-012" | "REG-015" | "REG-016" | null;
}

const ERRO = {
  ncm: { fora: "REG-011", incompleto: "REG-015" },
  nbs: { fora: "REG-012", incompleto: "REG-016" },
} as const;

export function validarNomenclatura(anexo: Anexo | undefined, tipo: TipoNomenclatura, codigo: string): ResultadoNomenclatura {
  const nome = tipo.toUpperCase();
  if (!/^\d+$/.test(codigo))
    return { aceito: false, motivo: `${nome} deve ter só dígitos, sem pontos ou espaços.`, erroEquivalente: null };
  const vinculos = anexo?.[tipo] ?? [];
  if (vinculos.length === 0)
    return { aceito: true, motivo: `A classificação não tem anexo de ${nome}: qualquer código vigente é aceito.`, erroEquivalente: null };
  if (codigo.length !== TAMANHO[tipo])
    return {
      aceito: false,
      motivo: `A classificação tem anexo e exige ${nome} completo, com ${TAMANHO[tipo]} dígitos.`,
      erroEquivalente: ERRO[tipo].incompleto,
    };
  const cobrem = vinculos.filter(([prefixo]) => codigo.startsWith(prefixo));
  const a = cobrem.length > 0;
  const e = cobrem.some(([, exc]) => (exc ?? []).some((x) => codigo.startsWith(x)));
  const s = cobrem.some(([, exc]) => !exc || exc.length === 0);
  if (!a)
    return { aceito: false, motivo: `${nome} ${codigo} não consta do anexo da classificação.`, erroEquivalente: ERRO[tipo].fora };
  if (e && !s)
    return {
      aceito: false,
      motivo: `${nome} ${codigo} está entre as exceções do anexo da classificação.`,
      erroEquivalente: ERRO[tipo].fora,
    };
  return { aceito: true, motivo: `${nome} ${codigo} consta do anexo da classificação.`, erroEquivalente: null };
}

/** Uma entrada por prefixo: exceções somadas, ou nenhuma se algum vínculo do prefixo não tem exceção. */
export function consolidarAnexo(lista: Vinculo[]): Array<{ prefixo: string; excecoes: string[] }> {
  const m = new Map<string, Set<string> | null>();
  for (const [prefixo, exc] of lista) {
    const atual = m.get(prefixo);
    if (!exc || exc.length === 0) m.set(prefixo, null);
    else if (atual !== null) m.set(prefixo, new Set([...(atual ?? []), ...exc]));
  }
  return [...m].map(([prefixo, exc]) => ({ prefixo, excecoes: exc ? [...exc].sort() : [] }));
}
