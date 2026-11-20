/* ============================================================================
   Wolfinn: site behaviour
   ========================================================================== */
(function () {
  'use strict';

  /* ---- the one place to set the contact address ------------------------ */
  var EMAIL = 'rohit@wolfinn.org';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---- email ----------------------------------------------------------- */
  function mailto(subject, body) {
    var q = [];
    if (subject) q.push('subject=' + encodeURIComponent(subject));
    if (body) q.push('body=' + encodeURIComponent(body));
    return 'mailto:' + EMAIL + (q.length ? '?' + q.join('&') : '');
  }
  $$('[data-email]').forEach(function (el) {
    if (el.hasAttribute('data-email-text')) el.textContent = EMAIL;
    if (el.tagName === 'A') el.href = mailto(el.getAttribute('data-subject') || '');
  });
  $$('[data-copy-email]').forEach(function (b) {
    var note = document.getElementById(b.getAttribute('data-copy-email'));
    b.addEventListener('click', function () {
      var ok = function () { if (note) note.textContent = 'Copied: ' + EMAIL; };
      var fail = function () { if (note) note.textContent = EMAIL; };
      try { navigator.clipboard.writeText(EMAIL).then(ok, fail); } catch (e) { fail(); }
    });
  });

  /* ---- bar ------------------------------------------------------------- */
  var bar = $('.bar');
  function onScroll() { if (bar) bar.classList.toggle('is-scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---- menu ------------------------------------------------------------ */
  var menu = $('#menu'), menuBtn = $('.bar__menu');
  function setMenu(open) {
    if (!menu || !menuBtn) return;
    menu.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuBtn.textContent = open ? 'Close' : 'Menu';
    if (open) { var f = $('a', menu); if (f) f.focus(); } else { menuBtn.focus(); }
  }
  if (menuBtn) menuBtn.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu && menu.classList.contains('is-open')) setMenu(false); });

  /* ---- light / dark ---------------------------------------------------- */
  var root = document.documentElement;
  var darkMQ = window.matchMedia('(prefers-color-scheme: dark)');
  function isDark() { var t = root.getAttribute('data-theme'); return t ? t === 'dark' : darkMQ.matches; }
  function syncToggle() {
    var dark = isDark();
    $$('.theme-toggle').forEach(function (b) {
      b.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
      b.setAttribute('aria-pressed', dark ? 'true' : 'false');
    });
    var meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', dark ? '#0C0F13' : '#FFFFFF');
  }
  $$('.theme-toggle').forEach(function (b) {
    b.addEventListener('click', function () {
      var next = isDark() ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('wolfinn-theme', next); } catch (e) {}
      syncToggle();
    });
  });
  if (darkMQ.addEventListener) darkMQ.addEventListener('change', syncToggle);
  syncToggle();

  /* ---- pointer depth on the scenes ------------------------------------- */
  if (fine && !reduce) {
    $$('[data-depth-scene]').forEach(function (scene) {
      var layers = $$('[data-depth]', scene);
      var raf = 0, nx = 0, ny = 0;
      scene.addEventListener('pointermove', function (e) {
        var r = scene.getBoundingClientRect();
        nx = (e.clientX - r.left) / r.width * 2 - 1;
        ny = (e.clientY - r.top) / r.height * 2 - 1;
        if (!raf) raf = requestAnimationFrame(function () {
          raf = 0;
          layers.forEach(function (l) {
            var d = parseFloat(l.getAttribute('data-depth')) || 0;
            l.style.transform = 'translate3d(' + (nx * d).toFixed(1) + 'px,' + (ny * d * 0.25).toFixed(1) + 'px,0)';
          });
        });
      });
      scene.addEventListener('pointerleave', function () { layers.forEach(function (l) { l.style.transform = ''; }); });
    });
  }

  /* ---- ripples on the water -------------------------------------------- */
  if (!reduce) {
    $$('[data-ripple]').forEach(function (w) {
      var last = 0, lx = -999, ly = -999;
      function drop(x, y) {
        var r = document.createElement('span');
        r.className = 'ripple'; r.style.left = x + 'px'; r.style.top = y + 'px';
        w.appendChild(r);
        setTimeout(function () { r.remove(); }, 1700);
      }
      w.addEventListener('pointermove', function (e) {
        if (e.pointerType !== 'mouse') return;
        var now = performance.now(), b = w.getBoundingClientRect();
        var x = e.clientX - b.left, y = e.clientY - b.top;
        if (now - last < 110 || Math.hypot(x - lx, y - ly) < 46) return;
        last = now; lx = x; ly = y; drop(x, y);
      });
      w.addEventListener('pointerdown', function (e) { var b = w.getBoundingClientRect(); drop(e.clientX - b.left, e.clientY - b.top); });
    });
  }

  /* ---- service tiles: tap to flood on touch ---------------------------- */
  $$('.svc').forEach(function (t) {
    t.addEventListener('click', function () {
      var open = t.getAttribute('aria-expanded') === 'true';
      $$('.svc').forEach(function (o) { o.setAttribute('aria-expanded', 'false'); });
      t.setAttribute('aria-expanded', open ? 'false' : 'true');
    });
  });

  /* ---- the gap finder -------------------------------------------------- */
  var gap = $('#gap');
  if (gap) {
    var TASKS = {
      calls: { t: 'Answering calls after hours', s: ['Call comes in', 'AI assistant answers', 'Checks your calendar', 'Books the slot', 'Texts a confirmation'], r: 'Every call answered and booked. <em>Nobody stays late.</em>' },
      invoices: { t: 'Chasing unpaid invoices', s: ['Invoice goes overdue', 'Friendly reminder sent', 'Firmer nudge later', 'Payment link included', 'Marked paid for you'], r: 'Reminders go out on time. <em>You stop being the bad guy.</em>' },
      sheets: { t: 'Copying data between spreadsheets', s: ['New entry anywhere', 'Fields matched', 'Checked for mistakes', 'Synced everywhere', 'Weekly summary'], r: 'One source of truth. <em>No more copy and paste.</em>' },
      booking: { t: 'Booking appointments', s: ['Customer picks a time', 'Your calendar updated', 'Reminder the day before', 'Reschedules handled'], r: 'Customers book themselves. <em>Your calendar fills quietly.</em>' },
      quotes: { t: 'Writing quotes', s: ['Job details captured', 'Prices pulled from your list', 'Draft quote written', 'You approve in one click', 'Sent and followed up'], r: 'Quotes out the same day. <em>You only check and send.</em>' },
      questions: { t: 'Answering the same questions', s: ['Question arrives', 'Answered from your own info', 'Tricky ones sent to you', 'Gaps in your info flagged'], r: 'Common questions answered instantly. <em>You take the interesting ones.</em>' },
      reports: { t: 'Putting together reports', s: ['Numbers pulled from your tools', 'Compared to last week', 'Highlights written up', 'Sent every Monday'], r: 'Your week on one page. <em>Without anyone building it.</em>' },
      social: { t: 'Posting on social media', s: ['Ideas from your week', 'Drafts in your voice', 'You approve', 'Scheduled and posted'], r: 'Present every week. <em>Without the Sunday scramble.</em>' }
    };
    var GUESS = [
      [/call|phone|voicemail|ring/i, 'calls'], [/invoice|payment|paid|owe|bill/i, 'invoices'],
      [/sheet|excel|spreadsheet|copy|data entry|paste|crm|enter/i, 'sheets'], [/book|appointment|schedul|calendar|reserv/i, 'booking'],
      [/quote|estimate|proposal|pricing/i, 'quotes'], [/question|faq|email|inbox|support|enquir|inquir|message/i, 'questions'],
      [/report|numbers|dashboard|kpi|summary/i, 'reports'], [/social|post|instagram|facebook|linkedin|content|marketing/i, 'social']
    ];
    var GENERIC = { s: ['Your task, described', 'Understood by AI', 'Done automatically', 'You approve what matters', 'Summary in your inbox'], r: 'Probably automatable. <em>Let’s find out how.</em>' };

    var card = $('.task', gap), cardTxt = $('.task__txt', gap);
    var nodesEl = $('.nodes', gap), orca = $('.current .orca', gap);
    var lit = $('.current__line .lit', gap), base = $('.current__line .base', gap);
    var result = $('.gap__result', gap), resultP = $('.gap__result p', gap), cta = $('.gap__mail', gap);
    var chips = $$('.chip', gap), form = $('.own', gap), input = $('.own input', gap);
    var timers = [], current = null, ran = false;

    // the current: a gentle wave the orca swims along
    var W = 1000, PTS = 80;
    function yAt(x) { return 30 + 14 * Math.sin((x / W) * Math.PI * 3 - 0.6); }
    var d = '';
    for (var i = 0; i <= PTS; i++) { var x = (i / PTS) * W; d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + yAt(x).toFixed(1); }
    base.setAttribute('d', d); lit.setAttribute('d', d);
    var LEN = lit.getTotalLength();
    lit.style.strokeDasharray = LEN; lit.style.strokeDashoffset = LEN;

    function clear() { timers.forEach(clearTimeout); timers = []; }
    function later(fn, ms) { timers.push(setTimeout(fn, reduce ? 0 : ms)); }

    function build(steps) {
      nodesEl.innerHTML = '';
      steps.forEach(function (s, i) {
        var f = steps.length === 1 ? 0.5 : i / (steps.length - 1);
        var li = document.createElement('li');
        li.className = 'node';
        li.style.left = (f * 100) + '%';
        li.style.setProperty('--y', (30 + yAt(f * W)) + 'px');
        li.innerHTML = '<span class="node__dot"></span><span class="node__txt"></span>';
        li.querySelector('.node__txt').textContent = s;
        nodesEl.appendChild(li);
      });
    }
    function moveOrca(f) {
      if (!orca) return;
      var w = nodesEl.clientWidth, ow = orca.offsetWidth;
      var x = f * w - ow * 0.78, y = yAt(f * W) - 30;
      orca.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
    }

    function run(task) {
      clear();
      current = task;
      result.classList.remove('is-on');
      lit.style.transition = 'none'; lit.style.strokeDashoffset = LEN;
      // rise to the surface, swap, sink
      card.classList.remove('is-sunk');
      later(function () {
        cardTxt.textContent = task.t;
        build(task.s);
        moveOrca(0);
        void card.offsetWidth;
        card.classList.add('is-sunk');
      }, ran ? 520 : 60);
      var start = (ran ? 520 : 60) + 1000;
      var nodes;
      task.s.forEach(function (_, i) {
        later(function () {
          nodes = nodes || $$('.node', nodesEl);
          var f = task.s.length === 1 ? 0.5 : i / (task.s.length - 1);
          if (nodes[i]) nodes[i].classList.add('is-lit');
          lit.style.transition = ''; lit.style.strokeDashoffset = (LEN * (1 - f)).toFixed(1);
          moveOrca(f);
        }, start + i * 520);
      });
      later(function () {
        resultP.innerHTML = task.r;
        result.classList.add('is-on');
        cta.href = mailto('A gap in my business', 'Hi Wolfinn,\n\nThe task I would hand off first: ' + task.t + '.\n\nAbout my business:\n');
      }, start + task.s.length * 520 + 100);
      ran = true;
    }

    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        chips.forEach(function (x) { x.setAttribute('aria-pressed', x === c ? 'true' : 'false'); });
        run(TASKS[c.getAttribute('data-task')]);
      });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = (input.value || '').trim();
      if (!v) { input.focus(); return; }
      chips.forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
      var key = null;
      for (var g = 0; g < GUESS.length; g++) if (GUESS[g][0].test(v)) { key = GUESS[g][1]; break; }
      var base = key ? TASKS[key] : GENERIC;
      run({ t: v.charAt(0).toUpperCase() + v.slice(1), s: base.s, r: base.r });
    });
    window.addEventListener('resize', function () {
      var on = $$('.node.is-lit', nodesEl).length, n = $$('.node', nodesEl).length;
      if (on && n) moveOrca(n === 1 ? 0.5 : (on - 1) / (n - 1));
    });

    // first run when the finder comes into view; fully drawn at once if it can't animate
    var first = TASKS[(chips[0] && chips[0].getAttribute('data-task')) || 'calls'];
    build(first.s); cardTxt.textContent = first.t;
    if ('IntersectionObserver' in window && !reduce) {
      var io = new IntersectionObserver(function (es) {
        if (es.some(function (e) { return e.isIntersecting; })) { io.disconnect(); run(first); }
      }, { threshold: 0.35 });
      io.observe($('.gap__sea', gap));
    } else { run(first); }
  }
})();
