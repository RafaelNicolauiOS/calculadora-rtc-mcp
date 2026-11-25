---
name: calculo-rescisao
description: Calcula a rescisão de contrato de trabalho (CLT) com memória de cálculo — saldo de salário, aviso prévio trabalhado ou indenizado com a proporcionalidade da Lei 12.506/2011, férias vencidas e proporcionais com 1/3, 13º proporcional, multa e saque do FGTS, descontos — para cada modalidade (sem justa causa, pedido de demissão, justa causa, acordo do art. 484-A, término de contrato de experiência). Use quando o usuário pedir "calcular rescisão", "quanto o funcionário vai receber", "verbas rescisórias", "simular demissão", "acordo trabalhista 484-A" ou "conferir TRCT".
---

# Cálculo de rescisão (CLT)

Rescisão errada vira reclamação trabalhista e multa por atraso. Esta skill monta o cálculo completo com a memória de cada verba, para o escritório conferir e explicar ao cliente antes de pagar.

## Dados necessários
- Data de admissão, data do aviso e data do desligamento (último dia trabalhado ou projetado).
- Modalidade: dispensa sem justa causa, pedido de demissão, justa causa, acordo (art. 484-A da CLT), término de contrato de experiência ou rescisão antecipada dele.
- Aviso prévio: trabalhado, indenizado ou dispensado (no pedido de demissão).
- Remuneração: salário, médias de variáveis (horas extras, comissões, adicionais), conforme a convenção e a lei.
- Férias: períodos vencidos não gozados e o início do período aquisitivo atual. Faltas injustificadas que reduzem as férias.
- Saldo do FGTS para fins rescisórios (o extrato), ou a estimativa informada.
- Tabelas vigentes de INSS e IRRF da competência. **Peça ou confirme; não use de memória.**

## Verbas por modalidade (resumo da regra)
| Verba | Sem justa causa | Pedido de demissão | Justa causa | Acordo 484-A |
|---|---|---|---|---|
| Saldo de salário | sim | sim | sim | sim |
| Aviso prévio indenizado | sim (se indenizado) | não (pode haver desconto se não cumprido) | não | metade |
| Férias vencidas + 1/3 | sim | sim | sim | sim |
| Férias proporcionais + 1/3 | sim | sim | não | sim |
| 13º proporcional | sim | sim | não | sim |
| Multa do FGTS | 40% | não | não | 20% |
| Saque do FGTS | sim | não | não | até 80% |

**Aviso prévio proporcional**: 30 dias mais 3 dias por ano completo de serviço, até 90 dias (Lei 12.506/2011). O aviso indenizado projeta o contrato para fins de férias e 13º proporcionais.

**Avos**: a fração igual ou superior a 15 dias no mês conta como mês inteiro para férias e 13º proporcionais.

## Cálculo
1. Determine a data final projetada (com aviso indenizado) e conte os avos de férias (por período aquisitivo) e de 13º (por ano civil).
2. Calcule cada verba sobre a remuneração com médias. Mostre a fórmula: ex.: "13º = R$ 3.000 ÷ 12 × 7 avos = R$ 1.750,00".
3. **Incidências**:
   - Férias indenizadas e o 1/3 correspondente não sofrem INSS nem IRRF.
   - O aviso prévio indenizado não tem INSS e tem FGTS.
   - O 13º tem INSS e IRRF calculados em separado.
   - Confirme qualquer incidência controversa com a legislação vigente.
4. **Descontos**: INSS, IRRF, adiantamentos, aviso não cumprido (no pedido de demissão) e pensão.
5. **FGTS**: depósito do mês da rescisão e do aviso indenizado, e a multa sobre o saldo para fins rescisórios.

## Saída
- Tabela de verbas (proventos, descontos e líquido) com a memória de cada linha.
- Valores de FGTS (depósito rescisório e multa).
- Prazo: o pagamento das verbas e a entrega dos documentos devem ocorrer em até 10 dias corridos contados do término do contrato (art. 477, §6º, da CLT). Com aviso prévio indenizado, o término para esse prazo é o dia do afastamento (último dia trabalhado), **não** a data projetada. A projeção serve só para os avos de férias e 13º e para a data de saída anotada na CTPS. Exemplo: afastamento em 15/08, prazo até 25/08. O atraso gera a multa do §8º.
- Lista de premissas: as médias consideradas, as tabelas usadas e o que precisa ser confirmado (convenção, estabilidades provisórias como gestante, acidentado ou CIPA).

## Limites
Antes de calcular a dispensa, verifique se há estabilidade provisória. Se houver, avise: a dispensa pode ser nula ou gerar indenização. Convenções coletivas podem prever verbas extras. O cálculo é de apoio e não substitui a homologação nem a análise jurídica de casos litigiosos.
