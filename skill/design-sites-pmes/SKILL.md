---
name: design-sites-pmes
description: Desenha e coda sites e landing pages para pequenos negócios brasileiros (clínica, salão, restaurante, padaria, loja de bairro, oficina, academia, escritório, pet shop, escola) sem cara de site feito por IA ou de template. Pesquisa o segmento e o mundo real do negócio, propõe três direções visuais, justifica a escolhida e entrega o site responsivo em HTML com Tailwind (ou React), com WhatsApp, mapa, horário e Pix. Use quando o usuário pedir "faz um site para minha padaria", "landing page para clínica", "site para pequeno negócio", "melhora o visual desse site", "site que não pareça template" ou descrever um negócio local que precisa de site.
---

# Sites para pequenos negócios brasileiros

Site feito por IA se reconhece em segundos: o mesmo herói com gradiente, três cards de "benefícios" com ícone, depoimentos inventados e um "Transformando sonhos em realidade". Isso acontece porque o agente desenha de memória, a partir da média da internet. Esta skill inverte a ordem: primeiro olha para o negócio concreto, depois desenha. E o negócio é brasileiro e pequeno: o cliente chama no WhatsApp, quer saber o horário e o endereço, paga no Pix.

## Referências
- `reference/segmentos.md`: por segmento, o que o cliente procura, as seções que importam, materiais do mundo daquele negócio e armadilhas comuns.
- `reference/sinais-de-ia.md`: checklist de sinais de site gerado por IA ou template, com a correção de cada um. Use na revisão final.
- `reference/texto-pt-br.md`: regras de texto em português, títulos, chamadas para ação e o que nunca inventar.
- `reference/elementos-brasil.md`: WhatsApp, mapa, horário, Pix, Google Meu Negócio, Instagram, LGPD e rodapé, com trechos de código.

Carregue só o que o trabalho pedir: o segmento do negócio em `segmentos.md`, e as outras três sempre antes de entregar.

## Processo

### 1. Entender o negócio
Extraia do pedido, e pergunte em uma única rodada só o que faltar:
- **Segmento** e o que exatamente vende (não "restaurante": "marmitaria de comida mineira por quilo").
- **Onde**: cidade e bairro. Um salão na Vila Madalena e um no centro de Montes Claros não têm o mesmo público.
- **Público**: quem compra, faixa de renda, como chega (indicação, Google, Instagram, passando na rua).
- **Objetivo do site**, um principal: chamar no WhatsApp, agendar, pedir orçamento, ver o cardápio, visitar a loja.
- **Diferencial real**: o que o dono diria a um cliente no balcão. Se ele não souber, pergunte o que os clientes elogiam.
- **Dados**: nome, telefone/WhatsApp, endereço, horário, Instagram, formas de pagamento, fotos disponíveis, CNPJ (opcional).
- **Restrições**: identidade visual existente (logo, cores), tecnologia (HTML puro ou React), onde vai hospedar.

Se a conversa permitir perguntar, pergunte uma vez e espere. Se o usuário pedir para seguir sem responder, ou se você estiver rodando sem ninguém para responder, siga com o que tem e marque os dados ausentes (veja "Dados que faltam"). Sem o nome do negócio, use `[preencher: nome do negócio]`.

### 2. Pesquisar antes de desenhar
- **Segmento**: leia o trecho do segmento em `reference/segmentos.md`. Se o negócio não estiver lá, aplique o mesmo roteiro (o que o cliente procura, seções, materiais, armadilhas) e escreva-o antes de seguir.
- **Concorrência e referências**: se você tiver acesso à web, procure 3 a 5 negócios do mesmo segmento, de preferência da mesma cidade, e anote o que todos fazem igual (é o que evitar) e o que algum faz bem. Sem acesso à web, siga só com as referências da skill e registre isso no resumo da entrega ("pesquisa de concorrentes não feita: sem acesso à web").
- **Materiais do mundo do negócio**: liste de 5 a 8 coisas físicas daquele universo, com a cor de cada uma. Uma oficina tem graxa, macacão azul-petróleo, amarelo de segurança, concreto, aço escovado. Uma padaria tem farinha, crosta tostada, papel kraft, azulejo, café. **A paleta sai dessa lista**, não de uma paleta "moderna" genérica.
- **Fontes**: escolha no catálogo do Google Fonts um par (título e texto) que combine com a personalidade do negócio. Justifique em uma frase. Sem acesso à web, escolha entre fontes que você sabe que estão no catálogo e confira no código que o nome está escrito como no Google Fonts. Evite usar por padrão as fontes que aparecem em todo site gerado (Inter, Poppins, Montserrat, Roboto) se não houver um motivo concreto.

### 3. Três direções, uma escolhida
Escreva três direções realmente diferentes. Diferentes de verdade quer dizer que mudam a estrutura e o tom, não só a cor. Para cada uma:
- **Nome** curto e **conceito** em uma frase.
- **Paleta**: 3 a 5 cores em HEX, cada uma ligada a um material da lista.
- **Tipografia**: o par de fontes e o tamanho do título no celular.
- **Estrutura**: a ordem das seções e o que aparece na primeira tela do celular.
- **Tom do texto**: como o negócio fala (por exemplo: "de vizinho, direto", "técnico e tranquilizador").
- **Risco**: o que pode dar errado com essa direção.

