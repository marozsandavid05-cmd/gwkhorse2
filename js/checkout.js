/* GWK Horse · pénztár (bemutató): összesítő, szállítás, ellenőrzés, demó fizetés, köszönő oldal */
(function () {
  'use strict';
  var G = window.GWK, C = window.GWK_CONFIG, D = window.GWK_DATA, $ = G.$, $$ = G.$$, B = G.B;
  var form = $('#coForm'); if (!form) return;

  function shipId() { var r = form.querySelector('input[name="ship"]:checked'); return r ? r.value : C.shipping[0].id; }
  function shipCost(sub) {
    if (sub >= C.freeShippingFrom) return 0;
    var s = C.shipping.filter(function (x) { return x.id === shipId(); })[0];
    return s ? s.price : 0;
  }
  function render() {
    var items = G.cart.items();
    $('#coEmpty').hidden = items.length > 0;
    $('#coSheet').hidden = !items.length;
    if (!items.length) return;
    $('#sumList').innerHTML = items.map(function (x) {
      var p = D.byId(x.id); if (!p) return '';
      return '<div class="sum-item">' + G.thumb(p, x.color) + '<div><b>' + G.esc(G.lineName(x)) + '</b><small>' + G.esc(G.lineSub(x)) + ' \u00b7 ' + x.qty + ' ' + G.t('unit.' + p.unit) + '</small></div><span>' + G.money(p.price * x.qty) + '</span></div>';
    }).join('');
    var sub = G.cart.subtotal(), sh = shipCost(sub);
    $('#sumSub').textContent = G.money(sub);
    $('#sumShip').textContent = sh ? G.money(sh) : G.t('co.free');
    $('#sumTotal').textContent = G.money(sub + sh);
    var left = C.freeShippingFrom - sub;
    $('#sumHint').textContent = left > 0 ? G.t('cart.free', { n: G.money(left) }) : G.t('cart.freeok');
    $$('[data-ship-price]').forEach(function (el) { el.textContent = sub >= C.freeShippingFrom ? G.t('co.free') : G.money(+el.getAttribute('data-ship-price')); });
  }
  form.addEventListener('change', function (e) { if (e.target.name === 'ship') render(); });
  document.addEventListener('gwk:lang', render);

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!G.validate(form)) return;
    var btn = $('#coSubmit'); btn.disabled = true;
    var lbl = btn.querySelector('span'); lbl.textContent = G.t('co.processing');
    var items = G.cart.items(), sub = G.cart.subtotal(), sh = shipCost(sub);
    var no = 'GWK-' + new Date().toISOString().slice(2, 10).replace(/-/g, '') + '-' + String(Math.floor(1000 + Math.random() * 9000));
    var order = { no: no, items: items, subtotal: sub, shipping: sh, total: sub + sh, ship: shipId(),
      pay: (form.querySelector('input[name="pay"]:checked') || {}).value, name: $('#oName').value.trim(), email: $('#oEmail').value.trim(), at: Date.now() };
    window.GWK_PAY.start(order).then(function (res) {
      if (!res.ok) { btn.disabled = false; lbl.textContent = G.t('co.submit'); G.toast(res.error || 'Hiba'); return; }
      order.ref = res.ref; order.provider = res.provider;
      try { sessionStorage.setItem(C.storageKeys.order, JSON.stringify(order)); } catch (err) {}
      G.cart.clear();
      location.href = B + 'koszonjuk.html';
    });
  });
  render();
})();
