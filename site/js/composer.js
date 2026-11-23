/* Wolfinn: the contact composer. Picks become a message you can send in one tap,
   or copy. Sending goes through the Apps Script backend set in js/site.js. */
(function () {
  'use strict';
  var W = window.Wolfinn || { email: 'admin@wolfinn.org', howl: function () {}, post: function () { return Promise.reject(new Error('offline')); } };
  var form = document.getElementById('composer'); if (!form) return;
  var card = document.getElementById('letter-card'), bodyEl = document.getElementById('c-body'), subj = document.getElementById('c-subject');
  var note = document.getElementById('c-note'), sendBtn = document.getElementById('c-send'), sent = document.getElementById('c-sent');
  var emailIn = document.getElementById('c-email');
  var KEY = 'wolfinn-composer';
  function picked(group) { return Array.prototype.slice.call(form.querySelectorAll('[data-group="' + group + '"] [aria-pressed="true"]')).map(function (b) { return b.textContent.trim(); }); }
  function val(id) { return document.getElementById(id).value.trim(); }
  function compose() {
    var probs = picked('problems'), tools = picked('tools'), name = val('c-name'), biz = val('c-biz'), more = val('c-more');
    var subject = 'A problem in my business' + (probs.length && probs[0] !== 'Something else' ? ': ' + probs[0].toLowerCase() : '');
    var lines = ['Hi Rohit,', ''];
    lines.push((biz ? 'I run ' + biz + ' and I' : 'I') + (probs.length ? "'m looking for help with:" : "'d like some help with my business."));
    probs.forEach(function (p) { lines.push('- ' + p); });
    if (tools.length) { lines.push(''); lines.push('Today we use: ' + tools.map(function (t) { return /^WhatsApp/.test(t) ? t : t.toLowerCase(); }).join(', ') + '.'); }
    if (more) { lines.push(''); lines.push(more); }
    lines.push(''); lines.push('Thanks,'); lines.push(name || '');
    return { subject: subject, body: lines.join('\n'), probs: probs, tools: tools, name: name, biz: biz, more: more, empty: !probs.length && !tools.length && !name && !biz && !more };
  }
  function render() {
    var c = compose();
    subj.textContent = c.subject;
    bodyEl.textContent = c.body;
    if (c.empty) { var ph = document.createElement('span'); ph.className = 'ph'; ph.textContent = '\n(Pick what fits on the left and this message writes itself.)'; bodyEl.appendChild(ph); }
    try { localStorage.setItem(KEY, JSON.stringify({ p: c.probs, t: c.tools, n: c.name, e: val('c-email'), b: c.biz, m: c.more })); } catch (e) {}
  }
  function copyText(c, prefix) {
    var text = 'To: ' + W.email + '\nSubject: ' + c.subject + '\n\n' + c.body;
    try {
      return navigator.clipboard.writeText(text).then(function () { note.textContent = (prefix || 'Copied.') + ' Paste it into a new email to ' + W.email + ' and send.'; W.howl(); },
        function () { note.textContent = 'Could not copy automatically. Select the message above instead.'; });
    } catch (e) { note.textContent = 'Could not copy automatically. Select the message above instead.'; return Promise.resolve(); }
  }
  form.querySelectorAll('.pill-opt').forEach(function (b) {
    b.addEventListener('click', function () { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); render(); });
  });
  form.addEventListener('input', function (e) { if (e.target === emailIn) emailIn.removeAttribute('aria-invalid'); render(); });
  form.addEventListener('submit', function (e) { e.preventDefault(); });
  document.getElementById('c-copy').addEventListener('click', function () { copyText(compose()); });

  sendBtn.addEventListener('click', function () {
    var c = compose(), email = val('c-email');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      emailIn.setAttribute('aria-invalid', 'true'); emailIn.focus();
      note.textContent = 'Add your email so Rohit can reply.'; return;
    }
    if (c.empty) { note.textContent = 'Pick at least one thing on the left first.'; return; }
    sendBtn.disabled = true; sendBtn.textContent = 'Sending...'; note.textContent = '';
    W.post({ action: 'contact', source: 'contact page', name: c.name, email: email, business: c.biz, subject: c.subject, message: c.body, website: val('c-website') })
      .then(function (r) {
        if (!r || !r.ok) throw new Error((r && r.error) || 'failed');
        document.getElementById('c-sent-text').textContent = 'Rohit will reply to ' + email + '.';
        sent.hidden = false; card.classList.add('is-sent'); W.howl();
        // analytics: lets Google Tag Manager count enquiries
        try { (window.dataLayer = window.dataLayer || []).push({ event: 'contact_form_sent', problems: c.probs.join(', ') }); } catch (e) {}
        try { localStorage.removeItem(KEY); } catch (e) {}
      })
      .catch(function (err) {
        var offline = err && err.message === 'offline';
        copyText(c, offline ? 'Sending isn\'t switched on yet, so your message was copied instead.' : 'That didn\'t send, so your message was copied instead.');
      })
      .then(function () { sendBtn.disabled = false; sendBtn.textContent = 'Send message'; });
  });
  document.getElementById('c-again').addEventListener('click', function () {
    card.classList.remove('is-sent'); sent.hidden = true; note.textContent = '';
    form.querySelectorAll('.pill-opt').forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
    document.getElementById('c-more').value = ''; render();
  });

  // restore an unsent draft
  try {
    var d = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (d) {
      form.querySelectorAll('[data-group="problems"] .pill-opt').forEach(function (b) { if ((d.p || []).indexOf(b.textContent.trim()) > -1) b.setAttribute('aria-pressed', 'true'); });
      form.querySelectorAll('[data-group="tools"] .pill-opt').forEach(function (b) { if ((d.t || []).indexOf(b.textContent.trim()) > -1) b.setAttribute('aria-pressed', 'true'); });
      document.getElementById('c-name').value = d.n || ''; document.getElementById('c-email').value = d.e || '';
      document.getElementById('c-biz').value = d.b || ''; document.getElementById('c-more').value = d.m || '';
    }
  } catch (e) {}
  render();
})();
