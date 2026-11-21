/* Finn: Wolfinn's website assistant.
   With the backend switched on (BACKEND in js/site.js), answers come from Claude
   via the Apps Script backend. Without it, Finn answers from a short FAQ below and
   says so. The conversation follows the visitor from page to page (sessionStorage). */
(function () {
  'use strict';
  var W = window.Wolfinn || {};
  var online = !!W.backend;
  var KEY = 'wolfinn-finn';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FIN = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19c3-1 6-4 7.5-8.5C13.4 7.6 14 5 15.5 3c.6 3 1.7 6.4 3.5 9.3 1 1.7 1.7 3.4 2 5.7H5z" fill="currentColor"/></svg>';
  var GREETING = "Hi, I'm Finn, Wolfinn's assistant. Ask me what we do, which service fits your problem, or how to get started.";
  var CHIPS = ['What do you do?', 'Can you help my business?', 'How much does it cost?', 'How do I get started?'];

  var FAQ = [
    [/price|cost|how much|quote|budget|expensive|cheap/i, "Every job is different, so there's no price list. Tell Rohit what you need and you'll get a clear quote after a short conversation. The [Contact page](contact.html) writes the message for you."],
    [/automat|workflow|repetitive|manual|copy|paste|follow.?up|handoff/i, "That sounds like workflow automation: the handoffs between your tools done for you, like enquiries, follow-ups and reports. Try the [automation demo](demo-automation.html) to see one run."],
    [/website|web ?site|web app|landing|online presence|domain/i, "We build fast, clear websites and web apps that bring in work. The [websites demo](demo-websites.html) builds three sample sites in front of you."],
    [/dashboard|data|report|excel|spreadsheet|numbers|analytics|chart/i, "If you have data, even messy spreadsheets, we can turn it into clear visual dashboards. Have a look at the [analytics demo](demo-analytics.html)."],
    [/chat ?bot|\bai\b|assistant|voice|answer.*(call|message|question)|customer service|faq/i, "We set up AI assistants that answer chats, calls or emails using your own information, and hand tricky ones to you. Try the [assistant demo](demo-assistant.html)."],
    [/tool|software.*(choose|pick|which)|consult|advice|setup|set up|too many/i, "Software consulting starts with a check-up of the tools you use: what to keep, replace, connect or drop. The [consulting demo](demo-consulting.html) shows how that looks."],
    [/\bapps?\b|custom|internal|system|track|inventory|stock|job/i, "Custom software means a tool built around how you actually work, like a job tracker or stock system. Try the [custom software demo](demo-software.html)."],
    [/who|founder|rohit|team|you guys|company|about/i, "Wolfinn is a one-person studio run by Rohit. You talk to the person who builds it, from first chat to finished system."],
    [/start|begin|hire|contact|talk|call|email|reach/i, "The easiest way is the [Contact page](contact.html): tap what's slowing you down and send. Or email rohit@wolfinn.org directly."],
    [/how.*work|process|steps|timeline|long/i, "It starts with a conversation about how you work, then a plain-English plan before anything is built. If technology isn't the answer, you'll hear that too."],
    [/what.*(do|offer|services)|services|help.*business|help me/i, "Wolfinn builds software solutions for whatever slows your business down: [custom software](demo-software.html), [websites](demo-websites.html), [software consulting](demo-consulting.html), [data dashboards](demo-analytics.html), [AI assistants](demo-assistant.html) and [workflow automation](demo-automation.html). What's the problem you'd most like to fix?"],
    [/^(hi|hey|hello|yo)\b/i, "Hi! What would you like to know about Wolfinn?"],
    [/thank|cheers|great|perfect/i, "You're welcome. If you'd like Rohit to look at your problem, tap Send this chat to Rohit below."]
  ];
  function faq(q) {
    for (var i = 0; i < FAQ.length; i++) if (FAQ[i][0].test(q)) return FAQ[i][1];
    return "I'm not sure about that one. Rohit can help: tap Send this chat to Rohit below, or email rohit@wolfinn.org.";
  }

  var state = { open: false, msgs: [] };
  try { var saved = JSON.parse(sessionStorage.getItem(KEY) || 'null'); if (saved && Array.isArray(saved.msgs)) state.msgs = saved.msgs.slice(-30); } catch (e) {}
  function save() { try { sessionStorage.setItem(KEY, JSON.stringify({ msgs: state.msgs })); } catch (e) {} }

  /* ---- markup ---- */
  var root = document.createElement('div');
  root.className = 'finn';
  root.innerHTML =
    '<button class="finn__launch" type="button" aria-haspopup="dialog" aria-expanded="false"><span class="finn__fin">' + FIN + '</span><span>Ask Finn</span></button>' +
    '<section class="finn__panel" role="dialog" aria-label="Chat with Finn, Wolfinn\'s assistant" hidden>' +
      '<header class="finn__head"><span class="finn__avatar">' + FIN + '</span><div><b>Finn</b><span>Wolfinn\'s assistant</span></div><button class="finn__close" type="button" aria-label="Close chat"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button></header>' +
      '<div class="finn__msgs" aria-live="polite"></div>' +
      '<div class="finn__chips"></div>' +
      '<form class="finn__form" autocomplete="off"><label class="visually-hidden" for="finn-input">Message Finn</label><input id="finn-input" maxlength="600" placeholder="Ask anything about Wolfinn..."><button type="submit" aria-label="Send"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button></form>' +
      '<div class="finn__hand" hidden><label for="finn-email">Your email, so Rohit can reply</label><div><input id="finn-email" type="email" maxlength="120" placeholder="you@business.com" autocomplete="email"><button type="button" class="finn__handsend">Send</button></div></div>' +
      '<footer class="finn__foot"><button type="button" class="finn__handoff">Send this chat to Rohit</button><span>' + (online ? 'AI answers can make mistakes.' : 'Preview: answers come from a short FAQ.') + '</span></footer>' +
    '</section>';
  document.body.appendChild(root);
  var launch = root.querySelector('.finn__launch'), panel = root.querySelector('.finn__panel'), list = root.querySelector('.finn__msgs');
  var chips = root.querySelector('.finn__chips'), form = root.querySelector('.finn__form'), input = root.querySelector('#finn-input');
  var hand = root.querySelector('.finn__hand'), handEmail = root.querySelector('#finn-email'), busy = false;

  function linkify(el, text) {
    // [label](page.html) links to our own pages only; everything else stays plain text
    var re = /\[([^\]]+)\]\(((?:demo-[a-z]+|contact|services|index)\.html)\)|\b((?:demo-[a-z]+|contact|services)\.html)\b|(rohit@wolfinn\.org)/g, last = 0, m;
    while ((m = re.exec(text))) {
      if (m.index > last) el.appendChild(document.createTextNode(text.slice(last, m.index)));
      var a = document.createElement('a');
      if (m[4]) { a.href = 'mailto:' + m[4]; a.textContent = m[4]; }
      else { a.href = m[2] || m[3]; a.textContent = m[1] || m[3]; }
      el.appendChild(a); last = re.lastIndex;
    }
    if (last < text.length) el.appendChild(document.createTextNode(text.slice(last)));
  }
  function bubble(role, text) {
    var d = document.createElement('div'); d.className = 'finn__msg finn__msg--' + (role === 'user' ? 'me' : 'bot');
    if (role === 'user') d.textContent = text; else linkify(d, text);
    list.appendChild(d); list.scrollTop = list.scrollHeight; return d;
  }
  function renderAll() {
    list.innerHTML = ''; bubble('assistant', GREETING);
    state.msgs.forEach(function (m) { bubble(m.role, m.content); });
    chips.innerHTML = '';
    if (!state.msgs.length) CHIPS.forEach(function (c) {
      var b = document.createElement('button'); b.type = 'button'; b.textContent = c;
      b.addEventListener('click', function () { ask(c); }); chips.appendChild(b);
    });
  }
  function setOpen(open) {
    state.open = open; panel.hidden = !open; launch.setAttribute('aria-expanded', open ? 'true' : 'false');
    root.classList.toggle('is-open', open);
    if (open) { renderAll(); setTimeout(function () { input.focus(); }, reduce ? 0 : 120); } else { launch.focus(); }
  }
  launch.addEventListener('click', function () { setOpen(true); });
  root.querySelector('.finn__close').addEventListener('click', function () { setOpen(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && state.open) setOpen(false); });

  function ask(q) {
    q = String(q || '').trim(); if (!q || busy) return;
    chips.innerHTML = ''; state.msgs.push({ role: 'user', content: q }); save(); bubble('user', q);
    var t = document.createElement('div'); t.className = 'finn__msg finn__msg--bot finn__typing'; t.innerHTML = '<i></i><i></i><i></i>'; list.appendChild(t); list.scrollTop = list.scrollHeight;
    busy = true;
    var done = function (text) { t.remove(); state.msgs.push({ role: 'assistant', content: text }); save(); bubble('assistant', text); busy = false; };
    if (!online) { setTimeout(function () { done(faq(q)); }, reduce ? 0 : 550); return; }
    W.post({ action: 'chat', messages: state.msgs.slice(-20) })
      .then(function (r) {
        if (r && r.ok && r.reply) return done(r.reply);
        if (r && r.error === 'busy') return done("I'm getting a lot of questions right now. Try again in a minute, or email rohit@wolfinn.org.");
        done(faq(q));
      })
      .catch(function () { done(faq(q)); });
  }
  form.addEventListener('submit', function (e) { e.preventDefault(); var v = input.value; input.value = ''; ask(v); });

  /* ---- hand the conversation to Rohit ---- */
  function transcript() {
    return state.msgs.map(function (m) { return (m.role === 'user' ? 'Visitor: ' : 'Finn: ') + m.content; }).join('\n\n') || '(No messages yet.)';
  }
  root.querySelector('.finn__handoff').addEventListener('click', function () {
    if (!state.msgs.length) { bubble('assistant', 'Ask me something first, then I can send the whole conversation to Rohit.'); return; }
    hand.hidden = !hand.hidden; if (!hand.hidden) handEmail.focus();
  });
  root.querySelector('.finn__handsend').addEventListener('click', function () {
    var email = handEmail.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { handEmail.setAttribute('aria-invalid', 'true'); handEmail.focus(); return; }
    var text = 'Conversation with Finn on ' + location.pathname.split('/').pop() + ':\n\n' + transcript();
    var finish = function (msg) { hand.hidden = true; bubble('assistant', msg); };
    W.post({ action: 'contact', source: 'Finn chat', email: email, subject: 'A visitor sent their Finn chat', message: text })
      .then(function (r) { if (!r || !r.ok) throw new Error('fail'); finish('Sent. Rohit will reply to ' + email + '.'); if (W.howl) W.howl(); })
      .catch(function () {
        try { navigator.clipboard.writeText('To: rohit@wolfinn.org\n\n' + text).then(function () { finish("Sending isn't switched on yet, so I copied the conversation. Paste it into an email to rohit@wolfinn.org."); }, function () { finish('Please email rohit@wolfinn.org with your question.'); }); }
        catch (e) { finish('Please email rohit@wolfinn.org with your question.'); }
      });
  });
  handEmail.addEventListener('input', function () { handEmail.removeAttribute('aria-invalid'); });
})();
