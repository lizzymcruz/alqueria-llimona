/* Builds the Alqueria Llimona demo into /public (English at /, Spanish at /es/).
   Run: node build.js   (Node 18+, no packages needed) */
const fs = require('fs');
const path = require('path');
const L_ = require('./src/lib.js');
const C = require('./src/content.js');
const { esc, split, pic, page, bookingBar, stickyBar, bookBody, writeOut, sitemap, HEADERS, UI } = L_;
const OUT = path.join(__dirname, 'public');

const site = {
  name: 'Alqueria Llimona', code: 'AL', domain: 'https://alqueria-llimona.pages.dev', theme: '#233A8C', og: 'hero',
  address: "Camí de la Llimona 4, 46120 Alboraia, València", ota: 1.11, breakfastOta: 14, version: Date.now().toString(36),
  fonts: ['gloock-latin-400-normal.woff2', 'hanken-grotesk-latin-400-normal.woff2'],
  rooms: C.rooms, extras: C.extras, t: C.t,
  paths: { home: '/', rooms: '/rooms/', book: '/book/', privacy: '/privacy/', legal: '/legal/', accessibility: '/accessibility/' }
};
C.rooms.en.forEach(r => { site.paths['room-' + r.id] = `/rooms/${r.slug}/`; });
site.href = (L, k) => { const [key, hash] = k.split('#'); return (L === 'en' ? '' : '/es') + site.paths[key] + (hash ? '#' + hash : ''); };

/* ---------- brand marks ---------- */
const petals = [0, 72, 144, 216, 288].map(a => `<ellipse cx="60" cy="37" rx="10.5" ry="20" transform="rotate(${a} 60 60)"/>`).join('');
const stamens = [0, 45, 90, 135, 180, 225, 270, 315].map(a => { const r = a * Math.PI / 180, x = 60 + Math.sin(r) * 15, y = 60 - Math.cos(r) * 15; return `<line x1="60" y1="60" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.9" fill="currentColor"/>`; }).join('');
const blossom = (cls = '', ring = false) => `<svg class="${cls}" viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true">${ring ? '<circle cx="60" cy="60" r="57"/><circle cx="60" cy="60" r="53" stroke-width=".7"/>' : ''}${petals}${stamens}<circle cx="60" cy="60" r="5" fill="#F2D35B"/></svg>`;
/* Seal lettering: every glyph placed on its own at a measured angle, so the gaps are even
   all the way round and the capitals sit exactly in the middle of the yellow ring (radius 83). */
const ringText = (str = 'ALQUERIA LLIMONA · ALBORAIA · EST. 1874 · ', r = 83, size = 12.5) => {
  const w = (c) => ({ ' ': .55, '·': .55, '.': .45, I: .55, '1': .75, M: 1.2, Q: 1.1, O: 1.1 })[c] || 1;
  const total = [...str].reduce((a, c) => a + w(c), 0);
  let acc = 0;
  const capHalf = size * 0.35; /* half the cap height, to centre capitals on the ring line */
  return `<g font-family="Hanken Grotesk,sans-serif" font-size="${size}" font-weight="500" fill="#233A8C" text-anchor="middle">${[...str].map(c => {
    const mid = acc + w(c) / 2; acc += w(c);
    if (c === ' ') return '';
    const a = (mid / total) * 360;
    return `<text x="100" y="${(100 - r + capHalf).toFixed(2)}" transform="rotate(${a.toFixed(2)} 100 100)">${c}</text>`;
  }).join('')}</g>`;
};
const seal = (cls = '') => `<svg class="${cls}" viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="98" fill="#F2D35B"/><circle cx="100" cy="100" r="68" fill="#FBFBF9" stroke="#233A8C" stroke-width=".8"/>${ringText()}<g transform="translate(46 46) scale(.9)" fill="none" stroke="#233A8C" stroke-width="1.3">${petals}${stamens}<circle cx="60" cy="60" r="5" fill="#233A8C"/></g></svg>`;
const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M7 17 17 7M8.5 7H17v8.5"/></svg>';

