---
name: conciliacao-bancaria
description: Concilia o extrato bancário do cliente (OFX, CSV ou PDF convertido) com os lançamentos contábeis ou financeiros, casa movimentos por valor, data e histórico, sugere a conta contábil dos não identificados e lista as diferenças. Use quando o usuário pedir "conciliação bancária", "bater extrato com a contabilidade", "achar lançamentos que faltam", "importar OFX", "saldo do banco não fecha com o razão" ou enviar um extrato junto com um razão ou relatório de contas a pagar e receber.
---

# Conciliação bancária

A conciliação fecha o mês. Saldo de banco que não bate trava o balancete e esconde erros de lançamento. Esta skill faz o pareamento mecânico e deixa para o analista só o que de fato precisa de decisão.

## Entradas
- **Extrato**: de preferência OFX, que é estruturado. O script `scripts/ofx_para_csv.py` converte OFX em CSV (data, valor, tipo, histórico, documento, FITID). Rode `python3 scripts/ofx_para_csv.py extrato.ofx > extrato.csv`. CSV do banco também serve, mas confirme as colunas e o sinal (débito negativo).
- **Lançamentos**: razão da conta banco, relatório do financeiro (pagos e recebidos) ou lançamentos do sistema contábil.
- **Plano de contas do cliente**, para sugerir a classificação dos itens não identificados.

## Pareamento (nesta ordem)
1. **Exato**: mesmo valor e mesma data, ou mesmo documento ou FITID.
2. **Data próxima**: mesmo valor com diferença de até 3 dias úteis (compensação, agendamento).
3. **Um para muitos**: um crédito no extrato que é a soma de vários recebimentos (lote de cartão, boletos) ou o inverso. Procure combinações pequenas, de no máximo 5 lançamentos.
4. **Por histórico**: palavras-chave recorrentes (nome do fornecedor, "TARIFA", "IOF", "PIX RECEBIDO") para casar ou classificar.

Nunca force um par só porque o valor coincide, se o histórico contradiz. Marque como "a confirmar".

## Classificação sugerida dos não identificados
Use o plano de contas do cliente. Padrões frequentes:
- tarifas bancárias e IOF: despesas financeiras;
- juros recebidos ou rendimentos de aplicação: receitas financeiras;
- transferências entre contas próprias: transferência, sem resultado;
- recebimentos de clientes ainda não baixados: clientes ou contas a receber.

Indique a confiança da sugestão.

## Saída
- **Planilha**: movimentos do extrato com o status (conciliado, a confirmar, sem lançamento) e lançamentos sem movimento no extrato (ex.: cheque não compensado, lançamento em duplicidade).
- **Demonstração da conciliação**: saldo do extrato, mais ou menos os itens em trânsito, igual ao saldo contábil, com a diferença residual explicada ou destacada.
- **Lançamentos sugeridos** para os itens sem registro, no formato que o sistema do usuário importa, se ele informar o formato.

## Limites
Não lance nada no sistema sem confirmação. Valores que não fecham depois do pareamento devem ser reportados, não ajustados com lançamento genérico de "diferença".
