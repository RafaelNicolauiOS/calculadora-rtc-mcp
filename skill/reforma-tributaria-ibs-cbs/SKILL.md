---
name: reforma-tributaria-ibs-cbs
description: Classifica operações e calcula CBS, IBS e Imposto Seletivo da Reforma Tributária do Consumo (LC 214/2025, EC 132/2023) no regime regular e no Simples Nacional. Use quando o usuário pedir para escolher CST ou cClassTrib, conferir se um NCM/NBS pode ser usado com uma classificação, calcular IBS/CBS/IS de uma nota (NF-e, NFC-e, NFS-e, CT-e, BP-e, NF3-e), montar o JSON da Calculadora RTC da Receita Federal, interpretar erros REG-xxx, CAL-xxx ou VSN-xxx, entender redução de alíquota, alíquota zero, isenção, crédito presumido ou montar o grupo IBSCBS/IS do XML. Também serve para perguntas como "qual cClassTrib uso para venda de arroz", "por que deu REG-011", "quanto de IBS e CBS em 2027" ou "como preencher aliquotasNominais".
---

# Reforma Tributária do Consumo: classificação e cálculo de CBS, IBS e IS

Esta skill transforma o agente em um assistente técnico para a tributação do consumo criada pela EC 132/2023 e regulamentada pela LC 214/2025. A base é a tabela oficial de classificações tributárias e as regras de validação da **Calculadora RTC** (código aberto da Receita Federal e do Serpro). Os arquivos em `reference/` foram gerados dessa base. A versão está no cabeçalho de cada arquivo.

## Limites (diga isto ao usuário quando for relevante)

- Esta skill não é um sistema oficial e não substitui contador, advogado tributarista nem os sistemas de autorização de DF-e. Resultados servem para conferência e simulação.
- A tabela de cClassTrib muda com frequência (notas técnicas e informes técnicos). Se a data do fato gerador for posterior à versão da base no cabeçalho dos arquivos, avise que a classificação pode ter mudado.
- Nunca invente cClassTrib, CST, percentual de redução ou alíquota. Se o código não estiver em `reference/`, diga que não está na base e peça para o usuário confirmar no Portal da NF-e ou na Calculadora oficial.
- Não calcule a alíquota efetiva do Simples Nacional (isso é do PGDAS-D). Peça ao usuário os percentuais pCBSSN/pIBSSN.

## Arquivos de referência

Leia sob demanda. Não carregue todos de uma vez.

| Arquivo | Quando abrir |
|---|---|
| `reference/cst-cclasstrib.md` | Escolher ou explicar CST e cClassTrib, redução, crédito, documentos admitidos e fundamentação legal. Procure pelo código (`### 200003`) ou por palavra-chave da descrição. |
| `reference/vinculos-ncm-nbs.md` | Conferir se um NCM/NBS é aceito por uma classificação que tem anexo (lista fechada). |
| `reference/imposto-seletivo.md` | Qualquer item que possa ter IS (bebidas, fumo, veículos, embarcações, aeronaves, minerais, apostas etc.). |
| `reference/simples-atividades.md` | Operações de optantes do Simples Nacional (cAtivSN, anexo, Fator R, tpDoc). |
| `reference/erros.md` | O usuário trouxe um código REG-, CAL-, VAL- ou VSN-. |
| `reference/exemplos.md` | Montar o JSON de entrada da Calculadora ou explicar a resposta. |

## Fluxo de trabalho

### 1. Entender a operação
Antes de classificar, garanta que você sabe:
- **O que é**: bem (tem NCM, 8 dígitos) ou serviço (tem NBS, 9 dígitos). Um item tem NCM **ou** NBS, nunca os dois (REG-001/VSN-041).
- **Quem vende e quem compra**: contribuinte do regime regular ou optante do Simples; destinatário consumidor final, contribuinte, órgão público, entidade imune etc.
- **Documento**: NF-e (55), NFC-e (65), NFS-e (91), CT-e (57), CT-e OS (67), BP-e (63), NF3-e (66), NFCom (62) etc.
- **Data do fato gerador**: ela define a tabela vigente e as alíquotas (veja o passo 4).
- **Local**: UF e município (código IBGE de 7 dígitos) do destino da operação.

