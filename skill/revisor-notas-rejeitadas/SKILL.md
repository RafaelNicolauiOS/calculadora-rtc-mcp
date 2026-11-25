---
name: revisor-notas-rejeitadas
description: Diagnostica notas fiscais e cálculos rejeitados por erros de IBS, CBS e Imposto Seletivo (Reforma Tributária, LC 214/2025) e diz exatamente o que corrigir no emissor ou no cadastro. Use sempre que o usuário colar um código REG-xxx, CAL-xxx, VAL-xxx ou VSN-xxx, uma mensagem de rejeição da Calculadora RTC ou do emissor, um trecho do XML com o grupo IBSCBS, ou perguntar "por que minha nota foi rejeitada", "o que significa esse erro" ou "como corrigir a cClassTrib da nota".
---

# Revisor de notas rejeitadas (IBS/CBS/IS)

Quando uma nota é rejeitada, o usuário quer três respostas rápidas: o que aconteceu, onde está o erro e o que mudar. Esta skill lê o erro, ou o XML, e devolve a correção concreta, separando o que é erro de cadastro (corrige uma vez e resolve todas as notas) do que é erro daquela nota.

## Referências
- `reference/erros.md`: catálogo oficial dos códigos REG/CAL/VAL (regime regular) e VSN (Simples Nacional), com campo e estado.
- `reference/cst-cclasstrib.md`: classificações, nomenclatura exigida e documentos aceitos.
- `reference/vinculos-ncm-nbs.md`: NCM/NBS aceitos por classificação com anexo.

## Como diagnosticar
1. **Identifique o código** e procure-o em `erros.md`. Leia o `estado`:
   - `INCONSISTENCIA_ENTRADA`: o dado enviado está errado. É o caso mais comum, e o usuário corrige.
   - `NAO_IMPLEMENTADO`: a classificação existe, mas a Calculadora ainda não a calcula. Diga que não é erro do usuário. A saída é aguardar a atualização ou emitir com o valor apurado por fora, conforme a orientação vigente.
   - `FALHA_TECNICA`: o problema está na base ou na Calculadora. Os dados do usuário não são a causa.
2. **Localize o item**: o `pointer` do erro (ex.: `#/itens/3/ncm`) começa a contar do 0, então `itens/3` é o 4º item da nota.
3. **Confirme a causa com os dados**. Se o usuário mandou o XML ou o JSON, verifique o campo apontado. Erros frequentes:
   - **REG-011 / REG-012**: o NCM/NBS não está no anexo da cClassTrib. Consulte `vinculos-ncm-nbs.md`. Proponha a classificação certa para aquele código, ou volte para 000001 se o item não tem direito ao tratamento.
   - **REG-015 / REG-016**: a classificação tem anexo e exige o código completo (8 dígitos de NCM, 9 de NBS).
   - **REG-006**: o cClassTrib não pertence ao CST informado (os 3 primeiros dígitos do cClassTrib são o CST).
   - **REG-029**: a classificação não é aceita naquele tipo de documento (veja a coluna DF-e).
   - **REG-013 / REG-014 / REG-032**: o grupo do Imposto Seletivo falta, sobra ou o documento não admite IS.
   - **REG-026 / REG-027**: com IS, a base de CBS/IBS deve ser a base do IS mais o valor do IS.
   - **REG-036 / REG-037**: `aliquotasNominais` foi informada antes de 2027 (proibido) ou faltou a partir de 2027 (obrigatório).
   - **VSN-0xx**: no Simples, confira primeiro pCBSSN/pIBSSN, cAtivSN e a combinação de anexo com Fator R.
4. **Classifique a correção**:
   - **Cadastro** (vale para todas as notas do item): NCM, cClassTrib, CST.
   - **Emissão** (só esta nota): base, alíquota informada, grupo de IS, tipo de documento.

## Resposta
Use esta estrutura:
- **O que aconteceu**: uma frase em linguagem simples.
- **Onde**: o item e o campo.
- **Como corrigir**: o valor certo, com a fonte (artigo, classificação, anexo).
- **Evite que se repita**: se for erro de cadastro, diga qual campo ajustar no ERP.

Quando houver vários erros, agrupe por causa. Dez itens com REG-011 pelo mesmo NCM são um problema só.

## Limites
Não invente códigos de erro nem regras que não estejam na referência. Se o código não estiver no catálogo, diga isso e peça a mensagem completa do emissor. Rejeições da SEFAZ ou da prefeitura com códigos próprios (ex.: "Rejeição 225") seguem tabelas do respectivo ambiente autorizador. Explique o que der pela mensagem, sem inventar o significado do número.
