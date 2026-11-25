# Códigos de erro da Calculadora RTC

> Gerado de Nova tabela de Classificações Tributárias (IT 2025.002 v.1.71), publicada em 30/10/2026. (base V0073, calculadora 1.7.2), vigência consultada em 2027-01-01. Fonte: dados abertos da Calculadora RTC (Receita Federal, licença MIT).

`estadoItem` diz o que fazer: **INCONSISTENCIA_ENTRADA** = corrigir os dados enviados; **NAO_IMPLEMENTADO** = a classificação ainda não é calculada pela Calculadora (não é erro do usuário); **FALHA_TECNICA** = problema na base ou na Calculadora, não nos dados.

## REG — regras de entrada (regime regular)

| Código | Erro | Campo | Estado | Significado |
|---|---|---|---|---|
| REG-001 | NCM e NBS informadas simultaneamente |  | INCONSISTENCIA_ENTRADA | Apenas uma nomenclatura (NCM ou NBS) deve ser informada por item. A presença simultânea impede a classificação. |
| REG-002 | NCM não encontrada | ncm | INCONSISTENCIA_ENTRADA | O código NCM informado não foi localizado na base de nomenclaturas vigente para a data do fato gerador. |
| REG-003 | NBS não encontrada | nbs | INCONSISTENCIA_ENTRADA | O código NBS informado não foi localizado na base de nomenclaturas vigente para a data do fato gerador. |
| REG-004 | Situação tributária não encontrada | cst | INCONSISTENCIA_ENTRADA | A situação tributária (CST) informada não existe na base de dados para o tributo e data do fato gerador. |
| REG-005 | Classificação tributária não encontrada | cClassTrib | INCONSISTENCIA_ENTRADA | A classificação tributária informada não foi localizada na base vigente para a data do fato gerador. |
| REG-006 | Classificação tributária não vinculada à situação tributária | cClassTrib | INCONSISTENCIA_ENTRADA | A classificação tributária informada não está vinculada à situação tributária selecionada. |
| REG-007 | Erro de nomenclatura | ncm | INCONSISTENCIA_ENTRADA | A nomenclatura informada apresenta inconsistência com as regras de classificação tributária vigentes. |
| REG-008 | Tratamento de classificação não encontrado | cClassTrib | INCONSISTENCIA_ENTRADA | Não foi encontrado tratamento de classificação tributária para os parâmetros informados. |
| REG-009 | Grupo de tributação regular não informado | tributacaoRegular | INCONSISTENCIA_ENTRADA | O grupo de tributação regular é obrigatório para a situação tributária selecionada e não foi informado. |
| REG-010 | Incompatibilidade com suspensão | tributacaoRegular/cClassTrib | INCONSISTENCIA_ENTRADA | A classificação tributária informada é incompatível com a situação de suspensão aplicada ao item. |
| REG-011 | NCM não vinculada | ncm | INCONSISTENCIA_ENTRADA | O código NCM informado não está vinculado a nenhuma classificação tributária vigente. |
| REG-012 | NBS não vinculada | nbs | INCONSISTENCIA_ENTRADA | O código NBS informado não está vinculado a nenhuma classificação tributária vigente. |
| REG-013 | Dados do Imposto Seletivo não informados | impostoSeletivo | INCONSISTENCIA_ENTRADA | Os dados do Imposto Seletivo são obrigatórios para a classificação tributária selecionada e não foram informados. |
| REG-014 | Dados do Imposto Seletivo informados indevidamente | impostoSeletivo | INCONSISTENCIA_ENTRADA | Os dados do Imposto Seletivo foram informados, mas a classificação tributária selecionada não prevê incidência. |
| REG-015 | NCM completo não informado | ncm | INCONSISTENCIA_ENTRADA | O código NCM deve ser informado com todos os dígitos (completo) para a operação solicitada. |
| REG-016 | NBS completo não informado | nbs | INCONSISTENCIA_ENTRADA | O código NBS deve ser informado com todos os dígitos (completo) para a operação solicitada. |
| REG-018 | Município não pertencente à UF |  | INCONSISTENCIA_ENTRADA | O município informado não pertence à UF indicada na operação. |
| REG-019 | Município não encontrado |  | INCONSISTENCIA_ENTRADA | O código do município informado não foi localizado na base de dados. |
| REG-020 | UF não encontrada |  | INCONSISTENCIA_ENTRADA | A UF informada para a operação não foi encontrada na base de dados. |
| REG-021 | Data do fato gerador não informada |  | INCONSISTENCIA_ENTRADA | A data do fato gerador é obrigatória e não foi informada na requisição. |
| REG-022 | Grupo de tributação regular informado indevidamente | tributacaoRegular | INCONSISTENCIA_ENTRADA | O grupo de tributação regular foi informado, mas a situação tributária selecionada não o exige. |
| REG-023 | Erro genérico de validação |  | INCONSISTENCIA_ENTRADA | Erro de validação que não se enquadra em nenhuma categoria específica. |
| REG-024 | Campo inválido |  | INCONSISTENCIA_ENTRADA | O valor informado para o campo não é válido conforme as regras de negócio. |
| REG-025 | Base de cálculo não informada | baseCalculo | INCONSISTENCIA_ENTRADA | A base de cálculo de CBS e IBS é obrigatória quando o grupo do Imposto Seletivo não é informado. |
| REG-026 | Base de cálculo inconsistente | baseCalculo | INCONSISTENCIA_ENTRADA | A base de cálculo de CBS e IBS informada difere da soma da base de cálculo do Imposto Seletivo com o Imposto Seletivo informado. |
| REG-027 | Base de cálculo menor que a base de cálculo do Imposto Seletivo | baseCalculo | INCONSISTENCIA_ENTRADA | A base de cálculo de CBS e IBS informada é menor que a base de cálculo do Imposto Seletivo. |
| REG-028 | Tipo de documento fiscal não encontrado | tpDoc | INCONSISTENCIA_ENTRADA | O tipo de documento fiscal (tpDoc) informado na operação não existe ou está fora de vigência na data do fato gerador. |
| REG-029 | Classificação tributária não vinculada ao tipo de documento | cClassTrib | INCONSISTENCIA_ENTRADA | A classificação tributária informada não possui vínculo vigente com o tipo de documento fiscal (tpDoc) da operação. |
| REG-030 | Nomenclatura incompatível com o tipo de documento |  | INCONSISTENCIA_ENTRADA | A nomenclatura informada (NCM ou NBS) não é aceita para a classificação tributária no tipo de documento fiscal (tpDoc) da operação. |
| REG-031 | Nomenclatura não permitida para o tipo de documento |  | INCONSISTENCIA_ENTRADA | O tipo de documento fiscal (tpDoc) da operação não admite o preenchimento de NCM ou NBS. |
| REG-032 | Imposto Seletivo não admitido pelo tipo de documento | impostoSeletivo | INCONSISTENCIA_ENTRADA | O NCM/NBS informado é tributado pelo Imposto Seletivo, mas o tipo de documento fiscal (tpDoc) da operação não admite Imposto Seletivo. |
| REG-033 | Nomenclatura obrigatória não informada |  | INCONSISTENCIA_ENTRADA | A classificação tributária possui anexo com NCM e NBS aplicáveis e exige o preenchimento de um deles, completo, para o tipo de documento fiscal (tpDoc) da operação. |
| REG-034 | Base de cálculo inconsistente | baseCalculo | INCONSISTENCIA_ENTRADA | A base de cálculo declarada no item diverge da base calculada a partir dos componentes informados |
| REG-035 | Alíquota do Imposto Seletivo não informada | aliquotasNominais/impostoSeletivo | INCONSISTENCIA_ENTRADA | A NCM/NBS possui incidência do Imposto Seletivo, mas a alíquota ainda não foi definida em lei e não foi informada pelo usuário. |
| REG-036 | Alíquotas nominais informadas indevidamente | aliquotasNominais | INCONSISTENCIA_ENTRADA | As alíquotas nominais não podem ser informadas para fato gerador anterior a 01/01/2027, pois a calculadora resolve as alíquotas vigentes. |
| REG-037 | Alíquotas nominais não informadas | aliquotasNominais | INCONSISTENCIA_ENTRADA | As alíquotas nominais (cbs, ibsEstadual e ibsMunicipal) devem ser informadas para fato gerador a partir de 01/01/2027. |
| REG-038 | Tipo de documento fiscal não tratado | tpDoc | INCONSISTENCIA_ENTRADA | O tipo de documento fiscal (tpDoc) informado na operação não possui tratamento implementado na calculadora. |

