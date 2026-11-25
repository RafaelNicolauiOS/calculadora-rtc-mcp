---
name: fator-r-pro-labore
description: Calcula e monitora o Fator R do Simples Nacional (folha de salários dos últimos 12 meses ÷ receita bruta dos últimos 12 meses) para decidir entre Anexo III e Anexo V, e simula o pró-labore mínimo para atingir 28% comparando o custo do pró-labore (INSS/IRRF) com a economia no DAS. Use quando o usuário perguntar "fator R", "anexo III ou V", "quanto de pró-labore para ficar no anexo III", "minha empresa caiu no anexo V", "planejar pró-labore" ou trouxer receita e folha mensais de uma empresa de serviços do Simples.
---

# Fator R e pró-labore

Para muitas empresas de serviços do Simples Nacional, a diferença entre o Anexo III e o Anexo V é grande. O que decide entre os dois é o Fator R. Ajustar o pró-labore costuma ser a forma mais barata de ficar no Anexo III, mas o pró-labore tem custo próprio. Esta skill faz a conta completa.

## Regra
- **Fator R** = folha de salários dos 12 meses anteriores ao período de apuração ÷ receita bruta dos mesmos 12 meses.
- **Fator R ≥ 28%**: tributa no **Anexo III**. Abaixo disso, no **Anexo V** (LC 123/2006, art. 18, §5º-J e §5º-M).
- A folha inclui salários, pró-labore, FGTS e a CPP/INSS patronal, conforme a definição legal. Confirme com o usuário o que entra e se o cálculo do PGDAS-D dele usa os mesmos componentes.
- Só se aplica às atividades sujeitas ao Fator R (ver o CNAE e a referência de atividades do Simples).

## Entradas
- Receita bruta e folha (com os componentes) de cada um dos últimos 12 meses, e as previsões dos próximos meses.
- As alíquotas efetivas atuais dos Anexos III e V (do PGDAS-D) ou a RBT12. Se o usuário não fornecer, você pode usar as tabelas dos Anexos III e V da LC 123/2006 (redação da LC 155/2016) como premissa declarada, mostrando a faixa, a alíquota nominal e a parcela a deduzir, e pedindo a confirmação com o PGDAS-D.
- O pró-labore atual de cada sócio. O custo de INSS do pró-labore adicional depende de o sócio já estar perto do teto: acima do teto, o INSS adicional do segurado é zero.
- As tabelas vigentes de INSS e IRRF, para o custo do pró-labore.

## Cálculo
1. **Fator R atual** e projeção mês a mês dos próximos 12 meses, com a janela móvel. Mostre em que mês ele cruza os 28%, para cima ou para baixo.
2. **Pró-labore necessário**: a folha mínima mensal para manter o fator em 28% dada a receita projetada, e o aumento de pró-labore que isso exige.
3. **Custo × benefício por mês**:
   - **Custo**: INSS do sócio sobre o pró-labore, IRRF (atenção: o IRRF é do sócio, mas reduz o líquido dele) e eventual INSS patronal, conforme o anexo.
   - **Benefício**: DAS no Anexo V menos DAS no Anexo III para a mesma receita.
4. **Conclusão**: vale ou não aumentar o pró-labore, e de quanto. Compare também com a distribuição de lucros. Atenção às regras recentes: desde 2026 a lei prevê retenção de IR sobre dividendos acima de um valor mensal por fonte pagadora e uma tributação mínima para altas rendas (Lei 15.270/2025). Confirme os limites vigentes antes de concluir que distribuir lucro é sempre isento.

## Saída
- Tabela mensal: receita, folha, Fator R móvel e anexo resultante.
- Simulação do pró-labore ideal, com o custo, a economia de DAS e o ganho líquido.
- Alertas: meses em que a empresa vai cair para o Anexo V sem ajuste, e premissas a confirmar.

## Limites
O Fator R depende de definições legais da folha e da receita. Confirme casos de folha com verbas atípicas. Mudanças na tributação de dividendos ou nas tabelas do Simples alteram a conclusão, então refaça a simulação quando houver alteração.
