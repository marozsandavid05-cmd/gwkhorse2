/* GWK Horse · főoldal: hero-képváltó (Krisztina 2026-11-04-i terve: 3 kép, nyilak, pöttyök).
   A képek áttűnéssel váltanak; a szöveg-panel nem mozog. Automatikus lapozás 6,5 mp-enként, ami megáll, ha az egér
   vagy a fókusz a hero-n van, ha a fül a háttérben van, és reduced-motion alatt (ott csak kézzel lapozható). GSAP nélkül fut. */
(function () {
  'use strict';
  var top = document.getElementById('hero');
  if (!top) return;
  setTimeout(function () { top.classList.add('is-in'); }, 120);

  var hs = document.getElementById('hs');
  if (!hs) return;
  var slides = [].slice.call(hs.querySelectorAll('.hs__s'));
  var dots = [].slice.call(hs.querySelectorAll('.hs__dot'));
  var n = slides.length, cur = 0, timer = null, hold = false;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function go(i) {
    i = (i + n) % n; if (i === cur) return;
    slides[cur].classList.remove('is-on'); slides[cur].setAttribute('aria-hidden', 'true');
    slides[i].classList.add('is-on'); slides[i].removeAttribute('aria-hidden');
    dots[cur].setAttribute('aria-current', 'false'); dots[i].setAttribute('aria-current', 'true');
    cur = i;
  }
  function stop() { clearInterval(timer); timer = null; }
  function start() { stop(); if (!reduce && !hold && !document.hidden) timer = setInterval(function () { go(cur + 1); }, 6500); }

  hs.addEventListener('click', function (e) {
    var b = e.target.closest('[data-hs]'); if (!b) return;
    var v = b.getAttribute('data-hs');
    go(v === 'p' ? cur - 1 : v === 'n' ? cur + 1 : parseInt(v, 10));
    start();
  });
  hs.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { go(cur - 1); start(); }
    if (e.key === 'ArrowRight') { go(cur + 1); start(); }
  });
  hs.addEventListener('mouseenter', function () { hold = true; stop(); });
  hs.addEventListener('mouseleave', function () { hold = false; start(); });
  hs.addEventListener('focusin', function () { hold = true; stop(); });
  hs.addEventListener('focusout', function () { hold = false; start(); });
  document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else start(); });
  window.GWK_HERO = { go: go, cur: function () { return cur; } };
  start();
})();
