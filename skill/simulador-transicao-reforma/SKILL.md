---
name: simulador-transicao-reforma
description: Simula, ano a ano de 2026 a 2033, a carga de tributos sobre o consumo de uma empresa na transição da Reforma Tributária (PIS/COFINS/ICMS/ISS/IPI para CBS/IBS/IS, EC 132/2023 e LC 214/2025) e mostra o impacto no preço e na margem. Use quando o usuário pedir "quanto meu cliente vai pagar com a reforma", "impacto da reforma no meu negócio", "simulação de carga 2027", "comparar imposto atual com IBS e CBS", "preparar apresentação da reforma para o cliente" ou quiser decidir preços e contratos de longo prazo considerando a transição.
---

# Simulador de impacto da transição da Reforma Tributária

O cliente quer saber se vai pagar mais ou menos, e quando. A resposta honesta depende de alíquotas que ainda não estão todas fixadas. Por isso esta skill simula **cenários explícitos** e nunca apresenta um número como certo. O resultado serve para planejamento e para o escritório conversar com o cliente.

## Referência
- `reference/cst-cclasstrib.md`: reduções (60%, 30%, alíquota zero etc.) por classificação. Use para aplicar a redução certa aos produtos e serviços do cliente.
- `reference/vinculos-ncm-nbs.md`: NCM/NBS aceitos por cada classificação com anexo. Antes de montar um cenário com redução, confira se o NCM/NBS do cliente está na lista. Se não estiver, use o cenário sem redução como principal e mencione o outro só como alternativa a confirmar.

## Cronograma da transição (EC 132/2023 e LC 214/2025)
Use como esqueleto e confirme com o usuário se houve mudança legal posterior:

| Ano | O que muda |
|---|---|
| 2026 | Ano de teste: CBS de 0,9% e IBS de 0,1%, compensáveis com PIS/COFINS. Na prática, sem aumento de carga para quem cumpre as obrigações. |
| 2027 | PIS e COFINS são extintos e a CBS passa a valer integralmente. IPI zerado, salvo para produtos com industrialização incentivada na ZFM. Imposto Seletivo começa. IBS ainda simbólico (0,1%). |
| 2028 | Mesmo modelo de 2027. |
| 2029 a 2032 | ICMS e ISS são reduzidos gradualmente (a 90%, 80%, 70% e 60% das alíquotas) e o IBS sobe na mesma proporção. |
| 2033 | ICMS e ISS são extintos. Fica só IBS + CBS + IS. |

Não invente as alíquotas de referência da CBS e do IBS a partir de 2027. Elas são fixadas por resolução do Senado e por lei de cada ente. Peça ao usuário as alíquotas que ele quer usar, ou monte cenários (por exemplo, "cenário A: CBS 8,8% e IBS 17,7%"), deixando claro que são hipóteses.

## Dados a coletar
- O regime atual (Simples, Presumido ou Real) e o setor.
- O faturamento por tipo de receita (mercadoria, serviço) e os principais NCM/NBS, para achar reduções na referência.
- A carga atual efetiva: PIS/COFINS (cumulativo ou não), ICMS (alíquota e eventual ST), ISS (alíquota municipal) e IPI. Peça os números do cliente em vez de supor.
- As compras com crédito: quanto das compras e despesas vai gerar crédito de IBS/CBS na não cumulatividade ampla.
- Para quem vende: o perfil do cliente final (consumidor ou empresa). Para empresas compradoras, o crédito importa mais do que a alíquota.

## Cálculo
1. **Carga atual**: soma dos tributos sobre consumo pagos hoje, em valor e em % da receita.
2. **Para cada ano**: débito pelo modelo do ano (alíquota cheia menos a redução da classificação) menos os créditos sobre compras, mais a parcela de ICMS/ISS que ainda existir.
3. **"Por dentro" e "por fora"**: ICMS e ISS hoje integram o preço. IBS e CBS são calculados "por fora". Compare sempre na mesma base e explique a diferença ao cliente para evitar confusão com alíquotas nominais altas.
4. **Impacto no preço**: quanto o preço precisa mudar para manter a margem em cada ano.

O crédito das compras é o IBS/CBS destacado pelo fornecedor, calculado pela alíquota da operação de compra (em regra, a cheia), e **não** pela alíquota reduzida das vendas do cliente. Uma redução nas vendas não reduz o crédito das entradas.

## Saída
- **Tabela 2026–2033**: carga atual × carga simulada por ano, em R$ e em % da receita, para cada cenário.
- **Três achados principais**, por exemplo: "a redução de 60% na educação compensa a perda do ISS baixo" ou "o crédito sobre insumos reduz a carga efetiva em X pontos".
- **Premissas**: as alíquotas usadas, o que foi suposto e o que precisa ser confirmado.
- **Recomendação de próximos passos**: revisar contratos longos, ajustar o cadastro e avaliar a opção do Simples, se for o caso.

## Limites
É uma simulação de planejamento, sem valor de parecer. Regimes específicos (combustíveis, financeiro, imobiliário, saúde, cooperativas, entre outros) têm regras próprias. Nesses casos, avise que a simulação geral não se aplica.
