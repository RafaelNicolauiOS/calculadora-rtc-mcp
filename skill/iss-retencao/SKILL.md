---
name: iss-retencao
description: Determina onde o ISS é devido, se o tomador deve reter, qual alíquota e base usar e como preencher a NFS-e, com base na LC 116/2003, na LC 123/2006 (Simples Nacional) e na legislação do município informado. Use quando o usuário perguntar "tenho que reter ISS dessa nota?", "ISS é devido aqui ou no município do prestador?", "item da lista de serviços", "alíquota de ISS do Simples na NFS-e", "retenção na fonte de ISS", ou trouxer uma NFS-e ou contrato de serviço para conferir o ISS.
---

# ISS: local de incidência e retenção

O erro mais caro com o ISS é recolher no município errado ou deixar de reter quando a lei manda. Aí o tomador vira responsável e paga de novo. Esta skill organiza o raciocínio da LC 116/2003 e indica o que confirmar na lei municipal.

## Dados necessários
- O serviço prestado e o item da lista anexa à LC 116/2003. Ajude a enquadrar pela descrição, mas peça confirmação.
- O município do estabelecimento prestador, o município do tomador e o local onde o serviço foi executado.
- O regime do prestador (Simples Nacional, MEI ou regime normal) e se o tomador é pessoa jurídica.
- O valor do serviço, as deduções permitidas (ex.: materiais em construção civil, conforme a lei) e os descontos.

## Passo 1: onde o ISS é devido
- **Regra geral**: no município do estabelecimento prestador (art. 3º da LC 116/2003).
- **Exceções**: para os serviços listados nos incisos do art. 3º, é devido no local da execução ou do tomador. Exemplos: construção civil (item 7), limpeza, vigilância, armazenagem, diversões públicas e outros. Indique o inciso aplicável. Se o serviço não estiver entre as exceções, vale a regra geral.

## Passo 2: há retenção?
- O município pode atribuir responsabilidade ao tomador (art. 6º da LC 116/2003). Nos serviços das exceções do art. 3º, o tomador pessoa jurídica costuma ser responsável quando o imposto é devido no seu município.
- Cada município define ainda outras hipóteses de substituição na lei local. **Peça a lei municipal ou confirme no portal da prefeitura** antes de afirmar a retenção nos casos que não sejam da LC.
- **MEI**: em regra, não há retenção de ISS do MEI. Confirme a regra vigente.

## Passo 3: alíquota e base
- **Regime normal**: a alíquota da lei municipal, de no mínimo 2% e no máximo 5%, salvo exceções legais. Não invente a alíquota do município. Peça ao usuário ou indique onde consultar.
- **Simples Nacional**: na retenção, aplica-se a alíquota efetiva de ISS do prestador, que ele informa na nota conforme a faixa do anexo (LC 123/2006, art. 21, §4º). Se o prestador não informar, a regra do município pode prever a alíquota máxima. Confirme.
- **Base**: o preço do serviço, com as deduções que a lei admitir.

## Passo 4: NFS-e
Diga como preencher: município de incidência, item da lista, indicação de ISS retido (sim/não), responsável pelo recolhimento, alíquota e valor. Com a Reforma Tributária, a NFS-e nacional também traz os campos de IBS e CBS. Para eles, sugira a skill de classificação.

## Saída
Uma conclusão objetiva, por exemplo: "ISS devido em X, retido pelo tomador, alíquota Y% (confirmar na lei municipal Z), valor R$ W". Em seguida, o raciocínio em 4 linhas (um por passo) e a lista do que precisa ser confirmado.

## Limites
O ISS é municipal: há mais de 5 mil legislações. Esta skill aplica a lei complementar e aponta o que depende do município, sem afirmar regras locais que o usuário não forneceu. A partir de 2029, o ISS começa a ser substituído pelo IBS, e a transição precisa ser considerada nos contratos longos.
