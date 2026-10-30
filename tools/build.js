/* GWK Horse · oldal-generátor.
   Futtatás: node tools/build.js   (a weboldal mappából)
   Minden HTML ebből készül: közös fejléc, lábléc, kosár-drawer, és az 5 termékoldal a products.js-ből.
   Új termék, ár, szöveg után újra kell futtatni. A kimenet dupla kattintással, file://-ről is működik. */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const C = require(path.join(ROOT, 'js/data/config.js'));
const D = require(path.join(ROOT, 'js/data/products.js'));
const I = require(path.join(ROOT, 'js/data/i18n.js'));
const ICONS = (function () {
  const src = fs.readFileSync(path.join(ROOT, 'js/data/icons.js'), 'utf8');
  const win = {}; new Function('window', src)(win); return win;
})();
const LINE = ICONS.GWK_ICONS_LINE;
const META = JSON.parse(fs.readFileSync(path.join(ROOT, 'media/kepek-meta.json'), 'utf8'));
const V = '22'; // cache-bust: iterációnként léptetni

const HU = I.hu;
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const money = n => new Intl.NumberFormat('hu-HU').format(n).replace(/\s/g, '\u00a0') + '\u00a0Ft';
const fmt = (s, vars) => String(s).replace(/\{(\w+)\}/g, (m, k) => (vars && vars[k] != null ? vars[k] : m));
function tx(key, vars) { if (!(key in HU)) throw new Error('Hiányzó fordítás: ' + key); return fmt(HU[key], vars); }
const ico = (n, cls) => `<svg class="icon${cls ? ' ' + cls : ''}" viewBox="0 0 256 256" aria-hidden="true" focusable="false">${ICONS.GWK_ICONS[n].map(d => `<path d="${d}"/>`).join('')}</svg>`;
// vonalas (Lucide) ikon: kitöltés nélkül, 1,4-es vonal
const icoLine = n => `<svg class="icon icon--line" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${LINE[n].map(d => `<path d="${d}"/>`).join('')}</svg>`;
// data-i18n szöveg
const T = (key, tag = 'span', attrs = '') => `<${tag} data-i18n="${key}"${attrs ? ' ' + attrs : ''}>${esc(tx(key))}</${tag}>`;
const FREE = money(C.freeShippingFrom);

function imgMeta(src) {
  const name = path.basename(src).replace(/\.webp$/, '');
  return META[name];
}
// vitrin: a kép egészben, mögötte a saját elmosott másolata
function vit(im, alt, sizes, opts = {}) {
  if (!im) return `<div class="soon"><img src="{B}media/logo/logo-felirat-sotet-480.webp" alt="" width="480" height="273" loading="lazy">${T('card.soon')}</div>`;
  const B = '{B}';
  const set = im.small ? `srcset="${B}${im.small} 800w, ${B}${im.src} ${im.w}w" sizes="${sizes}"` : '';
  const alt2 = opts.alt2 ? `<img class="vit__img vit__img--alt" src="${B}${opts.alt2.small || opts.alt2.src}" alt="" aria-hidden="true" loading="lazy" width="${opts.alt2.w}" height="${opts.alt2.h}">` : '';
  return `<div class="vit${opts.cls ? ' ' + opts.cls : ''}"><img class="vit__bg" src="${B}${im.small || im.src}" alt="" aria-hidden="true" loading="lazy" width="${im.w}" height="${im.h}">` +
    `${alt2}<img class="vit__img vit__img--main${opts.alt2 ? ' has-alt' : ''}" src="${B}${im.src}" ${set} alt="${esc(alt)}" width="${im.w}" height="${im.h}" loading="${opts.eager ? 'eager' : 'lazy'}"${opts.eager ? ' fetchpriority="high"' : ''}></div>`;
}
const colorsOf = p => D.COLOR_ORDER.filter(c => c in p.colors);
const firstImg = (p, c) => { const arr = p.colors[c || colorsOf(p)[0]]; return arr && arr[0] ? arr[0] : null; };
const pName = p => `<span data-p="${p.id}" data-pf="name">${esc(p.name.hu)}</span>`;
const pType = p => `<span data-p="${p.id}" data-pf="type">${esc(p.type.hu)}</span>`;
const priceEl = (p, cls = '') => `<span class="${cls}" data-price="${p.price}" data-per="${p.unit}">${money(p.price)}${p.unit === 'par' ? ' <small data-i18n="per.par">' + tx('per.par') + '</small>' : ''}</span>`;
const sw = c => `<i class="sw sw--${c}" aria-hidden="true"></i>`;

function card(p, c, sizes) {
  const arr = p.colors[c] || [];
  const im = arr[0] || null, alt2 = arr[1] || null;
  const alt = `${p.name.hu}, ${c}`;
  const search = [p.name.hu, p.name.en, p.type.hu, p.type.en, c].join(' ').toLowerCase();
  return `<a class="card" href="{B}${p.page}?szin=${c}" data-type="${p.id}" data-color="${c}" data-search="${esc(search)}" data-view="${esc(tx('idx.view'))}" data-reveal>` +
    vit(im, alt, sizes, { alt2 }) +
    `<div class="card__meta"><span class="card__name">${pName(p)}</span>${priceEl(p, 'card__price')}` +
    `<span class="card__sub">${sw(c)}<span data-i18n="color.${c}">${tx('color.' + c)}</span>${D.isOut(p, c) ? `<span class="card__out" data-i18n="stock.out">${tx('stock.out')}</span>` : ''}</span></div></a>`;
}

/* ---------------- közös részek ---------------- */
function head(o) {
  return `<!DOCTYPE html>
<html lang="hu" data-title="${o.titleKey}" data-desc="${o.descKey || ''}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(tx(o.titleKey))}</title>
${o.descKey ? `<meta name="description" content="${esc(tx(o.descKey))}">` : ''}
<meta name="theme-color" content="#F7F2EA">
<meta property="og:title" content="${esc(tx(o.titleKey))}">
<meta property="og:image" content="{B}media/hangulat/lo-hero-m-1200.webp">
<link rel="icon" href="{B}media/logo/favicon.png" type="image/png">
<link rel="apple-touch-icon" href="{B}media/logo/apple-touch-icon.png">
<script>document.documentElement.classList.add('js');window.GWK_BASE='{B}';try{if(localStorage.getItem('${C.storageKeys.lang}')==='en'){document.documentElement.classList.add('i18n-wait');setTimeout(function(){document.documentElement.classList.remove('i18n-wait')},1400)}}catch(e){}</script>
<style>.i18n-wait body{opacity:0}</style>
<link rel="stylesheet" href="{B}js/vendor/lenis.css?v=${V}">
<link rel="stylesheet" href="{B}css/site.css?v=${V}">
${o.preload || ''}
</head>
<body class="${o.bodyClass || ''}" data-page="${o.page}">
<a class="skip" href="#main">${esc(tx('skip'))}</a>`;
}

