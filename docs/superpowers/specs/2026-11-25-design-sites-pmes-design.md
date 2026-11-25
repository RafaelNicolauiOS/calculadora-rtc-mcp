# Skill: design de sites para pequenos negócios brasileiros

Data: 25/11/2026

## Objetivo

Uma skill paga na Agensi que faz o agente desenhar e codar sites para PMEs brasileiras sem a "cara de IA" e de template. Antes de escrever código, o agente pesquisa o segmento e o mundo real do negócio, propõe três direções visuais e justifica a escolhida.

A ideia geral (pesquisar antes de desenhar, três direções, checagem de sinais de IA) é inspirada na página pública de "LLM becomes an Award-Winning App & Site Designer", que não foi comprada nem lida por dentro. Todo o conteúdo desta skill é original. O diferencial é o contexto brasileiro de pequenos negócios.

## Público

Quem faz sites para pequenos negócios no Brasil com um agente de IA: freelancers, agências pequenas, donos de negócio e contadores que oferecem site como serviço extra.

## Entrega

Site pronto em código, mais um resumo da direção escolhida.

- Padrão: um `index.html` com Tailwind via CDN, responsivo e pensado primeiro para celular.
- Opcional: componentes React + Tailwind, quando o usuário pedir ou o projeto já usar React.

## Processo (o que o SKILL.md manda o agente fazer)

1. **Entender o negócio.** Segmento, cidade/bairro, público, objetivo principal do site (chamar no WhatsApp, agendar, pedir orçamento, visitar a loja) e o que diferencia o negócio. Pergunta só o que faltar no briefing, em uma única rodada.
2. **Pesquisar.**
   - Concorrentes e referências do segmento, de preferência locais, quando o agente tiver acesso à web. Sem acesso, diz isso e segue pelas referências da skill.
   - "Materiais do mundo do negócio": lista de 5 a 8 coisas físicas daquele universo (padaria: farinha, crosta tostada, azulejo, papel kraft). A paleta sai daí.
   - Fontes: escolhe no catálogo do Google Fonts, com par título/texto e justificativa.
3. **Três direções.** Cada uma com nome, conceito em uma frase, paleta (com os materiais de origem), tipografia, estrutura da página e tom do texto. O agente escolhe uma e explica por que ela vence as outras duas. Se o usuário quiser, ele escolhe.
4. **Código.** Gera o site da direção escolhida, com os elementos brasileiros obrigatórios quando fizerem sentido para o negócio (ver abaixo).
5. **Revisão.** Passa a checklist de sinais de IA/template e as regras de texto sobre o próprio resultado, corrige e só então entrega.

## Elementos do contexto brasileiro

- WhatsApp como contato principal: botão fixo no celular e link `wa.me` com mensagem pré-preenchida.
- Endereço, horário de funcionamento e mapa (embed do Google Maps ou link).
- Formas de pagamento visíveis quando relevante: Pix, cartão e parcelamento.
- Google Meu Negócio: lembrar que avaliações e horário devem bater com o perfil, sem inventar avaliações.
- Aviso de cookies/LGPD só quando o site usar rastreamento.
- Instagram como prova social real (link, não depoimentos inventados).
- Dados de contato e CNPJ no rodapé quando o negócio informar.

## Arquivos da skill

```
skill/design-sites-pmes/
├── SKILL.md                      processo, regras e formato da entrega
└── reference/
    ├── segmentos.md              por segmento: objetivo típico, seções que importam, materiais, armadilhas
    ├── sinais-de-ia.md           checklist de sinais de site feito por IA ou template, com a correção de cada um
    ├── texto-pt-br.md            regras de texto: tom, títulos, CTAs, o que nunca inventar
    └── elementos-brasil.md       WhatsApp, Pix, mapa, LGPD, Google Meu Negócio, com trechos de código prontos
```

Segmentos cobertos em `segmentos.md`: clínica/consultório, odontologia, salão/barbearia, restaurante/bar, padaria/café, loja de bairro, oficina mecânica, academia/estúdio, escritório (contabilidade, advocacia), pet shop/veterinária, construção/reformas, escola/curso livre. Para segmento fora da lista, o agente aplica o mesmo método.

## Regras de texto (resumo)

- Português do Brasil natural, como o dono do negócio falaria com um cliente.
- Títulos só com a primeira letra maiúscula.
- Uma afirmação concreta por seção, nada de slogans genéricos ("Qualidade e excelência").
- Nunca inventar depoimentos, avaliações, número de clientes, anos de mercado, prêmios ou preços. Onde faltar o dado, deixar um marcador visível como `[preencher: anos de mercado]` e listar os marcadores no fim da entrega.

## Limites

- Não faz deploy nem registra domínio.
- Não gera fotos. Usa espaços reservados descritos (o que a foto deve mostrar) ou imagens que o usuário fornecer.
- Não substitui revisão jurídica de textos de LGPD.

## Restrições de publicação

- Sem scripts executáveis: só Markdown, para não exigir terminal e facilitar a revisão da Agensi.
- Evitar URLs literais nos arquivos da skill além do mínimo necessário (o empacotador do repositório sinaliza URLs). Os trechos de código usam `wa.me` e o Google Fonts, que são necessários.
- Validar com `node scripts/empacotar-skills.mjs` antes de publicar.

## Listagem na Agensi

- Nome: "Sites para pequenos negócios brasileiros (sem cara de IA)".
- Preço: compra única de US$ 4,99.
- Tags: web-design, frontend, landing-page, small-business, brasil, tailwind-css.

## Teste

Rodar a skill com subagentes em três briefings diferentes (por exemplo: padaria em bairro de São Paulo, clínica de fisioterapia em Curitiba, oficina mecânica no interior de Minas) e verificar:

- as três direções de cada briefing são realmente diferentes entre si;
- os três sites finais não convergem para o mesmo visual;
- nenhum dado foi inventado e os marcadores `[preencher: …]` aparecem onde faltou informação;
- WhatsApp, endereço e horário estão presentes e funcionam no celular;
- a checklist de sinais de IA não encontra nada no resultado final.
