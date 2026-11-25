const layout = (titulo: string, corpo: string) => `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>${titulo}</title>
<style>body{font:16px/1.6 system-ui,sans-serif;max-width:46rem;margin:2rem auto;padding:0 1rem;color:#1f2328;background:#fff}
code,pre{background:#f3f4f6;border-radius:4px;padding:.1rem .3rem}pre{padding:.8rem;overflow:auto}
@media (prefers-color-scheme:dark){body{color:#e6edf3;background:#0d1117}code,pre{background:#161b22}}</style>
</head><body>${corpo}</body></html>`;

export function paginaInicial(origem: string): string {
  return layout(
    "Calculadora RTC — MCP",
    `<h1>Calculadora RTC — MCP remoto</h1>
<p>Servidor MCP aberto com os dados da Calculadora da Reforma Tributária do Consumo (CBS, IBS e IS — LC 214/2025):
classificações tributárias, anexos de NCM/NBS, Imposto Seletivo, Simples Nacional, códigos de erro, municípios e geração do DANFSe.</p>
<h2>Como conectar</h2>
<p>URL do servidor (Streamable HTTP): <code>${origem}/mcp</code></p>
<p>Claude Code:</p><pre>claude mcp add --transport http calculadora-rtc ${origem}/mcp</pre>
<p>Outros clientes: adicione um servidor MCP remoto com a URL acima. Não há login.</p>
<p>Limite: 60 requisições por minuto por IP. Este servidor não calcula tributos.</p>
<p><a href="/privacidade">Privacidade</a> · Projeto não oficial: não é mantido nem endossado pela Receita Federal ou pelo Serpro.</p>`,
  );
}

export function paginaPrivacidade(): string {
  return layout(
    "Privacidade — Calculadora RTC MCP",
    `<h1>Privacidade</h1>
<ul>
<li>As consultas usam só dados públicos. Nada do que você envia nelas é guardado.</li>
<li>No DANFSe, o XML da NFS-e é usado apenas para gerar o PDF e não é gravado nem registrado em log.</li>
<li>O PDF gerado fica disponível por um link aleatório durante 1 hora e é apagado depois.</li>
<li>Os registros técnicos guardam só o padrão da rota (por exemplo, /pdf/:id), o status e a duração de cada requisição. Não registram IP, navegador, o XML nem os identificadores dos PDFs.</li>
<li>Projeto não oficial: não substitui orientação profissional nem os sistemas oficiais de documentos fiscais.</li>
</ul>`,
  );
}
