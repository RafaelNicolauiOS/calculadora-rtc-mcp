---
name: proposta-honorarios
description: Monta proposta de honorários contábeis para um cliente novo ou reajuste de cliente atual — escopo de serviços por área (fiscal, contábil, DP, societário), precificação por complexidade (regime, volume de notas, número de funcionários, atividades, filiais), serviços extras cobrados à parte, condições e texto da proposta pronto para enviar. Use quando o usuário pedir "proposta de honorários", "quanto cobrar desse cliente", "precificar serviços contábeis", "reajuste de honorários", "tabela de honorários do escritório" ou descrever um prospecto pedindo uma proposta.
---

# Proposta de honorários

Honorário mal calculado transforma cliente em prejuízo: o escritório cobra pelo regime e esquece o volume de notas, os funcionários e o retrabalho. Esta skill estrutura a precificação pela complexidade real e produz uma proposta clara, que evita discussões de escopo depois.

## Informações do prospecto
- Regime tributário e atividade (comércio, serviço, indústria, misto).
- Faturamento mensal médio.
- Volume mensal de notas de entrada e de saída.
- Número de funcionários e de sócios com pró-labore.
- Número de estabelecimentos e de UFs ou municípios.
- Organização do cliente: envia documentos em dia? Tem financeiro estruturado? Usa ERP?
- Serviços esperados e pendências do passado (escrituração atrasada, débitos).

## Base de preço do escritório
Peça ao usuário a referência dele, que pode ser:
- a tabela atual do escritório;
- o valor-hora e o tempo médio por rotina;
- o honorário de clientes semelhantes.

Se ele não tiver, ofereça um modelo de cálculo (horas por rotina × custo-hora × margem) e deixe os números como parâmetros para ele preencher. Não invente tabelas de sindicatos ou conselhos como se fossem oficiais.

## Estrutura de precificação
1. **Base pelo regime**, que define o volume de obrigações.
2. **Adicionais por volume**: faixas de notas por mês, por funcionário e por estabelecimento ou UF.
3. **Fator de complexidade** (±): ST, importação, construção civil, atividade com regime especial, desorganização documental.
4. **Reforma Tributária no escopo**: em contratos que alcancem 2027 em diante, liste no escopo mensal a apuração e as obrigações de CBS/IBS (e do IS, se houver) no lugar de PIS/COFINS. Deixe como serviço à parte só os projetos pontuais (reclassificação do cadastro, simulações, revisão de contratos). Preveja uma cláusula de revisão do escopo quando o regulamento das novas obrigações for publicado.
5. **Serviços fora da mensalidade**, cobrados à parte:
   - abertura, alteração e baixa de empresa;
   - declarações de IRPF dos sócios;
   - recálculos e retificações de períodos anteriores;
   - certidões, parcelamentos e consultoria de planejamento.
6. **13º honorário**, se for política do escritório, e o índice e a data de reajuste anual.

## Saída
- **Memória de cálculo** (para uso interno): base, adicionais, fator e total, com o custo estimado em horas e a margem.
- **Proposta para o cliente** (texto pronto):
  - apresentação curta;
  - escopo incluso, em lista por área;
  - o que não está incluso e é cobrado à parte;
  - valor mensal;
  - condições: vencimento, reajuste, prazo de envio de documentos pelo cliente;
  - validade da proposta.
- Para reajuste: uma justificativa objetiva (aumento de volume, novas obrigações, Reforma Tributária) e o novo escopo.

## Limites
Os valores são definidos pelo escritório. A skill organiza o raciocínio e o texto. Escopo claro na proposta é o que evita trabalho não remunerado. Seja explícito sobre o que fica de fora.
