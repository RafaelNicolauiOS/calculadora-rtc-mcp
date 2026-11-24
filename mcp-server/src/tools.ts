// Ferramentas MCP que expõem as três APIs da Calculadora RTC.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiResult, guard, textResult } from "./format.js";
import { request, withQuery, type Endpoints } from "./http.js";

const data = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "use AAAA-MM-DD")
  .describe("Data de referência da vigência (AAAA-MM-DD).");

const payload = z
  .record(z.string(), z.unknown())
  .describe("Corpo JSON enviado como está para a API. Use rtc_esquema_entrada para ver o esquema completo.");

const TIPOS_DFE = ["nfe", "nfce", "nfse", "cte", "cte-simplificado", "bpe", "bpe-tm", "nf3e"] as const;

/** Mapa nome amigável -> (API, caminho, método) usado por rtc_esquema_entrada. */
const ESQUEMAS: Record<string, { api: keyof Endpoints; path: string }> = {
  "regime-geral": { api: "regime", path: "/calculadora/regime-geral" },
  "regime-geral-observabilidade": { api: "regime", path: "/calculadora/observabilidade/regime-geral" },
  pedagio: { api: "regime", path: "/calculadora/pedagio" },
  "base-calculo-unificada": { api: "regime", path: "/calculadora/base-calculo/base-calculo-unificada" },
  "base-calculo-unificada-nfse": { api: "regime", path: "/calculadora/base-calculo/base-calculo-unificada-nfse" },
  "xml-generate": { api: "regime", path: "/calculadora/xml/generate" },
  "simples-nacional": { api: "simples", path: "/calculadora/observabilidade/simples-nacional/nao-assistido" },
};

const READ_ONLY = { readOnlyHint: true, openWorldHint: false } as const;