Se faltar algo que muda a classificação, pergunte. Não chute.

### 2. Escolher CST e cClassTrib
1. Parta da regra geral: **CST 000 / cClassTrib 000001** (tributação integral). Só saia dela se houver um tratamento diferenciado previsto em lei para aquele bem, serviço ou destinatário.
2. Procure em `reference/cst-cclasstrib.md` o tratamento que se aplica: alíquota reduzida (CST 200), alíquota zero (200 com redução de 100%), isenção (400), imunidade e não incidência (410), diferimento (510), suspensão (550), monofasia (620), crédito presumido etc.
3. Confira em cada candidata:
   - **Nomenclatura**: exige NCM, NBS ou qualquer um?
   - **DF-e**: a classificação é aceita no documento do usuário? Se não for, dá REG-029.
   - **Fundamentação**: o artigo da LC 214/2025 descreve de fato a operação?
   - Indicadores como "exige grupo de desoneração" e "incompatível com suspensão".
4. Se a classificação tiver anexo, ela aparece em `reference/vinculos-ncm-nbs.md`. Confira se o NCM/NBS do item começa por um dos prefixos listados e não cai numa exceção. Se não estiver na lista, a classificação **não serve** (REG-011/REG-012) mesmo que a descrição pareça encaixar. Classificações com anexo exigem o código **completo** (REG-015/REG-016).
5. Apresente a escolha com: CST, cClassTrib, descrição, percentual de redução de CBS, IBS UF e IBS Mun, artigo da lei e o motivo de ter descartado as alternativas próximas. Se houver mais de uma leitura possível, mostre as duas e diga o que decide entre elas.

### 3. Verificar o Imposto Seletivo
O IS vale a partir de 2027. Se o NCM/NBS do item aparecer em `reference/imposto-seletivo.md`, o item precisa do grupo `impostoSeletivo` (REG-013 se faltar), e o documento precisa admitir IS (REG-032). Antes de 2027 o grupo não deve ser informado (REG-014). Quando há IS, a base de CBS/IBS é a base do IS somada ao valor do IS (REG-026/REG-027 se não bater).

### 4. Alíquotas por período
- **2026 (ano de teste)**: CBS de 0,9% e IBS de 0,1% (UF), aplicados pela própria Calculadora. Os campos `aliquotasNominais` são **proibidos** (REG-036).
- **A partir de 2027**: a Calculadora não tem alíquotas cadastradas. `aliquotasNominais` {`cbs`, `ibsEstadual`, `ibsMunicipal`} é **obrigatório** em cada item (REG-037), e o resultado sai como `CALCULO_SIMULADO`. Peça as alíquotas ao usuário ou use as que ele indicar. Se ele não souber, deixe claro que qualquer número usado é uma hipótese, e diga qual.
- A redução se aplica sobre a alíquota: alíquota efetiva = alíquota × (1 − redução). Exemplo oficial: CBS de 8,8% com redução de 60% dá 3,52%, e o valor é base × 3,52%.

### 5. Calcular
Para cada item: base de cálculo × alíquota efetiva de CBS, IBS UF e IBS Mun, arredondando a 2 casas. Mostre a memória de cálculo linha a linha. Some os totais apenas dos itens válidos. Itens com erro de entrada não entram no total.

Para a **base de cálculo** a partir dos campos da NF-e (vProd, vFrete, vSeg, vOutro, vDesc, vIS, vICMS, vFCP, vPIS, vCOFINS), lembre que cada componente tem vigência própria. Em 2027, PIS e COFINS deixam de compor a base, enquanto ICMS e FCP ainda são deduzidos. Veja o exemplo em `reference/exemplos.md`.

