/* GWK Horse · fizetés: PROVIDER-SEAM.
   A pénztár csak a GWK_PAY.start(order) hívást ismeri. A tényleges szolgáltató a config.paymentProvider szerint dől el.
   Most: 'demo' (bemutató), valódi terhelés nincs.
   Élesítés (később, backenddel): új ág ide, pl. 'barion' vagy 'stripe', amely a saját szerver-végpontunkat hívja
   (a titkos kulcs SOHA nem kerül a böngészőbe), és a szolgáltató fizetési oldalára irányít.
   A visszatérési URL a koszonjuk.html marad, így a frontend többi része nem változik. */
(function () {
  'use strict';
  var C = window.GWK_CONFIG;
  var providers = {
    demo: function (order) {
      return new Promise(function (resolve) {
        setTimeout(function () { resolve({ ok: true, provider: 'demo', ref: 'DEMO-' + order.no }); }, 900);
      });
    }
    // barion: function (order) { return fetch('/api/fizetes/inditas', { method: 'POST', body: JSON.stringify(order) }).then(...) }
  };
  window.GWK_PAY = {
    provider: C.paymentProvider,
    start: function (order) {
      var fn = providers[C.paymentProvider];
      if (!fn) return Promise.resolve({ ok: false, error: 'Ismeretlen fizetési szolgáltató: ' + C.paymentProvider });
      return fn(order);
    }
  };
})();