function header(active) {
  const links = [['bolt.html', 'nav.shop'], ['galeria.html', 'nav.gallery'], ['kollekcio.html', 'nav.collection'], ['tortenet.html', 'nav.story'], ['kapcsolat.html', 'nav.contact']];
  const a = links.map(([h, k]) => `<a href="{B}${h}" data-i18n="${k}"${active === h ? ' aria-current="page"' : ''}>${tx(k)}</a>`).join('');
  return `
<header class="hdr" id="hdr">
  <div class="ann">
    <span data-i18n="ann.ship" data-vars='{"n":"$free"}'>${esc(tx('ann.ship', { n: FREE }))}</span><i class="ann__sep ann__long" aria-hidden="true"></i><span class="ann__long" data-i18n="ann.brand">${tx('ann.brand')}</span>
    <div class="lang" role="group" aria-label="Nyelv / Language"><button type="button" data-lang="hu" aria-pressed="true" lang="hu">HU</button><button type="button" data-lang="en" aria-pressed="false" lang="en">EN</button></div>
  </div>
  <nav class="nav" aria-label="Fő menü">
    <a class="nav__brand" href="{B}index.html" data-i18n-attr="aria-label:nav.home" aria-label="${esc(tx('nav.home'))}"><img src="{B}media/logo/logo-felirat-sotet-480.webp" width="480" height="273" alt="GWK Horse"></a>
    <div class="nav__links">${a}</div>
    <div class="nav__act">
      <button type="button" class="ibtn" data-open="search" data-i18n-attr="aria-label:nav.search" aria-label="${esc(tx('nav.search'))}">${ico('magnifying-glass')}</button>
      <button type="button" class="ibtn" data-open="cart" data-i18n-attr="aria-label:nav.cart" aria-label="${esc(tx('nav.cart'))}">${ico('bag-simple')}<span class="cart-count" aria-live="polite">0</span></button>
      <button type="button" class="ibtn burger" data-open="menu" aria-expanded="false" aria-controls="mnav" data-i18n-attr="aria-label:nav.menu" aria-label="${esc(tx('nav.menu'))}">${ico('list')}</button>
    </div>
  </nav>
</header>
<div class="mnav" id="mnav" aria-hidden="true">
  <nav class="mnav__links" aria-label="Mobil menü">${links.map(([h, k]) => `<a href="{B}${h}" data-i18n="${k}">${tx(k)}</a>`).join('')}</nav>
  <p class="mnav__foot"><span data-i18n="mnav.mail">${tx('mnav.mail')}</span> <a href="mailto:${C.email}">${C.email}</a></p>
</div>`;
}

function overlays() {
  return `
<div class="scrim" id="scrim"></div>
<aside class="drawer" id="drawer" role="dialog" aria-modal="true" aria-labelledby="drawerH" aria-hidden="true" data-lenis-prevent>
  <div class="drawer__h"><h2 id="drawerH" data-i18n="cart.h">${tx('cart.h')}</h2><button type="button" class="ibtn" data-close="cart" data-i18n-attr="aria-label:nav.close" aria-label="${esc(tx('nav.close'))}">${ico('x')}</button></div>
  <div class="drawer__body" id="drawerBody"></div>
  <div class="drawer__f" id="drawerFoot"></div>
</aside>
<div class="srch" id="srch" role="dialog" aria-modal="true" aria-label="${esc(tx('srch.label'))}" aria-hidden="true">
  <div class="srch__top">${ico('magnifying-glass')}<label for="srchIn" class="sr-only" data-i18n="srch.label">${tx('srch.label')}</label><input id="srchIn" type="search" autocomplete="off" data-i18n-attr="placeholder:srch.ph" placeholder="${esc(tx('srch.ph'))}"><button type="button" class="ibtn" data-close="search" data-i18n-attr="aria-label:nav.close" aria-label="${esc(tx('nav.close'))}">${ico('x')}</button></div>
  <div class="srch__res" id="srchRes"></div>
</div>
<div class="toast" id="toast" role="status" aria-live="polite">${ico('check')}<span></span></div>`;
}

function footer(o) {
  o = o || {};
  const prods = D.PRODUCTS.map(p => `<li><a href="{B}${p.page}">${pType(p)}</a></li>`).join('');
  return `
<footer class="foot">
  <div class="wrap">${o.noSub ? '' : subscribe({ cls: 'sub--foot', id: 'subF' })}
    <div class="foot__grid">
      <div class="foot__brand"><img src="{B}media/logo/logo-kor-sotet-400.webp" width="400" height="400" alt="GWK Horse" loading="lazy"><p data-i18n="foot.p">${tx('foot.p')}</p>${social('foot__soc')}</div>
      <div><h2 data-i18n="foot.shop">${tx('foot.shop')}</h2><ul>${prods}</ul></div>
      <div><h2 data-i18n="foot.brand">${tx('foot.brand')}</h2><ul>
        <li><a href="{B}galeria.html" data-i18n="nav.gallery">${tx('nav.gallery')}</a></li>
        <li><a href="{B}kollekcio.html" data-i18n="nav.collection">${tx('nav.collection')}</a></li>
        <li><a href="{B}tortenet.html" data-i18n="nav.story">${tx('nav.story')}</a></li>
        <li><a href="{B}kapcsolat.html" data-i18n="nav.contact">${tx('nav.contact')}</a></li></ul></div>
      <div><h2 data-i18n="foot.help">${tx('foot.help')}</h2><ul>
        <li><a href="{B}aszf.html" data-i18n="foot.aszf">${tx('foot.aszf')}</a></li>
        <li><a href="{B}adatkezeles.html" data-i18n="foot.adat">${tx('foot.adat')}</a></li>
        <li><a href="{B}impresszum.html" data-i18n="foot.imp">${tx('foot.imp')}</a></li>
        <li><a href="mailto:${C.email}">${C.email}</a></li></ul></div>
    </div>
    <div class="foot__bot"><span data-i18n="foot.copy" data-vars='{"y":"$year"}'>${tx('foot.copy', { y: 2026 })}</span><span data-i18n="foot.demo">${tx('foot.demo')}</span></div>
  </div>
</footer>`;
}

/* közösségi linkek: a config.social-ból, ami üres (pl. tiktok: ''), az nem kerül ki */
const SOCIAL = ['facebook', 'instagram', 'tiktok'];
function social(cls) {
  const items = SOCIAL.filter(k => C.social && C.social[k]).map(k =>
    `<li><a class="soc__a" href="${esc(C.social[k])}" target="_blank" rel="noopener" data-i18n-attr="aria-label:soc.${k}" aria-label="${esc(tx('soc.' + k))}">${icoLine(k)}</a></li>`).join('');
  return items ? `<ul class="soc${cls ? ' ' + cls : ''}">${items}</ul>` : '';
}
/* feliratkozás új termékre (Web3Forms, js/subscribe.js). A tárgy a termék magyar neve. */
function subscribe(o) {
  const id = o.id;
  return `
<section class="sub ${o.cls}" aria-labelledby="${id}H">
  <div class="sub__txt"><h2 class="sub__h" id="${id}H" data-i18n="sub.h">${tx('sub.h')}</h2><p class="sub__p" data-i18n="sub.p">${tx('sub.p')}</p></div>
  <form class="sub__form" id="${id}" data-sub="${esc(o.product || '')}" novalidate>
    <div class="sub__row"><div class="sub__fld"><label for="${id}Mail" class="sr-only" data-i18n="sub.email">${tx('sub.email')}</label><input id="${id}Mail" name="email" type="email" autocomplete="email" required data-i18n-attr="placeholder:sub.email" placeholder="${esc(tx('sub.email'))}"></div>
      <button class="btn sub__btn" type="submit"><span data-i18n="sub.btn">${tx('sub.btn')}</span>${ico('arrow-right')}</button></div>
    <label class="chk sub__chk"><input type="checkbox" name="consent" required><span data-i18n-html="sub.consent">${tx('sub.consent', { B: '{B}' })}</span></label>
    <input type="checkbox" name="botcheck" class="sub__hp" tabindex="-1" autocomplete="off" aria-hidden="true">
    <p class="sub__msg" role="status" aria-live="polite"></p>
  </form>
</section>`;
}

