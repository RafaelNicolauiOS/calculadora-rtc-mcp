# MCP remoto de consulta da Calculadora RTC (Cloudflare Workers)

Data: 2026-11-24 · Branch: `mcp-remoto` (a partir de `skill-agensi`)

## Objetivo

Hoje o MCP `calculadora-rtc` só funciona na máquina de quem roda as APIs Java em localhost. O objetivo é publicar um MCP **remoto e aberto** que qualquer agente possa conectar só com uma URL. Ele cobre:
- as consultas (classificações, anexos NCM/NBS, Imposto Seletivo, Simples Nacional, erros, municípios);
- a geração do DANFSe.

O MCP funciona como porta de entrada gratuita para as skills pagas no Agensi. A skill `reforma-tributaria-ibs-cbs` já cita as ferramentas `rtc_*` como opcionais. Por isso os nomes e parâmetros são mantidos.

### Fora do escopo (v1)

- Cálculo de CBS/IBS/IS e geração ou validação de XML. Dependem das APIs Java e continuam só no MCP local.
- Login, chave de API, cobrança e qualquer armazenamento de dados do usuário além do PDF temporário.
- Alterações no `mcp-server/` local.

## Decisões

| Tema | Decisão | Motivo |
|---|---|---|
| Hospedagem | Cloudflare Workers, plano pago (US$ 5/mês) | O WASM do DANFSe tem 7,7 MB comprimido, e o plano gratuito limita o Worker a 3 MB |
| Acesso | Aberto, com limite por IP | São dados públicos; o MCP é isca e não deve ter atrito |
| DANFSe | Incluído na v1, num Worker separado | As consultas ficam leves; o custo de carregar o WASM fica isolado |
| Entrega do PDF | Link temporário de 1 h no R2 | Funciona em qualquer cliente MCP |
| Estrutura de código | Pacote novo `mcp-remote/`; o `mcp-server/` não muda | Não mistura dependências de Node e do Worker nem mexe no que funciona |
| Transporte | Streamable HTTP sem estado (`WebStandardStreamableHTTPServerTransport`, `sessionIdGenerator: undefined`) | Nenhuma ferramenta precisa de sessão; dispensa Durable Objects |

## Arquitetura

```
cliente MCP ──HTTPS──▶ Worker calculadora-rtc-mcp ──service binding──▶ Worker calculadora-rtc-danfse
                         │  POST /mcp     (MCP)                            (WASM oficial do gerador)
                         │  GET  /        (como conectar)
                         │  GET  /privacidade
                         │  GET  /pdf/:id (download, ≤ 1 h)
                         │  cron horário  (apaga PDFs com mais de 1 h)
                         ├─ Rate Limiting binding (60 req/min por IP)
                         └─ R2 bucket calculadora-rtc-danfse-pdf
```

### Estrutura de arquivos

```
mcp-remote/
  package.json            dependências: @modelcontextprotocol/sdk, zod; dev: wrangler, vitest, @cloudflare/vitest-pool-workers, typescript
  wrangler.toml           Worker MCP: bindings RATE_LIMITER, PDFS (R2), DANFSE (service), cron "0 * * * *"
  src/
    index.ts              fetch/scheduled: roteamento, limite por IP, páginas, /pdf/:id, limpeza do R2
    server.ts             cria o McpServer e registra as ferramentas (uma instância por requisição)
    tools.ts              definição das ferramentas (schemas zod + handlers finos)
    dados.ts              carrega os JSON embutidos e monta os índices (por código, por CST, NCM/NBS → classes)
    nomenclatura.ts       regra de aceitação de NCM/NBS contra o anexo (porta do NcmAplicavelService)
    busca.ts              busca textual sem acentos em descrições de classificações e nomenclaturas
    paginas.ts            HTML de / e /privacidade
  danfse/
    wrangler.toml         Worker DANFSe: sem rota pública, só alcançável por service binding
    src/index.ts          carrega danfse.wasm (import de módulo) + wasm_exec.js; POST com o XML devolve o PDF
  test/
    *.test.ts             testes unitários (vitest-pool-workers)
    paridade.mjs          compara rtc_validar_nomenclatura com a API oficial (roda no CI)
scripts/
  lib/erros.mjs           extração dos catálogos de erro (movida de build-skill.mjs; usada por ele e pelo export)
```

