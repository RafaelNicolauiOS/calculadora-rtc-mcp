# Avaliação dos testes das 22 skills de contabilidade

Fonte: `casos.json` (assertivas), `resultados/<skill>.md` (respostas) e `skill/<skill>/` (SKILL.md e `reference/`). O detalhe por assertiva, com a evidência, está em `resultados/<skill>.grading.json`.

**Resultado geral: 90 de 93 assertivas (96,8%).** Três skills ficaram abaixo de 100%. Quase todas as respostas cumprem as assertivas, mas o número esconde erros jurídicos e de cálculo fora das assertivas: ISS no município errado, prazo de rescisão errado, crédito subestimado no simulador e PIS/COFINS usados em 2027. Esses erros estão listados abaixo.

## Taxa de aprovação por skill

| Skill | Aprovadas | Taxa | Problemas extras |
|---|---|---|---|
| abertura-alteracao-empresa | 4/4 | 100% | 2 (menores) |
| agenda-obrigacoes-acessorias | 3/4 | **75%** | 3 |
| atendimento-clientes-contabilidade | 4/4 | 100% | 0 |
| calculo-rescisao | 4/5 | **80%** | 1 (grave) |
| classificador-cadastro-produtos | 5/5 | 100% | 4 |
| classificador-lancamentos | 4/4 | 100% | 1 (menor) |
| conciliacao-bancaria | 5/5 | 100% | 1 (menor) |
| conciliacao-nfe-entradas | 4/4 | 100% | 0 |
| conferencia-folha | 4/4 | 100% | 0 |
| conferencia-sped-efd | 4/4 | 100% | 0 |
| creditos-ibs-cbs | 4/4 | 100% | 0 |
| escolha-regime-tributario | 5/5 | 100% | 4 |
| esocial-eventos-rejeitados | 4/4 | 100% | 0 |
| fator-r-pro-labore | 4/4 | 100% | 3 |
| fechamento-mensal | 5/5 | 100% | 0 |
| iss-retencao | 3/4 | **75%** | 3 (grave) |
| onboarding-cliente | 4/4 | 100% | 0 |
| proposta-honorarios | 4/4 | 100% | 2 |
| relatorio-gerencial-cliente | 4/4 | 100% | 0 |
| revisor-notas-rejeitadas | 4/4 | 100% | 0 |
| simples-nacional-reforma | 4/4 | 100% | 1 |
| simulador-transicao-reforma | 4/4 | 100% | 3 (1 grave) |
| **Total** | **90/93** | **96,8%** | |

### Falhas

- **iss-retencao, A0.** A resposta diz que vigilância (11.02) não está entre as exceções do art. 3º e que o ISS é devido em Campinas. Está errado: o ISS é devido em São Paulo. A SKILL.md já lista "vigilância" como exemplo de exceção, então o erro é do executor. Mesmo assim, a skill precisa da lista de subitens para não deixar margem.
- **calculo-rescisao, A3.** A resposta cita a multa de 40% e o art. 477, §6º, mas conta os 10 dias a partir da data projetada (prazo até 06/10/2027). Com aviso indenizado, o prazo corre do afastamento em 15/08/2027, então vai até 25/08/2027. O texto da skill é ambíguo e contribuiu para o erro.
- **agenda-obrigacoes-acessorias, A1.** A resposta exclui a EFD-Contribuições da Tech para 06/2027 porque PIS/COFINS estão extintos. O raciocínio é parcialmente certo, mas uma empresa de software pode estar na CPRB, que ainda existe em 2027 e é escriturada na EFD-Contribuições. O certo seria incluir a obrigação como condicional. **A assertiva também deve ser revista**, para algo como "inclui a EFD-Contribuições ou explica que em 2027 ela só se aplica se houver CPRB ou retificação".

## Correções nas skills, por ordem de importância

