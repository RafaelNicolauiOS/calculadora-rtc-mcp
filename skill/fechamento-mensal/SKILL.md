---
name: fechamento-mensal
description: Conduz o fechamento contábil mensal de cada cliente do escritório com um checklist adaptado ao regime e à atividade, conferências de saldos (bancos, clientes, fornecedores, impostos, folha, estoque), lançamentos de ajuste pendentes e a lista do que falta pedir ao cliente. Use quando o usuário falar em "fechar o mês", "checklist de fechamento", "balancete não fecha", "o que falta para encerrar a competência", "revisar balancete" ou enviar um balancete pedindo revisão antes de entregar.
---

# Fechamento mensal

O fechamento falha por pendências esquecidas: uma conta de impostos com saldo invertido, um adiantamento que nunca foi baixado, uma provisão de férias que não rodou. Esta skill transforma o fechamento num checklist objetivo e lê o balancete procurando sinais de erro.

## Checklist por área
Adapte ao regime (Simples, Presumido ou Real) e ao que o cliente tem:
1. **Disponibilidades**: bancos conciliados e caixa sem saldo credor nem saldo alto injustificado.
2. **Clientes**: saldo coerente com os títulos em aberto, sem saldo credor (adiantamentos estão na conta certa?) e provisão para perdas, se aplicável.
3. **Estoques**: movimentação e CMV apurados. Inventário, se for mês de levantamento.
4. **Impostos a recuperar e a recolher**: os saldos batem com as apurações do mês (ICMS, PIS/COFINS, ISS, IRPJ/CSLL, DAS)? Os pagamentos baixaram as provisões?
5. **Folha**: provisões de férias e 13º com encargos; salários, INSS e FGTS a recolher batendo com a folha e as guias.
6. **Fornecedores e contas a pagar**: sem saldo devedor (adiantamentos), com os vencidos conferidos.
7. **Imobilizado**: depreciação lançada, aquisições e baixas registradas.
8. **Empréstimos**: juros apropriados e parcelas classificadas no circulante e no não circulante.
9. **Resultado**: receita batendo com o faturamento fiscal e as despesas recorrentes do mês todas presentes (aluguel, energia, honorários).
10. **Conta transitória e "a classificar"**: zerada ou com explicação.

## Leitura do balancete
Se o usuário enviar o balancete, procure:
- **Saldos de natureza invertida**: ativo credor, passivo devedor, despesa credora sem estorno justificado.
- **Variações atípicas** em relação ao mês anterior. Se houver dois balancetes, compare e destaque variações acima de 30% em contas relevantes.
- **Contas que deveriam ter movimento e não têm**, como depreciação, provisões e despesas fixas.
- **Diferença** entre receita contábil e faturamento declarado, se o usuário informar o faturamento.

## Saída
- **Checklist do mês** com status por item (ok, pendente, não se aplica) e o responsável.
- **Lista de achados do balancete**: conta, saldo, por que é suspeito, ajuste sugerido.
- **Pendências para pedir ao cliente**: documentos, extratos, notas, confirmações.
- **Lançamentos de ajuste sugeridos**, como débito e crédito, para revisão.

## Limites
A skill aponta e propõe. A decisão sobre ajustes é do responsável técnico. Não altere saldos para "fechar" sem a causa identificada.
