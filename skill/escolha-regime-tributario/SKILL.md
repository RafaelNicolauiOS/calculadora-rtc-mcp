---
name: escolha-regime-tributario
description: Compara Simples Nacional, Lucro Presumido e Lucro Real para uma empresa com simulação de carga anual a partir do faturamento, margem, folha e atividade, e recomenda o regime com as premissas explícitas — inclusive o efeito da Reforma Tributária (CBS/IBS a partir de 2027). Use quando o usuário pedir "qual o melhor regime tributário", "Simples ou Presumido", "planejamento tributário para o ano que vem", "vale a pena sair do Simples", "simular Lucro Real" ou estiver abrindo uma empresa e quiser saber quanto vai pagar de imposto.
---

# Escolha do regime tributário

A escolha do regime é anual e, em regra, irretratável no ano. Errar custa um ano inteiro de imposto a mais. Esta skill faz a comparação com os números do cliente e deixa as premissas à vista, para o contador validar e apresentar.

## Dados necessários
- Faturamento anual previsto, por tipo de receita (comércio, indústria, serviços e quais serviços).
- Folha anual, incluindo pró-labore (importa para o Fator R e para a CPP).
- Margem de lucro real esperada (lucro contábil sobre a receita) e as despesas dedutíveis relevantes.
- Compras com crédito de PIS/COFINS (para o Real não cumulativo) e o perfil do ICMS ou ISS.
- UF e município, atividades (CNAE) e se há vedações ao Simples.

## Regras-base (confirme se houve alteração legal recente)
- **Simples Nacional**: limite de receita bruta anual de R$ 4,8 milhões (com sublimite estadual para ICMS/ISS). A alíquota efetiva depende do anexo e da faixa. Atividades sujeitas ao Fator R vão para o Anexo III quando a folha dos últimos 12 meses for de pelo menos 28% da receita, e para o Anexo V se for menor.
- **Lucro Presumido**: limite de R$ 78 milhões.
  - Presunção usual: 8% (comércio e indústria) e 32% (serviços em geral) para o IRPJ; 12% e 32% para a CSLL.
  - IRPJ de 15% mais adicional de 10% sobre a parcela do lucro acima de R$ 20 mil por mês; CSLL de 9%.
  - PIS 0,65% e COFINS 3% (cumulativos).
  - Verifique se a lei vigente prevê acréscimo nos percentuais de presunção para faixas de receita mais altas e, se for o caso, aplique.
- **Lucro Real**:
  - IRPJ e CSLL sobre o lucro real ajustado. Prejuízo fiscal compensável com a trava de 30%.
  - PIS 1,65% e COFINS 7,6% não cumulativos, com créditos.
- **Reforma Tributária**: a partir de 2027, PIS e COFINS são substituídos pela CBS, em todos os regimes de lucro. Para 2027 em diante, troque PIS/COFINS pela CBS nas premissas e explique que a vantagem do Real não cumulativo muda de natureza. No Simples, considere a opção de IBS/CBS por fora (ver a skill do Simples na reforma).

Não invente as tabelas do Simples. Peça a alíquota efetiva do anexo e da faixa, ou a receita dos últimos 12 meses e a tabela do anexo para calcular a efetiva pela fórmula: (RBT12 × alíquota nominal − parcela a deduzir) ÷ RBT12.

## Simulação
Para cada regime, calcule o total anual de tributos federais, a CPP ou INSS patronal sobre a folha (incluso no DAS em alguns anexos) e o ICMS ou ISS estimado. Some os tributos e mostre o valor, a carga sobre a receita e a diferença para o melhor regime.

Faça ao menos um teste de sensibilidade: margem menor ou maior, ou faturamento ±20%. Isso mostra se a escolha é robusta.

## Saída
- Tabela comparativa por regime: valores por tributo, total, carga % e ranking.
- Recomendação com o motivo em 2 ou 3 frases, mais os riscos (vedações, sublimites, custo de obrigações acessórias do Real).
- Premissas e pendências para confirmar.
- Prazo: a opção pelo Simples, em regra, é feita em janeiro; a do Presumido ou Real, com o primeiro pagamento do ano. Confirme o calendário vigente.

## Limites
É uma estimativa para decisão gerencial. Benefícios fiscais, regimes especiais (ex.: setores monofásicos, ST, incentivos regionais) e a estrutura societária podem mudar o resultado. Sinalize quando eles existirem.