### 1. iss-retencao: lista explícita das exceções do art. 3º (erro de município)
**Problema:** a resposta negou uma exceção que a própria skill cita. A skill só dá exemplos genéricos e convida a "confirmar", o que leva o executor a reabrir a regra.
**Alteração:** substituir o bloco "Exceções" do Passo 1 por:
> **Exceções (art. 3º, I a XXV, da LC 116/2003)**: o ISS é devido no local da execução, dos bens ou do tomador para os subitens 3.05, 7.02, 7.04, 7.05, 7.09, 7.10, 7.11, 7.12, 7.16, 7.17, 7.18, 7.19, 11.01, 11.02 (vigilância, segurança ou monitoramento: local dos bens ou do domicílio das pessoas vigiadas), 11.04, item 12 (exceto 12.13), 16.01, 17.05, 17.10 e item 20. Se o subitem estiver nesta lista, a conclusão é a exceção: não a negue nem a transforme em pendência. O que fica a confirmar é só a lei municipal (alíquota e procedimento). Para os subitens 4.22, 4.23, 5.09, 10.04, 15.01 e 15.09 (LC 157/2016 e LC 175/2020), confirme a situação vigente antes de concluir.

E no Passo 2:
> O art. 6º, §2º, II, atribui a responsabilidade ao tomador PJ (ainda que imune ou isento) dos subitens 3.05, 7.02, 7.04, 7.05, 7.09, 7.10, 7.12, 7.16, 7.17, 7.19, 11.02, 17.05 e 17.10, em favor do município onde o imposto é devido.

### 2. calculo-rescisao: contagem do prazo do art. 477
**Problema:** "10 dias contados do término do contrato" e "o aviso indenizado projeta o contrato" aparecem lado a lado. O executor juntou as duas regras e contou o prazo a partir da data projetada, o que expõe o cliente à multa do §8º.
**Alteração:** na seção "Saída", substituir o item "Prazo" por:
> Prazo: pagamento das verbas e entrega dos documentos em até 10 dias corridos contados do término do contrato (art. 477, §6º, da CLT). Com aviso prévio indenizado, o término para esse prazo é o dia do afastamento (último dia trabalhado), NÃO a data projetada. A projeção serve só para os avos de férias e 13º e para a data de saída anotada na CTPS. Exemplo: afastamento em 15/08, prazo até 25/08. O atraso gera a multa do §8º.

### 3. simulador-transicao-reforma: crédito pela alíquota do fornecedor e lista de NBS
**Problema:** no cenário B (educação com redução de 60%), o crédito das compras foi calculado com a alíquota reduzida da escola. Por isso aparece 5.340 em vez de 13.350 em 2027, e 15.900 em vez de 39.750 em 2033. A carga do cenário B ficou superestimada: o correto seria 53.370 (4,45%) em 2027 e 87.450 (7,29%) em 2033. Além disso, a skill não tem a lista de NBS do 200028, então o executor não conseguiu verificar o curso de idiomas.
**Alteração:** em "Cálculo", passo 2, acrescentar:
> O crédito das compras é o IBS/CBS destacado pelo fornecedor, calculado pela alíquota da operação de compra (em regra a cheia), e NÃO pela alíquota reduzida das vendas do cliente. Uma redução nas vendas não reduz o crédito das entradas.

Copiar `reference/vinculos-ncm-nbs.md` para a skill e acrescentar em "Referência":
> `reference/vinculos-ncm-nbs.md`: NCM/NBS aceitos por cada classificação com anexo. Antes de montar um cenário com redução, confira se o NCM/NBS do cliente está na lista. Se não estiver, use o cenário sem redução como principal e mencione o outro só como alternativa a confirmar.

### 4. agenda-obrigacoes-acessorias: EFD-Contribuições em 2027 e DARF da DCTFWeb
**Problema:** a skill não diz o que acontece com a EFD-Contribuições a partir de 2027 e não menciona o DARF da DCTFWeb. A agenda deixou de fora a principal guia da folha (INSS e IRRF, vencimento em 18/06/2027) e excluiu a EFD-Contribuições por suposição.
**Alteração:** no bloco "Lucro Presumido e Real", substituir "EFD-Contribuições e EFD ICMS/IPI (se contribuinte de ICMS ou IPI)" por:
> EFD ICMS/IPI (se contribuinte de ICMS ou IPI). EFD-Contribuições: até a competência 12/2026 para PIS/COFINS; a partir de 2027, só se houver CPRB (desoneração da folha em transição, Lei 14.973/2024) ou retificação de períodos anteriores. Pergunte em vez de excluir.

Em todos os perfis com folha, acrescentar:
> DARF da DCTFWeb (INSS e IRRF da folha), no dia 20, antecipando para o dia útil anterior. FGTS Digital no dia 20, também antecipando.