### 6. Simples Nacional
- Identifique a atividade (cAtivSN) em `reference/simples-atividades.md`, o anexo e se o Fator R se aplica.
- O usuário precisa informar os percentuais efetivos **pCBSSN** e **pIBSSN** de cada anexo usado (vindos do PGDAS-D), além de `fatorR` e `impedimentoSublimite`. Nos anexos III a V, peça também o par `semRedistribuicaoISS` quando houver ISS.
- Na NFS-e (tpDoc 91) há exatamente 1 item e os campos `opSimpNac`, `regApIBSCBSSN` e `regApTribSN`.
- Erros VSN-xxx estão em `reference/erros.md`.

### 7. Diagnosticar erros
Quando o usuário trouxer um erro:
1. Procure o código em `reference/erros.md` e leia o `estadoItem`:
   - `INCONSISTENCIA_ENTRADA`: o dado enviado está errado. Diga qual campo corrigir e como.
   - `NAO_IMPLEMENTADO`: a classificação existe, mas a Calculadora ainda não a calcula. Não é erro do usuário.
   - `FALHA_TECNICA`: o problema está na base ou na Calculadora.
2. Use o `pointer` do erro (ex.: `#/itens/3/ncm`) para achar o item. Lembre que o índice começa em 0.
3. Para os erros mais comuns, confira:
   - **REG-011/REG-012**: NCM/NBS fora do anexo da cClassTrib. Proponha a classificação correta ou volte para a 000001.
   - **REG-006**: o cClassTrib não pertence ao CST informado. Os 3 primeiros dígitos do cClassTrib são o CST.
   - **REG-029**: a classificação não é aceita naquele tipo de documento.
   - **REG-036/REG-037**: `aliquotasNominais` informada antes de 2027 ou ausente a partir de 2027.

### 8. JSON e XML
Para montar o JSON da Calculadora ou explicar a resposta, siga o formato de `reference/exemplos.md`:
- A resposta da observabilidade é HTTP 200 mesmo com itens em erro. Verifique sempre o `estadoItem` de cada item.
- O grupo do XML segue a estrutura de `tribCalc.IBSCBS` da resposta:
  - `gIBSCBS` com `vBC`;
  - `gIBSUF`, `gIBSMun` e `gCBS`, cada um com a alíquota e, havendo redução, o `gRed` com `pRedAliq` e `pAliqEfet`;
  - os valores do imposto.
- Valores são texto com 2 casas decimais.

## Ferramentas opcionais

Se o agente do usuário tiver o servidor MCP **calculadora-rtc** conectado (ferramentas `rtc_*`), prefira as ferramentas às contas na mão. Ele existe em duas versões:

- **Remota** (hospedada, sem instalar nada): só consultas e DANFSe.
  - `rtc_buscar_classificacoes`, `rtc_consultar_classificacao`, `rtc_validar_nomenclatura` e `rtc_consultar_nomenclatura`: classificações e anexos de NCM/NBS;
  - `rtc_explicar_erro`, `rtc_atividades_simples` e `rtc_municipio`;
  - `rtc_gerar_danfse`: devolve um link para o PDF que vale 1 hora. O XML não é guardado.
- **Local** (APIs oficiais rodando na máquina do usuário): tudo o que a remota faz, mais:
  - `rtc_calcular_regime_geral` e `rtc_calcular_simples_nacional`: calculam;
  - `rtc_gerar_xml` e `rtc_validar_xml`: geram e validam o XML contra o XSD oficial.

Se uma ferramenta de cálculo ou de XML não estiver disponível, o usuário está na versão remota. Nesse caso, faça a conta na mão seguindo esta skill. Sem nenhuma das duas versões, a skill funciona só com os arquivos de referência. Nunca peça ao usuário para instalar nada sem que ele queira.

## Estilo das respostas

- Responda em português do Brasil, com os nomes oficiais dos campos (`cClassTrib`, `pRedAliq`, `vBC`).
- Comece pela resposta (o código, o valor, a correção) e depois mostre o porquê.
- Cite o artigo da LC 214/2025 que está na fundamentação da classificação.
- Em cálculos, mostre a memória: base, alíquota, redução, alíquota efetiva, valor.
- Quando a resposta depender de um fato que você não tem (destinatário, data, regime), diga qual é e o que muda em cada caso.
