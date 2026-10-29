/* GWK Horse · Galéria: nagyító natív <dialog>-gal (showModal: a háttér inert, Esc bezár).
   Nyilakkal és billentyűvel lapoz, a fókusz zárás után visszatér a megnyitó képre.
   GSAP nélkül működik; a nyitás egy rövid CSS-áttűnés, reduced-motion alatt az is kimarad. */
(function () {
  'use strict';
  var G = window.GWK || {};
  var dlg = document.getElementById('lb');
  var btns = Array.prototype.slice.call(document.querySelectorAll('.gal__btn'));
  if (!dlg || !btns.length || typeof dlg.showModal !== 'function') return;
  var img = document.getElementById('lbImg'), cap = document.getElementById('lbCap'), num = document.getElementById('lbN'), link = document.getElementById('lbA');
  var cur = 0, opener = null;

  function show(i) {
    cur = (i + btns.length) % btns.length;
    var b = btns[cur], fig = b.closest('figure');
    img.src = b.getAttribute('data-full');
    img.width = +b.getAttribute('data-w'); img.height = +b.getAttribute('data-h');
    img.alt = b.querySelector('img').alt;
    cap.textContent = Array.prototype.map.call(fig.querySelectorAll('.gal__cap > span'), function (x) { return x.textContent.trim(); }).join(', ');
    num.textContent = G.t ? G.t('gal.count', { i: cur + 1, n: btns.length }) : (cur + 1) + ' / ' + btns.length;
    link.href = b.getAttribute('data-href');
  }
  function open(i, from) {
    opener = from || null; show(i);
    if (G.lenis) G.lenis.stop();
    document.documentElement.classList.add('lb-open');
    dlg.showModal();
  }
  btns.forEach(function (b, i) { b.addEventListener('click', function () { open(i, b); }); });
  dlg.addEventListener('click', function (e) {
    var a = e.target.closest('[data-lb]');
    if (a) { var v = a.getAttribute('data-lb'); if (v === 'x') dlg.close(); else show(cur + (+v)); return; }
    if (e.target === dlg || e.target.classList.contains('lb__in')) dlg.close(); // kattintás a képen kívül
  });
  dlg.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); show(cur + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); show(cur - 1); }
  });
  dlg.addEventListener('close', function () {
    document.documentElement.classList.remove('lb-open');
    if (G.lenis) G.lenis.start();
    if (opener) opener.focus();
  });
})();
