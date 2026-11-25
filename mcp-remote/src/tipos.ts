export type Tributo = "cbs-ibs" | "is";
export type TipoNomenclatura = "ncm" | "nbs";
/** Prefixo aceito pelo anexo, com exceções opcionais (formato de vinculos-nomenclatura.json). */
export type Vinculo = [string] | [string, string[]];
export interface Anexo {
  ncm: Vinculo[];
  nbs: Vinculo[];
}
export interface Fundamentacao {
  texto: string;
  textoCurto: string;
  referenciaNormativa?: string;
}
export interface Classificacao {
  codigo: string;
  cst?: string;
  descricao: string;
  descricaoTratamentoTributario: string;
  tipoAliquota: string;
  nomenclatura: string | null;
  possuiPercentualReducao: boolean;
  percentualReducaoCbs?: number;
  percentualReducaoIbsUf?: number;
  percentualReducaoIbsMun?: number;
  creditoOperacaoAntecedente?: string;
  exigeGrupoDesoneracao: boolean;
  incompativelComSuspensao: boolean;
  indicaApropriacaoCreditoAdquirenteCbs: boolean;
  indicaApropriacaoCreditoAdquirenteIbs: boolean;
  indicaCreditoPresumidoFornecedor: boolean;
  indicaCreditoPresumidoAdquirente: boolean;
  tiposDfeClassificacao: Array<{ sigla: string; tipo: number; descricao: string }>;
  fundamentacoes?: Fundamentacao[];
}
export interface Situacao {
  codigo: string;
  descricao: string;
  classificacoes: string[];
}
export interface AtividadeSimples {
  codigo: string;
  descricao: string;
  rotuloAnexo: string;
  anexoSemFatorR: string | null;
  anexoComFatorR: string | null;
  sujeitaFatorR: boolean;
  tpDocsAdmissiveis: string[];
}
export interface ErroCatalogo {
  codigo: string;
  titulo: string;
  campo: string;
  estado: string;
  descricao: string;
}
export interface Meta {
  geradoEm: string;
  dataNomenclatura: string;
  regimeRegular: { versaoApp: string; versaoDb: string; descricaoVersaoDb: string; dataVersaoDb: string };
}
