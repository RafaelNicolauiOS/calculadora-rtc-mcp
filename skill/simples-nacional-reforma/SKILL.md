---
name: simples-nacional-reforma
description: Orienta optantes do Simples Nacional na Reforma Tributária (LC 214/2025 e LC 123/2006): calcula CBS e IBS dentro do DAS, compara com a opção de recolher IBS/CBS pelo regime regular para transferir crédito integral aos clientes, identifica cAtivSN, anexo e Fator R e explica erros VSN da Calculadora RTC. Use quando o usuário falar de "Simples Nacional e reforma", "IBS e CBS no Simples", "vale a pena sair do Simples por causa do crédito", "cliente reclamando que não recebe crédito da minha nota", "pCBSSN", "pIBSSN" ou "erro VSN".
---

# Simples Nacional na Reforma Tributária

Para o optante do Simples, a reforma levanta uma decisão comercial nova. O IBS e a CBS podem continuar dentro do DAS, o que é mais simples, mas o comprador recebe crédito só do valor pago ali. A alternativa é recolher IBS e CBS "por fora", pelo regime regular, e transferir o crédito cheio. Quem vende para outras empresas pode perder cliente por isso. Esta skill ajuda o escritório a calcular e explicar essa escolha.

## Referências
- `reference/simples-atividades.md`: atividades (cAtivSN), anexo, Fator R e documentos admitidos.
- `reference/erros.md`: códigos VSN do Simples Nacional, entre outros.

## Cálculo dentro do DAS
1. Identifique a atividade (cAtivSN) e o anexo. Se a atividade for sujeita ao Fator R, o anexo depende dele (ver a skill do Fator R ou calcule: folha dos últimos 12 meses ÷ receita bruta dos últimos 12 meses).
2. A alíquota efetiva do Simples vem do PGDAS-D. A Calculadora não a calcula. Peça ao usuário os percentuais efetivos de CBS e IBS do anexo (pCBSSN e pIBSSN). Nos anexos III a V com ISS, peça também o par "sem redistribuição de ISS".
3. CBS = base × pCBSSN e IBS = base × pIBSSN, item a item, com 2 casas.
4. O crédito que o comprador pode apropriar corresponde ao IBS/CBS efetivamente pago dentro do Simples.

## Comparação: dentro do DAS × por fora
Monte uma tabela com os dois cenários:
- **Dentro do DAS**: o custo para o optante é o DAS atual. O crédito transferido ao comprador é pequeno.
- **Por fora (regime regular para IBS/CBS)**: o optante paga IBS/CBS pelas alíquotas cheias, menos os créditos das próprias compras, e transfere o crédito integral. O restante continua no DAS.

Conclua por perfil de cliente:
- **Vende para consumidor final**: o crédito não importa, e ficar no DAS costuma ser melhor.
- **Vende para empresas do regime regular**: o crédito pesa no preço que o cliente aceita pagar. Calcule o preço equivalente nos dois cenários.

A opção tem prazos e periodicidade próprios definidos em regulamento. Diga ao usuário para confirmar a janela vigente antes de decidir.

## Erros VSN
Procure o código em `erros.md`. As causas mais comuns são:
- pCBSSN/pIBSSN ausente ou com formato inválido;
- cAtivSN incompatível com o documento (tpDoc) ou com a cClassTrib;
- NCM/NBS incompleto ou fora do anexo (VSN-042 a VSN-050);
- na NFS-e: mais de um item, ou falta de `opSimpNac`, `regApIBSCBSSN` ou `regApTribSN`.

## Saída
- O valor de CBS e IBS por item e o total, com a memória de cálculo.
- Quando o usuário pediu a comparação, a tabela dos dois cenários, o preço equivalente e uma recomendação por perfil de cliente.
- O que ainda precisa ser confirmado: os percentuais do PGDAS-D e a janela de opção.

## Limites
Não estime os percentuais efetivos do Simples "de cabeça". Eles dependem da receita bruta dos 12 meses, do anexo e da repartição dos tributos no PGDAS-D. Use os informados pelo usuário.
