---
name: agenda-obrigacoes-acessorias
description: Monta a agenda mensal de obrigações fiscais, trabalhistas e acessórias de cada cliente do escritório contábil (DAS/PGDAS-D, DCTFWeb, EFD-Reinf, eSocial, FGTS Digital, SPED, DIRF/DIMOB substitutas, declarações estaduais e municipais) conforme regime, atividade, UF e município, com responsável e status. Use quando o usuário pedir "agenda de obrigações do mês", "o que vence para cada cliente", "calendário fiscal", "checklist de entregas", "quais declarações esse cliente precisa entregar" ou listar clientes com regime e atividade pedindo organização das entregas.
---

# Agenda de obrigações acessórias

O risco do escritório não está em calcular, está em esquecer uma entrega. Esta skill transforma a carteira de clientes numa agenda do mês: o que cada um precisa entregar ou pagar, quando e quem cuida.

## Perfil de cada cliente
Para cada cliente, colete ou deduza:
- o regime (MEI, Simples Nacional, Lucro Presumido, Lucro Real);
- a atividade (comércio, indústria, serviços, misto);
- a UF e o município;
- se tem empregados ou pró-labore;
- se é contribuinte de ICMS e de ISS;
- se retém tributos de terceiros;
- se tem operações específicas (importação, locação de imóveis, construção civil).

## Obrigações por perfil (estrutura, confirme cada uma)
- **MEI**: DAS-MEI mensal e declaração anual (DASN-SIMEI). Com empregado, eSocial e FGTS Digital.
- **Simples Nacional**: PGDAS-D e DAS mensais, DEFIS anual, obrigações estaduais (ex.: DeSTDA, onde exigida) e municipais (ISS e NFS-e). Com empregados, a folha via eSocial, a DCTFWeb e o FGTS Digital.
- **Qualquer perfil com folha**: além da DCTFWeb (declaração), inclua o **DARF da DCTFWeb** (INSS e IRRF da folha) e o **FGTS Digital**, os dois com vencimento usual no dia 20, antecipando para o dia útil anterior quando cair em dia não útil.
- **Lucro Presumido e Real**:
  - DCTFWeb, EFD-Reinf, eSocial e FGTS Digital;
  - EFD ICMS/IPI (se contribuinte de ICMS ou IPI);
  - EFD-Contribuições: até a competência 12/2026 para PIS/COFINS. A partir de 2027, só se houver CPRB (desoneração da folha em transição) ou retificação de períodos anteriores. Pergunte em vez de excluir;
  - ECD e ECF anuais;
  - DARF de IRPJ/CSLL (trimestral ou por estimativa mensal) e de PIS/COFINS mensal;
  - guias de ICMS e ISS conforme a UF e o município.
- **Reforma Tributária**: a partir de 2026, acompanhe as obrigações e os campos novos de IBS/CBS nos documentos fiscais e as declarações que o regulamento vier a exigir.

## Datas
Prazos mudam por lei, instrução normativa, portaria estadual, decreto municipal e prorrogações. Não afirme datas de memória como definitivas. Faça assim:
1. Se o usuário fornecer o calendário oficial do mês ou a agenda do sistema dele, use essas datas.
2. Se não, preencha com o prazo usual e marque a coluna "confirmar". Exemplos de prazos usuais: DAS e PGDAS-D no dia 20; DCTFWeb e EFD-Reinf no dia 15. Recomende a conferência na Agenda Tributária da Receita Federal e nos calendários da SEFAZ e da prefeitura.
3. Ajuste para dia útil quando o vencimento cair em fim de semana ou feriado. Lembre que a regra de antecipar ou postergar varia por tributo.

## Saída
Uma planilha (ou tabela) com as colunas: cliente, obrigação, competência, vencimento, data confirmada (sim/não), responsável, documentos necessários e status (a fazer, em andamento, entregue).

Depois, uma visão por semana do mês e uma lista de "riscos": clientes com informação faltando para o perfil, obrigações que dependem de documento do cliente ainda não recebido, e vencimentos nos próximos 3 dias úteis.

## Limites
A agenda organiza, mas não substitui o calendário oficial. Quando houver dúvida se uma obrigação se aplica (por exemplo, por faturamento ou por evento específico), diga qual é o critério e peça a informação, em vez de incluir ou excluir por suposição.