/* ---------- header and footer ---------- */
site.header = (L, key) => {
  const t = C.t[L], other = L === 'en' ? 'es' : 'en';
  const altHref = (lang) => (lang === 'en' ? '' : '/es') + site.paths[key || 'home'];
  const nav = [[t.nav[0], 'rooms'], [t.nav[1], 'home#orchard'], [t.nav[2], 'home#table'], [t.nav[3], 'home#questions']];
  return `<p class="demo-strip">${t.demoTag}</p>
<header class="site-header"><div class="wrap hdr">
<nav aria-label="Main"><ul role="list">${nav.slice(0, 3).map(([n, k]) => `<li><a href="${site.href(L, k)}"${key === k ? ' aria-current="page"' : ''}>${n}</a></li>`).join('')}</ul></nav>
<a class="logo" href="${site.href(L, 'home')}" aria-label="Alqueria Llimona, ${L === 'es' ? 'inicio' : 'home'}">${blossom('logo-mark', true)}<span>Alqueria Llimona</span></a>
<div class="hdr-r"><div class="lang" role="group" aria-label="${L === 'es' ? 'Idioma' : 'Language'}"><a href="${altHref('en')}" hreflang="en" lang="en" ${L === 'en' ? 'aria-current="true"' : ''}>EN</a><a href="${altHref('es')}" hreflang="es" lang="es" ${L === 'es' ? 'aria-current="true"' : ''}>ES</a></div>
<a class="btn btn-ghost btn-sm" href="${site.href(L, 'book')}">${t.reserve}</a>
<button class="icon-btn" type="button" data-menu aria-expanded="false" aria-controls="menu" aria-label="${UI[L].menu}">${L_.ICON.menu}</button></div></div>
<nav id="menu" aria-label="Mobile">${nav.map(([n, k]) => `<a href="${site.href(L, k)}">${n}</a>`).join('')}<a class="btn btn-primary" href="${site.href(L, 'book')}">${t.checkAvail}</a></nav></header>`;
};
site.footer = (L) => {
  const t = C.t[L];
  const col = (h, links) => `<div><h2 class="eyebrow on-dark">${h}</h2><ul role="list">${links.map(([n, k]) => `<li><a href="${site.href(L, k)}">${n}</a></li>`).join('')}</ul></div>`;
  return `<footer class="site-footer"><div class="wrap">
<div class="f-top"><div class="f-brand">${blossom('f-mark', true)}<p class="f-name">Alqueria Llimona</p><address>${site.address}<br>${t.reception} · <a href="tel:+34961000000">+34 961 000 000</a><br><a href="mailto:hola@alquerialimona.example">hola@alquerialimona.example</a></address></div>
${col(t.footStay, t.footLinks)}${col(t.footHouse, t.footLinks2)}${col(t.footPlan, t.footLinks3)}</div>
<div class="f-bot"><p>${t.credit} · <a href="https://lizzymcruz.com">lizzymcruz.com</a></p><p>© <span data-year>2026</span> · ${t.demoTag}</p></div></div>
${blossom('f-wm')}</footer>`;
};

/* ---------- structured data ---------- */
const hotelLD = (L) => ({
  '@context': 'https://schema.org', '@type': 'Hotel', '@id': site.domain + '/#hotel', name: site.name, url: site.domain + (L === 'es' ? '/es/' : '/'),
  description: C.t[L].metaHomeD, image: [`${site.domain}/assets/img/hero-1920.webp`, `${site.domain}/assets/img/orchard-1920.webp`],
  telephone: '+34 961 000 000', email: 'hola@alquerialimona.example', priceRange: '€€€', numberOfRooms: 10, petsAllowed: false, checkinTime: '15:00', checkoutTime: '11:00',
  address: { '@type': 'PostalAddress', streetAddress: 'Camí de la Llimona 4', postalCode: '46120', addressLocality: 'Alboraia', addressRegion: 'València', addressCountry: 'ES' },
  geo: { '@type': 'GeoCoordinates', latitude: 39.4996, longitude: -0.3519 },
  amenityFeature: ['Free parking', 'Free Wi-Fi', 'Breakfast included', 'Garden', 'Bicycles', 'Airport transfer'].map(n => ({ '@type': 'LocationFeatureSpecification', name: n, value: true })),
  availableLanguage: ['en', 'es', 'ca']
});
const faqLD = (L) => ({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: C.t[L].faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) });
const crumbs = (L, items) => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map(([n, k], i) => ({ '@type': 'ListItem', position: i + 1, name: n, item: site.domain + site.href(L, k) })) });