## Dados

- Fonte: os arquivos de `site/data/` que o CI já gera com `scripts/export-site-data.mjs`. São eles: `classificacoes-<data>.json`, `situacoes-<data>.json`, `imposto-seletivo-<data>.json`, `vinculos-nomenclatura.json` (com `vinculos` e `vinculosIs`), `ncm.json`, `nbs.json`, `localidades.json`, `simples-atividades.json` e `meta.json`.
- Novo: o `export-site-data.mjs` passa a gravar `erros.json` (`[{codigo, titulo, campo, estado, descricao}]`) usando `scripts/lib/erros.mjs`. O `build-skill.mjs` passa a usar o mesmo módulo.
- O Worker importa os JSON da data mais recente (`meta.dataNomenclatura`) em tempo de build. O wrangler embute os arquivos, então não há leitura em tempo de execução. Tamanho estimado: ~1,2 MB sem compressão.
- Os índices são montados uma vez por isolate, em escopo de módulo e de forma preguiçosa.
- A data da base sempre aparece nas respostas de `rtc_status` e de `rtc_consultar_classificacao`.

## Ferramentas

Todas são somente leitura, exceto `rtc_gerar_danfse`. Respostas em português, em JSON formatado ou em texto curto. Os nomes e parâmetros seguem o MCP local quando a ferramenta existe nos dois.

| Ferramenta | Entrada | Saída |
|---|---|---|
| `rtc_status` | — | Versão da base (V0073, IT…), data da exportação, lista de ferramentas e aviso de projeto não oficial |
| `rtc_consultar_classificacao` | `cClassTrib` (6 dígitos), `tributo` `cbs-ibs` (padrão) ou `is` | Registro completo da classificação, com fundamentação e, se houver, o anexo NCM/NBS já consolidado |
| `rtc_buscar_classificacoes` | exatamente um de: `cst`, `texto`, `ncm`, `nbs`; opcional `tributo` | Lista resumida (código, CST, descrição, redução, nomenclatura, DF-e), no máximo 50 itens |
| `rtc_validar_nomenclatura` | `cClassTrib` e exatamente um de `ncm` ou `nbs` | `{aceito, motivo, erroEquivalente}`, com `erroEquivalente` igual a REG-011/012/015/016 ou `null` |
| `rtc_consultar_nomenclatura` | `tipo` `ncm` ou `nbs`, `codigo` | Descrição e classificações com anexo que aceitam o código |
| `rtc_atividades_simples` | opcional `codigo` | Uma atividade ou a lista completa |
| `rtc_explicar_erro` | `codigo` (`REG-000`, `CAL-000`, `VAL-000` ou `VSN-000`) | Título, campo, estado e significado |
| `rtc_municipio` | exatamente um de `codigo` (IBGE, 7 dígitos) ou `nome` (busca sem acentos, com `uf` opcional) | Código, nome e UF; no máximo 20 resultados |
| `rtc_gerar_danfse` | `xml` (string, até 1 MB), `situacao` `valida`/`cancelada`/`substituida`, `canhoto` (padrão `true`) | Link `https://…/pdf/<id>`, tamanho e horário em que o link expira |

### Regra de `rtc_validar_nomenclatura`

É uma porta fiel do `NcmAplicavelService` da Calculadora. Com A = algum vínculo vigente cobre o código, E = alguma exceção cobre o código e S = algum vínculo que cobre o código não tem exceções:

1. Se a classificação não tem anexo, qualquer código é aceito.
2. Se tem anexo e o código não está completo (NCM com 8 dígitos, NBS com 9), retorna REG-015 ou REG-016.
3. Se não houver A, ou se houver E sem S, retorna REG-011 ou REG-012.
4. Nos demais casos, o código é aceito.

A NBS tem a tabela `EXCECAO_NBS_APLICAVEL`, vazia na base V0073. Mesmo assim, o export passa a lê-la com a mesma consulta usada para o NCM, e a regra trata NCM e NBS do mesmo jeito. Assim uma exceção futura não passa sem ser notada.

## DANFSe

**Worker `calculadora-rtc-danfse`**
- Importa `danfse.wasm` como `WebAssembly.Module` (o Workers não aceita compilar WASM a partir de bytes em tempo de execução) e roda o `wasm_exec.js` do Go.
- Inicia uma vez por isolate e espera `globalThis.danfseWasm.ready`.
- `POST /` recebe `{xml, stc, canhoto}` e devolve `application/pdf`. Erros do gerador voltam como HTTP 422 com `{erro}`.
- Não tem rota pública (`workers_dev = false`, sem `routes`).