/* „Szólj, ha újra van” (termékoldal, elfogyott színnél a Kosárba helyén). A js/subscribe.js küldi (data-notify).
   Látszólagos: Web3Forms-levél a boltnak; a valódi háttér (feliratkozók adatbázisa, automatikus levél) a backenddel jön. */
function notify(p, c, out) {
  const C0 = c[0].toUpperCase() + c.slice(1);
  return `<section class="notify" id="notify" aria-labelledby="notifyH"${out ? '' : ' hidden'}>
      <h2 class="notify__h" id="notifyH" data-i18n="notify.h">${tx('notify.h')}</h2>
      <p class="notify__p" id="notifyP">${esc(tx('notify.p', { p: p.name.hu, c: C0 }))}</p>
      <form class="notify__form" id="subN" data-sub="${esc(p.name.hu)}" data-notify="${esc(p.name.hu)}" data-notify-c="${C0}" data-notify-s="${p.sizes[0]}" novalidate>
        <div class="sub__fld"><label for="subNMail" class="notify__l" data-i18n="sub.email">${tx('sub.email')}</label><input id="subNMail" name="email" type="email" autocomplete="email" required></div>
        <label class="chk sub__chk"><input type="checkbox" name="consent" required><span data-i18n-html="sub.consent">${tx('sub.consent', { B: '{B}' })}</span></label>
        <input type="checkbox" name="botcheck" class="sub__hp" tabindex="-1" autocomplete="off" aria-hidden="true">
        <button class="btn btn--solid btn--block notify__btn" type="submit"><span data-i18n="notify.btn">${tx('notify.btn')}</span>${ico('envelope-simple')}</button>
        <p class="sub__msg" role="status" aria-live="polite"></p>
      </form>
    </section>`;
}

function scripts(extra) {
  const s = ['js/data/config.js', 'js/data/i18n.js', 'js/data/i18n-pages.js', 'js/data/products.js', 'js/data/icons.js',
    'js/vendor/gsap.min.js', 'js/vendor/ScrollTrigger.min.js', 'js/vendor/lenis.min.js', 'js/site.js', 'js/subscribe.js'].concat(extra || []);
  return s.map(f => `<script defer src="{B}${f}?v=${V}"></script>`).join('\n') + '\n</body>\n</html>\n';
}

function page(o) {
  return head(o) + header(o.active) + `\n<main id="main">\n${o.main}\n</main>` + (o.noFooter ? '' : footer(o)) + overlays() + '\n' + scripts(o.js);
}

/* ---------------- FŐOLDAL (egyszerűbb változat, Krisztina 2026-10-16 referenciája szerint) ----------------
   Első képernyő: hero (ló kantárral + szöveges panel) és alatta a kör alakú kategória-sor, együtt pontosan egy képernyő.
   Alatta: érték-sáv, Evening Star kollekció-blokk, bemutatkozás. */
/* Hero-kép (v2, 2026-10-19): Pexels 6848299 (Alexas Fotos, Pexels-licenc). A fotó bal oldalon, a ló feje egészben,
   jobbra a fotó szélének elmosott színmezője, ez megy a krém áttűnés alá (Claude tesztelés\gwk-atdolgozas-2026-10-19\hero-v2\hero-v2-kep.py).
   Desztopon a kép a teljes hero-szélesség, magasság szerint cover, balra horgonyozva: kirajzolt szélessége kb. 4,4 × a hero magassága. */
/* Hero v4 (2026-10-21, David: „a jobb oldalát nem kell elhomályosítani”): egyetlen valódi fotó, elmosás és tükrözés
   nélkül, Pexels 13340063 (sötét pej ló aranyórában). Asztalon a teljes fotó cover, balra horgonyozva, a szöveg a fotó
   saját sötét, nyugodt jobb oldalán; mobilon 4:5 kivágás a fejre (kor-1021\hero-v4-kep.py). */
