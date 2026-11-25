---
name: classificador-lancamentos
description: Classifica movimentos financeiros (extrato, contas pagas e recebidas, cartão corporativo, relatório do ERP) no plano de contas do cliente e gera lançamentos contábeis de débito e crédito prontos para importação, aprendendo com classificações anteriores. Use quando o usuário pedir "classificar o extrato", "contabilizar os pagamentos do mês", "gerar lançamentos para importar", "de-para de histórico para conta contábil", "classificar despesas do cartão" ou enviar uma lista de movimentos com o plano de contas.
---

# Classificador de lançamentos contábeis

Boa parte da hora de um analista contábil vai em decidir "esse PIX para Fulano é aluguel, fornecedor ou retirada de sócio?". Esta skill aplica as regras do cliente com consistência, gera os lançamentos e separa o que realmente precisa de pergunta.

## Entradas
- **Movimentos**: data, valor, histórico e, se houver, documento, favorecido ou CNPJ.
- **Plano de contas** do cliente (código, nome, natureza). Use só contas analíticas, as que aceitam lançamento.
- **Opcional, e muito útil**: um de-para de meses anteriores (histórico ou favorecido → conta). Trate-o como regra do cliente: ele prevalece sobre a sua intuição.

## Regras de classificação (ordem de prioridade)
1. **De-para do cliente**: favorecido ou CNPJ conhecido, ou palavra-chave do histórico já classificada antes.
2. **Natureza evidente pelo histórico**: tarifa, IOF, juros, impostos (DARF, DAS, GPS, guias estaduais e municipais, identificados pelo código ou pelo nome), folha (salários, pró-labore, FGTS), aluguel, energia, telecom.
3. **Contrapartida patrimonial**: pagamento de fornecedor já provisionado vai a débito de fornecedores, não a despesa. Recebimento de cliente vai a crédito de clientes. Pergunte se o cliente usa regime de competência com provisão, porque isso muda a contrapartida.
4. **Movimentos com sócios**: retiradas, aportes e pagamento de despesa pessoal do sócio vão para as contas próprias (lucros a distribuir, mútuo, adiantamento a sócios), nunca para despesa operacional.
5. **Sem pista suficiente**: conta transitória ("a classificar") e entrada na lista de perguntas ao cliente.

## Partidas
Monte cada lançamento com data, conta débito, conta crédito, valor e histórico padronizado. Por exemplo: "Pgto aluguel ref. 05/2027 — Imobiliária X". A conta banco é a contrapartida dos movimentos de extrato. Valores com retenção (ex.: serviço com IRRF, CSRF, ISS ou INSS retidos) viram lançamento composto. Indique as retenções a recolher.

## Saída
- **Arquivo de importação** no layout que o usuário indicar. Se ele não indicar, CSV com as colunas data, debito, credito, valor e historico.
- **Relatório de confiança**: quantos lançamentos vieram do de-para, quantos foram inferidos e quantos ficaram na transitória.
- **Perguntas ao cliente**, agrupadas por favorecido, para limpar a transitória.
- **De-para atualizado**, para usar no mês seguinte.

## Limites
Classificar é decisão contábil do responsável técnico. Não invente contas que não existem no plano do cliente. Se faltar uma conta adequada, sugira a criação e explique o motivo.
