# Revisão do balancete de agosto (Lucro Presumido)

Não recomendo fechar agora. Há 6 achados no balancete e 2 itens do checklist ainda não verificáveis. Abaixo estão os achados, as pendências e os ajustes sugeridos. A decisão de ajustar é do responsável técnico, e não alterei nenhum saldo.

## 1. Achados do balancete

| # | Conta | Saldo informado | Por que é suspeito | Ajuste sugerido |
|---|---|---|---|---|
| 1 | Caixa | 1.200,00 credor | Caixa não pode ficar credor (isso significaria pagar mais do que havia). Indica pagamento lançado sem entrada, erro de data ou lançamento em caixa que deveria ser banco. | Investigar o razão do caixa. Se for pagamento feito pelo banco, reclassificar: D Caixa / C Bancos (valor a confirmar). |
| 2 | Clientes | 3.000,00 credor | Saldo credor em clientes costuma ser adiantamento recebido, recebimento em duplicidade ou baixa a maior. | Se for adiantamento, reclassificar para passivo (Adiantamentos de clientes). Se for baixa duplicada, estornar. |
| 3 | ICMS a recolher | 2.300,00 devedor | Passivo com saldo devedor: pode ser pagamento a maior, pagamento sem a provisão da apuração, ou crédito de ICMS que deveria estar em "ICMS a recuperar". | Conferir a apuração de agosto e a guia paga. Se for crédito, reclassificar para ICMS a recuperar (ativo). Se o ICMS do mês não foi provisionado, lançar a apuração. |
| 4 | Provisão de férias | 0,00 (6 funcionários) | Com 6 funcionários deve haver provisão mensal de férias, 1/3 constitucional e encargos. Saldo zero indica que a provisão não rodou, ou que não há controle de períodos aquisitivos. | Calcular com base na folha: D Despesa de férias e 1/3 / C Provisão de férias, e o mesmo para os encargos (INSS e FGTS sobre férias). Valor depende da folha (não informada). Verificar também a provisão do 13º. |
| 5 | Depreciação acumulada | Sem movimento | Se há imobilizado depreciável, deveria ter depreciação mensal. | Se houver imobilizado: D Despesa de depreciação / C Depreciação acumulada. Valor depende do cadastro do imobilizado. Se não houver imobilizado, marcar como não se aplica. |
| 6 | Receita | 120.000,00 | Sem o faturamento fiscal não dá para conferir. Em Presumido, a receita é a base do PIS, COFINS, IRPJ e CSLL. | Comparar com o total de notas emitidas no mês e com a apuração. |

Observação: Bancos com 45.000,00 devedor é um saldo normal, mas só está ok depois de conciliado. Fornecedores com 8.000,00 credor também é natural, e falta conferir os vencidos.

## 2. Checklist do mês

| Área | Status | Observação |
|---|---|---|
| 1. Disponibilidades | Pendente | Caixa credor (achado 1). Bancos precisam de conciliação. |
| 2. Clientes | Pendente | Saldo credor (achado 2). Não há provisão para perdas informada. |
| 3. Estoques | Não verificável | Sem dados no balancete enviado. Se o cliente é comércio ou indústria (há ICMS), conferir estoque e CMV. |
| 4. Impostos | Pendente | ICMS devedor (achado 3). Faltam PIS, COFINS, IRPJ e CSLL a recolher para conferir com a apuração do Presumido. |
| 5. Folha | Pendente | Provisão de férias zerada (achado 4). Conferir também o 13º, INSS e FGTS a recolher. |
| 6. Fornecedores | Parcialmente ok | Saldo credor, normal. Conferir vencidos. |
| 7. Imobilizado | Pendente | Depreciação sem movimento (achado 5). |
| 8. Empréstimos | Não verificável | Sem informação. |
| 9. Resultado | Pendente | Conferir receita com o faturamento e as despesas fixas (aluguel, energia, honorários) presentes. |
| 10. Transitória / a classificar | Não verificável | Conta não apareceu no balancete. |

Responsáveis: sugiro o analista contábil para as contas de ativo e passivo, o departamento pessoal para a folha e o fiscal para ICMS e receita.

## 3. Pendências para pedir ao cliente

1. Extratos bancários e movimento de caixa de agosto, para conciliação e para explicar o caixa credor.
2. Relatório de contas a receber e confirmação se houve adiantamentos recebidos de clientes.
3. Guias de ICMS pagas e apuração de agosto.
4. Notas fiscais emitidas em agosto (faturamento) e livro de saídas.
5. Folha de agosto, controle de férias dos 6 funcionários e guias de INSS e FGTS.
6. Relação do imobilizado e data de aquisição dos bens.
7. Posição de estoque no fim de agosto, se aplicável.

## 4. Lançamentos de ajuste sugeridos (somente para revisão)

| Ajuste | Débito | Crédito | Valor |
|---|---|---|---|
| Provisão de férias e 1/3 | Despesa com férias | Provisão de férias | A calcular com a folha |
| Encargos sobre férias | Despesa de encargos | INSS e FGTS sobre provisão | A calcular |
| Depreciação do mês (se houver imobilizado) | Despesa de depreciação | Depreciação acumulada | A calcular |
| Caixa credor, se for pagamento feito pelo banco | Caixa | Bancos | Até 1.200,00 após conferência |
| Cliente credor, se for adiantamento | Clientes | Adiantamentos de clientes | 3.000,00 após conferência |
| ICMS devedor, se for crédito | ICMS a recuperar | ICMS a recolher | 2.300,00 após conferência |

Não há valor definitivo para esses ajustes antes de identificar a causa de cada um. Não faça lançamentos genéricos só para fechar os saldos.