### 5. escolha-regime-tributario: CBS nos números de 2027, município e janela do Simples
**Problema:** a empresa está sendo aberta em novembro/2026, mas a resposta usou PIS/COFINS nos números do Presumido e do Real, embora a skill mande usar a CBS a partir de 2027. A resposta também inventou o município (Belo Horizonte, ISS de 3%) e informou a janela de opção do Simples com "180 dias". A skill só fala em "janeiro".
**Alteração:** em "Simulação", acrescentar:
> Se o ano simulado for 2027 ou posterior (inclusive para empresa aberta no fim de 2026), a tabela principal deve usar a CBS no lugar de PIS/COFINS no Presumido e no Real, com alíquota declarada como hipótese. PIS/COFINS só entram em coluna de comparação com 2026. Não suponha UF ou município que o usuário não informou: deixe a alíquota de ISS/ICMS como parâmetro.

Em "Saída", substituir o item "Prazo" por:
> Prazo: empresa já existente opta pelo Simples em janeiro. Empresa em início de atividade opta em até 30 dias do último deferimento de inscrição (municipal ou estadual), sem ultrapassar 60 dias da abertura no CNPJ (Resolução CGSN 140/2018, art. 6º; confirme a redação vigente). Presumido ou Real: com o primeiro pagamento do ano ou do início da atividade.

### 6. simples-nacional-reforma: anexo do cAtivSN 01 para indústria
**Problema:** `reference/simples-atividades.md` traz o cAtivSN 01 ("revenda ... e venda de mercadorias industrializadas pelo contribuinte") com Anexo I. Pela LC 123/2006, art. 18, §4º, II, a indústria é tributada pelo Anexo II.
**Alteração:** em "Cálculo dentro do DAS", passo 1, acrescentar:
> Atenção ao cAtivSN 01: o código cobre a revenda (Anexo I) e a venda de mercadoria industrializada pelo próprio contribuinte, que pela LC 123/2006, art. 18, §4º, II, é tributada pelo Anexo II. A coluna "Anexo" de `simples-atividades.md` reproduz a tabela da Calculadora e não decide o anexo de cálculo. Para indústria, peça os pCBSSN/pIBSSN do Anexo II apurados no PGDAS-D.

### 7. classificador-cadastro-produtos: exceções de prefixo e IS na revenda
**Problema:** o executor leu os prefixos do 200034 ("07", "10") sem aplicar as exceções. Ele acertou a classificação final, mas por um raciocínio errado. A tabela também usa IS 000001 (primeiro fornecimento) para um varejista.
**Alteração:** no passo 2 do Método, acrescentar:
> Um código listado entre parênteses como "exceto" NÃO é aceito por aquela classificação. Os anexos I (200003) e VII (200034) foram construídos para não se sobrepor: se o NCM está no 200003, ele está excluído do 200034. Só diga que há duas candidatas depois de conferir as exceções.

No passo 6, acrescentar:
> Na coluna `sujeito_IS`, indique a cClassTrib do IS conforme a posição do cliente na cadeia: 000001 apenas para o primeiro fornecimento (fabricante ou importador). Na revenda por varejista ou atacadista, use 200007 (tributado em operação anterior, sem cálculo), sem alíquota de IS no item.

### 8. escolha-regime-tributario e fator-r-pro-labore: como usar as tabelas do Simples
**Problema:** as duas skills proíbem usar as tabelas "de memória". Sem elas, porém, não dá para fazer a comparação pedida, e as duas respostas usaram as tabelas da LC 123 mesmo assim, com ressalva. Os valores estavam corretos. A regra é descumprida porque não é viável.
**Alteração:** substituir "Não invente as tabelas do Simples. Peça..." (escolha-regime) e o item equivalente em "Entradas" (fator-r) por:
> Peça a alíquota efetiva do PGDAS-D ou a RBT12. Se o usuário não fornecer e a resposta depender delas, você pode usar as tabelas dos Anexos I a V da LC 123/2006 (redação da LC 155/2016), desde que: (a) diga que são as tabelas da lei usadas como premissa; (b) mostre a faixa, a alíquota nominal e a parcela a deduzir usadas; e (c) peça a confirmação com o PGDAS-D. Nunca use de memória os percentuais de repartição (pCBSSN/pIBSSN etc.).

