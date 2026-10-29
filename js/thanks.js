/* GWK Horse · köszönő oldal: a bemutató rendelés visszaigazolása (sessionStorage-ből) */
(function () {
  'use strict';
  var G = window.GWK, C = window.GWK_CONFIG, D = window.GWK_DATA, $ = G.$;
  var o = null;
  try { o = JSON.parse(sessionStorage.getItem(C.storageKeys.order) || 'null'); } catch (e) {}
  function render() {
    if (!o) return;
    var no = $('#tyNo'); no.hidden = false; no.textContent = G.t('ty.no', { n: o.no });
    var p = $('#tyP'); p.setAttribute('data-i18n', 'ty.p'); p.textContent = G.t('ty.p');
    var lines = $('#tyLines'); lines.hidden = false;
    lines.innerHTML = o.items.map(function (x) {
      var pr = D.byId(x.id); if (!pr) return '';
      return '<div><span>' + G.esc(G.lineName(x)) + ' \u00b7 ' + G.cap(x.color) + ' \u00b7 ' + x.qty + ' ' + G.t('unit.' + pr.unit) + '</span><span>' + G.money(pr.price * x.qty) + '</span></div>';
    }).join('') +
      '<div><span>' + G.t('co.shipc') + '</span><span>' + (o.shipping ? G.money(o.shipping) : G.t('co.free')) + '</span></div>' +
      '<div class="tot"><span>' + G.t('co.total') + '</span><span>' + G.money(o.total) + '</span></div>';
  }
  document.addEventListener('gwk:lang', render);
  render();
})();