/* ---------- pages ---------- */
function home(L) {
  const t = C.t[L], R = C.rooms[L];
  const body = `
<section class="hero" data-hero>
<div class="wrap hero-copy"><p class="eyebrow" data-hero-fade>${t.heroEyebrow}</p>${split(t.heroH, 'h1', 'class="display"')}
<blockquote data-hero-fade><p>${t.heroQuote}</p><footer>${t.heroBy}</footer></blockquote></div>
<div class="hero-media"><div class="hero-img" data-hero-media>${pic('hero', t.heroAlt, { priority: true, w: 1920, h: 1280 })}</div></div>
<div class="wrap hero-bar">${bookingBar(site, L)}<ul class="perks" role="list">${t.perks.map(p => `<li><span class="pk-ic">${L_.ICON.check}</span>${p}</li>`).join('')}</ul></div>
</section>

<section class="two wrap" aria-label="${t.roomsTile} · ${t.orchardTile}" id="orchard" data-stagger>
${[['rooms-tile', t.roomsTile, t.roomsTileP, t.roomsTileL, 'rooms', 'A doorway into a calm modern bedroom with wooden walls'], ['orchard', t.orchardTile, t.orchardTileP, t.orchardTileL, 'home#questions', 'An arched doorway opening onto a garden of orange trees']].map(([img, h, p, l, k, alt]) => `
<article class="tile"><a href="${site.href(L, k)}" class="tile-link"><div class="tile-img">${pic(img, alt, { sizes: '(min-width: 900px) 45vw, 100vw', w: 1280, h: 1600 })}<span class="round-btn" aria-hidden="true">${ARROW}</span></div><h2 class="h3">${h}</h2></a><p>${p}</p><a class="link" href="${site.href(L, k)}">${l}</a></article>`).join('')}
</section>

<section class="statement" aria-labelledby="st-h"><div class="statement-img" data-open>${pic('j-window', '', { w: 1920, h: 1618 })}<div class="overlay"></div></div>
<div class="statement-copy wrap">${blossom('band-mark')}${split(t.statement, 'h2', 'id="st-h" class="display-m"')}<p data-reveal>${t.statementP}</p></div></section>

<section class="stay" aria-labelledby="stay-h"><div class="wrap stay-head"><div><p class="eyebrow">${t.stayEyebrow}</p>${split(t.stayH, 'h2', 'id="stay-h" class="display-m"')}</div><a class="link" href="${site.href(L, 'rooms')}">${t.allRooms}</a></div>
<div class="rail"><ul class="rail-track wrap" role="list" data-stagger>${R.map(r => `
<li class="room-card"><a href="${site.href(L, 'room-' + r.id)}"><div class="rc-img">${pic(r.img, r.alt, { sizes: '(min-width: 1024px) 30vw, 80vw', w: 1280, h: 1600 })}<span class="round-btn" aria-hidden="true">${ARROW}</span></div>
<div class="rc-meta"><div class="rc-top"><h3>${r.name}</h3><p class="price"><small>${t.from}</small> <b>€${r.price}</b><small>${t.perNight}</small></p></div>${L_.metaList(r.meta, ['door', 'area', 'bed'])}</div></a></li>`).join('')}</ul></div></section>

<section class="iv" aria-labelledby="iv-h"><div class="iv-bg" data-parallax="0.2">${pic('j-orange', '', { w: 1920, h: 1446 })}</div><div class="iv-shade"></div>
<div class="wrap iv-in"><p class="eyebrow on-dark">${t.ivEyebrow}</p>${split(t.ivH, 'h2', 'id="iv-h" class="display-m"')}
<ol class="iv-list" role="list" data-stagger>${t.iv.map(([h, p], i) => `<li><span class="num">${['I', 'II', 'III', 'IV'][i]}</span><h3>${h}</h3><p>${p}</p></li>`).join('')}</ol>
<a class="btn btn-light" href="${site.href(L, 'book')}">${t.reserve}</a></div></section>

<section class="numbers wrap" aria-label="${L === 'es' ? 'Cifras' : 'In numbers'}"><ul role="list" data-stagger>${t.numbers.map(([n, l, suf]) => `<li><b data-count="${n}" data-suffix="${suf || ''}">${n}${suf || ''}</b><span>${l}</span></li>`).join('')}</ul></section>

<section class="heritage" id="story" aria-labelledby="her-h"><div class="wrap her-grid"><div class="her-img"><div class="reveal-img">${pic('heritage', 'An old stone wall with a doorway under a tiled roof', { sizes: '(min-width: 900px) 45vw, 100vw', w: 1280, h: 1920 })}</div>${seal('her-seal')}</div>
<div class="her-copy"><p class="eyebrow">${t.herEyebrow}</p>${split(t.herH, 'h2', 'id="her-h" class="display-m"')}<p data-reveal>${t.herP}</p>
<ol class="timeline" role="list" data-stagger>${t.timeline.map(([y, p]) => `<li><b>${y}</b><p>${p}</p></li>`).join('')}</ol></div></div></section>

<section class="table" id="table" aria-labelledby="tb-h"><div class="tb-copy">${blossom('tb-wm')}<p class="eyebrow">${t.tableEyebrow}</p>${split(t.tableH, 'h2', 'id="tb-h" class="display-m"')}<p data-reveal>${t.tableP}</p><a class="link" href="${site.href(L, 'book')}">${t.reserve}</a></div>
<div class="tb-img reveal-img">${pic('table', 'A long table set with white plates under a pergola of vines', { sizes: '(min-width: 900px) 50vw, 100vw', w: 1920, h: 1281 })}</div></section>

<section class="journal wrap" aria-labelledby="jr-h"><p class="eyebrow center">${t.journalEyebrow}</p>${split(t.journalH, 'h2', 'id="jr-h" class="display-m center"')}
<ul class="jr-grid" role="list" data-stagger>${t.journal.map(([img, alt, cap]) => `<li><figure><div class="jr-img">${pic(img, alt, { sizes: '(min-width: 900px) 20vw, 50vw', w: 640, h: 800 })}</div><figcaption>${cap}</figcaption></figure></li>`).join('')}</ul></section>

<section class="faq" id="questions" aria-labelledby="faq-h"><div class="wrap faq-grid"><div><p class="eyebrow">${t.faqEyebrow}</p>${split(t.faqH, 'h2', 'id="faq-h" class="display-m"')}</div>
<div>${t.faq.map(([q, a], i) => `<details class="qa"${i === 0 ? ' open' : ''}><summary>${q}</summary><p>${a}</p></details>`).join('')}</div></div></section>

<section class="letters" aria-labelledby="lt-h"><div class="wrap center">${blossom('lt-mark')}${split(t.lettersH, 'h2', 'id="lt-h" class="display-s"')}<p>${t.lettersP}</p>
<form class="news" data-demo-form novalidate><label class="sr" for="nl">${t.yourEmail}</label><input id="nl" type="email" name="email" placeholder="${t.yourEmail}" required autocomplete="email"><button class="btn btn-primary" type="submit">${t.subscribe}</button><p class="form-msg" data-form-msg role="status"></p></form></div></section>
${stickyBar(site, L, { label: t.from, value: '€190 ' + t.perNight, cta: t.reserve })}`;
  return page(site, { lang: L, key: 'home', title: t.metaHome, desc: t.metaHomeD, body, jsonld: [hotelLD(L), faqLD(L)] });
}