### 9. proposta-honorarios: escopo da Reforma
**Problema:** numa proposta de novembro/2026, o escopo inclui a apuração de PIS/COFINS e a EFD-Contribuições, que deixam de existir em 2027. Já a apuração de CBS/IBS ficou como "cobrado à parte".
**Alteração:** na parte de escopo, acrescentar:
> Para contratos que alcancem 2027 em diante, liste no escopo a apuração e as obrigações de CBS/IBS (e do IS, se houver) no lugar de PIS/COFINS. Deixe como serviço à parte apenas projetos pontuais (reclassificação do cadastro, simulações, revisão de contratos). Preveja cláusula de revisão do escopo quando o regulamento das novas obrigações for publicado.

Ao todo são **10 alterações em 9 skills**: a correção 8 vale para duas skills, e escolha-regime-tributario recebe duas.

## Disputas resolvidas

### classificador-cadastro-produtos: arroz (10063021) e feijão (07133319)
- `vinculos-ncm-nbs.md`: o **200003** (Anexo I, cesta básica) aceita o prefixo `100630` e o código `07133319`. O **200034** (Anexo VII, redução de 60%) aceita os prefixos `10` e `07`, mas com as exceções `10 (exceto 100620, 100630, 10064000)` e `07 (exceto ... 07133319, 07133329, 07133399, 07133590 ...)`.
- `cst-cclasstrib.md`: o 200003 tem alíquota zero, com redução de 100% de CBS, IBS UF e IBS Mun (art. 125). O 200034 tem redução de 60% (art. 135).
- **Conclusão:** os dois NCMs estão **só** no 200003, e a afirmação do executor de que aparecem nos dois está errada. A resposta final classificou os dois itens como 200003/CST 200, o que está correto. **A assertiva A0 está certa.**

### iss-retencao: vigilância (subitem 11.02)
- **O executor está errado.** A LC 116/2003, art. 3º, desloca o ISS para o local "dos bens, dos semoventes ou do domicílio das pessoas vigiados, segurados ou monitorados, no caso dos serviços descritos no subitem 11.02". O ISS é devido em **São Paulo**. O art. 6º, §2º, II, inclui o 11.02 entre os casos de responsabilidade do tomador PJ, então o condomínio retém para São Paulo, conforme a lei paulistana.
- Confiança: **alta (~95%)** de que a exceção existe e se aplica. Sobre o número do inciso: o usuário citou o XIV, mas minha leitura é que é o **inciso XVI** (redação da LC 157/2016). Nesse ponto a confiança é moderada (~75%). Vale conferir no texto compilado, mas isso não muda a conclusão.
- Este parecer não teve acesso à rede. As afirmações sobre a LC 116 vêm de conhecimento prévio, sem consulta ao texto compilado.

### simples-nacional-reforma: cAtivSN 01 e anexo
- `reference/simples-atividades.md`: a linha `| 01 | Revenda de mercadorias, venda de mercadorias industrializadas pelo contribuinte | I | não | 55, 65 |` agrupa revenda e industrialização no mesmo código, com Anexo I.
- Pela LC 123/2006, art. 18, §4º, II, a venda de mercadoria industrializada pelo próprio contribuinte é tributada pelo **Anexo II**. **O executor acertou** ao apontar a divergência e pedir os percentuais do anexo efetivamente usado no PGDAS-D. A referência deve ganhar a nota da correção 6.

## Outros erros relevantes fora das assertivas
- **simulador-transicao-reforma:** além do erro no crédito, apenas um código dentro de 1.2205 é aceito no 200028 (`122051300`), o que indica que cursos livres de idiomas tendem a não ter a redução. O cenário A deveria ser o principal (conferir a descrição na NBS).
- **escolha-regime-tributario:** PIS/COFINS nos números de 2027 e município inventado (correção 5).
- **fator-r-pro-labore:** cobra 11% de INSS sobre o pró-labore extra mesmo supondo que o sócio já ganha cerca de R$ 10 mil/mês. Se for um sócio só, ele já está acima do teto, e o custo adicional de INSS fica perto de zero.
- **agenda-obrigacoes-acessorias:** a regra do FGTS Digital é antecipar para o dia útil anterior. A resposta deixou como "confirmar se antecipa ou posterga".
- **Datas inventadas (menores):** "06/2025" no histórico da conciliação bancária e na pergunta sobre o DAS do classificador de lançamentos.
- **classificador-cadastro-produtos:** a descrição do REG-014 na resposta não bate com `erros.md` ("dados do IS informados quando a classificação não prevê incidência").
