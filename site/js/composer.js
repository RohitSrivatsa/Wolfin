/* Wolfinn: the contact composer. Picks become a ready-to-send email. */
(function () {
  'use strict';
  var W = window.Wolfinn || { email: 'rohit@wolfinn.org', mailto: function (s, b) { return 'mailto:rohit@wolfinn.org?subject=' + encodeURIComponent(s) + '&body=' + encodeURIComponent(b); }, howl: function () {} };
  var form = document.getElementById('composer'); if (!form) return;
  var bodyEl = document.getElementById('c-body'), subj = document.getElementById('c-subject'), note = document.getElementById('c-note');
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
    return { subject: subject, body: lines.join('\n'), empty: !probs.length && !tools.length && !name && !biz && !more };
  }
  function render() {
    var c = compose();
    subj.textContent = c.subject;
    bodyEl.textContent = c.body;
    if (c.empty) { var ph = document.createElement('span'); ph.className = 'ph'; ph.textContent = '\n(Pick what fits on the left and this email writes itself.)'; bodyEl.appendChild(ph); }
    try { localStorage.setItem(KEY, JSON.stringify({ p: picked('problems'), t: picked('tools'), n: val('c-name'), b: val('c-biz'), m: val('c-more') })); } catch (e) {}
  }
  form.querySelectorAll('.pill-opt').forEach(function (b) {
    b.addEventListener('click', function () { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); render(); });
  });
  form.addEventListener('input', render);
  form.addEventListener('submit', function (e) { e.preventDefault(); });
  document.getElementById('c-copy').addEventListener('click', function () {
    var c = compose(), text = 'To: ' + W.email + '\nSubject: ' + c.subject + '\n\n' + c.body;
    try { navigator.clipboard.writeText(text).then(function () { note.textContent = 'Copied. Paste it into a new email to ' + W.email + ' and send.'; W.howl(); }, function () { note.textContent = 'Could not copy automatically. Select the message above instead.'; }); }
    catch (e) { note.textContent = 'Could not copy automatically. Select the message above instead.'; }
  });
  // restore an unsent draft
  try {
    var d = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (d) {
      form.querySelectorAll('[data-group="problems"] .pill-opt').forEach(function (b) { if (d.p.indexOf(b.textContent.trim()) > -1) b.setAttribute('aria-pressed', 'true'); });
      form.querySelectorAll('[data-group="tools"] .pill-opt').forEach(function (b) { if (d.t.indexOf(b.textContent.trim()) > -1) b.setAttribute('aria-pressed', 'true'); });
      document.getElementById('c-name').value = d.n || ''; document.getElementById('c-biz').value = d.b || ''; document.getElementById('c-more').value = d.m || '';
    }
  } catch (e) {}
  render();
})();