function roomsPage(L) {
  const t = C.t[L], R = C.rooms[L];
  const body = `<section class="page-head wrap"><p class="eyebrow">${t.stayEyebrow}</p>${split(t.roomsPageH, 'h1', 'class="display"')}<p class="lead" data-reveal>${t.roomsPageP}</p></section>
<section class="wrap rooms-list">${R.map((r, i) => `<article class="rl${i % 2 ? ' rev' : ''}"><a class="reveal-img rl-img" href="${site.href(L, 'room-' + r.id)}" tabindex="-1" aria-hidden="true">${pic(r.img, r.alt, { sizes: '(min-width: 900px) 55vw, 100vw', w: 1280, h: 1600 })}</a>
<div class="rl-copy"><p class="eyebrow">${r.short}</p>${split(r.name, 'h2', 'class="display-m"')}<p>${r.intro}</p><ul class="facts" role="list"><li>${r.size}</li><li>${r.bed}</li><li>${r.view}</li></ul>
<p class="price-l">${t.from} <b>€${r.price}</b> ${t.nightForTwo}</p><div class="btns"><a class="btn btn-primary" href="${site.href(L, 'room-' + r.id)}">${t.viewRoom}<span class="sr"> ${r.name}</span></a><a class="link" href="${site.href(L, 'book')}?room=${r.id}">${t.bookRoom}</a></div></div></article>`).join('')}</section>`;
  return page(site, { lang: L, key: 'rooms', title: t.metaRooms, desc: t.metaRoomsD, body, og: 'rooms-tile', jsonld: [crumbs(L, [['Alqueria Llimona', 'home'], [t.roomsPageH, 'rooms']])] });
}

