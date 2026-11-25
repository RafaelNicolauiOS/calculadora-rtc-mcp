# Calculadora RTC — MCP

Servidor **MCP** (Model Context Protocol) que integra as três APIs de código aberto da **Calculadora de Tributos da Reforma Tributária do Consumo** (CBS, IBS e Imposto Seletivo — LC 214/2025), publicadas pela Receita Federal do Brasil no GitHub sob licença MIT:

| API | Repositório oficial | O que faz | Porta local |
|---|---|---|---|
| Regime regular | [calculadora-rtc-regime-regular](https://github.com/ReceitaFederal/calculadora-rtc-regime-regular) | Cálculo de CBS/IBS/IS, bases de cálculo, geração e validação de XML, dados abertos (cClassTrib, CST, NCM/NBS, alíquotas) | 8080 |
| Simples Nacional | [calculadora-rtc-simples-nacional](https://github.com/ReceitaFederal/calculadora-rtc-simples-nacional) | Cálculo de CBS/IBS para optantes do Simples | 8082 |
| Gerador de DANFSe | [calculadora-rtc-gerador-danfse](https://github.com/ReceitaFederal/calculadora-rtc-gerador-danfse) | PDF do DANFSe a partir do XML da NFS-e | 8090 |

Com o MCP, um assistente (Claude, ou outro cliente MCP) consegue escolher a classificação tributária, conferir NCM/NBS, calcular, explicar erros, gerar e validar o XML do DF-e e gerar o DANFSe na mesma conversa.

**Site:** https://rafaelnicolauios.github.io/calculadora-rtc-mcp/

| Seção do site | Como funciona |
|---|---|
| Classificações (cClassTrib) | Offline: dados exportados das APIs oficiais a cada publicação |
| NCM / NBS | Offline, com as classificações vinculadas a cada código |
| DANFSe | Offline: o gerador oficial compilado para WebAssembly roda no navegador, e o XML não sai do computador |
| Calculadora e Simples Nacional | Chamam as APIs pelo proxy em `http://localhost:8079`, que o `scripts/run.sh` sobe junto com as APIs |

> **Projeto não oficial.** Não é mantido nem endossado pela Receita Federal ou pelo Serpro. Ele apenas compila e chama o código oficial, sem alterar as regras de cálculo. Os resultados não substituem orientação profissional nem os sistemas oficiais de autorização de documentos fiscais.

## Estrutura

```
upstream/          submódulos git apontando para os 3 repositórios oficiais (versões fixadas)
scripts/build.sh   compila banco SQLite, os 2 JARs, o binário e o WASM do DANFSe em dist/
scripts/run.sh     sobe as 3 APIs a partir de dist/, sem Docker, mais o proxy CORS
scripts/cors-proxy.mjs          proxy na porta 8079 que libera o acesso do site às APIs
scripts/export-site-data.mjs    gera site/data/*.json e copia o WASM para o site
docker-compose.yml sobe as 3 APIs em containers
mcp-server/        servidor MCP em TypeScript (stdio)
site/              site estático publicado no GitHub Pages (HTML, CSS e JS, sem build)
examples/          NFS-e fictícia para testar o DANFSe
```

## Como rodar

### 1. Clonar com os submódulos

```bash
git clone --recurse-submodules https://github.com/RafaelNicolauiOS/calculadora-rtc-mcp.git
cd calculadora-rtc-mcp
```

### 2. Subir as APIs

**Com Docker:**

```bash
docker compose up --build -d
```

**Sem Docker** (requer Java 25 e Go 1.27+; o script também aceita um JDK 25 descompactado em `.tools/`):

```bash
./scripts/build.sh
```

```bash
./scripts/run.sh
```

Confira: `http://localhost:8080/api/swagger-ui.html` e `http://localhost:8082/api/swagger-ui.html`.

### 3. Compilar o MCP

```bash
cd mcp-server && npm install && npm run build
```

Teste de ponta a ponta (com as APIs no ar):

```bash
npm run smoke
```

### 4. Conectar ao seu cliente MCP

**Claude Code:** o arquivo [`.mcp.json`](.mcp.json) na raiz já registra o servidor ao abrir o projeto. Em outro diretório:

```bash
claude mcp add calculadora-rtc -- node /caminho/para/calculadora-rtc-mcp/mcp-server/dist/index.js
```

**Claude Desktop** (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "calculadora-rtc": {
      "command": "node",
      "args": ["/caminho/para/calculadora-rtc-mcp/mcp-server/dist/index.js"]
    }
  }
}
```

Variáveis de ambiente opcionais:

| Variável | Padrão |
|---|---|
| `RTC_REGIME_URL` | `http://localhost:8080/api` |
| `RTC_SIMPLES_URL` | `http://localhost:8082/api` |
| `RTC_DANFSE_URL` | `http://localhost:8090/api` |
| `RTC_HTTP_TIMEOUT_MS` | `60000` |
| `RTC_MAX_RESPONSE_CHARS` | `60000` (respostas maiores são truncadas) |

## MCP remoto (sem instalar nada)

Também existe uma versão hospedada, só de consulta: classificações, anexos de NCM/NBS, Imposto Seletivo, Simples Nacional, códigos de erro, municípios e geração do DANFSe. O código fica em [`mcp-remote/`](mcp-remote/) e roda no Cloudflare Workers. Ela **não calcula** tributos: para isso, use o MCP local acima.

```bash
claude mcp add --transport http calculadora-rtc https://<url-do-worker>/mcp
```

Não há login. O limite é de 60 requisições por minuto por IP. O PDF do DANFSe fica disponível por 1 hora e o XML não é guardado. Os logs guardam apenas o padrão da rota, o status e a duração (veja `/privacidade` no próprio servidor).

Desenvolvimento local, depois de gerar `site/data` com `node scripts/export-site-data.mjs`:

```bash
cd mcp-remote && npm install && npm test && npm run dev
```

Para publicar, é preciso uma conta Cloudflare com Workers Paid, o bucket R2 `calculadora-rtc-danfse-pdf` e os secrets `CLOUDFLARE_API_TOKEN` e `CLOUDFLARE_ACCOUNT_ID` no repositório. O CI publica a cada push no `main`.

## Ferramentas

| Ferramenta | API | Para quê |
|---|---|---|
| `rtc_status` | todas | Saúde e versões das 3 APIs |
| `rtc_esquema_entrada` | regime / simples | JSON Schema completo e exemplos oficiais de um endpoint de cálculo |
| `rtc_calcular_regime_geral` | regime | CBS, IBS e IS por item; modo `observabilidade` (erro por item) ou `estrito` |
| `rtc_calcular_pedagio` | regime | Operações de pedágio |
| `rtc_base_calculo_unificada` | regime | Bases RG, IS e SN para NF-e/NFC-e ou NFS-e |
| `rtc_gerar_xml` | regime | XML do grupo de tributação a partir do cálculo estrito |
| `rtc_validar_xml` | regime | Validação contra o XSD (grupo ou nota) |
| `rtc_consultar_classificacao` | regime | Detalhe de uma cClassTrib (redução, crédito, nomenclatura) |
| `rtc_buscar_classificacoes` | regime | cClassTrib por CST, NBS, situação tributária ou atores |
| `rtc_validar_nomenclatura` | regime | NCM/NBS compatível com a cClassTrib (erro REG-011) |
| `rtc_consultar_nomenclatura` | regime | Descrição de NCM ou NBS |
| `rtc_consultar_aliquotas` | regime | Alíquotas de referência da União, UF ou município (2026) |
| `rtc_dados_abertos` | regime | GET genérico em `/dados-abertos/*` e `/nfse/*` |
| `rtc_explicar_erro` | regime / simples | Descrição de códigos `REG-xxx` e `VSN-xxx` |
| `rtc_calcular_simples_nacional` | simples | CBS e IBS do Simples (endpoint não assistido) |
| `rtc_atividades_simples` | simples | Atividades (cAtivSN), anexos e classificações |
| `rtc_gerar_danfse` | danfse | PDF do DANFSe gravado em disco |

Exemplo de pedido ao assistente:

> Calcule CBS e IBS para uma mensalidade escolar de R$ 1.200,00 em Porto Alegre em março de 2027, com alíquotas CBS 8,8%, IBS UF 0,05% e IBS municipal 0,05%. Explique a redução aplicada e gere o XML do grupo para NF-e.

## Pontos de atenção das APIs oficiais

- **2026 x 2027:** em 2026 o cálculo usa as alíquotas de referência cadastradas e `aliquotasNominais` é proibido. A partir de 2027 ele é obrigatório, e o resultado sai como `CALCULO_SIMULADO`.
- **Arredondamento:** a versão 1.7.2 do regime regular mudou o arredondamento (diferenças de centavos em relação à 1.7.0). Fixe a versão dos submódulos e revise os testes ao atualizar.
- **Simples Nacional:** a Calculadora não calcula a alíquota efetiva. Ela vem do PGDAS-D e deve ser informada em `aliquotasEfetivas`.
- **Banco de dados:** o SQLite é gerado pelas migrations Flyway do regime regular e compartilhado pelo Simples Nacional.

## Atualizar para novas versões da Receita

```bash
git submodule update --remote
```

```bash
./scripts/build.sh
```

Rode `npm run smoke` em `mcp-server/` antes de publicar.

## Site

O site em `site/` é publicado pelo workflow [`ci.yml`](.github/workflows/ci.yml) a cada push na `main` e toda segunda-feira. O workflow compila as APIs, roda o teste de fumaça, exporta os dados com `scripts/export-site-data.mjs` e publica no GitHub Pages.

Para rodar localmente (com as APIs no ar):

```bash
node scripts/export-site-data.mjs
```

```bash
python3 -m http.server 5173 --directory site
```

**Calculadora no site publicado:** a API do regime regular não envia cabeçalhos CORS, então o site chama as APIs pelo `scripts/cors-proxy.mjs`, na porta 8079. Ele libera `https://*.github.io` e `localhost` por padrão. Para outras origens, defina `RTC_CORS_ORIGINS`. Para hospedar as APIs num servidor, coloque o proxy atrás de HTTPS e informe o endereço no campo "Endereço da API" do site.

## Próximos passos

- [ ] Hospedar as APIs Java para o site calcular sem instalar nada.
- [ ] Publicar o MCP no npm.

## Licença

MIT — veja [LICENSE](LICENSE). O código em `upstream/` pertence à Receita Federal do Brasil e é distribuído por ela sob a licença MIT.