**No Worker MCP, `rtc_gerar_danfse`:**
1. Recusa XML acima de 1 MB.
2. Chama o DANFSe pelo service binding.
3. Grava o PDF em `PDFS` com a chave `<uuid v4 sem hífens>.pdf` e o metadado `criadoEm`.
4. Devolve o link.

**Download e limpeza**
- `GET /pdf/:id` só serve objetos com menos de 1 h (404 caso contrário), com `Content-Disposition: attachment; filename="danfse.pdf"` e `Cache-Control: no-store`.
- Um cron de hora em hora lista o bucket e apaga os objetos com mais de 1 h.

**Privacidade**
- O XML nunca é gravado nem registrado em log. Os logs do Worker registram só a ferramenta, a duração e o status.
- A página `/privacidade` diz isso, além do prazo de 1 h do PDF e de que é um projeto não oficial.

## Limites e erros

- Limite por IP com o binding de Rate Limiting do Workers: 60 requisições por minuto, usando `CF-Connecting-IP` como chave. Quem passar recebe HTTP 429 com `Retry-After`.
- Corpo de `/mcp` limitado a 2 MB (HTTP 413).
- Erros de validação de entrada voltam como resultado `isError` com a mensagem em português. Exceções inesperadas viram `isError` "Erro inesperado: …", no mesmo padrão do `guard` local.
- `GET /mcp` e `DELETE /mcp` respondem 405, porque o servidor não tem estado.

## Testes

- **Unitários** (`vitest` em Node, porque a lógica é pura; o runtime do Worker é coberto pela fumaça com `wrangler dev`):
  - tabela-verdade da nomenclatura, com casos reais: 200003 com 02074300 (exceção), 200028 com 122011200 (aceito por prefixo) e 000001 sem anexo;
  - busca sem acentos;
  - `rtc_explicar_erro` com código existente e inexistente;
  - limite de tamanho do XML;
  - `/pdf/:id` expirado retorna 404;
  - um `initialize` seguido de `tools/list` no `/mcp`.
- **Paridade** (`test/paridade.test.ts`, só com `RTC_PARIDADE_URL`, no CI depois de subir as APIs): para cada classificação com anexo, testa cada prefixo completado com zeros, cada exceção e um código fora do anexo (só noves). Exige o mesmo veredito de `GET /calculadora/dados-abertos/classificacoes-tributarias/ncm-aplicavel` (ou `nbs-aplicavel`).
- **Fumaça do DANFSe**: com `wrangler dev` nos dois Workers, gera o PDF de `examples/nfse-ficticia.xml` e confere o cabeçalho `%PDF`.

## CI e deploy

- `ci.yml` ganha, depois de "Gerar dados do site", os passos:
  - `npm ci` e `npm test` em `mcp-remote/`;
  - `node test/paridade.mjs`;
  - `wrangler deploy --dry-run` dos dois Workers, que valida o bundle e o tamanho.
- O deploy real é um job separado, só no `main` e só se existir o secret `CLOUDFLARE_API_TOKEN`. Sem o secret, o job é pulado.
- Passos manuais do dono da conta, feitos uma vez:
  1. criar a conta Cloudflare e assinar o Workers Paid;
  2. criar o bucket R2 `calculadora-rtc-danfse-pdf`;
  3. criar o token de API com permissão de Workers e R2;
  4. cadastrar `CLOUDFLARE_API_TOKEN` e `CLOUDFLARE_ACCOUNT_ID` nos secrets do repositório.
- A URL final, `https://calculadora-rtc-mcp.<subdomínio>.workers.dev/mcp` ou um domínio próprio, entra no README, no `SKILL.md` e no anúncio do Agensi.

## Critérios de pronto

- Os testes unitários e de paridade passam no CI.
- `wrangler dev` local responde a `initialize`, `tools/list` e a uma chamada de cada ferramenta.
- O DANFSe da NFS-e fictícia é gerado e baixado pelo link.
- O README tem uma seção "MCP remoto" explicando como conectar no Claude, no Cursor e em outros clientes, além da página de privacidade.
