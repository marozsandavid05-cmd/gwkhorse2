/* GWK Horse · termékoldal: színválasztó (galéria-csere), méret, mennyiség, kosárba */
(function () {
  'use strict';
  var G = window.GWK, D = window.GWK_DATA, $ = G.$, $$ = G.$$, B = G.B;
  var root = $('#pdp'); if (!root) return;
  var p = D.byId(root.getAttribute('data-product'));
  var colors = D.COLOR_ORDER.filter(function (c) { return c in p.colors; });
  var st = { color: colors[0], size: p.sizes[0], qty: 1 };
  try { var q = new URLSearchParams(location.search).get('szin'); if (q && colors.indexOf(q) > -1) st.color = q; } catch (e) {}

  function gallery() {
    var arr = p.colors[st.color] || [], name = p.name[G.lang()];
    var gal = $('#gal');
    if (!arr.length) {
      gal.innerHTML = '<figure><div class="soon"><img src="' + B + 'media/logo/logo-felirat-480.webp" alt="" width="480" height="273"><span>' + G.t('card.soon') + '</span></div></figure>';
    } else {
      gal.innerHTML = arr.map(function (im, i) {
        var set = im.small ? ' srcset="' + B + im.small + ' 800w, ' + B + im.src + ' ' + im.w + 'w" sizes="(max-width:960px) 86vw, 56vw"' : '';
        return '<figure><img src="' + B + im.src + '"' + set + ' width="' + im.w + '" height="' + im.h + '" alt="' + G.esc(name + ', ' + st.color + ', ' + (i + 1) + '. ' + G.t('pdp.photo')) + '"' + (i ? ' loading="lazy"' : '') + '></figure>';
      }).join('');
    }
    $('#soon').hidden = arr.length > 0;
    $('#colorName').textContent = G.cap(st.color);
    $$('.cbtn').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-color') === st.color)); });
    stock();
    G.queueRefresh();
  }
  /* készlet: elfogyott színnél a Kosárba helyén a „Szólj, ha újra van” blokk; más színre váltva visszajön */
  function stock() {
    var out = D.isOut(p, st.color), C = G.cap(st.color);
    $('#buy').hidden = out; $('#notify').hidden = !out; $('#colorOut').hidden = !out;
    $$('.cbtn').forEach(function (b) {
      var c = b.getAttribute('data-color'), o = D.isOut(p, c);
      b.classList.toggle('is-out', o);
      b.setAttribute('aria-label', o ? G.t('stock.outAria', { c: G.cap(c) }) : G.cap(c));
    });
    var f = $('#subN');
    f.setAttribute('data-notify-c', C); f.setAttribute('data-notify-s', st.size);
    $('#notifyP').textContent = G.t('notify.p', { p: p.name[G.lang()], c: C });
    var m = f.querySelector('.sub__msg'); if (m && !out) { m.className = 'sub__msg'; m.textContent = ''; }
  }
  function sizes() { $$('.sbtn').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-size') === st.size)); }); }

  root.addEventListener('click', function (e) {
    var c = e.target.closest('.cbtn'); if (c) { st.color = c.getAttribute('data-color'); gallery(); return; }
    var s = e.target.closest('.sbtn'); if (s) { st.size = s.getAttribute('data-size'); sizes(); stock(); return; }
    var qb = e.target.closest('[data-q]'); if (qb) { st.qty = Math.max(1, Math.min(20, st.qty + (+qb.getAttribute('data-q')))); $('#qty').textContent = st.qty; return; }
    if (e.target.closest('#add')) {
      if (!G.cart.add(p.id, st.color, st.size, st.qty)) return; // elfogyott szín: nem kerül kosárba
      G.toast(G.t('toast.added', { p: p.name[G.lang()] + ' (' + G.cap(st.color) + ')' }));
      setTimeout(G.openCart, 380);
    }
  });
  document.addEventListener('gwk:lang', gallery);
  gallery(); sizes();
})();
