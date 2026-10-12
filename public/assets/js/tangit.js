/*
 * Tangit Design — rastreamento e comportamento do site
 *
 * CONFIGURAÇÃO DE ANÚNCIOS: preencha só os IDs que for usar.
 * - Usando Google Tag Manager? Preencha apenas gtmId e configure GA4, Google Ads e Meta dentro do GTM
 *   (o evento "whatsapp_click" já chega no dataLayer com origem e posição do botão).
 * - Sem GTM? Preencha ga4Id, googleAdsId + googleAdsWhatsappLabel e metaPixelId.
 * Com tudo vazio, nenhuma tag de terceiros é carregada.
 */
window.TANGIT_CONFIG = {
  gtmId: '',                  // ex.: 'GTM-ABC1234'
  ga4Id: '',                  // ex.: 'G-XXXXXXXXXX'
  googleAdsId: '',            // ex.: 'AW-123456789'
  googleAdsWhatsappLabel: '', // rótulo da conversão "Clique no WhatsApp" (ex.: 'AbCdEfGhIjKlMnOp')
  metaPixelId: '',            // ex.: '123456789012345'
  whatsapp: '5515997402304'
};

(function () {
  'use strict';
  var C = window.TANGIT_CONFIG;
  var doc = document;
  window.__tangitReady = true;
  doc.documentElement.classList.add('js');

  /* ---------- Origem do visitante (UTM, gclid, fbclid) ---------- */
  var KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'gbraid', 'wbraid', 'fbclid'];
  function store(kind) {
    try { return kind === 'local' ? window.localStorage : window.sessionStorage; } catch (e) { return null; }
  }
  function read(kind, key) {
    var s = store(kind); if (!s) return null;
    try { return JSON.parse(s.getItem(key) || 'null'); } catch (e) { return null; }
  }
  function write(kind, key, val) {
    var s = store(kind); if (!s) return;
    try { s.setItem(key, JSON.stringify(val)); } catch (e) { /* sem armazenamento */ }
  }

  var params = new URLSearchParams(window.location.search);
  var touch = {};
  KEYS.forEach(function (k) { var v = params.get(k); if (v) touch[k] = v.slice(0, 100); });
  if (!touch.utm_source) {
    if (touch.gclid || touch.gbraid || touch.wbraid) { touch.utm_source = 'google'; touch.utm_medium = 'cpc'; }
    else if (touch.fbclid) { touch.utm_source = 'meta'; touch.utm_medium = 'paid_social'; }
    else if (doc.referrer && doc.referrer.indexOf(window.location.hostname) === -1) {
      try {
        var host = new URL(doc.referrer).hostname.replace(/^www\./, '');
        touch.utm_source = host; touch.utm_medium = /google|bing|duckduckgo|yahoo|ecosia/.test(host) ? 'organic' : 'referral';
      } catch (e) { /* referrer inválido */ }
    }
  }
  if (Object.keys(touch).length) {
    touch.landing = window.location.pathname;
    touch.ts = new Date().toISOString();
    write('session', 'tangit_last_touch', touch);
    var first = read('local', 'tangit_first_touch');
    var expired = first && first.ts && (Date.now() - Date.parse(first.ts)) > 90 * 864e5;
    if (!first || expired) write('local', 'tangit_first_touch', touch);
  }
  var origin = read('session', 'tangit_last_touch') || read('local', 'tangit_first_touch') || {};

  /* ---------- Tags (carregadas só se houver ID) ---------- */
  window.dataLayer = window.dataLayer || [];
  function loadScript(src) { var s = doc.createElement('script'); s.async = true; s.src = src; doc.head.appendChild(s); }

  if (C.gtmId) {
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    loadScript('https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(C.gtmId));
  }
  var gtagId = C.ga4Id || C.googleAdsId;
  if (!C.gtmId && gtagId) {
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    if (C.ga4Id) window.gtag('config', C.ga4Id);
    if (C.googleAdsId) window.gtag('config', C.googleAdsId);
    loadScript('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(gtagId));
  }
  if (!C.gtmId && C.metaPixelId) {
    /* Código padrão do Meta Pixel */
    !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, doc, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', C.metaPixelId);
    window.fbq('track', 'PageView');
  }

  /* ---------- Links de WhatsApp ---------- */
  var MESSAGES = {
    projeto: 'Olá! Vim pelo site da Tangit e quero conversar sobre um projeto.',
    reuniao: 'Olá! Vim pelo site da Tangit e quero agendar uma reunião.',
    metodologia: 'Olá! Vim pelo site da Tangit e quero saber mais sobre a metodologia.',
    implementacao: 'Olá! Vim pelo site da Tangit e quero saber mais sobre a implementação de comunicação e marketing.'
  };
  function waHref(kind) {
    var msg = MESSAGES[kind] || MESSAGES.projeto;
    if (origin.utm_source) {
      msg += ' [ref: ' + [origin.utm_source, origin.utm_medium, origin.utm_campaign].filter(Boolean).join('/') + ']';
    }
    return 'https://wa.me/' + C.whatsapp + '?text=' + encodeURIComponent(msg);
  }

  doc.querySelectorAll('a[data-wa]').forEach(function (a) {
    a.href = waHref(a.getAttribute('data-wa'));
    a.addEventListener('click', function () {
      var where = a.getAttribute('data-wa-pos') || 'site';
      var payload = {
        event: 'whatsapp_click',
        wa_position: where,
        wa_intent: a.getAttribute('data-wa') || 'projeto',
        traffic_source: origin.utm_source || '(direct)',
        traffic_medium: origin.utm_medium || '(none)',
        traffic_campaign: origin.utm_campaign || '(not set)'
      };
      window.dataLayer.push(payload);
      if (window.gtag && !C.gtmId) {
        if (C.ga4Id) window.gtag('event', 'generate_lead', { method: 'whatsapp', wa_position: where });
        if (C.googleAdsId && C.googleAdsWhatsappLabel) window.gtag('event', 'conversion', { send_to: C.googleAdsId + '/' + C.googleAdsWhatsappLabel });
      }
      if (window.fbq && !C.gtmId) window.fbq('track', 'Contact', { content_name: 'WhatsApp ' + where });
    });
  });

  /* ---------- Menu mobile ---------- */
  var toggle = doc.querySelector('.menu-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = doc.body.classList.toggle('menu-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    doc.querySelectorAll('.nav a').forEach(function (a) {
      a.addEventListener('click', function () { doc.body.classList.remove('menu-open'); toggle.setAttribute('aria-expanded', 'false'); });
    });
  }

  /* ---------- Revelação suave ---------- */
  var items = doc.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('is-visible'); });
  }

  var year = doc.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();
})();