Depois escolha uma e justifique contra as outras duas, pensando no público e no objetivo do site. A primeira ideia costuma ser a que qualquer agente teria: teste-a contra as outras duas antes de escolhê-la. Ela pode vencer, desde que a justificativa venha do negócio concreto e não do costume. Você pode trazer um elemento de uma direção perdedora para a escolhida, se ele resolver um problema real. Se o usuário quiser escolher, mostre as três e espere.

### 4. Codar o site
Padrão: um único `index.html` com Tailwind pelo CDN oficial (`cdn.tailwindcss.com`) e as fontes do Google Fonts. Se o projeto já usa React ou o usuário pedir, gere componentes React com Tailwind.

Regras:
- **Celular primeiro.** Desenhe para 375 px de largura e depois amplie. A primeira tela do celular precisa mostrar o que é o negócio, onde fica e como falar com ele.
- **Contato sempre a um toque**: botão de WhatsApp fixo no celular, telefone clicável, endereço com link para o mapa. Use os trechos de `reference/elementos-brasil.md`.
- **Estrutura vem do segmento**, não de um modelo fixo. Uma marmitaria precisa do cardápio do dia antes de "Sobre nós"; uma clínica precisa de especialidades, convênios e agendamento. A ordem de `segmentos.md` é um ponto de partida: quando ela brigar com o objetivo do site, o objetivo vence (se o site existe para receber encomendas, as encomendas sobem).
- **Fotos**: use as do usuário. Sem fotos, coloque espaços reservados com uma descrição do que a foto deve mostrar (por exemplo, "foto: balcão com pães da manhã, luz natural"), nunca banco de imagens genérico.
- **Acessibilidade**: contraste mínimo AA, texto alternativo nas imagens, tamanho de toque de pelo menos 44 px, `lang="pt-BR"`.
- **Leve**: sem bibliotecas pesadas para um site de uma página. Animação só se tiver função (por exemplo, destacar o horário de hoje), e respeitando `prefers-reduced-motion`.
- **SEO local**: `title` com o que o negócio é e o bairro/cidade, `meta description`, e dados estruturados `LocalBusiness` em JSON-LD com nome, endereço, telefone e horário.

### 5. Revisar antes de entregar
1. Percorra `reference/sinais-de-ia.md` item a item sobre o seu próprio resultado. Corrija cada sinal encontrado.
2. Percorra `reference/texto-pt-br.md` sobre todo o texto da página.
3. Confira os dados: nenhum depoimento, avaliação, número de clientes, anos de mercado, prêmio ou preço que o usuário não tenha dado.
4. Confira no código que WhatsApp, telefone, endereço e horário aparecem e funcionam no celular.

## Dados que faltam
Nunca invente. Onde faltar um dado, deixe um marcador visível no texto, no formato `[preencher: o que falta]`, por exemplo `[preencher: horário de sábado]`. No fim da entrega, liste todos os marcadores para o usuário preencher.

- **Escreva o dado como o usuário deu.** Se ele disse "cartão", escreva "cartão"; não transforme em "crédito e débito" nem acrescente vale-refeição.
- **Descrever o serviço não é inventar.** Pode explicar em termos gerais o que um serviço resolve ("fisioterapia para dor lombar", "troca de pastilha de freio"). Não pode afirmar resultado, prazo, preço ou garantia que o usuário não deu.
- **Registro profissional**: mostre só o número e o conselho que o usuário informar. Sem o número, use `[preencher: número do registro no conselho]`, sem completar a região.
- **Código que a máquina lê** (dados estruturados JSON-LD, atributos de horário, links): nunca coloque marcador ali. Omita o campo que faltar e liste-o nas pendências.
- **Nada no código pode depender de um dado ausente.** Por exemplo, o indicador de "aberto agora" só entra quando todos os horários forem conhecidos.

## Formato da entrega
1. **Resumo do negócio** em três linhas (o que é, para quem, objetivo do site).
2. **Materiais e paleta**: a lista de materiais e as cores que saíram dela.
3. **As três direções** e a justificativa da escolhida.
4. **O código** completo do site.
5. **Revisão**: os sinais de IA encontrados e corrigidos.
6. **Pendências**: a lista de marcadores `[preencher: …]` e o que o usuário precisa fornecer (fotos, dados).

Seja direto. Não descreva o código linha por linha; explique só as decisões que o usuário precisa entender.

## Limites
- Não faz deploy nem registra domínio; pode indicar caminhos (hospedagem estática, por exemplo).
- Não gera fotos nem logo; trabalha com o que o usuário fornecer ou com espaços reservados descritos.
- Textos de privacidade e LGPD são modelos simples; não substituem revisão jurídica.
- A pesquisa de concorrentes depende de o agente ter acesso à web.
