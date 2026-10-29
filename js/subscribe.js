/* GWK Horse · feliratkozás új termékekre (lábléc + termékoldal).
   Beküldés: Web3Forms (api.web3forms.com/submit, fetch, JSON).
   Élesítés: a lenti ACCESS_KEY helyére a GWK Horse Web3Forms kulcsa kerül (web3forms.com, ingyenes,
   a kulcs a gwkhorse@gmail.com címre jár). Amíg a helyőrző áll itt, NEM megy ki kérés, és nincs hamis siker:
   az oldal kiírja, hogy a feliratkozás most nem érhető el, és megadja az e-mail-címet. */
(function () {
  'use strict';
  var ACCESS_KEY = 'WEB3FORMS_ACCESS_KEY_IDE';
  var ENDPOINT = 'https://api.web3forms.com/submit';
  var G = window.GWK || {}, C = window.GWK_CONFIG || {};
  var t = function (k, v) { return G.t ? G.t(k, v) : k; };
  var hasKey = ACCESS_KEY && ACCESS_KEY.indexOf('WEB3FORMS_ACCESS_KEY') !== 0;
  var MAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function msg(form, kind, text) {
    var m = form.querySelector('.sub__msg');
    m.className = 'sub__msg is-on is-' + kind;
    m.textContent = text;
  }
  function mark(el, bad) {
    el.setAttribute('aria-invalid', String(bad));
    var box = el.closest('.sub__fld, .sub__chk'); if (box) box.classList.toggle('bad', bad);
  }

  Array.prototype.forEach.call(document.querySelectorAll('form[data-sub]'), function (form) {
    var mail = form.querySelector('input[type=email]');
    var ok = form.querySelector('input[name=consent]');
    var btn = form.querySelector('button[type=submit]');
    mail.setAttribute('aria-describedby', form.id + 'Msg');
    form.querySelector('.sub__msg').id = form.id + 'Msg';
    mail.addEventListener('input', function () { mark(mail, false); });
    ok.addEventListener('change', function () { if (ok.checked) mark(ok, false); });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = mail.value.trim();
      var badMail = !MAIL_RE.test(v), badOk = !ok.checked;
      mark(mail, badMail); mark(ok, badOk);
      if (badMail) { msg(form, 'err', t('err.email')); mail.focus(); return; }
      if (badOk) { msg(form, 'err', t('err.consent')); ok.focus(); return; }
      if (form.botcheck && form.botcheck.checked) return; // robot: csendben eldobjuk
      if (!hasKey) { msg(form, 'err', t('sub.off', { mail: C.email })); return; }

      var product = form.getAttribute('data-sub') || t('sub.all');
      var payload = {
        access_key: ACCESS_KEY,
        subject: t('sub.subject', { p: product }),
        from_name: 'GWK Horse webshop',
        email: v,
        termek: product,
        nyelv: G.lang ? G.lang() : 'hu',
        oldal: location.href,
        botcheck: false
      };
      btn.disabled = true; msg(form, 'wait', t('sub.sending'));
      fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload) })
        .then(function (r) { return r.json().then(function (j) { return { ok: r.ok && j && j.success, j: j }; }); })
        .then(function (res) {
          if (res.ok) { msg(form, 'ok', t('sub.ok')); form.reset(); }
          else msg(form, 'err', t('sub.fail', { mail: C.email }));
        })
        .catch(function () { msg(form, 'err', t('sub.fail', { mail: C.email })); })
        .then(function () { btn.disabled = false; });
    });
  });
})();