const HERO_IMG = { w: 3200, h: 2133, sizes: 'max(100vw, 150vh)', mw: 1600, mh: 1904, mSizes: '100vw' };
const CATS = ['nyeregalatet', 'fulvedo', 'kantar', 'labvedo', 'pataharang'];
const VALUES = [['gem', 'val.1'], ['heart', 'val.2'], ['shield-check', 'val.3'], ['infinity', 'val.4']];
function home() {
  const cats = CATS.map(id => {
    const p = D.byId(id);
    return `<li><a class="cat" href="{B}bolt.html?tipus=${id}"><span class="cat__img"><img src="{B}media/kor/${id}.webp" width="480" height="480" alt="" loading="lazy"></span><span class="cat__name">${pType(p)}</span></a></li>`;
  }).join('');
  const vals = VALUES.map(([ic, k]) => `<li class="val">${icoLine(ic)}<p><b data-i18n="${k}a">${tx(k + 'a')}</b><span data-i18n="${k}b">${tx(k + 'b')}</span></p></li>`).join('');
  const szett = META['szett-rose'] || { w: 1280, h: 960 };
  const main = `
<section class="top" id="hero" aria-labelledby="heroH">
  <div class="hero">
    <figure class="hero__img"><picture><source media="(max-width:960px), (max-aspect-ratio:13/10)" srcset="{B}media/hangulat/lo-hero-v4-m-800.webp 800w, {B}media/hangulat/lo-hero-v4-m-1200.webp 1200w, {B}media/hangulat/lo-hero-v4-m-1600.webp 1600w" sizes="${HERO_IMG.mSizes}" width="${HERO_IMG.mw}" height="${HERO_IMG.mh}"><img src="{B}media/hangulat/lo-hero-v4-2400.webp" srcset="{B}media/hangulat/lo-hero-v4-1600.webp 1600w, {B}media/hangulat/lo-hero-v4-2400.webp 2400w, {B}media/hangulat/lo-hero-v4-3200.webp 3200w" sizes="${HERO_IMG.sizes}" width="${HERO_IMG.w}" height="${HERO_IMG.h}" alt="${esc(tx('hero.alt'))}" data-i18n-attr="alt:hero.alt" fetchpriority="high"></picture></figure>
    <div class="hero__panel" data-on-photo>
      <p class="label hero__label" data-i18n="hero.label">${tx('hero.label')}</p>
      <h1 class="hero__title" id="heroH"><span class="ln"><span data-i18n="hero.l1">${tx('hero.l1')}</span></span><span class="ln"><span><em data-i18n="hero.l2">${tx('hero.l2')}</em></span></span></h1>
      <p class="hero__tri"><span data-i18n="hero.t1">${tx('hero.t1')}</span><span data-i18n="hero.t2">${tx('hero.t2')}</span><span data-i18n="hero.t3">${tx('hero.t3')}</span></p>
      <p class="hero__more" data-i18n="hero.more">${tx('hero.more')}</p>
      <a class="btn btn--solid hero__btn" href="{B}galeria.html"><span data-i18n="hero.cta">${tx('hero.cta')}</span>${ico('arrow-right')}</a>
    </div>
  </div>
</section>
<nav class="cats" aria-label="${esc(tx('cats.label'))}" data-i18n-attr="aria-label:cats.label"><ul class="cats__list wrap">${cats}</ul></nav>

<section class="vals" aria-label="${esc(tx('vals.label'))}" data-i18n-attr="aria-label:vals.label">
  <ul class="vals__list wrap">${vals}</ul>
</section>

<section class="es" aria-labelledby="esH">
  <div class="es__in wrap">
    <div class="es__txt">
      <p class="label" data-i18n="es.label" data-reveal>${tx('es.label')}</p>
      <h2 class="es__h" id="esH" data-reveal>Evening <em>Star</em></h2>
      <p class="es__p" data-i18n="es.p" data-reveal>${tx('es.p')}</p>
      <p class="es__sw" data-reveal>${D.COLOR_ORDER.map(c => `<span>${sw(c)}<span data-i18n="color.${c}">${tx('color.' + c)}</span></span>`).join('')}</p>
      <a class="btn btn--solid" href="{B}bolt.html" data-reveal="2"><span data-i18n="es.btn">${tx('es.btn')}</span>${ico('arrow-right')}</a>
    </div>
    <figure class="es__img" data-reveal><img src="{B}media/kollekcio/szett-rose.webp" srcset="{B}media/kollekcio/szett-rose-800.webp 800w, {B}media/kollekcio/szett-rose.webp 1280w" sizes="(max-width:960px) 92vw, 54vw" width="${szett.w}" height="${szett.h}" alt="${esc(tx('es.alt'))}" data-i18n-attr="alt:es.alt" loading="lazy"></figure>
  </div>
</section>

<section class="duo" aria-label="${esc(tx('duo.label'))}" data-i18n-attr="aria-label:duo.label">
  <div class="duo__in">
  <article class="duo__p">
    <figure class="duo__img duo__img--det"><img src="{B}media/kollekcio/gwk-reszlet-528.webp" width="528" height="440" alt="${esc(tx('duo.d.alt'))}" data-i18n-attr="alt:duo.d.alt" loading="lazy"></figure>
    <div class="duo__txt">
      <h2 class="duo__h" data-i18n="duo.d.h">${tx('duo.d.h')}</h2>
      <a class="tlink duo__a" href="{B}kollekcio.html"><span data-i18n="duo.d.a">${tx('duo.d.a')}</span>${ico('arrow-right')}</a>
    </div>
  </article>
  <article class="duo__p">
    <figure class="duo__img duo__img--lo"><img src="{B}media/hangulat/rolunk-lo-fekvo-1600.webp" srcset="{B}media/hangulat/rolunk-lo-fekvo-1000.webp 1000w, {B}media/hangulat/rolunk-lo-fekvo-1600.webp 1600w, {B}media/hangulat/rolunk-lo-fekvo-2200.webp 2200w" sizes="(max-width:960px) 140vw, 1000px" width="2200" height="1466" alt="${esc(tx('duo.g.alt'))}" data-i18n-attr="alt:duo.g.alt" loading="lazy"></figure>
    <div class="duo__txt">
      <h2 class="duo__h" data-i18n="duo.g.l">${tx('duo.g.l')}</h2>
      <blockquote class="duo__q"><p>„<span data-i18n="story.q">${tx('story.q')}</span>”</p><cite data-i18n="story.cite">${tx('story.cite')}</cite></blockquote>
      <a class="tlink duo__a" href="{B}tortenet.html"><span data-i18n="story.a">${tx('story.a')}</span>${ico('arrow-right')}</a>
    </div>
  </article>
  </div>
</section>

<section class="moment" aria-labelledby="momH">
  <figure class="moment__img"><img src="{B}media/hangulat/pillanat-1800.webp" srcset="{B}media/hangulat/pillanat-1200.webp 1200w, {B}media/hangulat/pillanat-1800.webp 1800w, {B}media/hangulat/pillanat-2600.webp 2600w" sizes="100vw" width="2600" height="1733" alt="${esc(tx('mom.alt'))}" data-i18n-attr="alt:mom.alt" loading="lazy"></figure>
  <div class="moment__in wrap">
    <p class="moment__t" id="momH" data-i18n="mom.t">${tx('mom.t')}</p>
    <a class="btn btn--cream moment__btn" href="{B}galeria.html"><span data-i18n="mom.btn">${tx('mom.btn')}</span>${ico('arrow-right')}</a>
  </div>
</section>`;
  return page({ page: 'home', titleKey: 'home.title', descKey: 'home.desc', active: '', main, js: ['js/home.js'],
    preload: `<link rel="preload" as="image" media="(min-width:961px) and (min-aspect-ratio:13/10)" href="{B}media/hangulat/lo-hero-v4-2400.webp" imagesrcset="{B}media/hangulat/lo-hero-v4-1600.webp 1600w, {B}media/hangulat/lo-hero-v4-2400.webp 2400w, {B}media/hangulat/lo-hero-v4-3200.webp 3200w" imagesizes="${HERO_IMG.sizes}">\n<link rel="preload" as="image" media="(max-width:960px), (max-aspect-ratio:13/10)" href="{B}media/hangulat/lo-hero-v4-m-1200.webp" imagesrcset="{B}media/hangulat/lo-hero-v4-m-800.webp 800w, {B}media/hangulat/lo-hero-v4-m-1200.webp 1200w, {B}media/hangulat/lo-hero-v4-m-1600.webp 1600w" imagesizes="${HERO_IMG.mSizes}">` });
}

/* ---------------- BOLT ---------------- */
function shop() {
  const cards = [];
  D.PRODUCTS.forEach(p => colorsOf(p).forEach(c => cards.push(card(p, c, '(max-width:700px) 46vw, (max-width:1100px) 31vw, 23vw'))));
  const typeChips = [`<button type="button" class="chip" data-f="type" data-v="" aria-pressed="true" data-i18n="f.all">${tx('f.all')}</button>`]
    .concat(D.PRODUCTS.map(p => `<button type="button" class="chip" data-f="type" data-v="${p.id}" aria-pressed="false">${pType(p)}</button>`)).join('');
  const colChips = [`<button type="button" class="chip" data-f="color" data-v="" aria-pressed="true" data-i18n="f.all">${tx('f.all')}</button>`]
    .concat(D.COLOR_ORDER.map(c => `<button type="button" class="chip" data-f="color" data-v="${c}" aria-pressed="false">${sw(c)}<span data-i18n="color.${c}">${tx('color.' + c)}</span></button>`)).join('');
  const main = `
<section class="pg-top wrap" aria-labelledby="shopH">
  <div class="shop-h"><h1 id="shopH" data-i18n="shop.h">${tx('shop.h')}</h1><p class="shop-h__count" id="shopCount" aria-live="polite">${tx('shop.count', { n: cards.length })}</p></div>
  <div class="filters">
    <div class="fgroup" role="group" aria-label="${esc(tx('f.type'))}"><span class="fgroup__l" data-i18n="f.type">${tx('f.type')}</span>${typeChips}</div>
    <div class="fgroup" role="group" aria-label="${esc(tx('f.color'))}"><span class="fgroup__l" data-i18n="f.color">${tx('f.color')}</span>${colChips}</div>
    <div class="view" role="group" aria-label="${esc(tx('f.view'))}"><button type="button" data-v="3" aria-pressed="false">3</button><button type="button" data-v="4" aria-pressed="true">4</button></div>
  </div>
  <div class="pgrid" id="pgrid" data-view="4">${cards.join('')}
    <div class="empty" id="empty" hidden><p data-i18n="shop.empty">${tx('shop.empty')}</p><button type="button" class="btn btn--line" id="reset" data-i18n="shop.reset">${tx('shop.reset')}</button></div>
  </div>
</section>`;
  return page({ page: 'shop', titleKey: 'shop.title', descKey: 'shop.desc', active: 'bolt.html', main, js: ['js/shop.js'], bodyClass: 'solid' });
}