## CAL — cálculo (regime regular)

| Código | Erro | Campo | Estado | Significado |
|---|---|---|---|---|
| CAL-001 | Alíquota não encontrada |  | FALHA_TECNICA | Não foi possível localizar a alíquota aplicável para os parâmetros tributários informados. |
| CAL-002 | Alíquota padrão não encontrada |  | FALHA_TECNICA | A alíquota padrão (de referência) não foi encontrada na base para o tributo e período informados. |
| CAL-003 | Alíquota de referência não encontrada |  | FALHA_TECNICA | A alíquota de referência necessária para o cálculo não está disponível na base de dados. |
| CAL-004 | Alíquota ad rem não encontrada |  | FALHA_TECNICA | A alíquota ad rem (valor fixo por unidade) não foi localizada para o produto e período informados. |
| CAL-005 | Alíquota negativa |  | FALHA_TECNICA | O cálculo resultou em uma alíquota negativa, o que indica inconsistência nos parâmetros tributários. |
| CAL-006 | Tipo de alíquota desconhecido |  | FALHA_TECNICA | O tipo de alíquota retornado pela base de dados não é reconhecido pelo sistema. |
| CAL-007 | Classificação tributária em desenvolvimento | cClassTrib | NAO_IMPLEMENTADO | A classificação tributária informada ainda não possui implementação completa no sistema. |
| CAL-008 | Erro no avaliador de expressão aritmética |  | FALHA_TECNICA | Ocorreu um erro ao avaliar a expressão aritmética utilizada no cálculo do tributo. |
| CAL-009 | Tratamento tributário não encontrado |  | FALHA_TECNICA | O tratamento tributário aplicável não foi localizado para a combinação de parâmetros informada. |
| CAL-010 | Percentual de redução não encontrado |  | FALHA_TECNICA | O percentual de redução de alíquota previsto para a classificação não foi encontrado na base. |
| CAL-011 | Fundamentação não encontrada |  | FALHA_TECNICA | A fundamentação legal para a classificação tributária não foi localizada na base de dados. |
| CAL-012 | Tributo/situação tributária não encontrado |  | FALHA_TECNICA | A combinação de tributo e situação tributária informada não foi localizada na base. |
| CAL-999 | Erro interno do sistema |  | FALHA_TECNICA | Erro interno inesperado durante o processamento do cálculo. Contate o suporte se o problema persistir. |