function roomPage(L, r) {
  const t = C.t[L], R = C.rooms[L], others = R.filter(x => x.id !== r.id);
  const gal = [r.img, 'rooms-tile', 'j-window', 'j-tiles', 'j-lemons'];
  const body = `<section class="wrap room-head"><p class="crumbs"><a href="${site.href(L, 'rooms')}">${L_.ICON.arrowL}${t.allRoomsBack}</a></p><p class="eyebrow">${r.short} · ${r.access}</p>${split(r.name, 'h1', 'class="display"')}<p class="lead" data-reveal>${r.intro}</p></section>
<section class="wrap"><div class="gallery" data-gallery tabindex="0" aria-roledescription="carousel" aria-label="${r.name}, ${gal.length} ${t.photos}"><div class="g-track">${gal.map((g, i) => `<div class="g-slide${i === 0 ? ' is-on' : ''}" role="group" aria-roledescription="slide" aria-label="${i + 1} / ${gal.length}">${pic(g, i === 0 ? r.alt : '', { sizes: '100vw', w: 1920, h: 1080, priority: i === 0, lazy: i > 0 })}</div>`).join('')}</div>
<div class="g-ui"><span data-g-count aria-live="polite">1 / ${gal.length}</span><button type="button" data-g="-1" aria-label="${L === 'es' ? 'Foto anterior' : 'Previous photo'}">${L_.ICON.chevL}</button><button type="button" data-g="1" aria-label="${L === 'es' ? 'Foto siguiente' : 'Next photo'}">${L_.ICON.chevR}</button></div></div></section>
<section class="wrap room-main"><div class="room-copy"><p class="eyebrow">${t.theRoom}</p>${split(r.intro.split('.')[0] + '.', 'h2', 'class="display-s"')}<p data-reveal>${r.body}</p>
<dl class="facts-grid" data-stagger><div><dt>${t.bedL}</dt><dd>${r.bed}</dd></div><div><dt>${t.sizeL}</dt><dd>${r.size}</dd></div><div><dt>${t.viewL}</dt><dd>${r.view}</dd></div><div><dt>${t.accessL}</dt><dd>${r.access}</dd></div></dl>
<h2 class="eyebrow">${t.inRoom}</h2><ul class="amen" role="list">${t.amenities.map(a => `<li>${blossom('bullet')}${a}</li>`).join('')}</ul>
<h2 class="eyebrow">${t.goodToKnow}</h2><ul class="gtk" role="list">${t.gtk.map(([h, p]) => `<li><b>${h}</b><p>${p}</p></li>`).join('')}</ul></div>
<aside class="room-card-book" aria-label="${t.bookRoom}"><p class="rb-price">${t.from} €${r.price} <small>${t.nightForTwo}</small></p><p class="rb-inc">${t.breakfastIncl}</p>
${bookingBar(site, L, { room: r.id, price: r.price, watch: true })}<ul role="list" class="rb-perks">${t.bookBetter.map(b => `<li>${blossom('bullet')}${b}</li>`).join('')}</ul></aside></section>
<section class="wrap others"><p class="eyebrow">${t.alsoHouse}</p>${split(t.otherRooms, 'h2', 'class="display-m"')}<ul class="others-grid" role="list" data-stagger>${others.map(o => `<li class="room-card"><a href="${site.href(L, 'room-' + o.id)}"><div class="rc-img">${pic(o.img, o.alt, { sizes: '(min-width: 900px) 30vw, 100vw', w: 1280, h: 1600 })}<span class="round-btn" aria-hidden="true">${ARROW}</span></div><div class="rc-meta"><div class="rc-top"><h3>${o.name}</h3><p class="price"><small>${t.from}</small> <b>€${o.price}</b><small>${t.perNight}</small></p></div>${L_.metaList(o.meta, ['door', 'area', 'bed'])}</div></a></li>`).join('')}</ul></section>
${stickyBar(site, L, { label: r.name, value: '€' + r.price + ' ' + t.perNight, cta: t.reserve })}`;
  const roomLD = { '@context': 'https://schema.org', '@type': 'HotelRoom', name: r.name, description: r.intro, image: `${site.domain}/assets/img/${r.img}-1280.webp`, floorSize: { '@type': 'QuantitativeValue', value: parseInt(r.size), unitCode: 'MTK' }, occupancy: { '@type': 'QuantitativeValue', maxValue: r.max }, bed: r.bed, containedInPlace: { '@id': site.domain + '/#hotel' },
    offers: { '@type': 'Offer', price: r.price, priceCurrency: 'EUR', availability: 'https://schema.org/InStock', url: site.domain + site.href(L, 'book') + '?room=' + r.id } };
  return page(site, { lang: L, key: 'room-' + r.id, title: `${r.name} · ${r.short} · Alqueria Llimona`, desc: `${r.intro} ${t.from} €${r.price} ${t.nightForTwo}, ${t.breakfastIncl.toLowerCase()}.`, body, og: r.img, jsonld: [roomLD, crumbs(L, [['Alqueria Llimona', 'home'], [t.roomsPageH, 'rooms'], [r.name, 'room-' + r.id]])] });
}

