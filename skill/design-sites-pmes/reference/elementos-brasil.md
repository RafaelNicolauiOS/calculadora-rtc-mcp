# Elementos de sites de pequenos negócios brasileiros

Trechos prontos para adaptar. Troque os valores entre colchetes pelos dados do usuário; sem o dado, use `[preencher: …]`. Os endereços de serviços externos (WhatsApp, Google Maps, Google Fonts, Tailwind) aparecem sem o protocolo nesta referência: no código gerado, use sempre o endereço completo, com o protocolo seguro (https).

## WhatsApp
O contato principal na maioria dos negócios. O link é o domínio `wa.me` seguido do número só com dígitos, com o código do país 55 e o DDD, e da mensagem pré-preenchida codificada para URL no parâmetro `text`.

Exemplo de destino: `wa.me/5511987654321?text=Ol%C3%A1%2C%20vim%20pelo%20site%20e%20queria%20agendar%20um%20hor%C3%A1rio`

Botão fixo no celular (some no desktop, onde o contato fica no cabeçalho). O trecho só define a posição, o tamanho e o ícone: o formato (cantos, sombra, borda) e as cores seguem a direção escolhida, como o resto do site. O verde do WhatsApp é opcional; um botão na cor de destaque da paleta com o ícone também é reconhecido.

```html
<a href="[link do WhatsApp com https]"
   class="fixed bottom-4 right-4 z-50 flex min-h-[48px] items-center gap-2 px-5 py-3 font-semibold md:hidden [cantos, sombra e cores da direção]"
   aria-label="Chamar no WhatsApp">
  <svg aria-hidden="true" viewBox="0 0 24 24" class="h-5 w-5" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 20Zm4.4-6c-.2-.1-1.4-.7-1.7-.8s-.4-.1-.5.1-.6.8-.7.9-.3.2-.5.1a6.5 6.5 0 0 1-3.2-2.8c-.2-.4.2-.4.7-1.3a.4.4 0 0 0 0-.4l-.8-1.8c-.2-.5-.4-.4-.5-.4h-.5a.9.9 0 0 0-.6.3 2.7 2.7 0 0 0-.9 2 4.7 4.7 0 0 0 1 2.5 10.8 10.8 0 0 0 4.1 3.6c1.5.7 2.1.7 2.9.6a2.4 2.4 0 0 0 1.6-1.1 2 2 0 0 0 .1-1.1c0-.1-.2-.2-.4-.3Z"/></svg>
  Chamar no WhatsApp
</a>
```

A mensagem pré-preenchida deve ter a ver com o objetivo do site ("queria fazer uma encomenda", "queria um orçamento, vou mandar a foto").

## Telefone
```html
<a href="tel:+5511987654321" class="underline underline-offset-4">(11) 98765-4321</a>
```

## Endereço e mapa
- Endereço sempre em texto, completo, com link "Como chegar" para o Google Maps (busca pelo endereço no domínio `google.com/maps/search/?api=1&query=` seguido do endereço codificado).
- O mapa incorporado (iframe do Google Maps, gerado em "Compartilhar → Incorporar um mapa") é opcional: pesa na página. Prefira o link, ou carregue o iframe com `loading="lazy"`.
- Informe estacionamento, ponto de referência e acessibilidade quando o usuário souber.

## Horário de funcionamento
- Em texto, num formato fácil de ler: "seg a sex, 8h às 18h · sáb, 8h às 12h · dom, fechado".
- Opcional e útil: destacar o dia de hoje e dizer "aberto agora" ou "fechado agora" com um script curto. O texto completo continua visível sem JavaScript.
- **Só use o indicador quando todos os dias tiverem horário conhecido.** Se algum dia estiver como `[preencher: …]`, deixe só a lista em texto e não inclua o script.
- O script usa o fuso do negócio (no exemplo, `America/Sao_Paulo`), não o do aparelho de quem visita. Troque pelo fuso da cidade: `America/Manaus`, `America/Cuiaba`, `America/Rio_Branco`, `America/Noronha` etc.

