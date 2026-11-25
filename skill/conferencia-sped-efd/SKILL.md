---
name: conferencia-sped-efd
description: Confere arquivos do SPED Fiscal (EFD ICMS/IPI) e da EFD-Contribuições antes da transmissão e aponta inconsistências entre registros, totais e cadastros, com a correção sugerida. Use sempre que o usuário enviar um arquivo .txt do SPED, trechos de registros (0150, 0200, C100, C170, C190, E110, M200 etc.), um relatório do PVA com erros ou advertências, ou pedir "revisar o SPED antes de enviar", "por que o PVA está dando erro", "bater a apuração do ICMS" ou "conferir PIS/COFINS da EFD".
---

# Conferência de SPED (EFD ICMS/IPI e EFD-Contribuições)

O PVA valida estrutura, mas não pega tudo. Muitos erros só aparecem depois, em malha ou fiscalização. Esta skill lê o arquivo, ou os registros colados, e faz as conferências cruzadas que o analista faria à mão.

## Como ler o arquivo
O SPED é texto delimitado por `|`. O primeiro campo de cada linha é o registro (ex.: `|C100|...|`). Os blocos da EFD ICMS/IPI são:
- 0: abertura e cadastros (0000, 0150 participantes, 0190 unidades, 0200 itens);
- C: documentos de mercadorias (C100 cabeçalho, C170 itens, C190 resumo por CST/CFOP/alíquota);
- D: transportes e comunicação;
- E: apuração (E110 ICMS, E200 ST, E500 IPI);
- G: CIAP;
- H: inventário;
- K: produção e estoque;
- 1: outras informações;
- 9: controle e encerramento.

Na EFD-Contribuições, os blocos A (serviços), C, D, F (demais operações), M (apuração de PIS/COFINS) e P (CPRB).

Arquivos grandes: se houver um ambiente com Python, use um script para contar e somar registros em vez de ler linha a linha. Se o arquivo vier colado, trabalhe por blocos e diga o que foi coberto.

## Conferências (faça as que os dados permitirem)
1. **Estrutura**: os totais do bloco 9 (9900) batem com a contagem real de cada registro? Todo participante (0150) e item (0200) usados nos documentos existem no cadastro?
2. **Documento × itens**: o VL_DOC de cada C100 é igual à soma dos itens (C170) mais frete, seguro e outras despesas, menos desconto? A soma de VL_ICMS dos itens bate com o C100?
3. **C190 × C170**: o resumo por CST/CFOP/alíquota bate com os itens?
4. **Apuração (E110)**: débitos menos créditos, mais ajustes e saldo anterior, fecham com o saldo a recolher ou o credor transportado? O E116 (obrigações a recolher) bate com o E110?
5. **Coerência fiscal**: CFOP de entrada em documento de saída (ou o inverso), CST de tributação com ICMS zerado, alíquota interestadual incompatível com a UF do participante, ST sem E200.
6. **EFD-Contribuições**: as bases dos documentos (C/A/F) fecham com o M210/M610? O regime (cumulativo ou não cumulativo) é coerente com as alíquotas usadas? Há crédito em CST que não permite crédito?
7. **Inventário (H)**: se o período exige, o H010 está presente e o valor total bate com o H005?

## Saída
Uma lista priorizada:
- **Erro** (vai rejeitar ou gera imposto errado);
- **Advertência** (risco fiscal);
- **Observação**.

Para cada item, informe o registro e a linha (ou o documento), o que está errado, os valores comparados e a correção sugerida. No fim, um resumo: quantos documentos foram conferidos, os totais de débito e crédito e o saldo apurado.

## Limites
Regras de leiaute e tabelas (CST, CFOP, códigos de ajuste) mudam por ato COTEPE e por UF. Se uma regra depender da UF ou da versão do leiaute, diga isso e peça ao usuário para confirmar o guia prático vigente. Não altere o arquivo do cliente sem pedido. Entregue as correções propostas.
