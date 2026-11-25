# Simulação da transição 2026-2033: escola de idiomas (Lucro Presumido)

Material de planejamento para conversar com o cliente. **Não é parecer**, e as alíquotas de IBS/CBS de 2027 em diante são hipóteses, porque ainda dependem de resolução do Senado e de lei de cada ente.

## 1. Dados e premissas

- Receita: R$ 1.200.000/ano, só de serviços (sem variação ao longo dos anos, em termos reais).
- Carga atual: PIS/COFINS cumulativo 3,65% = R$ 43.800 + ISS 2% = R$ 24.000 = **R$ 67.800 (5,65% da receita)**. No cumulativo não há crédito.
- Compras com crédito: R$ 150.000/ano. Considerei esse valor como a base da compra **sem** IBS/CBS, e o crédito é essa base × a alíquota do ano.
- Cronograma usado (EC 132/2023 e LC 214/2025):
  - 2026: CBS 0,9% + IBS 0,1%, compensáveis com PIS/COFINS.
  - 2027-2028: CBS cheia, PIS/COFINS extintos, IBS simbólico de 0,1%, ISS integral.
  - 2029-2032: ISS cai para 90%, 80%, 70% e 60% e o IBS sobe na proporção (10%, 20%, 30% e 40% da alíquota).
  - 2033: ISS extinto e IBS pleno.
- **Cenários de alíquota (hipóteses):** CBS 8,8% e IBS 17,7% (total 26,5%).
  - **Cenário A:** serviço sem redução (cClassTrib 000001).
  - **Cenário B:** serviço de educação com redução de 60% (cClassTrib 200028, Art. 129 da LC 214/2025, alíquota efetiva de 10,6%).
- **Ponto crítico:** a classificação 200028 só vale para os serviços de educação listados no Anexo II (NBS). Confirme se o NBS do curso de idiomas do cliente consta no anexo. Se não constar, vale o cenário A. Não presuma o benefício.

## 2. Resultado por ano (valor recolhido ao fisco: IBS/CBS líquido de crédito + ISS + PIS/COFINS remanescente)

**Cenário A (sem redução, 26,5%)**

| Ano | IBS+CBS devido | Crédito das compras | PIS/COFINS | ISS | Total recolhido | % da receita |
|---|---|---|---|---|---|---|
| Hoje | - | - | 43.800 | 24.000 | 67.800 | 5,65% |
| 2026 | 12.000 (compensado) | - | 31.800 (após compensar) | 24.000 | 67.800 | 5,65% |
| 2027 | 106.800 | 13.350 | 0 | 24.000 | 117.450 | 9,79% |
| 2028 | 106.800 | 13.350 | 0 | 24.000 | 117.450 | 9,79% |
| 2029 | 126.840 | 15.855 | 0 | 21.600 | 132.585 | 11,05% |
| 2030 | 148.080 | 18.510 | 0 | 19.200 | 148.770 | 12,40% |
| 2031 | 169.320 | 21.165 | 0 | 16.800 | 164.955 | 13,75% |
| 2032 | 190.560 | 23.820 | 0 | 14.400 | 181.140 | 15,10% |
| 2033 | 318.000 | 39.750 | 0 | 0 | 278.250 | 23,19% |

**Cenário B (redução de 60%, 10,6%)**

| Ano | IBS+CBS devido | Crédito das compras | PIS/COFINS | ISS | Total recolhido | % da receita |
|---|---|---|---|---|---|---|
| 2026 | 12.000 (compensado) | - | 31.800 | 24.000 | 67.800 | 5,65% |
| 2027 | 42.720 | 5.340 | 0 | 24.000 | 61.380 | 5,12% |
| 2028 | 42.720 | 5.340 | 0 | 24.000 | 61.380 | 5,12% |
| 2029 | 50.736 | 6.342 | 0 | 21.600 | 65.994 | 5,50% |
| 2030 | 59.232 | 7.404 | 0 | 19.200 | 71.028 | 5,92% |
| 2031 | 67.728 | 8.466 | 0 | 16.800 | 76.062 | 6,34% |
| 2032 | 76.224 | 9.528 | 0 | 14.400 | 81.096 | 6,76% |
| 2033 | 127.200 | 15.900 | 0 | 0 | 111.300 | 9,28% |

