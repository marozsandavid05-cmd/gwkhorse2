/* GWK Horse · főoldal (egyszerűbb változat): csak a hero belépője.
   CSS osztály billen, GSAP nélkül is lefut (RB1). Reduced-motion alatt a CSS eleve a végállapotot mutatja. */
(function () {
  'use strict';
  var top = document.getElementById('hero');
  if (!top) return;
  setTimeout(function () { top.classList.add('is-in'); }, 120);
})();
