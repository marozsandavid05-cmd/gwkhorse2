/* GWK Horse · termékadatok EGY helyen (Evening Star kollekció).
   A leírások az ügyfél saját szövegei (HU + EN), a gondolatjeleket mondatra bontva, a hibás „Stardust” nevet Evening Starra javítva.
   Képek: csak az ügyfél szöveg nélküli fotói. Ahol egy színhez nincs fotó, a tömb üres, az oldal ezt kiírja. */
(function (root) {
  // w/h = a forráskép natív mérete (a keret arányához, vágás nélkül)
  function img(f, w, h, small) { return { src: 'media/termek/' + f + '.webp', small: small ? 'media/termek/' + f + '-800.webp' : null, w: w, h: h }; }

  var COLORS = {
    onyx:  { hex: '#15110F', ring: '#6d625c' },
    pearl: { hex: '#EEE7E1', ring: '#c9bfb7' },
    rose:  { hex: '#E7C9C1', ring: '#c99f94' }
  };

  var PRODUCTS = [
    {
      id: 'kantar', page: 'termek/kantar.html',
      price: 34900, // MINTA ÁR, az ügyfél adja meg
      unit: 'db',
      sizes: ['pony', 'cob', 'full'], // MINTA MÉRETEK, az ügyfél adja meg
      colors: {
        onyx: [img('kantar-onyx', 1402, 1122, true)],
        rose: [img('kantar-rose', 1402, 1122, true)]
      },
      name: { hu: 'Evening Star kantár', en: 'Evening Star Bridle' },
      type: { hu: 'Kantár', en: 'Bridle' },
      lead: {
        hu: 'Klasszikus kialakítás csillogó részletekkel: csillámos felület, finom kristálydíszítés, puha fehér párnázás.',
        en: 'A classic design with sparkling details: glitter finish, delicate crystal embellishment, soft white padding.'
      },
      body: {
        hu: [
          'A GWK Evening Star kantár elegáns, figyelemfelkeltő és kifinomult darab, amely a klasszikus kialakítást különleges, csillogó részletekkel ötvözi. A prémium hatású csillámos felületet finom kristálydíszítések egészítik ki, így a kantár igazán egyedi és luxus megjelenést kölcsönöz.',
          'A kantár azokon a területeken, ahol a kényelem különösen fontos, puha fehér párnázással rendelkezik. A párnázott részek kellemes, komfortos érzést biztosítanak, míg az állítható szíjak lehetővé teszik a kantár megfelelő illeszkedését a ló fejére.',
          'A GWK Evening Star kantár két elegáns színben érhető el, így kiválaszthatod a hozzád és lovadhoz leginkább illő stílust. A hozzá illő GWK Evening Star nyeregalátéttel és fülvédővel kombinálva tökéletesen összehangolt és figyelemfelkeltő szettet alkot.',
          'Egy különleges kantár azoknak, akik hisznek abban, hogy az igazán egyedi lovas megjelenést a részletek teszik teljessé.'
        ],
        en: [
          'The GWK Evening Star Bridle is an elegant, eye-catching and sophisticated piece that combines a classic design with distinctive sparkling details. The premium-look glitter finish is complemented by delicate crystal embellishments, giving the bridle a truly unique and luxurious appearance.',
          'The bridle features soft white padding in the areas where comfort is particularly important. The padded sections provide a comfortable feel, while the adjustable straps allow the bridle to be properly fitted to your horse.',
          'The Evening Star Bridle is available in two elegant colour options, allowing you to choose the style that best suits you and your horse. Paired with the matching GWK Evening Star Saddle Pad and Ear Bonnet, it creates a perfectly coordinated and eye-catching set.',
          'A special bridle for those who believe that the details are what make a rider\u2019s look truly unique.'
        ]
      }
    },
    {
      id: 'nyeregalatet', page: 'termek/nyeregalatet.html',
      price: 32900, // MINTA ÁR, az ügyfél adja meg
      unit: 'db',
      sizes: ['pony', 'full'], // MINTA MÉRETEK, az ügyfél adja meg
      colors: {
        onyx: [img('nyereg-onyx', 1509, 1042, true)],
        pearl: [img('nyereg-pearl', 1448, 1086, true)],
        rose: [img('nyereg-rose', 1509, 1042, true)]
      },
      name: { hu: 'Evening Star nyeregalátét', en: 'Evening Star Saddle Pad' },
      type: { hu: 'Nyeregalátét', en: 'Saddle pad' },
      lead: {
        hu: 'Fénylő anyag, letisztult steppelés, vastag és puha párnázás a mindennapokra és a különleges alkalmakra.',
        en: 'Shimmering fabric, clean quilting and thick, soft padding for everyday riding and special occasions.'
      },
      body: {
        hu: [
          'A GWK Evening Star nyeregalátét a klasszikus eleganciát finom csillogással ötvözi. A gyönyörűen fénylő anyag és a letisztult, steppelt kialakítás minden színváltozatban elegáns és figyelemfelkeltő megjelenést kölcsönöz.',
          'A nyeregalátét kiváló minőségű, vastag és puhán párnázott anyagból készül, amely kényelmes alátámasztást biztosít lovad számára. A gondosan kidolgozott részletek és a prémium megjelenés egyaránt tökéletessé teszik a mindennapi lovagláshoz és a különleges alkalmakhoz.',
          'Válaszd azt az Evening Star árnyalatot, amely leginkább hozzád és lovadhoz illik, és tedd igazán különlegessé minden közös lovaglásotokat.'
        ],
        en: [
          'The GWK Evening Star Saddle Pad combines classic elegance with a subtle touch of sparkle. The beautifully shimmering fabric and clean, quilted design create an elegant and eye-catching look in every colour option.',
          'The saddle pad is made from high-quality, thick and softly padded material, providing comfortable support for your horse. Carefully crafted details and its premium appearance make it a perfect choice for both everyday riding and special occasions.',
          'Choose the Evening Star shade that best suits you and your horse, and make every ride together truly special.'
        ]
      }
    },
    {
      id: 'fulvedo', page: 'termek/fulvedo.html',
      price: 16900, // MINTA ÁR, az ügyfél adja meg
      unit: 'db',
      sizes: ['pony', 'cob', 'full'], // MINTA MÉRETEK, az ügyfél adja meg
      colors: {
        onyx: [img('fulvedo-onyx', 1402, 1122, true)],
        pearl: [img('fulvedo-pearl', 1086, 1448, true), img('fulvedo-pearl-2', 1402, 1122, true)],
        rose: [img('fulvedo-rose', 1402, 1122, true)]
      },
      name: { hu: 'Evening Star fülvédő', en: 'Evening Star Ear Bonnet' },
      type: { hu: 'Fülvédő', en: 'Ear bonnet' },
      lead: {
        hu: 'Puha kötött anyag, rugalmas fülrészek, dekoratív szegély. Az Evening Star nyeregalátétek párja.',
        en: 'Soft knitted fabric, flexible ear sections and a decorative trim. The partner of the Evening Star saddle pads.'
      },
      body: {
        hu: [
          'A GWK Evening Star fülvédő elegáns és praktikus kiegészítő, amely tökéletesen harmonizál az Evening Star kollekció nyeregalátéteivel. Kifinomult, részletgazdag kialakítása és prémium megjelenése különleges eleganciát kölcsönöz lovad megjelenésének.',
          'A puha, kötött anyag kényelmes viseletet biztosít, míg a rugalmas fülrészek kellemes és stabil illeszkedést tesznek lehetővé. A dekoratív szegély és a GWK logó elegáns, letisztult megjelenést kölcsönöz a fülvédőnek.',
          'Több gyönyörű árnyalatban érhető el, így könnyedén megtalálhatod a lovadhoz és az Evening Star nyeregalátétedhez leginkább illő színt.',
          'Egy apró részlet, amely tökéletessé teszi az Evening Star megjelenést.'
        ],
        en: [
          'The GWK Evening Star Ear Bonnet is an elegant and practical accessory that perfectly complements the saddle pads from the Evening Star Collection. Its refined, detailed design and premium appearance add a sophisticated touch to your horse\u2019s overall look.',
          'The soft knitted fabric provides a comfortable fit, while the flexible ear sections allow for a pleasant and secure fit. The decorative trim and GWK logo add an elegant, clean finish.',
          'Available in several beautiful shades, making it easy to find the perfect colour to complement your horse and your Evening Star Saddle Pad.',
          'A small detail that completes the Evening Star look.'
        ]
      }
    },
    {
      id: 'labvedo', page: 'termek/labvedo.html',
      price: 24900, // MINTA ÁR, az ügyfél adja meg
      unit: 'par',
      sizes: ['pony', 'cob', 'full'], // MINTA MÉRETEK, az ügyfél adja meg
      colors: {
        onyx: [img('labvedo-onyx', 1210, 1300, true), img('labvedo-onyx-2', 464, 558, false), img('labvedo-onyx-3', 411, 498, false)],
        pearl: [], // az ügyféltől még nincs fotó: az oldal kiírja
        rose: [img('labvedo-rose', 1086, 1448, true)]
      },
      name: { hu: 'Evening Star lábvédő', en: 'Evening Star Brushing Boots' },
      type: { hu: 'Lábvédő', en: 'Brushing boots' },
      lead: {
        hu: 'Csillámos felület, puha plüss bélés, anatómiai forma és biztos tépőzáras rögzítés.',
        en: 'Glitter finish, soft plush lining, a contoured shape and secure hook-and-loop fastening.'
      },
      body: {
        hu: [
          'A GWK Evening Star lábvédők az elegáns dizájnt, a kényelmes védelmet és a GWK jellegzetes stílusát ötvözik. Finom csillámos hatású felületük, puha plüss bélésük és anatómiailag kialakított, védelmet biztosító formájuk révén ideálisak a ló lábainak védelmére a mindennapi lovaglás és munka során.',
          'A biztonságos tépőzáras rögzítés lehetővé teszi az állítható, stabil illeszkedést, míg a puha plüss szegély további kényelmet biztosít a széleken.',
          'Az Evening Star lábvédők Black, Pearl és Rose színekben érhetők el, és úgy terveztük őket, hogy tökéletesen harmonizáljanak a kollekció többi darabjával.',
          'Elegáns védelem. Könnyed stílus. Ragyogásra tervezve.'
        ],
        en: [
          'The GWK Evening Star Brushing Boots combine elegant design, comfortable protection and the signature GWK style. Featuring a refined glitter-effect finish, soft plush lining and a contoured protective shape, they are designed to help protect the horse\u2019s legs during everyday riding and exercise.',
          'The secure hook-and-loop fastening allows for an adjustable and stable fit, while the soft plush trim provides additional comfort around the edges.',
          'Available in Black, Pearl and Rose, the Evening Star Brushing Boots are designed to perfectly complement the other pieces of the collection.',
          'Elegant protection. Effortless style. Made to shine.'
        ]
      }
    },
    {
      id: 'pataharang', page: 'termek/pataharang.html',
      price: 14900, // MINTA ÁR, az ügyfél adja meg
      unit: 'par',
      sizes: ['s', 'm', 'l'], // MINTA MÉRETEK, az ügyfél adja meg
      colors: {
        onyx: [img('pataharang-onyx', 486, 492, false), img('pataharang-onyx-2', 438, 545, false)],
        pearl: [img('pataharang-pearl', 446, 540, false), img('pataharang-pearl-2', 859, 553, true)],
        rose: [img('pataharang-rose', 1448, 1086, true), img('pataharang-rose-2', 1402, 1122, true)]
      },
      name: { hu: 'Evening Star pataharang', en: 'Evening Star Bell Boots' },
      type: { hu: 'Pataharang', en: 'Bell boots' },
      lead: {
        hu: 'Csillámos felület, puha műszőrme szegély, állítható tépőzár és elegáns GWK fém logó.',
        en: 'Glitter finish, soft faux-fur trim, adjustable hook-and-loop fastening and an elegant GWK metal logo.'
      },
      body: {
        hu: [
          'A GWK Evening Star pataharang a praktikus védelmet elegáns, figyelemfelkeltő dizájnnal ötvözi. A stílusos csillámos felület finom ragyogást kölcsönöz neki, míg a puha műszőrme szegély kényelmes illeszkedést biztosít a pata körül.',
          'A strapabíró kialakítás és az állítható tépőzáras rögzítés segít abban, hogy a patkóvédők lovaglás és mindennapi használat közben is stabilan a helyükön maradjanak. Az elegáns GWK fém logó kifinomult, prémium megjelenést kölcsönöz a terméknek.',
          'A patkóvédők három gyönyörű színben érhetők el, és tökéletesen kombinálhatók a GWK Evening Star nyeregalátétekkel és a kollekció további kiegészítőivel, így harmonikus és kifinomult összhatás érhető el.',
          'Védelem, kényelem és egy csipetnyi ragyogás. Minden egyes lovagláshoz.'
        ],
        en: [
          'The GWK Evening Star Bell Boots combine practical protection with an elegant, eye-catching design. The stylish glitter finish adds a subtle sparkle, while the soft faux-fur trim provides a comfortable fit around the hoof.',
          'The durable construction and adjustable hook-and-loop fastening help keep the bell boots securely in place during riding and everyday use. The elegant GWK metal logo adds a refined, premium finishing touch.',
          'Available in three beautiful colour options, the bell boots can be perfectly matched with the GWK Evening Star Saddle Pads and other coordinating accessories to create a complete and sophisticated look.',
          'Protection, comfort and a touch of sparkle. For every ride.'
        ]
      }
    }
  ];

  var DATA = { COLORS: COLORS, PRODUCTS: PRODUCTS, COLOR_ORDER: ['onyx', 'pearl', 'rose'] };
  DATA.byId = function (id) { for (var i = 0; i < PRODUCTS.length; i++) if (PRODUCTS[i].id === id) return PRODUCTS[i]; return null; };
  if (typeof module !== 'undefined' && module.exports) module.exports = DATA;
  else root.GWK_DATA = DATA;
})(this);
