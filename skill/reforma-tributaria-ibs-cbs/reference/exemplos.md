# Exemplos de entrada e saída da Calculadora RTC

> Exemplos tirados da documentação e da especificação OpenAPI oficiais da Calculadora RTC (Receita Federal/Serpro, licença MIT). Os valores são fictícios. As alíquotas de 2027 nos exemplos são hipóteses de teste, não alíquotas oficiais.

## 1. Regime regular: operação com 4 itens (fato gerador em 2027)

O item 1 é arroz da cesta básica (CST 200, 200003, redução de 100%). O item 2 é cerveja com Imposto Seletivo: a base de CBS/IBS é a base do IS somada ao IS. O item 3 é serviço de educação (200028, redução de 60%). O item 4 tem um erro proposital: o NCM não pertence ao anexo da 200035.

```json
{
  "id": "6194602ea71cbf9431c236de4409d920",
  "versao": "1.0.0",
  "dhFatoGerador": "2027-03-10T10:00:00-03:00",
  "municipio": 4314902,
  "uf": "RS",
  "itens": [
    {
      "numero": 1, "ncm": "10063021", "cst": "200", "cClassTrib": "200003",
      "baseCalculo": 100.00, "quantidade": 20, "unidade": "KG",
      "aliquotasNominais": { "cbs": 8.8, "ibsEstadual": 0.05, "ibsMunicipal": 0.05 }
    },
    {
      "numero": 2, "ncm": "22030000", "cst": "000", "cClassTrib": "000001",
      "quantidade": 12, "unidade": "LT",
      "impostoSeletivo": {
        "cst": "000", "cClassTrib": "000001", "baseCalculo": 150.00,
        "quantidade": 12, "unidade": "LT", "impostoInformado": 15.00
      },
      "aliquotasNominais": {
        "cbs": 8.8, "ibsEstadual": 0.05, "ibsMunicipal": 0.05,
        "impostoSeletivo": { "adValorem": 10.0 }
      }
    },
    {
      "numero": 3, "nbs": "122011200", "cst": "200", "cClassTrib": "200028",
      "baseCalculo": 1200.00,
      "aliquotasNominais": { "cbs": 8.8, "ibsEstadual": 0.05, "ibsMunicipal": 0.05 }
    },
    {
      "numero": 4, "ncm": "02013000", "cst": "200", "cClassTrib": "200035",
      "baseCalculo": 80.00,
      "aliquotasNominais": { "cbs": 8.8, "ibsEstadual": 0.05, "ibsMunicipal": 0.05 }
    }
  ]
}
```

Regras de entrada:
- `dhFatoGerador` vai em ISO 8601 com fuso. O campo `dataHoraEmissao` está obsoleto.
- `municipio` é o código IBGE de 7 dígitos e precisa pertencer à `uf` (REG-018).
- Cada item tem `ncm` **ou** `nbs`.
- `aliquotasNominais` é obrigatório a partir de 2027 e proibido antes.

Resposta da observabilidade (resumida; cada grupo também traz a `memoriaCalculo` em texto):

```json
{
  "objetos": [
    { "nObj": 1, "estadoItem": "CALCULO_SIMULADO", "tribCalc": { "IBSCBS": { "...": "..." } } },
    { "nObj": 2, "estadoItem": "CALCULO_SIMULADO", "tribCalc": { "IS": { "...": "..." }, "IBSCBS": { "...": "..." } } },
    {
      "nObj": 3,
      "estadoItem": "CALCULO_SIMULADO",
      "tribCalc": { "IBSCBS": { "CST": "200", "cClassTrib": "200028", "gIBSCBS": {
        "vBC": "1200.00",
        "gIBSUF":  { "pIBSUF": "0.05",  "gRed": { "pRedAliq": "60.00", "pAliqEfet": "0.02" }, "vIBSUF": "0.24" },
        "gIBSMun": { "pIBSMun": "0.05", "gRed": { "pRedAliq": "60.00", "pAliqEfet": "0.02" }, "vIBSMun": "0.24" },
        "vIBS": "0.48",
        "gCBS":    { "pCBS": "8.80",    "gRed": { "pRedAliq": "60.00", "pAliqEfet": "3.52" }, "vCBS": "42.24" }
      } } }
    },
    {
      "nObj": 4,
      "estadoItem": "INCONSISTENCIA_ENTRADA",
      "erros": [{
        "code": "REG-011",
        "title": "NCM não vinculada",
        "pointer": "#/itens/3/ncm",
        "detail": "NCM de código 02013000 não vinculada à Classificação Tributária de código 200035 (CBS e IBS)"
      }]
    }
  ],
  "total": { "tribCalc": {
    "ISTot": { "vIS": "15.00" },
    "IBSCBSTot": { "vBCIBSCBS": "1465.00", "gIBS": { "vIBS": "0.64" }, "gCBS": { "vCBS": "56.76" } }
  } }
}
```