/* ---------------- TERMÉKOLDAL ---------------- */
function product(p) {
  const cs = colorsOf(p);
  const c0 = cs[0];
  const gal = (p.colors[c0] || []).map((im, i) =>
    `<figure>${`<img src="{B}${im.src}" ${im.small ? `srcset="{B}${im.small} 800w, {B}${im.src} ${im.w}w" sizes="(max-width:960px) 86vw, 56vw"` : ''} width="${im.w}" height="${im.h}" alt="${esc(p.name.hu)}, ${c0}, ${i + 1}. fotó"${i === 0 ? ' fetchpriority="high"' : ' loading="lazy"'}>`}</figure>`).join('');
  const cap = c => c[0].toUpperCase() + c.slice(1);
  const cbtns = cs.map((c, i) => `<button type="button" class="cbtn${D.isOut(p, c) ? ' is-out' : ''}" data-color="${c}" aria-pressed="${i === 0}" aria-label="${D.isOut(p, c) ? esc(tx('stock.outAria', { c: cap(c) })) : cap(c)}">${sw(c)}</button>`).join('');
  const out0 = D.isOut(p, c0);
  const sbtns = p.sizes.map((s, i) => `<button type="button" class="sbtn" data-size="${s}" aria-pressed="${i === 0}" data-i18n="size.${s}">${tx('size.' + s)}</button>`).join('');
  const body = p.body.hu.map(x => `<p>${esc(x)}</p>`).join('');
  const others = D.PRODUCTS.filter(x => x.id !== p.id).map(x => card(x, colorsOf(x)[0], '(max-width:960px) 46vw, 23vw')).join('');
  const main = `
<div class="pdp wrap grid12" id="pdp" data-product="${p.id}">
  <div class="pdp__gal" id="gal" tabindex="0" role="region" aria-label="Galéria / Gallery">${gal}</div>
  <div class="pdp__info">
    <nav class="crumb" aria-label="Morzsamenü"><a href="{B}bolt.html" data-i18n="pdp.crumb">${tx('pdp.crumb')}</a><span aria-hidden="true">/</span>${pType(p)}</nav>
    <h1 class="pdp__name"><span data-p="${p.id}" data-pf="name">${esc(p.name.hu)}</span></h1>
    <p class="pdp__price">${priceEl(p)}</p>
    <p class="pdp__lead" data-p="${p.id}" data-pf="lead">${esc(p.lead.hu)}</p>
    <div class="opt"><p class="opt__l"><span data-i18n="pdp.color">${tx('pdp.color')}</span><b id="colorName">${c0[0].toUpperCase() + c0.slice(1)}</b><span class="opt__out" id="colorOut" data-i18n="stock.out"${out0 ? '' : ' hidden'}>${tx('stock.out')}</span></p><div class="opt__row" role="group" aria-label="${esc(tx('pdp.color'))}">${cbtns}</div>
      <p class="pdp__soon" id="soon" hidden data-i18n="pdp.soon">${tx('pdp.soon')}</p></div>
    <div class="opt"><p class="opt__l"><span data-i18n="pdp.size">${tx('pdp.size')}</span></p><div class="opt__row" role="group" aria-label="${esc(tx('pdp.size'))}">${sbtns}</div></div>
    <div class="buy" id="buy"${out0 ? ' hidden' : ''}>
      <div class="qty"><button type="button" data-q="-1" data-i18n-attr="aria-label:pdp.dec" aria-label="${esc(tx('pdp.dec'))}">${ico('minus')}</button><output id="qty" aria-live="polite">1</output><button type="button" data-q="1" data-i18n-attr="aria-label:pdp.inc" aria-label="${esc(tx('pdp.inc'))}">${ico('plus')}</button></div>
      <button type="button" class="btn btn--solid" id="add"><span data-i18n="pdp.add">${tx('pdp.add')}</span>${ico('bag-simple')}</button>
    </div>
    ${notify(p, c0, out0)}
    <ul class="pdp__notes"><li>${ico('check')}<span data-i18n="pdp.n1" data-vars='{"n":"$free"}'>${tx('pdp.n1', { n: FREE })}</span></li><li>${ico('check')}<span data-i18n="pdp.n2">${tx('pdp.n2')}</span></li></ul>
  </div>
</div>
<section class="pdp-desc wrap grid12" aria-labelledby="descH">
  <h2 id="descH" data-i18n="pdp.desc">${tx('pdp.desc')}</h2>
  <div class="pdp-desc__body" data-p="${p.id}" data-pf="body">${body}</div>
</section>
<div class="wrap">${subscribe({ cls: 'sub--pdp', id: 'subP', product: p.name.hu })}</div>
<section class="pair wrap" aria-labelledby="pairH">
  <h2 id="pairH" data-i18n="pdp.pair">${tx('pdp.pair')}</h2>
  <div class="pgrid">${others}</div>
</section>`;
  const title = `${p.name.hu} · GWK Horse`;
  HU['pdp.title.' + p.id] = title; I.en['pdp.title.' + p.id] = `${p.name.en} · GWK Horse`;
  HU['pdp.desc.' + p.id] = p.lead.hu; I.en['pdp.desc.' + p.id] = p.lead.en;
  return page({ page: 'product', titleKey: 'pdp.title.' + p.id, descKey: 'pdp.desc.' + p.id, active: 'bolt.html', main, js: ['js/product.js'], bodyClass: 'solid', noSub: true });
}

/* ---------------- GALÉRIA (Krisztina 2026-10-29) ----------------
   Csak az ügyfél saját, szöveg nélküli termékfotói (a beégetett „EVENING STAR COLLECTION” feliratú
   kollekció-képek és a ChatGPT-képek nem). Minden kép egyszer. Sorok a tető-vonalra igazítva, natív arány,
   vágás nélkül (flex: a növekedés a képaránnyal arányos, így egy sorban minden kép azonos magas). Kattintásra nagyító. */
