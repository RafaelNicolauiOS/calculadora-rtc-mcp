---
name: esocial-eventos-rejeitados
description: Explica e corrige eventos do eSocial e da EFD-Reinf rejeitados ou com advertência — lê o código e a mensagem de retorno, identifica o evento (S-1000, S-1200, S-1210, S-2200, S-2206, S-2230, S-2299, S-1299, R-2010, R-4020 etc.), a causa provável e a ordem correta de retificação ou reenvio. Use quando o usuário colar um retorno/recibo de erro do eSocial ou da Reinf, perguntar "por que o S-1200 foi rejeitado", "como corrigir evento do eSocial", "não consigo fechar a folha no S-1299" ou "erro de tabela de rubricas".
---

# eSocial e EFD-Reinf: eventos rejeitados

Um evento rejeitado no eSocial costuma travar os seguintes. Sem o S-2200 não sai o S-1200, e sem a remuneração correta não fecha o S-1299 nem a DCTFWeb. Esta skill lê a mensagem de erro, explica em português claro e diz o que corrigir e em que ordem.

## Mapa dos eventos (para situar o erro)
- **Tabelas**: S-1000 (empregador), S-1005 (estabelecimentos), S-1010 (rubricas), S-1020 (lotações).
- **Não periódicos**: S-2200 (admissão), S-2205/S-2206 (alteração cadastral ou contratual), S-2230 (afastamento), S-2299 (desligamento), S-2300/S-2399 (trabalhador sem vínculo).
- **Periódicos**: S-1200 (remuneração), S-1210 (pagamentos), S-1260/S-1270/S-1280 (outros), S-1298 (reabertura), S-1299 (fechamento).
- **EFD-Reinf**: R-1000 (contribuinte), R-2010/R-2020 (retenções de INSS sobre serviços), R-4010/R-4020 (retenções de IR e PIS/COFINS/CSLL, série R-4000), R-2099/R-4099 (fechamento).

## Como diagnosticar
1. **Identifique o evento e o código do retorno**. A mensagem do eSocial traz um código numérico e uma descrição. Use a descrição como fonte principal. Não afirme o significado de um código que não veio acompanhado de texto: peça a mensagem completa.
2. **Classifique a causa**:
   - **Dependência**: o evento cita um trabalhador, rubrica ou lotação que não foi enviado ou está inativo. Envie antes o evento de tabela ou o não periódico.
   - **Dado inválido**: CPF/PIS, CBO, data, valor ou código de rubrica incompatível com a natureza ou a incidência.
   - **Competência fechada**: é preciso reabrir, corrigir e fechar de novo. No eSocial, a reabertura é o S-1298. Na Reinf, é o R-2098 para a série R-2000 e o R-4099 com indicador de reabertura para a série R-4000; confirme no leiaute vigente.
   - **Duplicidade**: o evento já existe. Retifique (indRetif=2, com o número do recibo) em vez de enviar um novo.
   - **Prazo e ordem cronológica**: um evento com data anterior a outro já enviado pode exigir exclusão (S-3000) e reenvio na ordem correta.
3. **Defina a sequência de correção**: liste os eventos a enviar, retificar ou excluir, na ordem.

## Rubricas (S-1010)
Muitos erros de remuneração vêm da tabela de rubricas, com incidência de INSS, IRRF ou FGTS errada. Ao suspeitar disso, mostre a incidência atual × a esperada para a verba e explique o efeito em cascata: retificar a rubrica pode exigir o reenvio dos S-1200 afetados.

## Saída
- **O que significa o erro**, em uma frase simples.
- **Causa provável** e como confirmá-la no sistema.
- **Passo a passo de correção**, com os eventos na ordem e se cada um é envio, retificação, exclusão ou reabertura.
- **Efeitos colaterais**: guias (DCTFWeb, FGTS Digital) que precisam ser reemitidas.

## Limites
Os leiautes e as regras de validação são atualizados por notas técnicas. Se a mensagem citar uma regra que você não reconhece, diga isso e recomende consultar o leiaute vigente e as orientações oficiais, em vez de adivinhar.