export function registerTools(server: McpServer, api: Endpoints): void {
  const regime = (p: string) => `${api.regime}/calculadora${p}`;
  const abertos = (p: string) => regime(`/dados-abertos${p}`);
  const simples = (p: string) => `${api.simples}/calculadora${p}`;

  // ---------------------------------------------------------------- status
  server.registerTool(
    "rtc_status",
    {
      title: "Status das APIs",
      description:
        "Verifica se as três APIs (regime regular, Simples Nacional e DANFSe) estão no ar e devolve as versões da aplicação e da base de dados. Use primeiro se outra ferramenta falhar por conexão.",
      inputSchema: {},
      annotations: READ_ONLY,
    },
    async () =>
      guard(async () => {
        const check = async (nome: string, url: string) => {
          try {
            const r = await request(url);
            return `${nome}: ${r.status < 400 ? "OK" : `HTTP ${r.status}`} — ${url}\n${(r.text ?? "").slice(0, 600)}`;
          } catch (e) {
            return `${nome}: FORA DO AR — ${e instanceof Error ? e.message : String(e)}`;
          }
        };
        const danfseHealth = api.danfse.replace(/\/api$/, "") + "/health/ready";
        const linhas = await Promise.all([
          check("regime-regular", abertos("/versao")),
          check("simples-nacional", `${api.simples}/versao`),
          check("gerador-danfse", danfseHealth),
        ]);
        return textResult(linhas.join("\n\n"));
      }),
  );

  // ---------------------------------------------------------------- esquemas
  server.registerTool(
    "rtc_esquema_entrada",
    {
      title: "Esquema de entrada de um endpoint",
      description:
        "Devolve o JSON Schema completo (com descrições de cada campo e exemplos oficiais) do corpo aceito por um endpoint de cálculo. Consulte antes de montar uma operação de cálculo com campos pouco comuns (Imposto Seletivo, compra governamental, tributação regular, componentes da base etc.).",
      inputSchema: { endpoint: z.enum(Object.keys(ESQUEMAS) as [string, ...string[]]) },
      annotations: READ_ONLY,
    },
    async ({ endpoint }) =>
      guard(async () => {
        const alvo = ESQUEMAS[endpoint];
        const docs = await request(`${api[alvo.api]}/api-docs`);
        if (docs.status >= 400) return apiResult(docs);
        const spec = JSON.parse(docs.text ?? "{}");
        const op = spec.paths?.[alvo.path]?.post;
        if (!op) return textResult(`Endpoint ${alvo.path} não encontrado na especificação OpenAPI.`, true);
        const content = op.requestBody?.content?.["application/json"] ?? {};
        const schemas = spec.components?.schemas ?? {};
        const resolve = (node: unknown, seen: Set<string>, depth: number): unknown => {
          if (Array.isArray(node)) return node.map((n) => resolve(n, seen, depth));
          if (!node || typeof node !== "object") return node;
          const obj = node as Record<string, unknown>;
          if (typeof obj.$ref === "string") {
            const name = obj.$ref.split("/").pop()!;
            if (seen.has(name) || depth > 8) return { $ref: name };
            return resolve(schemas[name], new Set([...seen, name]), depth + 1);
          }
          return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, resolve(v, seen, depth)]));
        };
        const out = {
          endpoint: `POST ${alvo.path}`,
          descricao: op.description ?? op.summary,
          schema: resolve(content.schema, new Set(), 0),
          exemplos: content.examples ?? content.example,
        };
        return textResult(JSON.stringify(out, null, 2));
      }),
  );

  // ---------------------------------------------------------------- regime regular: cálculo
  server.registerTool(
    "rtc_calcular_regime_geral",
    {
      title: "Calcular CBS, IBS e IS (regime regular)",
      description: [
        "Calcula CBS, IBS (UF e município) e Imposto Seletivo de uma operação do regime regular (LC 214/2025).",
        "Campos principais da operação: id, versao ('1.0.0'), dhFatoGerador (ISO 8601 com fuso), municipio (código IBGE de 7 dígitos), uf, itens[].",
        "Cada item: numero, cst, cClassTrib, ncm (bens) ou nbs (serviços), baseCalculo, quantidade/unidade (opcionais), impostoSeletivo (opcional).",
        "A partir de 2027 'aliquotasNominais' {cbs, ibsEstadual, ibsMunicipal} é OBRIGATÓRIO em cada item; antes de 2027 é PROIBIDO (usa as alíquotas de referência de 2026).",
        "modo 'observabilidade' (padrão) devolve o estado e os erros de cada item sem derrubar os demais; 'estrito' rejeita a operação inteira no primeiro erro, mas é a resposta aceita por rtc_gerar_xml.",
        "Verifique 'estadoItem' de cada objeto: CALCULADO, CALCULO_SIMULADO, INCONSISTENCIA_ENTRADA, NAO_IMPLEMENTADO ou FALHA_TECNICA. Cada grupo traz 'memoriaCalculo' em texto.",
      ].join(" "),
      inputSchema: {
        operacao: payload,
        modo: z.enum(["observabilidade", "estrito"]).default("observabilidade"),
      },
      annotations: READ_ONLY,
    },
    async ({ operacao, modo }) =>
      guard(async () => {
        const url = modo === "estrito" ? regime("/regime-geral") : regime("/observabilidade/regime-geral");
        return apiResult(await request(url, { json: operacao }));
      }),
  );

  server.registerTool(
    "rtc_calcular_pedagio",
    {
      title: "Calcular tributos de pedágio",
      description:
        "Calcula CBS/IBS de operações de pedágio. Use rtc_esquema_entrada com endpoint 'pedagio' para ver o formato.",
      inputSchema: { operacao: payload },
      annotations: READ_ONLY,
    },
    async ({ operacao }) => guard(async () => apiResult(await request(regime("/pedagio"), { json: operacao }))),
  );

  server.registerTool(
    "rtc_base_calculo_unificada",
    {
      title: "Base de cálculo unificada",
      description: [
        "Calcula as bases de cálculo do regime geral (baseRG), do Imposto Seletivo (baseIS) e do Simples Nacional (baseSN), aplicando a vigência de cada componente ao ano.",
        "documento 'nfe' (NF-e/NFC-e): campos anoFatoGerador, tipoDocumento (55 ou 65), natureza ('bem' ou 'servico'), vProd, vFrete, vSeg, vOutro, vDesc, vIS, vPIS, vCOFINS, vICMS, vFCP — todos no mesmo nível.",
        "documento 'nfse': endpoint experimental; consulte rtc_esquema_entrada com 'base-calculo-unificada-nfse'.",
      ].join(" "),
      inputSchema: { documento: z.enum(["nfe", "nfse"]).default("nfe"), entrada: payload },
      annotations: READ_ONLY,
    },
    async ({ documento, entrada }) =>
      guard(async () => {
        const p = documento === "nfse" ? "/base-calculo/base-calculo-unificada-nfse" : "/base-calculo/base-calculo-unificada";
        return apiResult(await request(regime(p), { json: entrada }));
      }),
  );

  // ---------------------------------------------------------------- XML
  server.registerTool(
    "rtc_gerar_xml",
    {
      title: "Gerar XML dos grupos de tributação",
      description:
        "Gera o XML do grupo de tributação (IBSCBS/IS) de um DF-e a partir da resposta de rtc_calcular_regime_geral em modo 'estrito' (não aceita a resposta da observabilidade). Tipos: nfe, nfce, cte, cte-simplificado, bpe, bpe-tm, nf3e.",
      inputSchema: {
        tipo: z.enum(["nfe", "nfce", "cte", "cte-simplificado", "bpe", "bpe-tm", "nf3e"]),
        resultado_calculo: payload.describe("Resposta JSON completa de rtc_calcular_regime_geral com modo 'estrito'."),
      },
      annotations: READ_ONLY,
    },
    async ({ tipo, resultado_calculo }) =>
      guard(async () => apiResult(await request(withQuery(regime("/xml/generate"), { tipo }), { json: resultado_calculo }))),
  );

  server.registerTool(
    "rtc_validar_xml",
    {
      title: "Validar XML contra o XSD",
      description:
        "Valida um XML contra o XSD oficial do DF-e. subtipo 'grupo' valida só os grupos de tributação; 'nota' valida o documento completo. Responde 'true' se válido ou HTTP 422 com linha e coluna do erro.",
      inputSchema: {
        tipo: z.enum(TIPOS_DFE),
        subtipo: z.enum(["grupo", "nota"]).default("grupo"),
        xml: z.string().optional().describe("Conteúdo XML. Informe este campo ou xml_path."),
        xml_path: z.string().optional().describe("Caminho de um arquivo .xml local."),
      },
      annotations: READ_ONLY,
    },
    async ({ tipo, subtipo, xml, xml_path }) =>
      guard(async () => {
        const conteudo = await lerXml(xml, xml_path);
        return apiResult(
          await request(withQuery(regime("/xml/validate"), { tipo, subtipo }), { body: conteudo, contentType: "application/xml" }),
        );
      }),
  );

  // ---------------------------------------------------------------- dados abertos
  server.registerTool(
    "rtc_consultar_classificacao",
    {
      title: "Consultar classificação tributária (cClassTrib)",
      description:
        "Detalha uma classificação tributária: descrição, tratamento (redução, isenção etc.), percentuais de redução de CBS/IBS, crédito, nomenclatura exigida (NCM/NBS) e indicadores. tributo 'cbs-ibs' (padrão) ou 'is' (Imposto Seletivo).",
      inputSchema: {
        cClassTrib: z.string().regex(/^\d{6}$/, "6 dígitos"),
        data,
        tributo: z.enum(["cbs-ibs", "is"]).default("cbs-ibs"),
      },
      annotations: READ_ONLY,
    },
    async ({ cClassTrib, data, tributo }) =>
      guard(async () =>
        apiResult(await request(withQuery(abertos(`/classificacoes-tributarias/${tributo}/class-trib/${cClassTrib}`), { data }))),
      ),
  );

  server.registerTool(
    "rtc_buscar_classificacoes",
    {
      title: "Buscar classificações tributárias",
      description: [
        "Lista classificações tributárias (cClassTrib) por critério:",
        "'cst' (ex.: 200) -> classificações daquele CST;",
        "'nbs' -> classificações aplicáveis a um código NBS de serviço;",
        "'situacoes' -> todos os CSTs com suas classificações (opcional siglaDfe, ex.: NFe, NFSe);",
        "'atores' -> classificações por fornecedor/adquirente (use rtc_dados_abertos em /ator/grupos para os códigos).",
        "Para checar se um NCM/NBS é compatível com uma cClassTrib, use rtc_validar_nomenclatura.",
      ].join(" "),
      inputSchema: {
        criterio: z.enum(["cst", "nbs", "situacoes", "atores"]),
        data,
        cst: z.string().optional(),
        nbs: z.string().optional(),
        siglaDfe: z.string().optional(),
        fornecedor: z.string().optional(),
        adquirente: z.string().optional(),
      },
      annotations: READ_ONLY,
    },
    async (a) =>
      guard(async () => {
        let url: string;
        switch (a.criterio) {
          case "cst":
            if (!a.cst) return textResult("Informe 'cst'.", true);
            url = withQuery(abertos(`/classificacoes-tributarias/cbs-ibs/${a.cst}`), { data: a.data });
            break;
          case "nbs":
            if (!a.nbs) return textResult("Informe 'nbs'.", true);
            url = withQuery(abertos("/classificacoes-tributarias/nbs"), { nbs: a.nbs, data: a.data });
            break;
          case "situacoes":
            url = withQuery(abertos("/situacoes-tributarias/cbs-ibs"), { data: a.data, siglaDfe: a.siglaDfe });
            break;
          case "atores":
            url = withQuery(abertos("/classificacoes-tributarias/cbs-ibs/por-atores"), {
              data: a.data,
              fornecedor: a.fornecedor,
              adquirente: a.adquirente,
              siglaDfe: a.siglaDfe,
            });
            break;
        }
        return apiResult(await request(url));
      }),
  );

  server.registerTool(
    "rtc_validar_nomenclatura",
    {
      title: "Validar NCM/NBS para uma cClassTrib",
      description:
        "Verifica se um NCM (bens) ou NBS (serviços) pode ser usado com a classificação tributária informada na data do fato gerador — a causa mais comum do erro REG-011.",
      inputSchema: {
        cClassTrib: z.string().regex(/^\d{6}$/),
        ncm: z.string().optional(),
        nbs: z.string().optional(),
        data,
      },
      annotations: READ_ONLY,
    },
    async ({ cClassTrib, ncm, nbs, data }) =>
      guard(async () => {
        if (!ncm === !nbs) return textResult("Informe exatamente um: 'ncm' ou 'nbs'.", true);
        const p = ncm ? "/classificacoes-tributarias/ncm-aplicavel" : "/classificacoes-tributarias/nbs-aplicavel";
        return apiResult(
          await request(withQuery(abertos(p), { cClassTrib, ncm, nbs, dataOcorrenciaFatoGerador: data })),
        );
      }),
  );

  server.registerTool(
    "rtc_consultar_nomenclatura",
    {
      title: "Consultar NCM ou NBS",
      description: "Consulta a descrição e a vigência de um código NCM (8 dígitos) ou NBS (9 dígitos).",
      inputSchema: { tipo: z.enum(["ncm", "nbs"]), codigo: z.string(), data },
      annotations: READ_ONLY,
    },
    async ({ tipo, codigo, data }) =>
      guard(async () => apiResult(await request(withQuery(abertos(`/${tipo}`), { [tipo]: codigo, data })))),
  );

  server.registerTool(
    "rtc_consultar_aliquotas",
    {
      title: "Consultar alíquotas de referência",
      description:
        "Alíquota padrão/de referência da CBS (esfera 'uniao'), do IBS estadual ('uf', código IBGE da UF com 2 dígitos, ex.: 43) ou do IBS municipal ('municipio', código IBGE com 7 dígitos). Só há alíquotas cadastradas para 2026; a partir de 2027 a API responde 404 e as alíquotas devem ser informadas em aliquotasNominais.",
      inputSchema: {
        esfera: z.enum(["uniao", "uf", "municipio"]),
        codigo: z.string().optional().describe("Código IBGE da UF ou do município (não use para 'uniao')."),
        data,
      },
      annotations: READ_ONLY,
    },
    async ({ esfera, codigo, data }) =>
      guard(async () => {
        if (esfera !== "uniao" && !codigo) return textResult("Informe 'codigo' (IBGE) para UF ou município.", true);
        const q =
          esfera === "uf" ? { codigoUf: codigo, data } : esfera === "municipio" ? { codigoMunicipio: codigo, data } : { data };
        return apiResult(await request(withQuery(abertos(`/aliquota-${esfera}`), q)));
      }),
  );

  server.registerTool(
    "rtc_dados_abertos",
    {
      title: "Consulta genérica aos dados abertos",
      description: [
        "Faz um GET em qualquer rota de /calculadora/dados-abertos ou /calculadora/nfse do regime regular, para consultas não cobertas pelas outras ferramentas.",
        "Exemplos de caminho: /dados-abertos/fundamentacoes-legais, /dados-abertos/ufs, /dados-abertos/ufs/municipios (siglaUf), /dados-abertos/ator/grupos, /dados-abertos/dfe/grupos,",
        "/dados-abertos/situacoes-tributarias/imposto-seletivo, /dados-abertos/nbs-aplicaveis (cClassTrib), /dados-abertos/redutores-compra-governamental,",
        "/nfse/indicador-operacao (dataOcorrenciaFatoGerador, nbs), /nfse/local-operacao (cIndOp, dataOcorrenciaFatoGerador), /nfse/situacoes-classificacoes-tributarias (nbs, data).",
        "Listas completas (ex.: /dados-abertos/ncm/vigentes) são grandes e serão truncadas.",
      ].join(" "),
      inputSchema: {
        caminho: z
          .string()
          .regex(/^\/(dados-abertos|nfse)\/[A-Za-z0-9\-/]+$/, "deve começar com /dados-abertos/ ou /nfse/")
          .describe("Caminho a partir de /calculadora, ex.: /dados-abertos/fundamentacoes-legais"),
        parametros: z.record(z.string(), z.string()).optional().describe("Query string, ex.: {\"data\": \"2027-01-01\"}"),
      },
      annotations: READ_ONLY,
    },
    async ({ caminho, parametros }) =>
      guard(async () => {
        if (caminho.includes("..")) return textResult("Caminho inválido.", true);
        return apiResult(await request(withQuery(regime(caminho), parametros)));
      }),
  );

  server.registerTool(
    "rtc_explicar_erro",
    {
      title: "Explicar código de erro",
      description:
        "Descreve um código de erro devolvido pela Calculadora: REG-xxx (regime regular) ou VSN-xxx (Simples Nacional).",
      inputSchema: { codigo: z.string().regex(/^(REG|VSN)-\d{3}$/i, "formato REG-000 ou VSN-000") },
      annotations: READ_ONLY,
    },
    async ({ codigo }) =>
      guard(async () => {
        const c = codigo.toUpperCase();
        const url = c.startsWith("VSN")
          ? withQuery(simples("/observabilidade/simples-nacional/erros"), { codigo: c })
          : withQuery(regime("/observabilidade/erros"), { codigo: c });
        return apiResult(await request(url));
      }),
  );

  // ---------------------------------------------------------------- Simples Nacional
  server.registerTool(
    "rtc_calcular_simples_nacional",
    {
      title: "Calcular CBS e IBS no Simples Nacional",
      description: [
        "Calcula CBS e IBS de optantes do Simples Nacional (endpoint 'não assistido', o atual).",
        "A Calculadora NÃO calcula a alíquota efetiva do Simples (isso é do PGDAS-D): informe em 'aliquotasEfetivas' fatorR, impedimentoSublimite e o par pCBSSN/pIBSSN (texto, pontos percentuais) de cada anexo usado (anexoI..anexoV; III a V com 'semRedistribuicaoISS').",
        "Campos: id, versao ('3.0.0'), data (AAAA-MM-DD), tpDoc (55, 65, 57, 67, 63, 93, 62 ou 91 = NFS-e).",
        "Documentos com CRT: CRT (1, 2 ou 3). NFS-e (91): opSimpNac, regApIBSCBSSN, regApTribSN; exatamente 1 item.",
        "Itens: numero, cAtivSN (atividade do Simples), cClassTrib, ncm ou nbs, baseCalculo (texto), valorImpostoSeletivo (documentos com CRT), tribISSQN/tpRetISSQN/tpBM (NFS-e).",
        "Use rtc_esquema_entrada com 'simples-nacional' para o esquema completo e exemplos oficiais, e rtc_atividades_simples para os códigos cAtivSN.",
      ].join(" "),
      inputSchema: { operacao: payload },
      annotations: READ_ONLY,
    },
    async ({ operacao }) =>
      guard(async () =>
        apiResult(await request(simples("/observabilidade/simples-nacional/nao-assistido"), { json: operacao })),
      ),
  );

  server.registerTool(
    "rtc_atividades_simples",
    {
      title: "Atividades do Simples Nacional",
      description:
        "Lista as atividades do Simples Nacional (cAtivSN) vigentes na data, com anexo e classificações compatíveis, ou consulta uma atividade pelo código. Filtros opcionais: anexos (ex.: 'I,III'), tpDoc (ex.: 55, 91), cClassTrib.",
      inputSchema: {
        data,
        codigo: z.string().optional().describe("Código da atividade (cAtivSN). Sem ele, lista todas."),
        anexos: z.string().optional(),
        tpDoc: z.string().optional(),
        cClassTrib: z.string().optional(),
      },
      annotations: READ_ONLY,
    },
    async ({ data, codigo, anexos, tpDoc, cClassTrib }) =>
      guard(async () => {
        const base = codigo
          ? simples(`/simples-nacional/atividades/${encodeURIComponent(codigo)}`)
          : simples("/simples-nacional/atividades");
        return apiResult(await request(withQuery(base, { data, anexos: codigo ? undefined : anexos, tpDoc, cClassTrib })));
      }),
  );

  // ---------------------------------------------------------------- DANFSe
  server.registerTool(
    "rtc_gerar_danfse",
    {
      title: "Gerar DANFSe (PDF)",
      description:
        "Gera o PDF do DANFSe (representação gráfica da NFS-e) a partir do XML da NFS-e autorizada e grava em disco. Devolve o caminho do arquivo. situacao: 'valida' (padrão), 'cancelada' ou 'substituida'.",
      inputSchema: {
        xml: z.string().optional().describe("Conteúdo do XML da NFS-e. Informe este campo ou xml_path."),
        xml_path: z.string().optional().describe("Caminho de um arquivo .xml local da NFS-e."),
        situacao: z.enum(["valida", "cancelada", "substituida"]).default("valida"),
        canhoto: z.boolean().default(true).describe("Incluir o canhoto de recebimento."),
        saida: z.string().optional().describe("Caminho do PDF a gravar. Padrão: pasta temporária do sistema."),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
    },
    async ({ xml, xml_path, situacao, canhoto, saida }) =>
      guard(async () => {
        const conteudo = await lerXml(xml, xml_path);
        const stc = { valida: 0, cancelada: 1, substituida: 2 }[situacao];
        const res = await request(withQuery(`${api.danfse}/danfse`, { stc, canhoto }), {
          body: conteudo,
          contentType: "application/xml",
          binary: true,
        });
        if (!res.bytes) return apiResult(res);
        const destino = path.resolve(saida ?? path.join(tmpdir(), `danfse-${Date.now()}.pdf`));
        await mkdir(path.dirname(destino), { recursive: true });
        await writeFile(destino, res.bytes);
        return textResult(`DANFSe gerado: ${destino} (${res.bytes.length.toLocaleString("pt-BR")} bytes)`);
      }),
  );
}

async function lerXml(xml?: string, xmlPath?: string): Promise<string> {
  if (xml && xmlPath) throw new Error("Informe 'xml' ou 'xml_path', não os dois.");
  if (xml) return xml;
  if (xmlPath) return readFile(path.resolve(xmlPath), "utf8");
  throw new Error("Informe 'xml' (conteúdo) ou 'xml_path' (arquivo).");
}