const GAL = [
  ['kollekcio/szett-rose', 'szett'],
  ['termek/kantar-onyx', 'kantar', 'onyx'], ['termek/nyereg-pearl', 'nyeregalatet', 'pearl'], ['termek/fulvedo-rose', 'fulvedo', 'rose'],
  ['termek/labvedo-onyx', 'labvedo', 'onyx'], ['termek/pataharang-pearl-2', 'pataharang', 'pearl'], ['termek/kantar-rose', 'kantar', 'rose'],
  ['termek/nyereg-onyx', 'nyeregalatet', 'onyx'], ['termek/fulvedo-pearl-2', 'fulvedo', 'pearl'], ['termek/pataharang-rose', 'pataharang', 'rose'],
  ['termek/labvedo-onyx-2', 'labvedo', 'onyx'], ['termek/pataharang-pearl', 'pataharang', 'pearl'], ['termek/labvedo-rose', 'labvedo', 'rose'],
  ['termek/fulvedo-onyx', 'fulvedo', 'onyx'], ['termek/nyereg-rose', 'nyeregalatet', 'rose'], ['termek/pataharang-onyx', 'pataharang', 'onyx'],
  ['termek/pataharang-rose-2', 'pataharang', 'rose'], ['termek/labvedo-onyx-3', 'labvedo', 'onyx'], ['termek/pataharang-onyx-2', 'pataharang', 'onyx']
];
function gallery() {
  const seen = new Set(), ars = [];
  const items = GAL.map(([f, id, c], i) => {
    if (seen.has(f)) throw new Error('Galéria: kétszer szereplő kép ' + f); seen.add(f);
    const name = path.basename(f), m = META[name];
    if (!m) throw new Error('Galéria: hiányzó kép-meta ' + name);
    const small = m.files.find(x => /-800\.webp$/.test(x.f));
    const p = id === 'szett' ? null : D.byId(id);
    const capHu = p ? `${p.type.hu}, ${c[0].toUpperCase() + c.slice(1)}` : 'Evening Star szett, Rose';
    const cap = p ? `${pType(p)}<span class="gal__c">${sw(c)}<span data-i18n="color.${c}">${tx('color.' + c)}</span></span>` : `<span data-i18n="gal.set">${tx('gal.set')}</span><span class="gal__c">${sw('rose')}<span data-i18n="color.rose">${tx('color.rose')}</span></span>`;
    const href = p ? `{B}${p.page}?szin=${c}` : '{B}kollekcio.html';
    const ar = (m.w / m.h).toFixed(4);
    ars.push(`.gal__it[data-g="${i}"]{--ar:${ar};max-width:${m.w}px}`); // natív méret fölé nem nagyítunk
    return `<figure class="gal__it" data-g="${i}"><button type="button" class="gal__btn" data-gal="${i}" data-full="{B}media/${f}.webp" data-w="${m.w}" data-h="${m.h}" data-href="${href}">` +
      `<img src="{B}media/${small ? path.dirname(f) + '/' + small.f : f + '.webp'}"${small ? ` srcset="{B}media/${path.dirname(f)}/${small.f} 800w, {B}media/${f}.webp ${m.w}w" sizes="(max-width:700px) 92vw, (max-width:1100px) 46vw, 34vw"` : ''} width="${m.w}" height="${m.h}" alt="${esc(capHu)}" loading="${i < 4 ? 'eager' : 'lazy'}"></button>` +
      `<figcaption class="gal__cap">${cap}</figcaption></figure>`;
  }).join('');
  const main = `
<section class="gal wrap" aria-labelledby="galH">
  <header class="gal__head"><h1 id="galH" data-i18n="gal.h">${tx('gal.h')}</h1><p class="lead gal__lead" data-i18n="gal.lead">${tx('gal.lead')}</p></header>
  <div class="gal__grid" id="galGrid">${items}
  <div class="gal__end"><p class="gal__end-t" data-i18n="gal.end">${tx('gal.end')}</p><a class="btn btn--solid" href="{B}bolt.html"><span data-i18n="gal.btn">${tx('gal.btn')}</span>${ico('arrow-right')}</a></div></div>
</section>
<dialog class="lb" id="lb" aria-labelledby="lbCap" data-lenis-prevent>
  <div class="lb__in">
    <figure class="lb__fig"><img id="lbImg" alt=""><figcaption class="lb__cap"><span id="lbCap"></span><span class="lb__n" id="lbN"></span><a class="tlink lb__a" id="lbA" href="#"><span data-i18n="gal.shop">${tx('gal.shop')}</span>${ico('arrow-right')}</a></figcaption></figure>
    <button type="button" class="lb__nav lb__nav--p" data-lb="-1" data-i18n-attr="aria-label:gal.prev" aria-label="${esc(tx('gal.prev'))}">${ico('arrow-left')}</button>
    <button type="button" class="lb__nav lb__nav--n" data-lb="1" data-i18n-attr="aria-label:gal.next" aria-label="${esc(tx('gal.next'))}">${ico('arrow-right')}</button>
    <button type="button" class="lb__x" data-lb="x" data-i18n-attr="aria-label:nav.close" aria-label="${esc(tx('nav.close'))}">${ico('x')}</button>
  </div>
</dialog>`;
  return page({ page: 'gallery', titleKey: 'gal.title', descKey: 'gal.desc', active: 'galeria.html', main, js: ['js/gallery.js'], bodyClass: 'solid',
    preload: `<style>${ars.join('')}</style>` });
}

/* ---------------- KOLLEKCIÓ ---------------- */
function collection() {
  const list = D.PRODUCTS.map(p => `<a href="{B}${p.page}"><span class="n">${pType(p)}</span><span class="p">${priceEl(p)}</span></a>`).join('');
  const main = `
<section class="kc-cover wrap grid12" aria-labelledby="kcH">
  <header class="kc-cover__head"><p class="label" data-i18n="kc.kicker">${tx('kc.kicker')}</p><h1 id="kcH">Evening <em>Star</em></h1></header>
  <div class="kc-cover__a"><p class="lead" data-i18n="kc.lead">${tx('kc.lead')}</p><div class="kc-cover__shades"><p class="kc-cover__bh" data-i18n="kc.colors">${tx('kc.colors')}</p><p class="kc-cover__sw">${D.COLOR_ORDER.map(c => `<span>${sw(c)}<span data-i18n="color.${c}">${tx('color.' + c)}</span></span>`).join('')}</p></div></div>
  <figure class="kc-cover__img"><img src="{B}media/kollekcio/kollekcio-nyereg.webp" srcset="{B}media/kollekcio/kollekcio-nyereg-800.webp 800w, {B}media/kollekcio/kollekcio-nyereg.webp 1536w" sizes="(max-width:960px) 92vw, 52vw" width="1536" height="1024" alt="Evening Star nyeregalátétek Onyx, Pearl és Rose színben" fetchpriority="high"></figure>
  <div class="kc-cover__b"><nav aria-label="${esc(tx('kc.list'))}" data-i18n-attr="aria-label:kc.list"><p class="kc-cover__bh" data-i18n="kc.list">${tx('kc.list')}</p>${list}</nav>
    <a class="btn btn--solid" href="{B}bolt.html"><span data-i18n="kc.btn">${tx('kc.btn')}</span>${ico('arrow-right')}</a></div>
</section>`;
  return page({ page: 'collection', titleKey: 'kc.title', descKey: 'kc.desc', active: 'kollekcio.html', main, bodyClass: 'solid' });
}