function bookPage(L) {
  const t = C.t[L];
  return page(site, { lang: L, key: 'book', title: t.metaBook, desc: t.metaBookD, body: bookBody(site, L), bodyClass: 'is-book' });
}

const TEXT = {
  privacy: {
    en: ['Privacy policy', ['This is a demonstration website for a fictional hotel. No booking, newsletter or contact data is sent or stored on a server.', 'Your accessibility choices and the dates you search are saved only in your own browser (localStorage) so the site remembers them. You can clear them at any time by clearing your browser data.', 'We do not use cookies, analytics or advertising trackers. Fonts and images are served from this website, with no requests to third parties.', 'On a real hotel website this page would name the data controller, explain the legal basis for processing booking data under the GDPR, how long it is kept, and how to exercise your rights with the Spanish data protection agency (AEPD).']],
    es: ['Política de privacidad', ['Esta es una web de demostración de un hotel ficticio. Los datos de reservas, newsletter o contacto no se envían ni se guardan en ningún servidor.', 'Tus preferencias de accesibilidad y las fechas que buscas se guardan solo en tu navegador (localStorage) para que la web las recuerde. Puedes borrarlas en cualquier momento borrando los datos del navegador.', 'No usamos cookies, analítica ni rastreadores publicitarios. Las fuentes y las imágenes se sirven desde esta web, sin peticiones a terceros.', 'En la web de un hotel real, esta página indicaría el responsable del tratamiento, la base legal para tratar los datos de reserva según el RGPD, el plazo de conservación y cómo ejercer tus derechos ante la AEPD.']]
  },
  legal: {
    en: ['Legal notice', ['Alqueria Llimona is a fictional hotel created as a design and development demonstration by Lizzy Cruz (lizzymcruz.com).', 'All names, addresses, phone numbers and prices on this site are invented. Photographs are from Unsplash and are used under the Unsplash License.', 'On a real hotel website this page would include the company name, tax ID (NIF/CIF), registered address and tourism registration number, as required by Spanish law (LSSI-CE).']],
    es: ['Aviso legal', ['Alqueria Llimona es un hotel ficticio creado como demostración de diseño y desarrollo por Lizzy Cruz (lizzymcruz.com).', 'Todos los nombres, direcciones, teléfonos y precios de esta web son inventados. Las fotografías son de Unsplash y se usan bajo la licencia de Unsplash.', 'En la web de un hotel real, esta página incluiría la razón social, el NIF/CIF, el domicilio social y el número de registro turístico, como exige la LSSI-CE.']]
  },
  accessibility: {
    en: ['Accessibility statement', ['We want everyone to be able to find and book a room on this website, whatever device, browser or assistive technology they use.', 'The site aims to meet WCAG 2.2 level AA. Text and buttons meet contrast requirements, every control can be used with a keyboard and shows a visible focus ring, form fields have labels and clear error messages, and images have text alternatives.', 'Use the accessibility button in the bottom-left corner to make text up to 50% larger, switch to high contrast, stop animations, underline links, add spacing between letters and lines, or use a simpler font. Your choices are remembered on this device.', 'The site also follows your device settings: if you have reduced motion turned on, animations are switched off automatically. Browser zoom up to 400% is supported.', 'Found a problem? Tell us at hola@alquerialimona.example and we will reply within two working days.']],
    es: ['Declaración de accesibilidad', ['Queremos que cualquier persona pueda encontrar y reservar una habitación en esta web, sea cual sea su dispositivo, navegador o tecnología de apoyo.', 'La web busca cumplir las WCAG 2.2 nivel AA. Los textos y botones cumplen los requisitos de contraste, todos los controles se pueden usar con teclado y muestran un foco visible, los campos de formulario tienen etiquetas y mensajes de error claros, y las imágenes tienen texto alternativo.', 'Usa el botón de accesibilidad de la esquina inferior izquierda para aumentar el texto hasta un 50%, activar el alto contraste, detener las animaciones, subrayar los enlaces, añadir espacio entre letras y líneas o usar una fuente más sencilla. Tus preferencias se recuerdan en este dispositivo.', 'La web también respeta los ajustes de tu dispositivo: si tienes activada la reducción de movimiento, las animaciones se desactivan automáticamente. Admite zoom del navegador hasta el 400%.', '¿Has encontrado un problema? Escríbenos a hola@alquerialimona.example y te responderemos en dos días laborables.']]
  }
};
function textPage(L, key) {
  const [h, ps] = TEXT[key][L];
  return page(site, { lang: L, key, title: `${h} · Alqueria Llimona`, desc: ps[0], body: `<section class="wrap text-page"><h1 class="display-m">${h}</h1>${ps.map(p => `<p>${p}</p>`).join('')}</section>` });
}

