// Dados da Calculadora RTC embutidos no bundle (gerados por scripts/preparar.mjs a partir de site/data).
import classificacoesJson from "../data/classificacoes.json";
import errosJson from "../data/erros.json";
import isJson from "../data/imposto-seletivo.json";
import localidadesJson from "../data/localidades.json";
import metaJson from "../data/meta.json";
import nbsJson from "../data/nbs.json";
import ncmJson from "../data/ncm.json";
import simplesJson from "../data/simples-atividades.json";
import situacoesJson from "../data/situacoes.json";
import vinculosJson from "../data/vinculos.json";
import type { Anexo, AtividadeSimples, Classificacao, ErroCatalogo, Meta, Situacao, TipoNomenclatura, Tributo } from "./tipos";

export const meta = metaJson as unknown as Meta;

const lista: Record<Tributo, Classificacao[]> = {
  "cbs-ibs": classificacoesJson as unknown as Classificacao[],
  is: (isJson as unknown as { classificacoes: Classificacao[] }).classificacoes,
};
const anexosPorTributo: Record<Tributo, Record<string, Anexo>> = {
  "cbs-ibs": (vinculosJson as unknown as { vinculos: Record<string, Anexo> }).vinculos,
  is: (vinculosJson as unknown as { vinculosIs?: Record<string, Anexo> }).vinculosIs ?? {},
};

let porCodigo: Record<Tributo, Map<string, Classificacao>> | undefined;
function indice(t: Tributo): Map<string, Classificacao> {
  porCodigo ??= {
    "cbs-ibs": new Map(lista["cbs-ibs"].map((c) => [c.codigo, c])),
    is: new Map(lista.is.map((c) => [c.codigo, c])),
  };
  return porCodigo[t];
}

export const classificacoes = (t: Tributo): Classificacao[] => lista[t];
export const classificacao = (t: Tributo, codigo: string): Classificacao | undefined => indice(t).get(codigo);
export const anexo = (t: Tributo, codigo: string): Anexo | undefined => anexosPorTributo[t][codigo];
export const anexos = (t: Tributo): Array<[string, Anexo]> => Object.entries(anexosPorTributo[t]);
export const situacoes = (): Situacao[] => situacoesJson as unknown as Situacao[];
export const situacoesIs = (): Array<{ codigo: string; descricao: string }> =>
  (isJson as unknown as { situacoes: Array<{ codigo: string; descricao: string }> }).situacoes;

let nomenclaturas: Record<TipoNomenclatura, Map<string, string>> | undefined;
export function descricaoNomenclatura(tipo: TipoNomenclatura, codigo: string): string | undefined {
  nomenclaturas ??= {
    ncm: new Map(ncmJson as unknown as Array<[string, string]>),
    nbs: new Map(nbsJson as unknown as Array<[string, string]>),
  };
  return nomenclaturas[tipo].get(codigo);
}

export const atividadesSimples = (): AtividadeSimples[] => simplesJson as unknown as AtividadeSimples[];
export const erros = (): ErroCatalogo[] => errosJson as unknown as ErroCatalogo[];

let cacheMunicipios: Array<{ codigo: number; nome: string; uf: string }> | undefined;
export function municipios(): Array<{ codigo: number; nome: string; uf: string }> {
  if (!cacheMunicipios) {
    const loc = localidadesJson as unknown as { ufs: Array<[number, string, string]>; municipios: Array<[number, number, string]> };
    const sigla = new Map(loc.ufs.map(([cod, uf]) => [cod, uf]));
    cacheMunicipios = loc.municipios.map(([codigo, uf, nome]) => ({ codigo, nome, uf: sigla.get(uf) ?? "" }));
  }
  return cacheMunicipios;
}