Como ler a resposta:
- A resposta é HTTP 200 mesmo com itens em erro. O que vale é o `estadoItem` de cada objeto.
- `nObj` é o número do item, e o `pointer` usa índice a partir de 0 (`itens/3` é o item 4).
- Os totais somam apenas os itens calculados. A base total, 1.465,00, é 100 + 165 (150 de base do IS + 15 de IS) + 1.200.
- Item 3: a alíquota efetiva é 8,80 × (1 − 0,60) = 3,52% de CBS, e 1.200 × 3,52% = 42,24.
- No modo estrito (`POST /regime-geral`), a operação inteira é rejeitada com HTTP 422 por causa do item 4. Só a resposta do modo estrito serve para gerar o XML.

## 2. Base de cálculo unificada (NF-e, 2027)

Entrada (os componentes ficam no mesmo nível, sem objeto aninhado):

```json
{
  "anoFatoGerador": 2027, "tipoDocumento": 55, "natureza": "bem",
  "vProd": 1000.00, "vFrete": 50.00, "vSeg": 20.00, "vOutro": 10.00, "vDesc": 50.00,
  "vIS": 30.00, "vPIS": 9.25, "vCOFINS": 46.25, "vICMS": 180.00, "vFCP": 10.00
}
```

Saída:

```json
{
  "baseRG": 870.00, "baseIS": 840.00, "baseSN": 1060.00,
  "avisos": [
    "Campo vPIS não compõe as bases para o ano 2027 (vigência 2026–2026) e foi ignorado no cálculo",
    "Campo vCOFINS não compõe as bases para o ano 2027 (vigência 2026–2026) e foi ignorado no cálculo"
  ]
}
```

Conferência:
- baseRG = 1000 + 50 + 20 + 10 − 50 + 30 (IS) − 180 (ICMS) − 10 (FCP) = 870.
- baseIS = baseRG − IS = 840.
- Em 2027, PIS e COFINS já não existem e são ignorados.

## 3. Simples Nacional: NF-e, CRT 1, Anexo I

```json
{
  "id": "op-2", "versao": "3.0.0", "data": "2027-03-15", "tpDoc": "55", "CRT": "1",
  "aliquotasEfetivas": {
    "fatorR": true, "impedimentoSublimite": false,
    "anexoI": { "pCBSSN": "1.1612", "pIBSSN": "0.0129" }
  },
  "itens": [
    { "numero": 1, "cAtivSN": "01", "cClassTrib": "000001", "baseCalculo": "1000.00", "valorImpostoSeletivo": "0.00" }
  ]
}
```

## 4. Simples Nacional: NFS-e de construção civil com ISS

```json
{
  "id": "op-1", "versao": "3.0.0", "data": "2027-03-15", "tpDoc": "91",
  "opSimpNac": "3", "regApIBSCBSSN": "1", "regApTribSN": "1",
  "aliquotasEfetivas": {
    "fatorR": false, "impedimentoSublimite": false,
    "anexoIII": {
      "pCBSSN": "2.3874", "pIBSSN": "0.0263",
      "semRedistribuicaoISS": { "pCBSSN": "2.3591", "pIBSSN": "0.0260" }
    }
  },
  "itens": [
    {
      "numero": 1, "cAtivSN": "12", "cClassTrib": "000001", "nbs": "114051000",
      "baseCalculo": "10000.00", "tribISSQN": "1", "tpRetISSQN": "1", "tpBM": "1"
    }
  ]
}
```

Notas sobre o Simples:
- Os percentuais são texto e vêm do PGDAS-D. A Calculadora não os calcula.
- Nos anexos III a V com ISS, informe também o par `semRedistribuicaoISS`. A regra que escolhe qual par usar depende de `tribISSQN`, `tpRetISSQN` e `tpBM`.
- A NFS-e tem exatamente 1 item.