/* ---------- write everything ---------- */
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
fs.cpSync(path.join(__dirname, 'assets'), path.join(OUT, 'assets'), { recursive: true });
for (const L of ['en', 'es']) {
  const pre = L === 'en' ? '' : '/es';
  writeOut(OUT, pre + '/', home(L));
  writeOut(OUT, pre + '/rooms/', roomsPage(L));
  C.rooms[L].forEach(r => writeOut(OUT, pre + `/rooms/${r.slug}/`, roomPage(L, r)));
  writeOut(OUT, pre + '/book/', bookPage(L));
  ['privacy', 'legal', 'accessibility'].forEach(k => writeOut(OUT, pre + `/${k}/`, textPage(L, k)));
}
const t = C.t.en;
fs.writeFileSync(path.join(OUT, '404.html'), page(site, { lang: 'en', key: 'home', title: 'Page not found · Alqueria Llimona', desc: t.notFoundP, noindex: true, body: `<section class="wrap text-page center">${blossom('lt-mark')}<h1 class="display-m">${t.notFoundH}</h1><p>${t.notFoundP}</p><p class="btns" style="justify-content:center"><a class="btn btn-primary" href="/rooms/">${t.roomsPageH}</a><a class="btn btn-ghost" href="/">${t.backHome}</a></p></section>` }));
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), sitemap(site, Object.keys(site.paths)));
fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${site.domain}/sitemap.xml\n`);
fs.writeFileSync(path.join(OUT, '_headers'), HEADERS);
fs.writeFileSync(path.join(OUT, 'favicon.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="26" fill="#233A8C"/><g fill="none" stroke="#fff" stroke-width="3">${petals}</g><circle cx="60" cy="60" r="8" fill="#F2D35B"/></svg>`);
fs.writeFileSync(path.join(OUT, 'site.webmanifest'), JSON.stringify({ name: site.name, short_name: 'Llimona', start_url: '/', display: 'standalone', background_color: '#FBFBF9', theme_color: site.theme, icons: [{ src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' }] }, null, 1));
console.log('Built', fs.readdirSync(OUT).length, 'entries into public/');