/* ---------------- TÖRTÉNET ---------------- */
function story() {
  const main = `
<section class="st-cover" aria-labelledby="stH">
  <figure class="st-cover__img"><img src="{B}media/hangulat/tortenet-istallo-2000.webp" srcset="{B}media/hangulat/tortenet-istallo-1200.webp 1200w, {B}media/hangulat/tortenet-istallo-2000.webp 2000w, {B}media/hangulat/tortenet-istallo-2800.webp 2800w" sizes="max(100vw, 150vh)" width="2800" height="1867" alt="${esc(tx('st.hero.alt'))}" data-i18n-attr="alt:st.hero.alt" fetchpriority="high"></figure>
  <div class="st-cover__in wrap grid12">
    <div class="st-cover__txt">
      <h1 id="stH" class="st-cover__h"><span class="l1" data-i18n="st.h1a">${tx('st.h1a')}</span> <em class="l2" data-i18n="st.h1b">${tx('st.h1b')}</em> <span class="l3" data-i18n="st.h1c">${tx('st.h1c')}</span></h1>
      <p class="st-cover__sig"><span data-i18n="st.founder">${tx('st.founder')}</span><span data-i18n="st.role">${tx('st.role')}</span></p>
    </div>
  </div>
</section>
<article class="st-story" aria-label="${esc(tx('nav.story'))}">
  <div class="st-act st-act--1 wrap grid12">
    <div class="st-act__txt">
      <p class="first" data-i18n="st.p1" data-reveal>${tx('st.p1')}</p>
      <p data-i18n="st.p2" data-reveal>${tx('st.p2')}</p>
    </div>
    <figure class="st-act__fig" data-reveal="2"><img src="{B}media/hangulat/szem-1400.webp" srcset="{B}media/hangulat/szem-800.webp 800w, {B}media/hangulat/szem-1400.webp 1400w, {B}media/hangulat/szem.webp 2400w" sizes="(max-width:960px) 100vw, 42vw" width="2400" height="1350" alt="Ló szeme és sötét sörénye közelről" loading="lazy"></figure>
  </div>
  <div class="st-pause wrap grid12">
    <p class="st-pause__t"><span data-i18n="st.t1" data-reveal>${tx('st.t1')}</span><span data-i18n="st.t2" data-reveal="2">${tx('st.t2')}</span><span data-i18n="st.t3" data-reveal="3">${tx('st.t3')}</span></p>
  </div>
  <div class="st-act st-act--2 wrap grid12">
    <figure class="st-act__fig" data-reveal><img src="{B}media/hangulat/gesztenye-1400.webp" srcset="{B}media/hangulat/gesztenye-800.webp 800w, {B}media/hangulat/gesztenye-1400.webp 1400w" sizes="(max-width:960px) 72vw, 30vw" width="2400" height="3600" alt="Gesztenyeszínű ló feje közelről, sötét háttér előtt" loading="lazy"></figure>
    <div class="st-act__txt">
      <p data-i18n="st.p3" data-reveal>${tx('st.p3')}</p>
      <p data-i18n="st.p4" data-reveal>${tx('st.p4')}</p>
    </div>
  </div>
</article>
<section class="tiers" aria-label="GWK Classic, GWK Signature">
  <div class="tier tier--classic"><div class="tier__in" data-reveal><h2>GWK <em data-i18n="st.c.em">${tx('st.c.em')}</em></h2><p data-i18n="st.c.p">${tx('st.c.p')}</p></div></div>
  <div class="tier tier--signature"><div class="tier__in" data-reveal="2"><h2>GWK <em data-i18n="st.s.em">${tx('st.s.em')}</em></h2><p data-i18n="st.s.p">${tx('st.s.p')}</p></div></div>
</section>
<section class="st-end wrap grid12" aria-label="GWK">
  <figure class="st-end__q">
    <blockquote data-i18n="st.q" data-reveal>${tx('st.q')}</blockquote>
    <figcaption data-i18n="st.founder">${tx('st.founder')}</figcaption>
    <a class="btn btn--solid" href="{B}kollekcio.html"><span data-i18n="st.btn">${tx('st.btn')}</span>${ico('arrow-right')}</a>
  </figure>
</section>`;
  return page({ page: 'story', titleKey: 'st.title', descKey: 'st.desc', active: 'tortenet.html', main, bodyClass: 'solid' });
}

/* ---------------- KAPCSOLAT ---------------- */
function contact() {
  const fld = (id, key, type, extra = '') => `<div class="fld"><label for="${id}" data-i18n="${key}">${tx(key)}</label>${type === 'textarea' ? `<textarea id="${id}" name="${id}" required ${extra}></textarea>` : `<input id="${id}" name="${id}" type="${type}" required ${extra}>`}<span class="err" data-i18n="${type === 'email' ? 'err.email' : 'err.req'}">${tx(type === 'email' ? 'err.email' : 'err.req')}</span></div>`;
  const main = `
<section class="ct" aria-labelledby="ctH">
  <div class="ct__in wrap">
    <figure class="ct__fig"><img src="{B}media/hangulat/kantar-lo-1200.webp" srcset="{B}media/hangulat/kantar-lo-720.webp 720w, {B}media/hangulat/kantar-lo-1200.webp 1200w, {B}media/hangulat/kantar-lo.webp 2000w" sizes="(max-width:960px) 100vw, 56vw" width="2000" height="3000" alt="${esc(tx('ct.alt'))}" data-i18n-attr="alt:ct.alt" fetchpriority="high"></figure>
    <div class="ct__card">
      <h1 id="ctH" class="ct__h"><span data-i18n="ct.h1a">${tx('ct.h1a')}</span> <em data-i18n="ct.h1b">${tx('ct.h1b')}</em></h1>
      <p class="lead ct__lead" data-i18n="ct.lead">${tx('ct.lead')}</p>
      <div class="ct__reach"><a class="ct__mail" href="mailto:${C.email}">${C.email}</a>
        <div class="ct__row"><a class="btn btn--solid" href="mailto:${C.email}"><span data-i18n="ct.mail">${tx('ct.mail')}</span>${ico('envelope-simple')}</a><button type="button" class="btn btn--line" id="copyMail"><span data-i18n="ct.copy">${tx('ct.copy')}</span>${ico('copy')}</button></div>
        <div class="ct__soc"><p class="ct__soc-h" data-i18n="soc.h">${tx('soc.h')}</p>${social('soc--ct')}</div></div>
    </div>
  </div>
</section>
<section class="form-sec" aria-labelledby="formH">
  <div class="wrap grid12">
    <h2 id="formH" data-i18n="ct.form">${tx('ct.form')}</h2>
    <form id="ctForm" novalidate>
      <div class="frow">${fld('cName', 'ct.name', 'text', 'autocomplete="name"')}${fld('cEmail', 'ct.email', 'email', 'autocomplete="email"')}</div>
      ${fld('cMsg', 'ct.msg', 'textarea')}
      <div class="fld"><label class="chk"><input type="checkbox" id="cOk" required><span data-i18n-html="ct.consent">${tx('ct.consent', { B: '{B}' })}</span></label><span class="err" data-i18n="err.consent">${tx('err.consent')}</span></div>
      <button class="btn btn--ink" type="submit"><span data-i18n="ct.send">${tx('ct.send')}</span>${ico('arrow-right')}</button>
      <p class="ok-msg" id="ctOk" role="status" data-i18n="ct.ok">${tx('ct.ok')}</p>
    </form>
  </div>
</section>`;
  return page({ page: 'contact', titleKey: 'ct.title', descKey: 'ct.desc', active: 'kapcsolat.html', main, js: ['js/contact.js'], bodyClass: 'solid' });
}

