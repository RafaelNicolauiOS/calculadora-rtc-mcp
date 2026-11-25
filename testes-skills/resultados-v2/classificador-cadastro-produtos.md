# Classificação do cadastro para a Reforma Tributária (IBS/CBS/IS)

Cliente: mercadinho, regime regular (Lucro Presumido), NF-e e NFC-e, venda a consumidor final. 6 linhas tratadas (5 classificadas, 1 em revisão). Base consultada: IT 2025.002 v.1.71 (publicada em 30/10/2026, vigência 01/01/2027). Se a operação for anterior a essa vigência ou a tabela for atualizada, reconfira.

## Tabela para o ERP (CSV)

```csv
descricao;ncm;CST;cClassTrib;descricao_classificacao;reducao_cbs;reducao_ibs;sujeito_IS;cClassTrib_IS;confianca;justificativa
ARROZ BRANCO TIPO 1 5KG;10063021;200;200003;Vendas de produtos destinados à alimentação humana (Anexo I);100%;100%;nao;;Alta;Art. 125 LC 214/2025: NCM 100630 está no Anexo I (cesta básica); alíquota zero
CERVEJA LATA 350ML;22030000;000;000001;Situações tributadas integralmente pelo IBS e CBS;0%;0%;sim (a partir de 2027);200007;Alta;Regra geral (sem anexo para o NCM 2203); NCM 2203 sujeito a IS, e na revenda pelo varejista o IS é 200007 (sem cálculo)
SABAO EM PO 1KG;34022000;000;000001;Situações tributadas integralmente pelo IBS e CBS;0%;0%;nao;;Alta;NCM 34022000 não consta em nenhum anexo (o Anexo VIII, 200035, lista 3401 e não 3402); regra geral
FEIJAO CARIOCA 1KG;07133319;200;200003;Vendas de produtos destinados à alimentação humana (Anexo I);100%;100%;nao;;Alta;Art. 125 LC 214/2025: NCM 07133319 está listado no Anexo I; por isso fica fora do 200034 (Anexo VII), que o exclui
REFRIGERANTE COLA 2L;22021000;000;000001;Situações tributadas integralmente pelo IBS e CBS;0%;0%;sim (a partir de 2027);200007;Alta;Regra geral; NCM 22021000 consta na lista do IS; na revenda o IS é 200007 (sem cálculo)
KIT PRESENTE DIVERSOS;9999;;;;;;;;Revisar;Código incompleto (NCM com 4 dígitos) e descrição genérica
```

Observações de leitura:
- Os dois itens de IS levam o grupo IBS/CBS com CST 000 / 000001 e, além disso, o grupo `impostoSeletivo` com cClassTrib 200007 (venda de bem tributado pelo IS em operação anterior, sem cálculo). O CST do IS segue os 3 primeiros dígitos do cClassTrib (200, "Não ocorrência do Fato Gerador"). Não há alíquota de IS no item do mercadinho. O IS só vale a partir de 2027; antes disso o grupo não deve ser informado (REG-014).
- Se o mercadinho um dia fabricar ou importar bebida, o item passa a ser 000001 do IS (primeiro fornecimento, com cálculo).

## Documento (NF-e e NFC-e)
- 200003 aceita NF-e (55), NFC-e (65) e Duimp: compatível com o cliente.
- 000001 aceita NF-e e NFC-e: compatível. Não há risco de REG-029 nas classificações escolhidas.

## Resumo para o contador

| Classificação | Itens |
|---|---|
| 200003 (alíquota zero, cesta básica) | 2 (arroz, feijão) |
| 000001 (tributação integral) | 3 (cerveja, sabão em pó, refrigerante) |
| Revisar | 1 (kit presente) |

Itens com alíquota zero (interesse comercial para o cliente): arroz 5kg e feijão carioca 1kg, com redução de 100% de CBS e IBS.

Itens sujeitos a IS a partir de 2027: cerveja e refrigerante (IS 200007 na revenda).

Fila "Revisar":
- KIT PRESENTE DIVERSOS (9999): NCM incompleto (4 dígitos; precisa de 8) e descrição genérica. Um kit é classificado pelo NCM do conjunto ou do componente que lhe dá caráter, então peça a composição do kit e o NCM correto. Se contiver bebida alcoólica ou refrigerante, haverá IS. Sem isso não dá para classificar, e a ausência de código completo geraria REG-015/REG-016 se houvesse anexo.

## Pontos a conferir
- Pelo NCM, arroz e feijão estão na cesta básica. A confirmação final é pela descrição: arroz beneficiado e feijão em grãos (embalagem a granel/varejo) se enquadram. Produtos preparados ou temperados ficam fora.
- Perguntas que não mudam esta tabela, mas valem registro: o cliente vende a órgãos públicos ou entidades imunes? Nesses casos existe classificação específica por operação, que deve ficar como observação e não no cadastro padrão. Pela descrição dos itens, não há indício disso.
- Não consegui rodar `rtc_validar_nomenclatura` nesta sessão, então os pares NCM × cClassTrib foram conferidos apenas contra as tabelas de referência. Recomendo validar na calculadora antes de importar.

Ferramenta de apoio: a responsabilidade pela classificação é do contribuinte e do contador; não substitui consulta formal ao fisco em casos duvidosos.