## VSN — Simples Nacional

| Código | Erro | Significado |
|---|---|---|
| VSN-000 | Erro de validação não categorizado | O tipo de validação aplicado não possui uma categoria específica. |
| VSN-001 | Base de cálculo do Simples ausente | A base de cálculo do Simples Nacional é obrigatória e não foi informada. |
| VSN-002 | Base de cálculo do Simples inválida (negativa/fora do formato) | A base de cálculo informada é negativa ou não está no formato 13v2 (até 13 dígitos inteiros e até 2 casas decimais, sem notação científica). |
| VSN-003 | Valor do Imposto Seletivo inválido (negativo/fora do formato) | O valor do Imposto Seletivo (vIS) informado é negativo ou não está no formato 13v2 (até 13 dígitos inteiros e até 2 casas decimais, sem notação científica). |
| VSN-004 | Alíquota pCBSSN ausente | A alíquota efetiva de CBS do Simples Nacional (pCBSSN) é exigida para o cálculo do item e não foi informada. |
| VSN-005 | Alíquota pCBSSN inválida (negativa/fora do formato) | A alíquota efetiva de CBS do Simples Nacional (pCBSSN) informada é negativa ou não está no formato aceito (até 3 dígitos inteiros e até 34 casas decimais, sem notação científica). |
| VSN-006 | Alíquota pIBSSN ausente | A alíquota efetiva de IBS do Simples Nacional (pIBSSN) é exigida para o cálculo do item e não foi informada. |
| VSN-007 | Alíquota pIBSSN inválida (negativa/fora do formato) | A alíquota efetiva de IBS do Simples Nacional (pIBSSN) informada é negativa ou não está no formato aceito (até 3 dígitos inteiros e até 34 casas decimais, sem notação científica). |
| VSN-010 | Número do item ausente | O número (identificador) do item é obrigatório e não foi informado. |
| VSN-011 | Lista de itens vazia | A lista de itens da operação é obrigatória e não pode estar vazia. |
| VSN-012 | Data do fato gerador ausente/inválida | A data do fato gerador é obrigatória e deve estar no formato de data (YYYY-MM-DD). |
| VSN-013 | Dado global obrigatório ausente | Um campo global obrigatório da operação (id ou versao) não foi informado. |
| VSN-014 | Tipo de documento fiscal (tpDoc) ausente | O tipo de documento fiscal (tpDoc) é obrigatório e não foi informado. |
| VSN-015 | Tipo de documento fiscal (tpDoc) não suportado | O tipo de documento fiscal (tpDoc) informado não está habilitado para o cálculo do Simples Nacional na data do fato gerador. A habilitação de documentos é parametrizada em banco de dados (tabela de tipos de DFe do cálculo do Simples), conforme as NTs publicadas. |
| VSN-016 | Código de Regime Tributário (CRT) ausente/inválido | O Código de Regime Tributário (CRT) é obrigatório e deve ser 1, 2, 3 ou 4. |
| VSN-017 | Tipo de regime do IBS/CBS (tpRegimeIBSCBS) inválido | O tipo de regime de apuração do IBS/CBS (tpRegimeIBSCBS), quando informado, deve ser 1 ou 2. |
| VSN-018 | tpRegimeIBSCBS incompatível com o CRT | A combinação de CRT e tpRegimeIBSCBS informada é incoerente (regras C21a-10/20/30 da NT 2026.005): CRT 1, 2 ou 4 não admite tpRegimeIBSCBS=2; CRT 3 não admite tpRegimeIBSCBS=1; CRT 4 não admite tpRegimeIBSCBS algum. |
| VSN-019 | Operação fora do escopo do cálculo do Simples Nacional | A operação não é calculada por este endpoint: optante pelo regime regular do IBS/CBS (tpRegimeIBSCBS=1), MEI (CRT=4) ou regime normal puro (CRT=3 sem tpRegimeIBSCBS=2). |
| VSN-020 | Código de Classificação Tributária (cClassTrib) ausente | O código de classificação tributária do IBS/CBS (cClassTrib) é obrigatório e não foi informado. |
| VSN-021 | cClassTrib desconhecido ou fora de vigência | O cClassTrib informado não existe ou não está vigente na data do fato gerador: o Tipo de Receita Bruta do Simples Nacional (tpRBSN) não pôde ser determinado. |
| VSN-022 | cClassTrib incompatível com o tpDoc | O cClassTrib informado não é admissível para o tipo de documento fiscal (tpDoc) da operação. |
| VSN-023 | Código de Atividade do Simples Nacional incompatível com cClassTrib | O código de atividade cAtivSN='90' (Operações não Tributáveis) é incompatível com cClassTrib cujo tpRBSN esteja entre 1 e 5 (regra UB14-90 da NT 2026.005). |
| VSN-024 | Tipo de ente governamental (tpEnteGov) inválido | O tipo de ente governamental (tpEnteGov), quando informado, deve ser 1 (União), 2 (Estado), 3 (Distrito Federal) ou 4 (Município). O campo é da operação — espelha a tag gCompraGov/tpEnteGov da identificação da nota (grupo B/ide do leiaute do DF-e) — e sua invalidade rejeita a operação inteira. |
| VSN-025 | Parametrização de compra governamental indisponível para a data | A data do fato gerador está fora de todas as vigências do parâmetro de transição de alíquotas de compra governamental do Simples Nacional (NT 2026.005, seção 5.3.3; arts. 372 e 473 da LC 214/2025). Como o tpEnteGov é dado da operação, a falha rejeita a operação inteira. |
| VSN-026 | Parametrização do cálculo do Simples Nacional indisponível para a data | Não há linha vigente, na data do fato gerador, em uma tabela de parametrização do cálculo do Simples Nacional (efeito do tipo de receita bruta ou matriz de regime de apuração). O cálculo nunca assume comportamento implícito: a parametrização deve ser corrigida por script de migração. |
| VSN-027 | cClassTrib sem tratamento implementado no cálculo do Simples Nacional | A classificação tributária (cClassTrib) informada está vinculada, na data do fato gerador, a tratamento tributário marcado como ainda não implementado na Calculadora (indicador de ajuste do tratamento tributário). O item é reportado com o estado NAO_IMPLEMENTADO, sem cálculo e fora dos totais; a funcionalidade está prevista no roadmap e será disponibilizada em versão futura. |
| VSN-028 | Identificação do contribuinte (niContribuinte) ausente ou inválida | A identificação do contribuinte emitente (niContribuinte) é obrigatória no cálculo assistido e deve ser um CNPJ alfanumérico válido: 14 caracteres (12 caracteres [A-Z0-9] e 2 dígitos verificadores), aceito com ou sem máscara. É por ela e pelo período de apuração da data do fato gerador que as alíquotas efetivas são obtidas na Tabela de Alíquotas Efetivas do Simples Nacional (NT 2026.005, seção 5.3.3). A falha rejeita a operação inteira. |
| VSN-029 | Alíquotas efetivas do Simples Nacional indisponíveis para o contribuinte no período de apuração | Não há registro na Tabela de Alíquotas Efetivas do Simples Nacional para o contribuinte (niContribuinte) no período de apuração (AAAAMM) derivado da data do fato gerador. Sem as alíquotas efetivas o cálculo assistido não pode ser realizado; a operação inteira é rejeitada. Alternativa: o endpoint clássico, informando as alíquotas por item. |
| VSN-030 | Situação perante o Simples Nacional (opSimpNac) ausente ou inválida | Na NFS-e, a situação do prestador perante o Simples Nacional (opSimpNac, DPS prest/regTrib) é obrigatória e deve ser 1 (não optante), 2 (MEI), 3 (ME/EPP) ou 4 (opção pendente). |
| VSN-031 | Regime de apuração do IBS e da CBS no Simples (regApIBSCBSSN) incoerente ou inválido | O regApIBSCBSSN (DPS prest/regTrib) deve ser 1 (IBS e CBS pelo Simples), 2 (CBS pelo Simples e IBS pelo regime regular) ou 3 (os dois pelo regime regular). É obrigatório com opSimpNac 3 ou 4 (regra 313 da NFS-e) e não pode ser informado com opSimpNac 1 ou 2. |
| VSN-032 | Regime de apuração dos tributos no Simples (regApTribSN) incoerente ou inválido | O regApTribSN (DPS prest/regTrib) deve ser 1 (tributos federais e ISS pelo Simples), 2 (federais pelo Simples e ISS fora dele) ou 3 (federais e ISS fora). É obrigatório com opSimpNac 3 ou 4 (regra E0166, estendida pela NT 009) e não pode ser informado com opSimpNac 1 ou 2 (E0162). |
| VSN-033 | Campo de regime não pertence ao documento | O regime do emitente é informado no vocabulário do próprio documento: CRT e tpRegimeIBSCBS nos documentos com CRT (NF-e, NFC-e, CT-e, CT-e OS, BP-e, BP-e TM e NFCom); opSimpNac, regApIBSCBSSN e regApTribSN na NFS-e. Campo do outro vocabulário não pode ser informado. |
| VSN-034 | Número de itens não admitido pelo documento | O documento admite um número máximo de itens (parametrizado em banco). A NFS-e tem exatamente 1 item: a DPS tem um só serviço, com um cTribNac e um cClassTrib. |
| VSN-035 | Imposto Seletivo não admitido pelo documento | O documento não tem Imposto Seletivo (NFS-e): o valorImpostoSeletivo deve estar ausente ou ser zero. |
| VSN-036 | Tributação do ISSQN (tribISSQN) ausente ou inválida | Na NFS-e, a tributação do ISSQN (tribISSQN) é obrigatória quando a atividade tem ISS no Simples e o regime calcula tributos, e deve ser 1 (operação tributável), 2 (imunidade), 3 (exportação de serviço) ou 4 (não incidência). |
| VSN-037 | Retenção do ISSQN (tpRetISSQN) ausente ou inválida | Na NFS-e, o tipo de retenção do ISSQN (tpRetISSQN) é obrigatório quando tribISSQN = 1, nas atividades com ISS no Simples, e deve ser 1 (não retido), 2 (retido pelo tomador) ou 3 (retido pelo intermediário). |
| VSN-038 | Tipo de benefício municipal (tpBM) inválido | Na NFS-e, o tipo de benefício municipal do ISS (tpBM), quando informado, deve ser 1 (isenção), 2 (redução da base em %), 3 (redução da base em R$) ou 4 (alíquota diferenciada). Ausente = sem benefício municipal. |
| VSN-039 | Alíquotas efetivas do contribuinte (aliquotasEfetivas) ausentes | No cálculo não assistido, a linha de alíquotas efetivas do contribuinte no período (aliquotasEfetivas) é obrigatória, exceto quando o regime não calcula tributos (SOMENTE_RECEITA). A falha rejeita a operação inteira. |
| VSN-040 | Fator "r" (fatorR) ausente | O fatorR da linha de alíquotas é exigido quando o item tem atividade sujeita ao fator "r" (a 09): é ele que decide entre o Anexo III (fator r igual ou superior a 28%) e o Anexo V. |
| VSN-041 | NCM e NBS simultâneos | Informe NCM ou NBS, nunca ambos. |
| VSN-042 | NCM incompleto | A classificação tributária exige um NCM completo com 8 caracteres. |
| VSN-043 | NBS incompleto | A classificação tributária exige um NBS completo com 9 caracteres. |
| VSN-044 | Nomenclatura obrigatória | Informe NCM ou NBS completo conforme exigido pela classificação tributária. |
| VSN-045 | Nomenclatura incompatível com o documento | A nomenclatura informada é incompatível com o tipo de documento fiscal ou a classificação tributária. |
| VSN-046 | Nomenclatura não permitida | A nomenclatura informada não é permitida para o tipo de documento fiscal. |
| VSN-047 | NCM não aplicável | O NCM informado não está vinculado à classificação tributária. |
| VSN-048 | NBS não aplicável | O NBS informado não está vinculado à classificação tributária. |
| VSN-049 | NCM desconhecido | O NCM informado não existe ou não está vigente na data. |
| VSN-050 | NBS desconhecido | O NBS informado não existe ou não está vigente na data. |
| VSN-051 | Formato de nomenclatura inválido | NCM deve conter 8 ou NBS deve conter 9 dígitos ASCII, sem espaços ou símbolos. |
| VSN-999 | Falha técnica no cálculo do item | Ocorreu uma falha técnica inesperada durante o cálculo do item. |