## 3. Como ler: "por dentro" x "por fora" e o efeito no preço

Hoje PIS/COFINS e ISS estão **dentro** do preço de R$ 1,2 milhão. IBS e CBS são cobrados **por fora**, somados ao preço. Por isso a coluna "% da receita" acima, com receita sem IBS/CBS, não mostra sozinha o que o aluno sentirá. Em IBS/CBS, a escola funciona como arrecadadora: o aluno paga o tributo e a escola repassa o valor líquido.

Para a escola **manter o mesmo valor líquido depois dos tributos** (R$ 1.132.200/ano, que é R$ 1.200.000 menos R$ 67.800 hoje), o preço-base sem IBS/CBS e o preço final ao aluno ficam assim, em relação aos R$ 1,2 milhão de hoje:

| Ano | Preço-base necessário | Preço final ao aluno, cenário A | Variação A | Preço final, cenário B | Variação B |
|---|---|---|---|---|---|
| 2027-2028 | 1.155.306 | 1.258.128 | +4,8% | 1.196.435 | -0,3% |
| 2029 | 1.152.953 | 1.274.820 | +6,2% | 1.201.700 | +0,1% |
| 2030 | 1.150.609 | 1.292.595 | +7,7% | 1.207.403 | +0,6% |
| 2031 | 1.148.275 | 1.310.297 | +9,2% | 1.213.084 | +1,1% |
| 2032 | 1.145.951 | 1.327.928 | +10,7% | 1.218.742 | +1,6% |
| 2033 | 1.132.200 | 1.432.233 | +19,4% | 1.252.213 | +4,4% |

O preço-base cai ao longo do tempo porque o ISS, que hoje está embutido no preço, vai sumindo. Mas o IBS/CBS por fora cresce mais do que isso.

## 4. Três achados principais

1. **2026 não muda a carga.** CBS 0,9% e IBS 0,1% são compensados com PIS/COFINS, então o cliente continua em R$ 67.800 (5,65%), desde que cumpra as obrigações acessórias.
2. **Tudo depende de a educação de idiomas ter a redução de 60%.** Com a redução, a carga recolhida em 2027-2028 é de R$ 61.380 (5,12%), menor que a de hoje, e o aluno quase não sente a mudança até 2032. Sem a redução, o recolhimento sobe para R$ 117.450 (9,79%) em 2027, e o preço final ao aluno sobe cerca de 5% no ano, chegando a perto de +19% em 2033.
3. **O crédito das compras é pequeno diante do débito.** Os R$ 150 mil de compras geram de R$ 13.350 (cenário A, 2027) a R$ 39.750 (cenário A, 2033) de crédito. Ele reduz a carga em 1,1 a 3,3 pontos percentuais da receita, mas não muda o quadro. A escola vende para consumidor final (alunos pessoa física), então o aluno não aproveita crédito algum e sente o tributo por inteiro no preço.

## 5. O que o escritório precisa confirmar

- O NBS do curso de idiomas e se ele está no Anexo II (classificação 200028). Isso decide entre os cenários A e B.
- As alíquotas de referência definitivas de CBS e IBS. Troque a hipótese de 8,8% e 17,7% pelas fixadas.
- Se existe parcela das compras com tributo embutido hoje (PIS/COFINS, ICMS) que deixará de ser custo. A simulação não considerou queda no custo das compras, o que favorece o cliente.
- Alíquota de ISS municipal e eventuais benefícios locais.
- Se a escola atende também empresas (cursos corporativos). Para empresas compradoras, o crédito de IBS/CBS pesa no preço que elas aceitam pagar, e o cálculo mudaria.

## 6. Próximos passos

- Revisar contratos de mensalidade e matrículas longas (12 meses ou mais) com cláusula de repasse de mudança tributária, já que o preço final tende a subir a cada ano da transição.
- Cadastrar os serviços com o NBS correto para a classificação certa no emissor de NFS-e.
- Reapresentar a simulação quando as alíquotas definitivas saírem e quando o cliente trouxer a estrutura real de compras.
- Este modelo de regime regular não se aplica se a escola migrar para o Simples Nacional. Nesse caso, outra análise.

Esta é uma simulação de planejamento, sem valor de parecer.
