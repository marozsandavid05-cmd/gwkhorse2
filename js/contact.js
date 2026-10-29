/* GWK Horse · közös űrlap-ellenőrzés + kapcsolat oldal (bemutató: nem küld el semmit) */
(function () {
  'use strict';
  var G = window.GWK, $ = G.$, $$ = G.$$;

  G.validate = function (form) {
    var first = null;
    $$('.fld', form).forEach(function (f) {
      var el = f.querySelector('input,textarea,select'); if (!el) return;
      var bad = false;
      if (el.type === 'checkbox') bad = el.required && !el.checked;
      else {
        var v = el.value.trim();
        bad = el.required && !v;
        if (!bad && el.type === 'email') bad = !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
        if (!bad && el.id === 'oZip') bad = !/^\d{4}$/.test(v);
      }
      f.classList.toggle('bad', bad);
      el.setAttribute('aria-invalid', String(bad));
      var err = f.querySelector('.err');
      if (err) { if (!err.id) err.id = el.id + 'Err'; el.setAttribute('aria-describedby', err.id); }
      if (bad && !first) first = el;
    });
    if (first) first.focus();
    return !first;
  };
  document.addEventListener('input', function (e) {
    var f = e.target.closest && e.target.closest('.fld.bad'); if (f) { f.classList.remove('bad'); e.target.setAttribute('aria-invalid', 'false'); }
  });
  document.addEventListener('change', function (e) {
    var f = e.target.closest && e.target.closest('.fld.bad'); if (f && e.target.checked) f.classList.remove('bad');
  });

  var form = $('#ctForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!G.validate(form)) return;
      $('#ctOk').classList.add('is-on');
      form.reset();
    });
  }
  var cp = $('#copyMail');
  if (cp) cp.addEventListener('click', function () {
    var mail = window.GWK_CONFIG.email;
    var done = function () { G.toast(G.t('ct.copied')); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(mail).then(done, done);
    else done();
  });
})();
