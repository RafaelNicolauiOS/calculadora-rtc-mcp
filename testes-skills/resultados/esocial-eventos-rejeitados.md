# S-1200 rejeitado: "trabalhador não cadastrado"

## O que significa
O eSocial não encontrou um vínculo ativo desse CPF na sua empresa. O S-1200 (remuneração) depende do evento de admissão, o **S-2200**, ou do cadastro inicial de vínculo, que também é um S-2200. Sem esse evento aceito, o S-1200 é rejeitado. Isso trava o S-1299, a DCTFWeb e o FGTS Digital do mês.

## Causas prováveis (da mais comum para a menos comum)
1. **O S-2200 nunca foi enviado.** A admissão foi feita no sistema de folha, mas o evento ficou sem transmitir.
2. **O S-2200 foi enviado e rejeitado.** Houve erro de dado, como CPF, data, CBO, categoria ou lotação, e a rejeição não foi percebida.
3. **O S-2200 está pendente ou em processamento** e ainda não tem recibo de aceitação.
4. **CPF, matrícula ou categoria divergem entre os eventos.** O S-1200 aponta para um CPF, uma matrícula ou uma categoria diferente da do S-2200. O mesmo vale para um dígito digitado errado.
5. **Empregador ou estabelecimento diferente.** O S-1200 saiu em outro CNPJ ou outro ambiente (produção e produção restrita) do que o S-2200.
6. **Data de início do vínculo posterior à competência** do S-1200. É o caso quando a competência enviada é anterior à admissão informada.

Não conheço o código numérico nem o texto completo da mensagem. Se você me enviar o retorno completo, eu confirmo qual dessas causas é.

## Passo a passo
1. **Consulte o S-2200 desse CPF** no sistema da folha e no portal do eSocial (consulta de eventos ou de trabalhador). Veja o status e o número do recibo.
2. **Conforme o status:**
   - **Nunca enviado:** envie o S-2200 agora, com a data de admissão real. Espere o recibo de aceitação.
   - **Rejeitado:** leia a mensagem de erro dele, corrija o dado e reenvie. Se ele foi rejeitado, não há registro a retificar, então o reenvio vale como envio novo.
   - **Pendente ou em processamento:** aguarde o retorno. Não envie um segundo evento, para não gerar duplicidade.
   - **Aceito (tem recibo):** compare CPF, matrícula, categoria e CNPJ do S-2200 com os do S-1200. Se o erro estiver no S-1200, corrija e reenvie. Se estiver no S-2200 aceito, retifique com indRetif=2 e o número do recibo.
3. **Com o S-2200 aceito, reenvie o S-1200** do trabalhador, na competência correta.
4. Se esse trabalhador também tem **S-2230 ou outros eventos não periódicos** pendentes, mantenha a ordem cronológica. Se um evento ficou fora de ordem, pode ser preciso excluir com o S-3000 e reenviar.
5. Quando todos os S-1200 estiverem aceitos, envie o **S-1210** (pagamentos), se aplicável, e depois o **S-1299** (fechamento).

## Efeitos colaterais
- **Admissão fora do prazo:** o S-2200 enviado depois do prazo regulamentar pode gerar multa por atraso. Confira o prazo no leiaute e nas orientações vigentes. Como a admissão foi no mês passado, é provável que o prazo já tenha passado, e vale avisar o cliente.
- **Guias:** a DCTFWeb e o FGTS Digital do mês só ficam completos depois do S-1200 aceito. Se alguma guia já foi emitida sem essa remuneração, ela precisará ser reemitida ou complementada.
- **Folha do mês anterior:** se esse trabalhador tinha remuneração na competência anterior, ela também ficou sem S-1200. Envie o S-1200 daquela competência. Se a competência já está fechada, é preciso reabrir com o **S-1298**, corrigir e fechar de novo.

## O que preciso de você
- O texto completo do retorno, com o código e a descrição.
- O status do S-2200 desse CPF (recibo, rejeitado ou nunca enviado).
