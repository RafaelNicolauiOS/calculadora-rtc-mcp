# Conciliação de NF-e de entrada, maio

Cruzei as notas destinadas com o livro de entradas pelo final da chave de acesso. **A conciliação é provisória**: as chaves vieram truncadas ("...0001" etc.), então confirme com as 44 posições antes de lançar ou estornar qualquer coisa.

## Resultado por nota

| Final da chave | Emitente | Valor no XML/destinadas | Valor no livro | Status | Ação sugerida |
|---|---|---|---|---|---|
| ...0001 | FORN A | 1.500,00 | 1.500,00 | **Conciliada** | Nenhuma |
| ...0002 | FORN B | 320,00 | não consta | **Não escriturada** | Lançar no livro, se for compra do cliente. Se o cliente não reconhece, ver abaixo |
| ...0003 | FORN C | 9.800,00 (cancelada) | 9.800,00 | **Cancelada mas escriturada** | Estornar o lançamento (inclusive créditos de impostos eventualmente apropriados) |
| ...0004 | FORN D | 2.000,00 | 2.200,00 | **Divergência de valor** (200,00 a mais no livro) | Conferir no XML qual é o valor correto (2.000,00) e corrigir o lançamento |
| ...0004 | FORN D | (mesma nota) | 2.200,00 | **Duplicidade** | Excluir um dos dois lançamentos e corrigir o remanescente para 2.000,00 |
| ...0009 | (não consta nas destinadas) | não consta | 450,00 | **Escriturada sem XML** | Pode ser nota de outro CNPJ, chave digitada errada ou nota inexistente. Pedir o documento ao cliente |

## Resumo

| Status | Notas | Valor |
|---|---|---|
| Conciliada | 1 | 1.500,00 |
| Não escriturada | 1 | 320,00 |
| Cancelada mas escriturada | 1 | 9.800,00 |
| Divergência de valor | 1 | 200,00 de diferença |
| Duplicidade | 1 (lançada 2 vezes) | 2.200,00 a mais |
| Escriturada sem XML | 1 | 450,00 |

- **Valor não escriturado**: R$ 320,00 (nota ...0002).
- **Excesso no livro**: o livro soma R$ 16.150,00. As notas válidas conferidas somam R$ 3.500,00 (...0001 e ...0004, a 2.000,00). Isso deixa R$ 12.650,00 lançados a mais, entre nota cancelada, duplicidade e divergência, mais a nota sem XML (R$ 450,00). A conta é: 9.800,00 (cancelada) + 2.400,00 (...0004: 4.400,00 lançados contra 2.000,00 devidos) + 450,00.
- **Impacto em créditos**: não calculei, porque não sei o regime tributário do cliente nem as alíquotas. Se for informado, estimo o crédito perdido da nota ...0002 e o crédito indevido de ...0003, ...0004 e ...0009. O crédito indevido tende a ser o risco maior, por poder gerar glosa.

## Pendências para pedir ao cliente

1. **FORN B, R$ 320,00 (...0002)**: o cliente reconhece essa compra? Se não reconhece, oriente a registrar o evento "Desconhecimento da operação" no manifesto do destinatário e avalie o risco de uso indevido do CNPJ. Confirme o prazo e os efeitos do evento na legislação vigente antes de informar uma data.
2. **Nota ...0009, R$ 450,00**: pedir o XML ou o DANFE. Verificar se o CNPJ do destinatário é mesmo o do cliente.
3. **FORN D (...0004)**: confirmar o valor real da compra (XML indica 2.000,00) e o motivo do segundo lançamento.
4. **FORN C (...0003)**: confirmar que a mercadoria não foi recebida, já que a nota foi cancelada, e se existe nota substituta.
5. Enviar as **chaves de acesso completas** de todas as notas, para a conciliação definitiva.

Não lancei nem estornei nada no sistema do cliente. Essas são propostas para o analista executar.
