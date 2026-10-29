/* =====================================================================
   GWK Horse · site.js · közös gerinc minden oldalon
   Robusztus: a kritikus vizuál (tartalom, nav, reveal, kosár) nem függ GSAP-tól.
   GSAP + Lenis csak degradálható extra; reduced-motion alatt natív görgetés.
   ===================================================================== */
(function () {
  'use strict';
  var C = window.GWK_CONFIG, D = window.GWK_DATA, I = window.GWK_I18N, ICONS = window.GWK_ICONS || {};
  var B = window.GWK_BASE || '';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var GWK = window.GWK = window.GWK || {};
  GWK.B = B; GWK.reduce = reduce; GWK.$ = $; GWK.$$ = $$; GWK.hasGSAP = hasGSAP;

  /* ---------------- nyelv ---------------- */
  var lang = 'hu';
  try { if (localStorage.getItem(C.storageKeys.lang) === 'en') lang = 'en'; } catch (e) {}
  GWK.lang = function () { return lang; };
  function fmt(s, v) { return String(s).replace(/\{(\w+)\}/g, function (m, k) { return v && v[k] != null ? v[k] : m; }); }
  GWK.money = function (n) {
    if (lang === 'en') return 'HUF\u00a0' + new Intl.NumberFormat('en-GB').format(n);
    return new Intl.NumberFormat('hu-HU').format(n).replace(/\s/g, '\u00a0') + '\u00a0Ft';
  };
  GWK.t = function (key, v) {
    var d = I[lang], s = d && key in d ? d[key] : (I.hu[key] != null ? I.hu[key] : key);
    return fmt(s, v);
  };
  GWK.cap = function (c) { return c.charAt(0).toUpperCase() + c.slice(1); };
  GWK.icon = function (n) {
    return '<svg class="icon" viewBox="0 0 256 256" aria-hidden="true" focusable="false">' + (ICONS[n] || []).map(function (d) { return '<path d="' + d + '"/>'; }).join('') + '</svg>';
  };
  GWK.esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };
  function specialVars(v) {
    var o = {};
    for (var k in v) {
      if (v[k] === '$free') o[k] = GWK.money(C.freeShippingFrom);
      else if (v[k] === '$year') o[k] = new Date().getFullYear();
      else o[k] = v[k];
    }
    return o;
  }
  GWK.priceHTML = function (price, per) {
    return GWK.money(price) + (per === 'par' ? ' <small>' + GWK.t('per.par') + '</small>' : '');
  };

  function applyI18n(root) {
    root = root || document;
    document.documentElement.lang = lang;
    $$('[data-i18n]', root).forEach(function (el) {
      var v = el.getAttribute('data-vars');
      el.textContent = GWK.t(el.getAttribute('data-i18n'), v ? specialVars(JSON.parse(v)) : null);
    });
    $$('[data-i18n-html]', root).forEach(function (el) {
      el.innerHTML = GWK.t(el.getAttribute('data-i18n-html'), { B: B });
    });
    $$('[data-i18n-attr]', root).forEach(function (el) {
      el.getAttribute('data-i18n-attr').split(';').forEach(function (pair) {
        var p = pair.split(':'); if (p.length === 2) el.setAttribute(p[0], GWK.t(p[1]));
      });
    });
    $$('[data-p]', root).forEach(function (el) {
      var p = D.byId(el.getAttribute('data-p')), f = el.getAttribute('data-pf');
      if (!p || !p[f]) return;
      var val = p[f][lang] || p[f].hu;
      if (Array.isArray(val)) el.innerHTML = val.map(function (x) { return '<p>' + GWK.esc(x) + '</p>'; }).join('');
      else el.textContent = val;
    });
    $$('[data-price]', root).forEach(function (el) {
      el.innerHTML = GWK.priceHTML(+el.getAttribute('data-price'), el.getAttribute('data-per'));
    });
    if (root === document) {
      var h = document.documentElement, tk = h.getAttribute('data-title'), dk = h.getAttribute('data-desc');
      if (tk) document.title = GWK.t(tk);
      var md = $('meta[name="description"]'); if (md && dk) md.setAttribute('content', GWK.t(dk));
      $$('.lang button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === lang)); });
    }
  }
  GWK.applyI18n = applyI18n;
  GWK.setLang = function (l) {
    lang = l === 'en' ? 'en' : 'hu';
    try { localStorage.setItem(C.storageKeys.lang, lang); } catch (e) {}
    applyI18n(document);
    renderCart();
    document.dispatchEvent(new CustomEvent('gwk:lang', { detail: lang }));
  };

  /* ---------------- kosár (localStorage) ---------------- */
  var KEY = C.storageKeys.cart;
  function load() { try { var a = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(a) ? a : []; } catch (e) { return []; } }
  function save(a) { try { localStorage.setItem(KEY, JSON.stringify(a)); } catch (e) {} }
  var cart = {
    items: load,
    add: function (id, color, size, qty) {
      var a = load(), k = id + '|' + color + '|' + size, hit = null;
      a.forEach(function (x) { if (x.k === k) hit = x; });
      if (hit) hit.qty = Math.min(20, hit.qty + qty); else a.push({ k: k, id: id, color: color, size: size, qty: qty });
      save(a); renderCart();
    },
    set: function (k, qty) {
      var a = load().map(function (x) { if (x.k === k) x.qty = Math.max(1, Math.min(20, qty)); return x; });
      save(a); renderCart();
    },
    remove: function (k) { save(load().filter(function (x) { return x.k !== k; })); renderCart(); },
    clear: function () { save([]); renderCart(); },
    count: function () { return load().reduce(function (s, x) { return s + x.qty; }, 0); },
    subtotal: function () {
      return load().reduce(function (s, x) { var p = D.byId(x.id); return s + (p ? p.price * x.qty : 0); }, 0);
    }
  };
  GWK.cart = cart;

  GWK.thumb = function (p, color, cls) {
    var arr = p.colors[color] || [], im = arr[0];
    if (!im) return '<div class="soon ' + (cls || '') + '"><img src="' + B + 'media/logo/logo-felirat-480.webp" alt="" width="480" height="273"></div>';
    var src = B + (im.small || im.src);
    return '<div class="vit ' + (cls || '') + '"><img class="vit__bg" src="' + src + '" alt="" aria-hidden="true" width="' + im.w + '" height="' + im.h + '"><img class="vit__img" src="' + src + '" alt="" width="' + im.w + '" height="' + im.h + '"></div>';
  };
  GWK.lineName = function (x) { var p = D.byId(x.id); return p ? (p.name[lang] || p.name.hu) : x.id; };
  GWK.lineSub = function (x) { return GWK.cap(x.color) + ' \u00b7 ' + GWK.t('size.' + x.size); };

  function renderCart() {
    var n = cart.count();
    $$('.cart-count').forEach(function (el) { el.textContent = n; el.classList.toggle('has', n > 0); });
    var body = $('#drawerBody'), foot = $('#drawerFoot');
    if (!body) return;
    var a = load();
    if (!a.length) {
      body.innerHTML = '<div class="drawer__empty"><p>' + GWK.t('cart.empty') + '</p><a class="btn btn--line" href="' + B + 'bolt.html">' + GWK.t('cart.shop') + GWK.icon('arrow-right') + '</a></div>';
      foot.innerHTML = ''; foot.hidden = true; return;
    }
    foot.hidden = false;
    body.innerHTML = a.map(function (x) {
      var p = D.byId(x.id); if (!p) return '';
      return '<div class="ditem" data-k="' + GWK.esc(x.k) + '">' + GWK.thumb(p, x.color) +
        '<div><div class="ditem__t"><b><a href="' + B + p.page + '?szin=' + x.color + '">' + GWK.esc(GWK.lineName(x)) + '</a></b><span>' + GWK.money(p.price * x.qty) + '</span></div>' +
        '<p class="ditem__sub">' + GWK.esc(GWK.lineSub(x)) + '</p><p class="ditem__sub">' + GWK.priceHTML(p.price, p.unit) + ' \u00d7 ' + x.qty + '</p>' +
        '<div class="ditem__row"><div class="qty" role="group" aria-label="' + GWK.t('cart.qty') + '"><button type="button" data-dq="-1" aria-label="' + GWK.t('pdp.dec') + '">' + GWK.icon('minus') + '</button><output>' + x.qty + '</output><button type="button" data-dq="1" aria-label="' + GWK.t('pdp.inc') + '">' + GWK.icon('plus') + '</button></div>' +
        '<button type="button" class="rm" data-rm>' + GWK.t('cart.rm') + '</button></div></div></div>';
    }).join('');
    var sub = cart.subtotal(), left = C.freeShippingFrom - sub;
    foot.innerHTML = '<p class="drawer__ship">' + (left > 0 ? GWK.t('cart.free', { n: GWK.money(left) }) : GWK.t('cart.freeok')) + '</p>' +
      '<div class="drawer__sum"><span>' + GWK.t('cart.sub') + '</span><b>' + GWK.money(sub) + '</b></div>' +
      '<a class="btn btn--solid btn--block" href="' + B + 'penztar.html">' + GWK.t('cart.checkout') + GWK.icon('arrow-right') + '</a>';
  }
  GWK.renderCart = renderCart;

  /* ---------------- rétegek: drawer, kereső, menü ---------------- */
  var lastFocus = null, openLayer = null;
  function lockScroll(on) { if (GWK.lenis) { if (on) GWK.lenis.stop(); else GWK.lenis.start(); } document.documentElement.style.overflow = on ? 'hidden' : ''; }
  function openL(name) {
    closeL(true);
    lastFocus = document.activeElement; openLayer = name;
    var scrim = $('#scrim');
    if (name === 'cart') { var d = $('#drawer'); d.classList.add('is-open'); d.setAttribute('aria-hidden', 'false'); scrim.classList.add('is-on'); setTimeout(function () { var b = $('[data-close="cart"]'); b && b.focus(); }, 60); }
    if (name === 'search') { var s = $('#srch'); s.classList.add('is-open'); s.setAttribute('aria-hidden', 'false'); scrim.classList.add('is-on'); setTimeout(function () { $('#srchIn').focus(); }, 80); runSearch(); }
    if (name === 'menu') { var m = $('#mnav'); m.classList.add('is-open'); m.setAttribute('aria-hidden', 'false'); $('#hdr').classList.add('is-open'); $('.burger').setAttribute('aria-expanded', 'true'); $('.burger').innerHTML = GWK.icon('x'); }
    lockScroll(true);
  }
  function closeL(silent) {
    if (!openLayer) return;
    var d = $('#drawer'), s = $('#srch'), m = $('#mnav');
    d.classList.remove('is-open'); d.setAttribute('aria-hidden', 'true');
    s.classList.remove('is-open'); s.setAttribute('aria-hidden', 'true');
    m.classList.remove('is-open'); m.setAttribute('aria-hidden', 'true');
    $('#hdr').classList.remove('is-open');
    var bg = $('.burger'); if (bg) { bg.setAttribute('aria-expanded', 'false'); bg.innerHTML = GWK.icon('list'); }
    $('#scrim').classList.remove('is-on');
    openLayer = null; lockScroll(false);
    if (!silent && lastFocus && lastFocus.focus) lastFocus.focus();
  }
  GWK.openCart = function () { openL('cart'); };
  document.addEventListener('click', function (e) {
    var o = e.target.closest('[data-open]');
    if (o) { var n = o.getAttribute('data-open'); if (openLayer === n) closeL(); else openL(n); return; }
    if (e.target.closest('[data-close]') || e.target.id === 'scrim') { closeL(); return; }
    var lb = e.target.closest('.lang button'); if (lb) { GWK.setLang(lb.getAttribute('data-lang')); return; }
    var it = e.target.closest('.ditem');
    if (it) {
      var k = it.getAttribute('data-k'), q = e.target.closest('[data-dq]');
      if (q) { var cur = +it.querySelector('output').textContent; cart.set(k, cur + (+q.getAttribute('data-dq'))); }
      if (e.target.closest('[data-rm]')) cart.remove(k);
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && openLayer) closeL();
    if (e.key === 'Tab' && (openLayer === 'cart' || openLayer === 'search')) {
      var box = openLayer === 'cart' ? $('#drawer') : $('#srch');
      var f = $$('a[href],button:not([disabled]),input', box).filter(function (x) { return x.offsetParent !== null; });
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });

  /* ---------------- kereső ---------------- */
  function norm(s) { return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
  function runSearch() {
    var inp = $('#srchIn'), out = $('#srchRes'); if (!inp) return;
    var q = norm(inp.value.trim());
    var res = [];
    D.PRODUCTS.forEach(function (p) {
      D.COLOR_ORDER.forEach(function (c) {
        if (!(c in p.colors)) return;
        var hay = norm([p.name.hu, p.name.en, p.type.hu, p.type.en, c, 'evening star gwk'].join(' '));
        var ok = !q || q.split(/\s+/).every(function (w) { return hay.indexOf(w) > -1; });
        if (ok) res.push({ p: p, c: c });
      });
    });
    if (!q) res = D.PRODUCTS.map(function (p) { return { p: p, c: D.COLOR_ORDER.filter(function (c) { return c in p.colors; })[0] }; });
    out.innerHTML = res.length ? res.slice(0, 8).map(function (r) {
      return '<a href="' + B + r.p.page + '?szin=' + r.c + '">' + GWK.thumb(r.p, r.c) + '<span><b>' + GWK.esc(r.p.name[lang]) + '</b> <span class="muted">' + GWK.cap(r.c) + '</span></span><span>' + GWK.money(r.p.price) + '</span></a>';
    }).join('') : '<p class="srch__none">' + GWK.t('srch.none') + '</p>';
  }
  document.addEventListener('input', function (e) { if (e.target.id === 'srchIn') runSearch(); });
  document.addEventListener('keydown', function (e) {
    if (e.target.id === 'srchIn' && e.key === 'Enter') { var a = $('#srchRes a'); if (a) location.href = a.href; }
  });

  /* ---------------- toast ---------------- */
  var tt = null;
  GWK.toast = function (msg) {
    var t = $('#toast'); if (!t) return;
    t.querySelector('span').textContent = msg; t.classList.add('is-on');
    clearTimeout(tt); tt = setTimeout(function () { t.classList.remove('is-on'); }, 2600);
  };

  /* ---------------- reveal (RB2) ---------------- */
  function runReveal() {
    var h = innerHeight * 0.92;
    $$('[data-reveal]:not(.in)').forEach(function (el) { if (el.getBoundingClientRect().top < h) el.classList.add('in'); });
  }
  GWK.runReveal = runReveal;

  /* ---------------- fejléc: szilárd háttér + hide-on-scroll hiszterézissel ---------------- */
  var hdr = $('#hdr'), lastY = scrollY, acc = 0;
  function onScroll() {
    var y = scrollY, dy = y - lastY; lastY = y;
    if (hdr) {
      hdr.classList.toggle('is-solid', y > 12);
      if (openLayer) { acc = 0; }
      else if (y < 160) { acc = 0; hdr.classList.remove('is-hidden'); document.body.classList.remove('nav-hidden'); }
      else {
        acc = (dy > 0) === (acc > 0) ? acc + dy : dy;
        if (acc > 14) { hdr.classList.add('is-hidden'); document.body.classList.add('nav-hidden'); }
        if (acc < -14) { hdr.classList.remove('is-hidden'); document.body.classList.remove('nav-hidden'); }
      }
    }
    runReveal();
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', runReveal, { passive: true });

  /* ---------------- Lenis (self-rAF, nem gsap.ticker) ---------------- */
  GWK.lenis = null;
  if (!reduce && typeof window.Lenis !== 'undefined') {
    try {
      GWK.lenis = new window.Lenis({ duration: 1.1, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }, smoothWheel: true, syncTouch: false });
      (function raf(t) { GWK.lenis.raf(t); requestAnimationFrame(raf); })(performance.now());
      if (hasGSAP) GWK.lenis.on('scroll', window.ScrollTrigger.update);
    } catch (e) { GWK.lenis = null; }
  }
  if (hasGSAP) {
    window.gsap.registerPlugin(window.ScrollTrigger);
    window.ScrollTrigger.config({ ignoreMobileResize: true });
    // idle-refresh: csak görgetés-szünetben (Build Lessons, pin + rétegzés 3.)
    var lastScrollT = 0, tries = 0;
    addEventListener('scroll', function () { lastScrollT = performance.now(); }, { passive: true });
    GWK.queueRefresh = function () {
      clearTimeout(GWK._rq);
      GWK._rq = setTimeout(function tryR() {
        if (performance.now() - lastScrollT < 500 && tries++ < 40) { GWK._rq = setTimeout(tryR, 250); return; }
        tries = 0; window.ScrollTrigger.refresh();
      }, 200);
    };
    addEventListener('load', GWK.queueRefresh);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(GWK.queueRefresh);
    setTimeout(GWK.queueRefresh, 2500);
  } else { GWK.queueRefresh = function () {}; }

  /* ---------------- csillag-kurzor: az egyszerűbb változatban kikapcsolva (natív kurzor) ---------------- */
  if (false && fine && !reduce) {
    var ring = document.createElement('div'); ring.className = 'cur'; ring.innerHTML = '<span class="cl"></span>';
    var dot = document.createElement('div'); dot.className = 'cur-dot';
    document.body.appendChild(ring); document.body.appendChild(dot);
    document.body.classList.add('has-cur');
    var lbl = ring.querySelector('.cl'), rx = 0, ry = 0, dx = 0, dy2 = 0, tx = 0, ty = 0, ready = false;
    addEventListener('mousemove', function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!ready) { ready = true; document.body.classList.add('cur-ready'); rx = dx = tx; ry = dy2 = ty; }
    }, { passive: true });
    document.addEventListener('mouseleave', function () { document.body.classList.add('cur-out'); });
    document.addEventListener('mouseenter', function () { document.body.classList.remove('cur-out'); });
    (function loop() {
      rx += (tx - rx) * 0.17; ry += (ty - ry) * 0.17; dx += (tx - dx) * 0.45; dy2 += (ty - dy2) * 0.45;
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)';
      dot.style.transform = 'translate(' + dx + 'px,' + dy2 + 'px) translate(-50%,-50%)';
      requestAnimationFrame(loop);
    })();
    document.addEventListener('mouseover', function (e) {
      var v = e.target.closest('[data-view]');
      var a = e.target.closest('a,button,label,[data-pv]');
      document.body.classList.toggle('cur-view', !!v);
      document.body.classList.toggle('cur-hover', !v && !!a);
      if (v) lbl.textContent = GWK.t('idx.view');
    });
  }

  /* ---------------- indulás ---------------- */
  applyI18n(document);
  document.documentElement.classList.remove('i18n-wait');
  renderCart();
  onScroll();
  setTimeout(runReveal, 250); setTimeout(runReveal, 1200);
})();
