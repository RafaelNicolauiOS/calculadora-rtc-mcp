# Conciliação bancária — junho

Pareei os 5 movimentos do extrato com os 5 lançamentos do razão. Três movimentos fecharam, dois ficaram sem lançamento e um lançamento do razão não aparece no extrato.

## 1. Movimentos do extrato

| Data | Histórico (extrato) | Valor | Status | Lançamento do razão | Observação |
|---|---|---:|---|---|---|
| 03/06 | TARIFA PACOTE | -89,90 | Sem lançamento | — | Tarifa bancária ainda não contabilizada |
| 05/06 | PIX RECEBIDO CLIENTE ALFA | 3.000,00 | Conciliado | 05/06 Recebimento Alfa 3.000,00 | Pareamento exato (valor, data e histórico) |
| 10/06 | PAG BOLETO FORN BETA | -1.250,00 | Conciliado | 11/06 Pagamento Beta -1.250,00 | Mesmo valor e fornecedor, 1 dia de diferença (data próxima) |
| 12/06 | IOF | -4,32 | Sem lançamento | — | IOF ainda não contabilizado |
| 15/06 | TED RECEBIDA LOTE CARTAO | 5.430,00 | Conciliado (um para muitos) | 15/06 Recebimento cartão 2.430,00 + 15/06 Recebimento cartão 3.000,00 | A soma dos dois lançamentos (2.430 + 3.000) é igual ao crédito do lote |

## 2. Lançamentos do razão sem movimento no extrato

| Data | Lançamento | Valor | Status | Observação |
|---|---|---:|---|---|
| 20/06 | Pagamento aluguel | -2.000,00 | A confirmar | Não consta no extrato de junho. Pode ser cheque ou agendamento não compensado, pagamento por outra conta ou caixa, ou lançamento feito sem o pagamento ter ocorrido. Não classifiquei como erro. |

## 3. Classificação sugerida dos itens sem lançamento

Não recebi o plano de contas, então indico só a natureza. Informe os códigos que eu monto os lançamentos.

| Item | Valor | Natureza sugerida | Confiança |
|---|---:|---|---|
| Tarifa pacote | -89,90 | Despesa financeira, tarifas bancárias (débito), contra banco (crédito) | Alta |
| IOF | -4,32 | Despesa financeira, IOF (débito), contra banco (crédito) | Alta |

Total a lançar: R$ 94,22.

## 4. Demonstração da conciliação

Você não enviou os saldos inicial e final do extrato nem o saldo contábil de 30/06. Fiz a conciliação pelas **movimentações do mês**, e os saldos de abertura precisam ser iguais nos dois lados.

| | Valor (R$) |
|---|---:|
| Movimentação líquida do extrato | 7.085,78 |
| Movimentação líquida do razão | 5.180,00 |
| **Diferença (extrato - razão)** | **1.905,78** |

Explicação da diferença:

| Item | Efeito (R$) |
|---|---:|
| Tarifa e IOF no extrato, não lançados no razão (-89,90 - 4,32) | -94,22 |
| Aluguel no razão, não está no extrato (-2.000,00) | +2.000,00 |
| **Total explicado** | **1.905,78** |
| **Diferença residual** | **0,00** |

Portanto, depois de lançar tarifa e IOF, o razão fica R$ 2.000,00 abaixo do extrato, e essa diferença é só o aluguel de 20/06. Se o aluguel for um item em trânsito, o saldo do extrato menos o aluguel pendente é igual ao saldo contábil. Se o aluguel não foi pago pela conta, o lançamento precisa ser revisto.

## 5. Lançamentos sugeridos (para sua confirmação)

Nada foi lançado no sistema. Contas conforme o seu plano:

| Data | Débito | Crédito | Valor | Histórico |
|---|---|---|---:|---|
| 03/06 | Tarifas bancárias | Banco | 89,90 | Tarifa pacote de serviços 06/2027 |
| 12/06 | IOF (despesa financeira) | Banco | 4,32 | IOF s/ operação bancária |

(A competência no histórico é só ilustrativa; ajuste conforme o caso.)

## 6. Pontos para você decidir

1. Confirmar o aluguel de 20/06: de onde saiu o pagamento e se ele aparece no extrato de julho.
2. Os dois lançamentos "Recebimento cartão" de 15/06 (2.430 e 3.000) fecham exatamente o lote de 5.430. Vale conferir com o relatório da adquirente. O valor de 3.000,00 é igual ao do recebimento da Alfa, então confirme que não é duplicidade de outro lançamento.
3. Envie os saldos do extrato e do razão em 30/06 para eu fechar a demonstração com os saldos finais.
