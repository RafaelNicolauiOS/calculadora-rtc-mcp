# Classificação do cadastro para IBS/CBS/IS (mercadinho, regime regular, NF-e/NFC-e, consumidor final)

Base consultada: IT 2025.002 v.1.71 (publicada em 30/10/2026, vigência 2027-01-01). Premissas: Lucro Presumido (regime regular), venda só a consumidor final (sem variação para órgão público, imune ou exportação). Documentos NF-e e NFC-e: todas as classificações abaixo aceitam os dois. Foram tratadas 6 linhas.

## 1. Tabela para o ERP

```csv
descricao;ncm;CST;cClassTrib;descricao_classificacao;reducao_cbs;reducao_ibs;sujeito_IS;confianca;justificativa
ARROZ BRANCO TIPO 1 5KG;10063021;200;200003;Vendas de produtos destinados à alimentação humana (Anexo I - Cesta Básica Nacional);100%;100%;nao;Alta;Art. 125 LC 214/2025: NCM 100630 está no Anexo I; alíquota zero
CERVEJA LATA 350ML;22030000;000;000001;Tributação integral;0%;0%;sim (IS 000001);Alta;Sem redução possível para NCM 2203; regra geral da LC 214/2025; NCM 2203 sujeito a Imposto Seletivo a partir de 2027
SABAO EM PO 1KG;34022000;000;000001;Tributação integral;0%;0%;nao;Media;NCM 3402.20 não consta no Anexo VIII (200035 aceita só 34011190, 34011900 etc.); sem tratamento diferenciado, regra geral
FEIJAO CARIOCA 1KG;07133319;200;200003;Vendas de produtos destinados à alimentação humana (Anexo I - Cesta Básica Nacional);100%;100%;nao;Alta;Art. 125 LC 214/2025: NCM 07133319 está no Anexo I; alíquota zero
REFRIGERANTE COLA 2L;22021000;000;000001;Tributação integral;0%;0%;sim (IS 000001);Alta;NCM 22021000 fora dos anexos de redução; consta na lista de IS a partir de 2027
KIT PRESENTE DIVERSOS;9999;;;REVISAR;;;;Revisar;NCM incompleto (4 dígitos) e descrição genérica ("kit/diversos"); não classificar sem NCM de 8 dígitos e a composição do kit
```

Observação sobre a confiança do sabão em pó: marquei "Média" e não "Alta" porque a classificação decorre de o NCM não estar no Anexo VIII; vale conferir se o produto cadastrado é de fato sabão/detergente em pó do NCM 3402.20 (e não um item de outra posição).

## 2. Resumo para o contador

| Classificação | Itens | Qtde |
|---|---|---|
| 200003 (CST 200) - cesta básica, alíquota zero | Arroz, Feijão | 2 |
| 000001 (CST 000) - tributação integral | Cerveja, Sabão em pó, Refrigerante | 3 |
| Revisar | Kit presente | 1 |

**Itens em que a reforma zera o imposto (interesse comercial do cliente):** arroz e feijão, com redução de 100% de CBS e IBS (Art. 125 da LC 214/2025). Os dois mantêm o crédito na operação antecedente.

**Itens sujeitos a Imposto Seletivo a partir de 2027:** cerveja (NCM 2203) e refrigerante (NCM 22021000). Eles precisam do grupo `impostoSeletivo` com alíquota informada; antes de 2027 o grupo não deve ser enviado (REG-014). Atenção: o IS incide, em regra, no primeiro fornecimento (fabricante/importador). Para a revenda pelo mercadinho, a opção do catálogo de IS é a 200007 (venda de bem tributado pelo IS em operação anterior). Confirme com a orientação vigente do emissor qual cClassTrib de IS usar na revenda, pois isso depende da operação e não só do produto. Para IBS/CBS, a classificação 000001 permanece.

**Lista "Revisar":**
- KIT PRESENTE DIVERSOS (NCM 9999): código incompleto (REG-015 se enviado assim) e descrição genérica. Envie o NCM de 8 dígitos e a composição do kit. Em kits, a classificação normalmente segue o item que dá o caráter essencial, e a mistura de itens com tributações diferentes pode exigir tratamento próprio.

**Pontos de atenção**
- Feijão: 200003 (alíquota zero) foi escolhida em vez de 200034 (redução de 60%), porque 07133319 está no Anexo I da cesta básica.
- Todas as classificações aceitam NF-e e NFC-e, então não há risco de REG-029 neste lote.
- Não foi possível rodar a conferência de NCM x cClassTrib via `rtc_validar_nomenclatura`; a validação foi feita contra as tabelas de referência da skill. Recomendo validar na calculadora antes de importar.
- Esta é uma ferramenta de apoio; a responsabilidade pela classificação é do contribuinte e do contador.
