---
name: creditos-ibs-cbs
description: Analisa notas de entrada, compras e despesas para dizer o que gera crédito de IBS e CBS na não cumulatividade da Reforma Tributária (LC 214/2025), o que não gera e por quê, e estima o crédito do período. Use quando o usuário perguntar "isso dá crédito de IBS/CBS?", "quanto de crédito minha empresa vai ter", "conferir créditos das notas de entrada", "uso e consumo pessoal gera crédito?", "crédito presumido" ou trouxer uma lista de compras, XMLs de entrada ou um razão de despesas para revisar sob a reforma.
---

# Créditos de IBS e CBS

A reforma troca créditos restritos, ligados a insumos, por uma não cumulatividade ampla. Em regra, quase toda aquisição gera crédito, com exceções importantes. Isso muda o custo real das compras e a precificação. Esta skill revisa as entradas e separa o crédito certo, o crédito condicionado e o que não gera crédito.

## Referência
- `reference/cst-cclasstrib.md`: para cada classificação, os indicadores "adquirente apropria crédito de CBS/IBS", "crédito presumido do adquirente" e "crédito presumido do fornecedor", além da redução e da fundamentação.

## Princípios a aplicar
1. **Regra geral**: o adquirente contribuinte do regime regular credita o IBS e a CBS destacados nas aquisições de bens e serviços.
2. **Condição de extinção do débito**: o crédito, em regra, depende de o tributo da operação anterior ter sido extinto (pagamento, inclusive pelo split payment, ou outra forma prevista). Marque como "condicionado" quando não houver evidência de recolhimento.
3. **Uso e consumo pessoal**: aquisições para uso ou consumo pessoal de sócios, administradores e empregados, e bens como joias, obras de arte, bebidas alcoólicas e itens de recreação, sofrem restrição (LC 214/2025). Confirme na lei o rol exato antes de concluir.
4. **Classificação do fornecedor manda**: a cClassTrib na nota de entrada indica se o adquirente pode apropriar crédito. Por exemplo, operações isentas ou imunes em geral não destacam tributo e não geram crédito, salvo hipótese de crédito presumido.
5. **Fornecedor do Simples Nacional**: o crédito fica limitado ao IBS/CBS pago dentro do DAS, que vem destacado na nota, salvo se o fornecedor optou por recolher por fora.
6. **Crédito presumido**: existe em hipóteses específicas, como compras de produtor rural não contribuinte e de resíduos sólidos. Use os indicadores da referência e cite a fundamentação.

## Método
Para cada nota ou linha de despesa:
1. Leia o fornecedor (regime), a cClassTrib e o CST da nota, os valores destacados de CBS/IBS e a finalidade da compra.
2. Classifique em:
   - **Crédito integral**;
   - **Crédito limitado** (Simples);
   - **Crédito presumido**;
   - **Condicionado** (sem evidência de extinção do débito);
   - **Sem crédito**, com o motivo.
3. Some por categoria e período.

## Saída
- **Tabela**: nota ou linha, fornecedor, cClassTrib, valor de CBS e de IBS, categoria, motivo e fundamentação.
- **Totais**: crédito estimado de CBS e IBS no período, separando o certo do condicionado.
- **Alertas**: fornecedores que não destacam IBS/CBS quando deveriam, notas com cClassTrib incoerente com a compra, despesas que parecem uso pessoal.

## Limites
As regras de crédito e as exceções são detalhadas na LC 214/2025 e no regulamento. Em casos limítrofes, indique o artigo a consultar em vez de decidir sozinho. Durante 2026 (ano de teste), os valores de CBS/IBS têm tratamento próprio de compensação. Não os trate como crédito definitivo.