```html
<ul id="horario" class="space-y-1">
  <li data-dias="1,2,3,4,5" data-abre="8" data-fecha="18">Seg a sex · 8h às 18h</li>
  <li data-dias="6" data-abre="8" data-fecha="12">Sábado · 8h às 12h</li>
  <li data-dias="0">Domingo · fechado</li>
</ul>
<p id="status" class="mt-2 font-semibold" aria-live="polite"></p>
<script>
  const fuso = "America/Sao_Paulo";
  const partes = Object.fromEntries(new Intl.DateTimeFormat("en-US", {
    timeZone: fuso, weekday: "short", hour: "numeric", minute: "numeric", hourCycle: "h23",
  }).formatToParts(new Date()).map((p) => [p.type, p.value]));
  const dia = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(partes.weekday);
  const h = +partes.hour + +partes.minute / 60;
  for (const li of document.querySelectorAll("#horario li")) {
    if (!li.dataset.dias.split(",").map(Number).includes(dia)) continue;
    li.classList.add("font-semibold");
    const aberto = li.dataset.abre !== undefined && h >= +li.dataset.abre && h < +li.dataset.fecha;
    document.getElementById("status").textContent = aberto ? "Aberto agora" : "Fechado agora";
  }
</script>
```

Para horário quebrado (por exemplo, 8h às 12h e 14h às 18h), use um `li` por período com os mesmos dias.

## Pagamento
Quando relevante, mostre as formas de pagamento em texto: "Pix, cartão de crédito e débito, parcelamos em até [preencher]x". Não exiba chave Pix no site sem o usuário pedir.

## Google Meu Negócio
- Lembre o usuário de que nome, endereço, telefone e horário do site devem ser idênticos aos do perfil no Google: isso ajuda a aparecer nas buscas locais.
- Avaliações do Google só se o usuário fornecer o texto e permitir mostrar; nunca invente nota ou quantidade.
- Link "Avalie no Google" no rodapé, se o usuário tiver o link do perfil.

## Instagram
Para muitos pequenos negócios, o Instagram é a vitrine real. Link visível no cabeçalho ou rodapé, com o @ do perfil. Uma galeria com fotos que o usuário exportar do perfil vale mais que fotos de banco de imagens.

## Dados estruturados (SEO local)
```html
<script type="application/ld+json">
{
  "@context": "[https]schema.org",
  "@type": "[tipo, por exemplo Bakery, Dentist, AutoRepair, HairSalon, Restaurant, LocalBusiness]",
  "name": "[nome]",
  "telephone": "+55 11 98765-4321",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "[rua e número]",
    "addressLocality": "[cidade]",
    "addressRegion": "[UF]",
    "postalCode": "[CEP]",
    "addressCountry": "BR"
  },
  "openingHours": ["Mo-Fr 08:00-18:00", "Sa 08:00-12:00"]
}
</script>
```

No código gerado, `@context` é o endereço completo do schema.org, com o protocolo seguro (https). Inclua só os campos com dados reais: sem o CEP, omita `postalCode`; sem o horário de um dia, omita esse dia de `openingHours`. Nunca coloque `[preencher: …]` dentro do JSON-LD; liste o que faltou nas pendências.

## LGPD e cookies
- Site sem rastreamento (sem Google Analytics, pixel do Meta etc.) e sem formulário: não precisa de aviso de cookies.
- Com formulário: uma frase junto do botão dizendo para que os dados serão usados ("Usamos seu telefone só para responder este pedido").
- Com rastreamento: aviso de cookies simples com opção de recusar, e uma página de privacidade. Diga ao usuário que o texto é um modelo e não substitui revisão jurídica.

## Rodapé
Nome do negócio, endereço completo, telefone, WhatsApp, horário, Instagram e, se o usuário informar, CNPJ e razão social. Para profissões regulamentadas, o registro do responsável (CRM, CRO, OAB, CRC…).

## Fontes e Tailwind
- Tailwind: script do CDN oficial (`cdn.tailwindcss.com`) no `head`. Para produção, sugira ao usuário compilar o CSS.
- Google Fonts: `link` com `preconnect` para `fonts.googleapis.com` e `fonts.gstatic.com`, e `display=swap`. Carregue só os pesos usados.
