---
name: conciliacao-nfe-entradas
description: Concilia as notas fiscais emitidas contra o CNPJ do cliente (XMLs baixados, relatório de NF-e destinadas ou manifesto do destinatário) com o que foi escriturado no sistema fiscal ou contábil, e aponta notas não lançadas, lançadas em duplicidade, com valor divergente ou que precisam de manifestação. Use quando o usuário pedir "conferir notas de entrada", "achar notas não escrituradas", "bater XML com o livro de entradas", "conciliar NF-e destinadas" ou enviar uma pasta de XMLs junto com um relatório de entradas.
---

# Conciliação de NF-e de entrada × escrituração

Nota de entrada não escriturada é crédito perdido, diferença em malha fina e, às vezes, sinal de fraude contra o CNPJ do cliente. Esta skill cruza as duas fontes e devolve uma lista do que precisa ser resolvido.

## Fontes
- **Notas existentes**: arquivos XML (procNFe), um relatório de NF-e destinadas (portal/SEFAZ ou o sistema do escritório) ou o resultado do manifesto do destinatário.
- **Notas escrituradas**: o livro ou relatório de entradas do sistema fiscal, o SPED (registros C100 de entrada) ou o razão contábil de fornecedores.

Se houver XMLs, extraia de cada um: chave de acesso (44 dígitos), número, série, emitente (CNPJ e nome), data de emissão, valor total (vNF), CFOP predominante e situação (autorizada ou cancelada, quando informada). Use um script se o ambiente permitir e o volume for grande.

## Chave de conciliação
1. **Primária**: a chave de acesso.
2. **Alternativa** (quando o livro não traz a chave): CNPJ do emitente + número + série.
3. **Valor**: compare o vNF com o valor escriturado, com tolerância de centavos.

## Resultado por nota
- **Conciliada**: existe nas duas fontes com o mesmo valor.
- **Não escriturada**: existe no XML ou no relatório, mas não no livro. Sugira lançar ou verificar se é compra do cliente.
- **Escriturada sem XML**: existe no livro, mas não nas notas destinadas. Pode ser nota de outro CNPJ, digitação errada ou nota inexistente.
- **Divergência de valor ou data**: diferença de valor, de competência ou de CFOP.
- **Duplicidade**: a mesma chave lançada mais de uma vez.
- **Cancelada mas escriturada**: estorne.
- **Desconhecida pelo cliente**: notas que o cliente não reconhece. Oriente a registrar o evento "Desconhecimento da operação" no manifesto dentro do prazo e a avaliar o risco de uso indevido do CNPJ.

## Saída
- **Planilha**: uma linha por nota, com o status, as duas versões dos dados e a ação sugerida.
- **Resumo**: total de notas por status, o valor não escriturado e o impacto estimado em créditos, se o usuário informar o regime.
- **Lista de pendências para pedir ao cliente**: as notas a confirmar.

## Limites
O prazo e os efeitos do manifesto do destinatário seguem a legislação de cada evento. Confirme o vigente antes de orientar um prazo exato. Não lance nada no sistema do cliente sem pedido. A skill propõe, o analista executa.
