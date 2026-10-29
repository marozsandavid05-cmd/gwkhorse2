/* GWK Horse · webshop beállítások EGY helyen.
   Minden üzleti szám (ár, díj, küszöb) itt vagy a products.js-ben él, HTML-ben soha. */
(function (root) {
  var CONFIG = {
    brand: 'GWK Horse',
    email: 'gwkhorse@gmail.com',
    currency: 'HUF',

    // MINTA ÉRTÉK, az ügyfél adja meg. Az ügyfél makettjén „150 € felett ingyenes szállítás” állt, ez forintban kerekítve.
    freeShippingFrom: 60000,

    // MINTA DÍJAK, az ügyfél adja meg (szállító-integráció még nincs, ezek csak a pénztár felépítéséhez kellenek).
    shipping: [
      { id: 'hazhoz', price: 2490 },
      { id: 'csomagpont', price: 1490 }
    ],

    // Fizetés: provider-seam. 'demo' = bemutató, valódi terhelés nincs.
    // Élesítéskor itt kell átállítani (pl. 'barion' vagy 'stripe'), a pénztár kódja nem változik.
    paymentProvider: 'demo',

    // Közösségi oldalak (lábléc + Kapcsolat oldal). Ami üres, az nem jelenik meg.
    // TikTok bekapcsolása: írd be a profil teljes linkjét, majd futtasd: node tools/build.js
    social: {
      facebook: 'https://www.facebook.com/profile.php?id=61593259613128',
      instagram: 'https://www.instagram.com/gwk_horse/',
      tiktok: ''
    },

    storageKeys: { cart: 'gwk-cart-v1', lang: 'gwk-lang', order: 'gwk-order' }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = CONFIG;
  else root.GWK_CONFIG = CONFIG;
})(this);
