---
name: classificador-cadastro-produtos
description: Classifica em lote o cadastro de produtos e serviços de um cliente para a Reforma Tributária (IBS, CBS e Imposto Seletivo, LC 214/2025). Para cada item, define CST e cClassTrib, confere se o NCM/NBS é aceito pelo anexo da classificação e aponta o que precisa de revisão. Use sempre que o usuário trouxer uma planilha, CSV ou lista de itens (descrição, NCM, NBS, CFOP) e pedir para "classificar o cadastro", "preencher cClassTrib", "ajustar o ERP para a reforma", "revisar a tabela de produtos" ou "descobrir quais itens têm redução ou alíquota zero", mesmo que não cite cClassTrib pelo nome.
---

# Classificador de cadastro de produtos (IBS/CBS/IS)

O cadastro de produtos é o ponto onde a reforma mais gera erro no dia a dia do escritório. Uma cClassTrib errada no ERP se repete em todas as notas do cliente e vira rejeição (REG-011) ou imposto pago a mais. Esta skill transforma a lista de itens do cliente numa tabela pronta para importar no ERP, com justificativa por item e uma fila de revisão para o contador.

## Referências (leia sob demanda)
- `reference/cst-cclasstrib.md`: todas as classificações, com redução, nomenclatura exigida, documentos aceitos e artigo da LC 214/2025.
- `reference/vinculos-ncm-nbs.md`: classificações que só aceitam uma lista fechada de NCM/NBS (prefixos, com exceções).
- `reference/imposto-seletivo.md`: CST/cClassTrib do IS e os NCM/NBS sujeitos a ele.

A versão da base está no cabeçalho de cada arquivo. Se a data das operações for posterior, avise que a tabela pode ter mudado.

## Entrada esperada
Uma planilha ou lista com, no mínimo, descrição e NCM (bens) ou NBS (serviços). Se houver, aproveite também CFOP, unidade, tipo de cliente (consumidor final, contribuinte, órgão público) e o documento usado (NF-e, NFC-e, NFS-e). Se o arquivo vier sem cabeçalho claro, identifique as colunas pelo conteúdo (NCM tem 8 dígitos, NBS tem 9) e confirme com o usuário antes de processar centenas de linhas.

Antes de começar, pergunte só o que muda a classificação e não está nos dados:
- o regime do cliente (regular ou Simples Nacional);
- se ele vende para órgãos públicos ou entidades imunes;
- o tipo de documento, quando não der para deduzir.

## Método, item a item
1. **Normalize o código**: só dígitos, sem pontos. NCM com menos de 8 dígitos ou NBS com menos de 9 vai para a fila de revisão como "código incompleto". Classificações com anexo exigem o código completo (REG-015/REG-016).
2. **Procure tratamento diferenciado pelo código**: em `vinculos-ncm-nbs.md`, ache as classificações cujo anexo aceita o NCM/NBS. Aceita quando o código começa por um prefixo listado e não começa por nenhuma exceção daquele prefixo. Essas são as candidatas fortes, como cesta básica (200003), dispositivos médicos e educação (200028).

   Um código listado entre parênteses como "exceto" **não** é aceito por aquela classificação. Os anexos I (200003, alíquota zero) e VII (200034, redução de 60%) não se sobrepõem: se o NCM está no 200003, ele está excluído do 200034. Só diga que há duas candidatas depois de conferir as exceções.
3. **Confira com a descrição**: o anexo diz qual NCM pode usar a classificação, não que todo item com aquele NCM deve usá-la. Leia a descrição e a fundamentação em `cst-cclasstrib.md` e confirme que o item se encaixa. Por exemplo, um produto alimentício só entra na cesta básica se estiver no Anexo I com aquela descrição.
4. **Sem candidata**: use CST 000 / cClassTrib 000001 (tributação integral). Não force uma redução.
5. **Destinatário especial**: se o cliente vende para órgão público, entidade imune ou exportação, aponte as classificações específicas (procure por "administração pública", "imune" ou "exportação" na referência). Deixe a regra padrão no cadastro e a variação como observação, porque a classificação depende da operação, não do produto.
6. **Imposto Seletivo**: se o NCM/NBS aparece em `imposto-seletivo.md`, marque "sujeito a IS a partir de 2027". A cClassTrib do IS depende da posição do cliente na cadeia:
   - 000001 (com cálculo) só para o primeiro fornecimento, isto é, fabricante ou importador;
   - 200007 (sem cálculo) na revenda por atacadista ou varejista, porque o IS foi cobrado na operação anterior. Nesse caso não há alíquota de IS no item.
7. **Documento**: confira se a classificação escolhida é aceita no documento que o cliente usa (coluna DF-e). Se não for, isso gera REG-029.

## Nível de confiança
Atribua a cada linha um dos três níveis:
- **Alta**: o código está no anexo e a descrição bate com o texto legal, ou não há tratamento diferenciado possível para aquele código.
- **Média**: o código está no anexo, mas a descrição do item é genérica ("diversos", "kit", "outros").
- **Revisar**: código incompleto ou inexistente, descrição incompatível com o NCM, mais de uma classificação possível, ou dependência do destinatário.

## Saída
Entregue duas coisas:
1. **Tabela para o ERP** (CSV ou planilha, mantendo as colunas originais e acrescentando estas): `CST`, `cClassTrib`, `descricao_classificacao`, `reducao_cbs`, `reducao_ibs`, `sujeito_IS`, `confianca`, `justificativa` (uma linha: o artigo e o porquê).
2. **Resumo para o contador**: quantos itens em cada classificação, a lista "Revisar" com o motivo de cada um, e os itens em que a reforma reduz ou zera o imposto. Esses itens interessam comercialmente ao cliente.

Em listas longas, processe em blocos e diga quantas linhas foram tratadas. Nunca invente uma cClassTrib que não esteja na referência.

## Limites
É uma ferramenta de apoio. A responsabilidade pela classificação é do contribuinte e do contador. Não substitui consulta formal ao fisco em casos duvidosos. Se o MCP calculadora-rtc estiver conectado, use `rtc_validar_nomenclatura` para confirmar cada par NCM × cClassTrib antes de entregar.
