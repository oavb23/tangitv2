# Site Tangit Design

Site estático publicado pelo Cloudflare Pages a partir deste repositório.

**Configuração do Pages:** Framework preset `None` · Build command vazio · Build output directory `public`.
Tudo o que vai para o ar fica dentro de `public/`.

## Onde mexer

| O quê | Arquivo |
|---|---|
| Textos da home | `public/index.html` |
| IDs de anúncios (GTM, GA4, Google Ads, Meta Pixel) | topo de `public/assets/js/tangit.js` |
| Mensagens automáticas do WhatsApp | `public/assets/js/tangit.js` → `MESSAGES` |
| Cores, fontes e layout | `public/assets/css/tangit.css` |
| Resumo para IAs (ChatGPT, Claude, Perplexity) | `public/llms.txt` |
| Páginas no Google | `public/sitemap.xml` (incluir cada landing page nova) |

## Rastreamento

- Todo botão de WhatsApp envia o evento `whatsapp_click` para o `dataLayer`, com posição do botão e origem (utm_source, utm_medium, utm_campaign).
- Sem GTM: o clique também dispara `generate_lead` (GA4), a conversão do Google Ads (se o rótulo estiver preenchido) e `Contact` (Meta Pixel).
- Quando a visita vem com UTM, gclid ou fbclid, a mensagem do WhatsApp termina com `[ref: origem/meio/campanha]`, para você saber de onde veio cada conversa.
- Use UTM em todo anúncio. Ex.: `https://tangit.com.br/?utm_source=meta&utm_medium=paid_social&utm_campaign=branding-out26`

## Pendências marcadas no código

- Depoimentos reais: bloco comentado em `public/index.html` (seção `#depoimentos`).
- Links das redes e CNPJ: comentados no rodapé de `public/index.html` e na política de privacidade; links das redes também em `sameAs` do JSON-LD.
- Códigos de verificação do Meta e do Search Console: comentados no `<head>`.
- Ao alterar CSS ou JS, troque `?v=1` por `?v=2` nos `<link>`/`<script>` para atualizar o cache.
