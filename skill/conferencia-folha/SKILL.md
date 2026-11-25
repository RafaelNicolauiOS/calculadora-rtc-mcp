---
name: conferencia-folha
description: Confere a folha de pagamento de um cliente antes do fechamento — proventos, descontos, INSS, IRRF, FGTS, horas extras, adicionais, férias, 13º e consistência com guias e eSocial — usando as tabelas vigentes informadas pelo usuário, e aponta divergências com a correção. Use quando o usuário pedir "conferir a folha", "revisar holerites", "bater INSS e FGTS da folha com as guias", "por que o IRRF deu diferente", "checar cálculo de horas extras ou adicional noturno" ou enviar um resumo/espelho de folha para revisão.
---

# Conferência de folha de pagamento

Erro de folha vira passivo trabalhista e multa no eSocial. A conferência antes do fechamento é barata, e a correção depois é cara. Esta skill refaz os cálculos de cada colaborador e cruza os totais com as guias.

## Tabelas: sempre as vigentes
Salário mínimo, faixas e alíquotas do INSS, teto do INSS, tabela e deduções do IRRF (incluindo o desconto simplificado), salário-família e pisos de convenção coletiva mudam com frequência. **Não use valores de memória.** Peça ao usuário as tabelas da competência, ou que ele confirme as que você vai usar. Registre na resposta quais tabelas foram aplicadas.

## Entradas
- O espelho ou resumo da folha por colaborador: salário-base, eventos (horas extras, adicionais, faltas, DSR, comissões, benefícios), descontos e líquido.
- A jornada contratual e a convenção coletiva aplicável, para percentuais de hora extra, adicionais e pisos.
- As guias e totais do mês: INSS (DCTFWeb), FGTS Digital e DARF de IRRF.

## Conferências por colaborador
1. **Salário e proporcionalidade**: admissão ou demissão no mês, faltas e DSR descontado.
2. **Horas extras**: o divisor da jornada (ex.: 220 h para 44 h semanais), o percentual da CLT ou da convenção (o que for maior) e o reflexo no DSR.
3. **Adicionais**: noturno (hora reduzida e percentual), insalubridade (base e grau conforme laudo e convenção) e periculosidade.
4. **INSS**: cálculo progressivo por faixa sobre o salário de contribuição, limitado ao teto, com as tabelas informadas.
5. **IRRF**: base igual a rendimentos tributáveis menos INSS menos dependentes (ou desconto simplificado, o que for mais vantajoso) menos pensão. Aplique a tabela da competência e a redução vigente, se houver.
6. **FGTS**: percentual sobre a remuneração (8% em regra; 2% para aprendiz), incluindo as verbas que integram a base.
7. **Benefícios**: vale-transporte (desconto limitado a 6% do salário-base), vale-refeição e plano de saúde, conforme a política e a convenção.

## Conferências da empresa
- O total do INSS segurados e patronal (ou CPP no Simples, conforme o anexo) bate com a DCTFWeb.
- O total do FGTS bate com o FGTS Digital.
- O IRRF retido bate com o DARF (código de receita do IRRF sobre trabalho assalariado).
- As provisões de férias e 13º estão coerentes com a folha.

## Saída
- Tabela por colaborador com os valores da folha e os recalculados, a diferença e a causa provável.
- Lista de divergências de guias.
- As tabelas e premissas usadas.
- Correções sugeridas, com o evento e o valor a ajustar.

## Limites
Convenções coletivas variam muito. Quando um percentual ou piso depender dela, peça o trecho. A skill confere cálculos, mas não substitui o sistema de folha nem a análise jurídica de casos controversos, como equiparação salarial ou enquadramento sindical.
