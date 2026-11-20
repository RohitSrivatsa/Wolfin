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
      var ok = function () { if (note) note.textContent = 'Copied: ' + EMAIL; if (typeof howl === 'function') howl(); };
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
  // Light by default. The visitor's choice is saved and applied on every page
  // (the inline script in each page's <head> sets it before anything paints).
  // The site uses its own attribute, data-wf-theme, so a host page or browser
  // extension that sets data-theme can never flip the colours on its own.
  // The choice is kept in localStorage, and mirrored in window.name so it
  // still follows the visitor from page to page where storage is blocked.
  var root = document.documentElement, THEME_KEY = 'wolfinn-theme';
  function stored() {
    var t = null;
    try { t = localStorage.getItem(THEME_KEY); } catch (e) {}
    if (!t) { var m = /wolfinn-theme:(dark|light)/.exec(window.name || ''); if (m) t = m[1]; }
    return t === 'dark' ? 'dark' : 'light';
  }
  function remember(t) {
    try { localStorage.setItem(THEME_KEY, t); } catch (e) {}
    try { window.name = (window.name || '').replace(/\s*wolfinn-theme:(dark|light)/, '') + ' wolfinn-theme:' + t; } catch (e) {}
  }
  function isDark() { return root.getAttribute('data-wf-theme') === 'dark'; }
  function syncSwitch() {
    var dark = isDark();
    $$('.theme-switch').forEach(function (b) { b.setAttribute('aria-checked', dark ? 'true' : 'false'); });
    var meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', dark ? '#0C0F13' : '#FFFFFF');
  }
  function setTheme(t) {
    root.setAttribute('data-wf-theme', t);
    remember(t);
    syncSwitch();
  }
  $$('.theme-switch').forEach(function (b) {
    b.addEventListener('click', function () { setTheme(isDark() ? 'light' : 'dark'); });
    // swipe the knob across on touch screens
    var x0 = null;
    b.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    b.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 12) { e.preventDefault(); setTheme(dx > 0 ? 'dark' : 'light'); }
    });
  });
  // another tab changed the theme: follow it
  window.addEventListener('storage', function (e) { if (e.key === THEME_KEY && e.newValue) { root.setAttribute('data-wf-theme', e.newValue); syncSwitch(); } });
  // coming back with the browser's back button: re-apply the saved choice
  window.addEventListener('pageshow', function () { root.setAttribute('data-wf-theme', stored()); syncSwitch(); });
  root.setAttribute('data-wf-theme', stored());
  syncSwitch();

  /* ---- the wolf: inline it so the head can lift into a howl ------------ */
  var wolfImgs = $$('img.wolf');
  function howl() {
    if (reduce) return;
    $$('svg.wolf').forEach(function (w) {
      w.classList.remove('is-howling'); void w.getBoundingClientRect(); w.classList.add('is-howling');
      setTimeout(function () { w.classList.remove('is-howling'); }, 1800);
    });
  }
  if (wolfImgs.length && window.fetch) {
    fetch(wolfImgs[0].getAttribute('src')).then(function (r) { return r.ok ? r.text() : Promise.reject(); }).then(function (txt) {
      var inner = txt.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
      var sprite = document.createElement('div');
      sprite.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>' +
        '<symbol id="wolf-shape" viewBox="0 0 722 491">' + inner + '</symbol>' +
        '<clipPath id="wolf-clip-body"><path d="M0 0H372V90H722V491H0Z"/></clipPath>' +
        '<clipPath id="wolf-clip-head"><path d="M360 -40H620V116H360Z"/></clipPath>' +
        '</defs></svg>';
      document.body.insertBefore(sprite.firstChild, document.body.firstChild);
      wolfImgs.forEach(function (img) {
        var ns = 'http://www.w3.org/2000/svg';
        var svg = document.createElementNS(ns, 'svg');
        svg.setAttribute('viewBox', '0 0 722 491');
        svg.setAttribute('class', img.getAttribute('class'));
        if (img.hasAttribute('data-depth')) svg.setAttribute('data-depth', img.getAttribute('data-depth'));
        var alt = img.getAttribute('alt');
        if (alt) { svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', alt); } else { svg.setAttribute('aria-hidden', 'true'); }
        svg.innerHTML = '<g clip-path="url(#wolf-clip-body)"><use href="#wolf-shape" width="722" height="491"/></g>' +
          '<g class="wolf-head" clip-path="url(#wolf-clip-head)"><use href="#wolf-shape" width="722" height="491"/></g>';
        img.replaceWith(svg);
      });
      document.dispatchEvent(new Event('wolfinn:wolf'));
    }).catch(function () {});
  }

  /* ---- pointer depth on the scenes ------------------------------------- */
  if (fine && !reduce) {
    $$('[data-depth-scene]').forEach(function (scene) {
      // looked up each time: the wolf image is swapped for an inline SVG after load
      var layers = function () { return $$('[data-depth]', scene); };
      var raf = 0, nx = 0, ny = 0;
      scene.addEventListener('pointermove', function (e) {
        var r = scene.getBoundingClientRect();
        nx = (e.clientX - r.left) / r.width * 2 - 1;
        ny = (e.clientY - r.top) / r.height * 2 - 1;
        if (!raf) raf = requestAnimationFrame(function () {
          raf = 0;
          layers().forEach(function (l) {
            var d = parseFloat(l.getAttribute('data-depth')) || 0;
            l.style.transform = 'translate3d(' + (nx * d).toFixed(1) + 'px,' + (ny * d * 0.25).toFixed(1) + 'px,0)';
          });
        });
      });
      scene.addEventListener('pointerleave', function () { layers().forEach(function (l) { l.style.transform = ''; }); });
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

  /* ---- shared with page scripts (the contact composer) ----------------- */
  window.Wolfinn = { email: EMAIL, mailto: mailto, howl: howl };

})();
