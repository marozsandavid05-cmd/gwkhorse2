/* GWK Horse · bolt: szűrés termékre és színvilágra (DOM-alapú, megosztható ?tipus= &szin= paraméterrel) */
(function () {
  'use strict';
  var G = window.GWK, $ = G.$, $$ = G.$$;
  var grid = $('#pgrid'), cards = $$('.card', grid), empty = $('#empty'), count = $('#shopCount');
  var st = { type: '', color: '' };
  try {
    var q = new URLSearchParams(location.search);
    st.type = q.get('tipus') || ''; st.color = q.get('szin') || '';
  } catch (e) {}

  function apply(push) {
    var n = 0;
    cards.forEach(function (c) {
      var ok = (!st.type || c.getAttribute('data-type') === st.type) && (!st.color || c.getAttribute('data-color') === st.color);
      c.hidden = !ok; if (ok) { n++; c.classList.add('in'); }
    });
    empty.hidden = n > 0;
    count.textContent = G.t('shop.count', { n: n });
    $$('.chip').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-v') === st[b.getAttribute('data-f')]));
    });
    if (push && history.replaceState && location.protocol !== 'file:') {
      var u = new URL(location.href); u.search = '';
      if (st.type) u.searchParams.set('tipus', st.type);
      if (st.color) u.searchParams.set('szin', st.color);
      history.replaceState(null, '', u);
    }
    G.queueRefresh(); G.runReveal();
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.chip'); if (b) { st[b.getAttribute('data-f')] = b.getAttribute('data-v'); apply(true); return; }
    var v = e.target.closest('.view button');
    if (v) { grid.setAttribute('data-view', v.getAttribute('data-v')); $$('.view button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === v)); }); }
    if (e.target.closest('#reset')) { st.type = ''; st.color = ''; apply(true); }
  });
  document.addEventListener('gwk:lang', function () { apply(false); });
  apply(false);
})();