/* ---------------- PÉNZTÁR ---------------- */
function checkout() {
  const f = (id, key, type, ac, err = 'err.req', extra = '') => `<div class="fld"><label for="${id}" data-i18n="${key}">${tx(key)}</label><input id="${id}" name="${id}" type="${type}" autocomplete="${ac}" required ${extra}><span class="err" data-i18n="${err}">${tx(err)}</span></div>`;
  const ship = C.shipping.map((s, i) => `<label class="rcard"><input type="radio" name="ship" value="${s.id}"${i === 0 ? ' checked' : ''}><span class="rcard__dot"></span><span><b data-i18n="co.ship.${s.id}">${tx('co.ship.' + s.id)}</b><small data-i18n="co.ship.${s.id}.s">${tx('co.ship.' + s.id + '.s')}</small></span><span class="rcard__p" data-ship-price="${s.price}">${money(s.price)}</span></label>`).join('');
  const pay = ['card', 'transfer'].map((m, i) => `<label class="rcard"><input type="radio" name="pay" value="${m}"${i === 0 ? ' checked' : ''}><span class="rcard__dot"></span><span><b data-i18n="co.pay.${m}">${tx('co.pay.' + m)}</b><small data-i18n="co.pay.${m}.s">${tx('co.pay.' + m + '.s')}</small></span><span></span></label>`).join('');
  const main = `
<section class="co wrap" aria-labelledby="coH">
  <div class="co__h"><h1 id="coH" data-i18n="co.h">${tx('co.h')}</h1></div>
  <div class="demo" role="note"><div><strong data-i18n="co.demo.t">${tx('co.demo.t')}</strong><p data-i18n="co.demo.p">${tx('co.demo.p')}</p></div></div>
  <div id="coEmpty" class="co-empty" hidden><p data-i18n="co.empty">${tx('co.empty')}</p><a class="btn btn--solid" href="{B}bolt.html"><span data-i18n="cart.shop">${tx('cart.shop')}</span>${ico('arrow-right')}</a></div>
  <div class="sheet" id="coSheet">
    <form class="sheet__form" id="coForm" novalidate>
      <fieldset><legend data-i18n="co.contact">${tx('co.contact')}</legend>
        ${f('oName', 'co.name', 'text', 'name')}
        <div class="frow">${f('oEmail', 'co.email', 'email', 'email', 'err.email')}${f('oPhone', 'co.phone', 'tel', 'tel')}</div>
      </fieldset>
      <fieldset><legend data-i18n="co.addr">${tx('co.addr')}</legend>
        <div class="frow frow--3">${f('oZip', 'co.zip', 'text', 'postal-code', 'err.zip', 'inputmode="numeric" maxlength="4"')}${f('oCity', 'co.city', 'text', 'address-level2')}</div>
        ${f('oStreet', 'co.street', 'text', 'street-address')}
      </fieldset>
      <fieldset><legend data-i18n="co.ship">${tx('co.ship')}</legend><div class="radios">${ship}</div></fieldset>
      <fieldset><legend data-i18n="co.pay">${tx('co.pay')}</legend><div class="radios">${pay}</div></fieldset>
      <div class="fld"><label class="chk"><input type="checkbox" id="oTerms" required><span data-i18n-html="co.terms">${tx('co.terms')}</span></label><span class="err" data-i18n="err.consent">${tx('err.consent')}</span></div>
      <button class="btn btn--ink btn--block" type="submit" id="coSubmit"><span data-i18n="co.submit">${tx('co.submit')}</span>${ico('arrow-right')}</button>
    </form>
    <section class="sheet__sum" aria-labelledby="sumH">
      <h2 id="sumH" data-i18n="co.sum">${tx('co.sum')}</h2>
      <div class="sum-list" id="sumList"></div>
      <div class="sum-rows"><div><span data-i18n="co.sub">${tx('co.sub')}</span><span id="sumSub"></span></div><div><span data-i18n="co.shipc">${tx('co.shipc')}</span><span id="sumShip"></span></div></div>
      <div class="sum-total"><span data-i18n="co.total">${tx('co.total')}</span><span id="sumTotal"></span></div>
      <p class="sum-hint" id="sumHint"></p>
    </section>
  </div>
</section>`;
  return page({ page: 'checkout', titleKey: 'co.title', active: '', main, js: ['js/contact.js', 'js/payment.js', 'js/checkout.js'], bodyClass: 'solid', noFooter: false });
}

/* ---------------- KÖSZÖNŐ ---------------- */
function thanks() {
  const main = `
<section class="ty wrap" aria-labelledby="tyH">
  <div class="ty__sheet">
    <div class="ty__star" aria-hidden="true"></div>
    <h1 id="tyH" data-i18n="ty.h">${tx('ty.h')}</h1>
    <p class="ty__no" id="tyNo" hidden></p>
    <p class="ty__p" id="tyP" data-i18n="ty.none">${tx('ty.none')}</p>
    <div class="ty__lines" id="tyLines" hidden></div>
    <div class="ty__act"><a class="btn btn--ink" href="{B}index.html" data-i18n="ty.home">${tx('ty.home')}</a><a class="btn btn--line btn--line-ink" href="{B}bolt.html" data-i18n="ty.shop">${tx('ty.shop')}</a></div>
  </div>
</section>`;
  return page({ page: 'thanks', titleKey: 'ty.title', active: '', main, js: ['js/thanks.js'], bodyClass: 'solid' });
}

/* ---------------- JOGI VÁZAK ---------------- */
function legal(kind) {
  const secs = { aszf: ['lg.s1', 'lg.s2', 'lg.s3', 'lg.s4', 'lg.s5', 'lg.s6'], adat: ['lg.a1', 'lg.a2', 'lg.a3', 'lg.a4', 'lg.a5'], imp: ['lg.i1', 'lg.i2', 'lg.i3'] }[kind];
  const body = secs.map(k => `<h2 data-i18n="${k}">${tx(k)}</h2><p data-i18n="lg.fill">${tx('lg.fill')}</p>`).join('');
  const main = `
<section class="legal wrap" aria-labelledby="lgH">
  <h1 id="lgH" data-i18n="lg.${kind}.h">${tx('lg.' + kind + '.h')}</h1>
  <p class="legal__wip" role="note" data-i18n="lg.wip">${tx('lg.wip')}</p>
  <div class="legal__body">${body}</div>
</section>`;
  return page({ page: 'legal', titleKey: 'lg.' + kind + '.title', active: '', main, bodyClass: 'solid' });
}

/* ---------------- 404 ---------------- */
function notFound() {
  const main = `
<section class="nf" aria-labelledby="nfH">
  <div><div class="nf__star" aria-hidden="true"><i></i></div>
  <h1 id="nfH" data-i18n="nf.h">${tx('nf.h')}</h1><p data-i18n="nf.p">${tx('nf.p')}</p>
  <a class="btn btn--solid" href="{B}index.html"><span data-i18n="nf.btn">${tx('nf.btn')}</span>${ico('arrow-right')}</a></div>
</section>`;
  return page({ page: 'nf', titleKey: 'nf.title', active: '', main, noFooter: true, bodyClass: 'solid' });
}

/* ---------------- írás ---------------- */
function write(rel, html) {
  const depth = rel.split('/').length - 1;
  const B = depth ? '../'.repeat(depth) : '';
  const out = html.replace(/\{B\}/g, B);
  if (/[\u2013\u2014]/.test(out)) throw new Error('Gondolatjel a kimenetben: ' + rel);
  const p = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, out, 'utf8');
  console.log('ok', rel, Math.round(out.length / 1024) + ' kB');
}

write('index.html', home());
write('bolt.html', shop());
D.PRODUCTS.forEach(p => write(p.page, product(p)));
write('galeria.html', gallery());
write('kollekcio.html', collection());
write('tortenet.html', story());
write('kapcsolat.html', contact());
write('penztar.html', checkout());
write('koszonjuk.html', thanks());
write('aszf.html', legal('aszf'));
write('adatkezeles.html', legal('adat'));
write('impresszum.html', legal('imp'));
write('404.html', notFound());
// a termékoldalak dinamikus fordítási kulcsai a böngészőnek is kellenek
fs.writeFileSync(path.join(ROOT, 'js/data/i18n-pages.js'),
  '/* generált: node tools/build.js */\n(function(){var I=window.GWK_I18N;' +
  D.PRODUCTS.map(p => ['title', 'desc'].map(k => ['hu', 'en'].map(l => `I.${l}[${JSON.stringify('pdp.' + k + '.' + p.id)}]=${JSON.stringify(I[l]['pdp.' + k + '.' + p.id])};`).join('')).join('')).join('') + '})();\n', 'utf8');
