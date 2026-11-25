# Classificação dos lançamentos — julho

Classifiquei os 5 movimentos usando só as contas do seu plano. Como o cliente provisiona fornecedores, o pagamento de fornecedor baixa a provisão e não vai a despesa. Não recebi de-para anterior, então todas as classificações são inferidas.

## Lançamentos (CSV para importação)

```csv
data,debito,credito,valor,historico
02/07,2.3.1.01,1.1.1.02,5000.00,Pgto a socio Joao - retirada (a confirmar natureza)
05/07,4.2.1.09,1.1.1.02,410.00,Pgto energia eletrica - CEMIG
08/07,2.1.1.01,1.1.1.02,3200.00,Pgto fornecedor Madeiras SA - baixa de provisao
10/07,2.1.3.01,1.1.1.02,1150.00,Pgto DAS Simples Nacional - baixa de imposto a recolher
12/07,1.1.1.02,1.1.2.01,7000.00,Recebimento cliente XYZ Ltda - baixa de clientes
```

Em tabela:

| Data | Débito | Crédito | Valor (R$) | Histórico | Origem |
|---|---|---|---:|---|---|
| 02/07 | 2.3.1.01 Lucros a distribuir | 1.1.1.02 Banco Itaú | 5.000,00 | Pgto a sócio João | Inferido (confiança média) |
| 05/07 | 4.2.1.09 Energia | 1.1.1.02 Banco Itaú | 410,00 | Pgto energia elétrica CEMIG | Inferido (confiança alta) |
| 08/07 | 2.1.1.01 Fornecedores | 1.1.1.02 Banco Itaú | 3.200,00 | Pgto Madeiras SA, baixa de provisão | Inferido (confiança alta) |
| 10/07 | 2.1.3.01 Impostos a recolher | 1.1.1.02 Banco Itaú | 1.150,00 | Pgto DAS | Inferido (confiança alta) |
| 12/07 | 1.1.1.02 Banco Itaú | 1.1.2.01 Clientes | 7.000,00 | Recebimento XYZ Ltda | Inferido (confiança média) |

Conferência: saídas 9.760,00 (5.000 + 410 + 3.200 + 1.150) e entrada 7.000,00. Efeito líquido no banco: -2.760,00.

## Relatório de confiança

| Origem | Qtde |
|---|---:|
| De-para do cliente | 0 |
| Inferidos pela natureza do histórico | 5 (3 com confiança alta, 2 com média) |
| Na conta transitória "a classificar" | 0 |

## Perguntas ao cliente

Por favorecido:

1. **João (sócio), R$ 5.000,00, 02/07**: foi retirada de lucros, pró-labore, empréstimo (mútuo) ao sócio ou despesa pessoal dele paga pela empresa? Lancei em Lucros a distribuir (2.3.1.01) porque movimento com sócio não vai a despesa. Se for pró-labore, o lançamento muda e entram INSS e IRRF. Se for adiantamento ou mútuo, o plano **não tem uma conta adequada**. Sugiro criar "Adiantamentos a sócios" (ativo) ou "Mútuo com sócios".
2. **XYZ Ltda, R$ 7.000,00, 12/07**: esse valor é de uma venda já faturada e registrada em Clientes? Lancei a crédito de Clientes (1.1.2.01). Se a receita não foi reconhecida antes (venda à vista ou regime de caixa), o crédito correto seria 3.1.1.01 Receita de serviços.
3. **DAS, R$ 1.150,00, 10/07**: confirme que a competência do DAS (provavelmente 06/2025) já está provisionada em 2.1.3.01. Se não estava provisionada, o débito vai à despesa de impostos, e o plano não tem essa conta (sugiro criar "Impostos e taxas sobre receita").
4. **Madeiras SA, R$ 3.200,00**: a nota já foi provisionada em Fornecedores? Se não foi, a contrapartida é a conta de custo ou despesa e a nota precisa ser lançada.
5. **CEMIG, R$ 410,00**: sem dúvida de classificação. Só confirme se a conta de luz não é de imóvel de sócio.

## De-para atualizado (para o mês seguinte)

| Histórico / favorecido | Conta |
|---|---|
| CEMIG | 4.2.1.09 Energia |
| MADEIRAS SA | 2.1.1.01 Fornecedores |
| DAS SIMPLES | 2.1.3.01 Impostos a recolher |
| XYZ LTDA (recebimento) | 1.1.2.01 Clientes |
| JOAO SOCIO | 2.3.1.01 Lucros a distribuir (pendente de confirmação) |

Esta é uma proposta para revisão do responsável técnico. Nada foi lançado no sistema.
