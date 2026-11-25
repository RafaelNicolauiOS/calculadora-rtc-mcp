# Conferência do trecho do SPED Fiscal (C100/C170/C190)

**Veredito: não transmita ainda.** Há 2 erros que geram imposto errado ou rejeição e 1 inconsistência de operação. Conferi 1 documento (C100 nº 1234), 2 itens e 1 resumo. O trecho não traz os blocos 0 e 9 nem o E110, então esses cruzamentos ficaram de fora (ver o fim).

## Erros

| # | Registro | Problema | Valores comparados | Correção sugerida |
|---|---|---|---|---|
| 1 | C100 nº 1234 × C170 | O total do documento não fecha com a soma dos itens | VL_MERC e VL_DOC no C100 = 1.000,00. Itens: 500,00 + 400,00 = **900,00**. Diferença de **100,00** | Ver se falta um item (C170 nº 3 de 100,00) ou se algum valor de item está errado. Confira com o XML da nota e corrija o lado divergente |
| 2 | C100 × C170 (ICMS) | O ICMS do documento é maior que o dos itens | VL_BC_ICMS: C100 1.000,00 × itens 900,00. VL_ICMS: C100 180,00 × itens 90,00 + 72,00 = **162,00**. Diferença de **18,00** (18% de 100,00) | Mesma causa do item 1. Se houver o item faltante (100,00 a 18%), o ICMS fecha em 180,00. Se o C100 estiver errado, corrija para 900,00 e 162,00 |
| 3 | C190 × C170 | O resumo por CST/CFOP/alíquota não bate com os itens | C190 (CST 000, CFOP 1102, 18%): VL_OPR 1.000,00, VL_BC 1.000,00, VL_ICMS 180,00. Itens: 900,00 / 900,00 / 162,00 | O C190 está de acordo com o C100, e quem diverge são os itens. Ajuste depois de resolver o item 1. O C190 deve sempre ser a soma dos C170 |
| 4 | C100 nº 1234, campo CHV_NFE | Chave de acesso vazia | Modelo 55 (COD_MOD) com COD_SIT 00 (regular), chave em branco | Informar a chave de 44 dígitos da NF-e. O PVA costuma rejeitar. Confirme no guia prático vigente |

## Advertência (risco fiscal)

| # | Registro | Problema | Correção sugerida |
|---|---|---|---|
| 5 | C100 nº 1234, IND_OPER e IND_EMIT | IND_OPER = 1 (saída) e IND_EMIT = 0 (emissão própria), mas os itens têm CFOP 1102 (compra, entrada) e o participante é FORN01 (fornecedor) | Se é compra de terceiro: IND_OPER = 0 (entrada) e IND_EMIT = 1 (terceiros). Se for mesmo uma saída, o CFOP deveria começar por 5 ou 6, e o participante deveria ser cliente. Defina a natureza da operação e corrija o campo ou o CFOP |

## Observações

- **Datas**: DT_DOC e DT_E_S são 01/03/2027, e DT_E_S não é anterior a DT_DOC. Confirme se estão dentro do período do registro 0000, que não veio no trecho.
- **CST 000 com CFOP 1102 e alíquota 18%**: é coerente com tributação integral. A alíquota interna de 18% não pode ser validada sem a UF do participante (0150). Se FORN01 for de outra UF, o CFOP deveria ser 2102 e a alíquota interestadual seria 4%, 7% ou 12%.
- **COD_NAT "001"** nos itens exige o cadastro correspondente no registro 0400.
- **Campos de IPI/PIS/COFINS dos itens**: os campos de IPI, PIS e COFINS dos C170 chegaram em branco ou zerados. Verifique se isso é o esperado para a operação e a versão do leiaute.

## Não foi possível conferir (faltam registros)

- Existência de FORN01 (0150), PROD1 e PROD2 (0200) e da unidade UN (0190).
- Totais do bloco 9 (9900).
- Apuração E110/E116 e saldo.
- Inventário (H).

Se enviar o arquivo completo ou ao menos o 0000, 0150, 0200, E110 e o bloco 9, eu faço essas conferências. As regras de leiaute e tabelas mudam por ato COTEPE e por UF. Confirme o guia prático da EFD vigente para a competência de 03/2027.

## Resumo

- Documentos conferidos: 1 (C100), com 2 itens (C170) e 1 resumo (C190).
- Débito de ICMS no C100/C190: 180,00. Nos itens: 162,00. Diferença a esclarecer: 18,00.
- Crédito e saldo da apuração: não apurados (sem E110).

Não alterei nada no arquivo. As correções acima são propostas para você aplicar.
