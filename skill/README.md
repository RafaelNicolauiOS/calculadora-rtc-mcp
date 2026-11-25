# Skills para escritórios de contabilidade

Cada pasta é uma skill no padrão SKILL.md: uma pasta com `SKILL.md` na raiz e arquivos de apoio opcionais.

Para gerar os pacotes do Agensi (zips git-ignorados), rode:

```bash
node scripts/empacotar-skills.mjs
```

O script também valida o frontmatter e procura o que a verificação de segurança do Agensi sinaliza (URLs, blocos parecidos com base64).

As referências das skills de Reforma Tributária vêm da base oficial da Calculadora RTC. Para regenerá-las:

```bash
node scripts/build-skill.mjs
```

## Catálogo

| Área | Skill | Usa dados oficiais |
|---|---|---|
| Reforma Tributária | `reforma-tributaria-ibs-cbs` (publicada) | sim |
| Reforma Tributária | `classificador-cadastro-produtos` | sim |
| Reforma Tributária | `revisor-notas-rejeitadas` | sim |
| Reforma Tributária | `simulador-transicao-reforma` | sim |
| Reforma Tributária | `simples-nacional-reforma` | sim |
| Reforma Tributária | `creditos-ibs-cbs` | sim |
| Fiscal | `conferencia-sped-efd` | — |
| Fiscal | `conciliacao-nfe-entradas` | — |
| Fiscal | `agenda-obrigacoes-acessorias` | — |
| Fiscal | `iss-retencao` | — |
| Contábil | `conciliacao-bancaria` (com o script `ofx_para_csv.py`) | — |
| Contábil | `classificador-lancamentos` | — |
| Contábil | `fechamento-mensal` | — |
| Contábil | `relatorio-gerencial-cliente` | — |
| Departamento pessoal | `conferencia-folha` | — |
| Departamento pessoal | `esocial-eventos-rejeitados` | — |
| Departamento pessoal | `calculo-rescisao` | — |
| Societário | `escolha-regime-tributario` | — |
| Societário | `abertura-alteracao-empresa` | — |
| Societário | `fator-r-pro-labore` | — |
| Atendimento | `atendimento-clientes-contabilidade` | — |
| Atendimento | `proposta-honorarios` | — |
| Atendimento | `onboarding-cliente` | — |
| Design (pequenos negócios) | `design-sites-pmes` | — |

## Princípio comum

As skills sem dados oficiais ensinam o método e as regras estáveis da lei. Valores que mudam com frequência ficam de fora: tabelas de INSS e IRRF, salário mínimo, tabelas do Simples, alíquotas municipais e datas de vencimento. Nesses casos, a skill pede ao usuário os valores vigentes ou marca o dado como "confirmar". Isso evita que o agente apresente números desatualizados como certos.

Antes de publicar uma skill paga, rode os testes do `skill-creator` com 2 ou 3 pedidos reais de escritório e compare as respostas com e sem a skill.
