/* =====================================================================
   SAGE GARDEN NIKAH — behaviour
   - config binding        - ambient particles / petals (CSS-driven)
   - countdown             - navigation
   - GSAP envelope opening - ScrollTrigger reveals + light parallax
   Everything degrades gracefully: reduced-motion or no-GSAP = static, readable page.
   ===================================================================== */
(function () {
  'use strict';

  var CFG = window.WEDDING_CONFIG || {};
  var doc = document;
  var G = window.gsap, ST = window.ScrollTrigger;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canAnimate = !!G && !reduce;
  if (G && ST) G.registerPlugin(ST);

  function $(s, c) { return (c || doc).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); }
  function rand(a, b) { return a + Math.random() * (b - a); }
  function get(path) {
    return path.split('.').reduce(function (o, k) { return o == null ? undefined : o[k]; }, CFG);
  }
  // "27th December" -> "27<sup>th</sup> December" (input is escaped first)
  function withSup(t) {
    return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/(\d+)(st|nd|rd|th)\b/g, '$1<sup>$2</sup>');
  }

  /* ---------- 1. Fill the page from config.js ---------- */
  function bindConfig() {
    $$('[data-bind]').forEach(function (el) {
      var v = get(el.getAttribute('data-bind'));
      if (v != null && v !== '') el.textContent = v;
    });
    $$('[data-bind-date]').forEach(function (el) {
      var v = get(el.getAttribute('data-bind-date'));
      if (v) el.innerHTML = withSup(v);
    });
    $$('[data-href]').forEach(function (a) {
      var v = get(a.getAttribute('data-href'));
      if (v) a.setAttribute('href', v);
    });
    $$('[data-social]').forEach(function (a) {
      var v = (CFG.social || {})[a.getAttribute('data-social')];
      var li = a.closest('li');
      if (!v) { if (li) li.hidden = true; return; }
      a.setAttribute('href', v);
      if (v === '#') {
        a.removeAttribute('target');
        a.addEventListener('click', function (e) { e.preventDefault(); });
      }
    });
    if (CFG.bride && CFG.groom) {
      doc.title = CFG.bride + ' & ' + CFG.groom + ' — Nikah Invitation';
      var h1 = $('.names');
      if (h1) h1.setAttribute('aria-label', CFG.bride + ' and ' + CFG.groom);
    }
  }

  /* ---------- 2. Ambient layers (pure CSS animation, a handful of nodes) ---------- */
  function makeAmbient() {
    $$('[data-particles]').forEach(function (w) {
      var n = parseInt(w.getAttribute('data-particles'), 10) || 8;
      var frag = doc.createDocumentFragment();
      for (var i = 0; i < n; i++) {
        var p = doc.createElement('i');
        p.className = 'gp';
        p.style.cssText = '--x:' + rand(4, 96).toFixed(1) + '%;--y:' + rand(10, 90).toFixed(1) + '%;--s:' +
          rand(4, 9).toFixed(1) + 'px;--d:' + rand(8, 14).toFixed(1) + 's;--dl:-' + rand(0, 12).toFixed(1) +
          's;--dx:' + rand(-30, 30).toFixed(0) + 'px';
        frag.appendChild(p);
      }
      w.appendChild(frag);
    });
    $$('[data-petals]').forEach(function (w) {
      var n = parseInt(w.getAttribute('data-petals'), 10) || 6;
      var frag = doc.createDocumentFragment();
      for (var i = 0; i < n; i++) {
        var im = new Image(66, 166);
        im.src = 'assets/img/petal.webp'; im.alt = ''; im.decoding = 'async';
        im.className = 'petal';
        im.style.cssText = '--x:' + rand(4, 94).toFixed(1) + '%;--w:' + rand(9, 17).toFixed(1) + 'px;--d:' +
          rand(13, 22).toFixed(1) + 's;--dl:-' + rand(0, 20).toFixed(1) + 's;--dx:' + rand(-90, 90).toFixed(0) +
          'px;--r0:' + rand(0, 360).toFixed(0) + 'deg';
        frag.appendChild(im);
      }
      w.appendChild(frag);
    });
  }

  /* ---------- 3. Countdown ---------- */
  var countdown = (function () {
    var target = new Date(CFG.countdownTo).getTime();
    var els = { d: $('#cdD'), h: $('#cdH'), m: $('#cdM'), s: $('#cdS') };
    var done = $('#cdDone');
    var shown = {}, busy = false, visible = false, timer = null;

    function pad(n) { return n < 10 ? '0' + n : '' + n; }
    function calc() {
      var diff = Math.max(0, target - Date.now());
      var s = Math.floor(diff / 1000);
      return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60, over: diff <= 0 };
    }
    function write(v) {
      ['d', 'h', 'm', 's'].forEach(function (k) {
        var t = pad(v[k]);
        if (shown[k] === t) return;
        shown[k] = t;
        els[k].textContent = t;
        if (k === 's' && canAnimate && visible && !busy) {
          G.fromTo(els.s, { y: 5, opacity: .35 }, { y: 0, opacity: 1, duration: .5, ease: 'power2.out', overwrite: true });
        }
      });
      if (done) done.hidden = !v.over;
    }
    function tick() {
      if (!doc.hidden && !busy) write(calc());
      timer = setTimeout(tick, 1000 - (Date.now() % 1000) + 15);   // stay aligned to real seconds
    }
    function init() {
      if (!els.d || isNaN(target)) return;
      write(calc());
      tick();
    }
    // numbers roll up from 0 the first time the section is seen
    function intro() {
      visible = true;
      if (!canAnimate || isNaN(target)) return;
      var v = calc(), o = { d: 0, h: 0, m: 0, s: 0 };
      busy = true;
      G.to(o, {
        d: v.d, h: v.h, m: v.m, s: v.s, duration: 1.8, ease: 'power2.out',
        onUpdate: function () {
          ['d', 'h', 'm', 's'].forEach(function (k) { els[k].textContent = pad(Math.round(o[k])); });
        },
        onComplete: function () { busy = false; shown = {}; write(calc()); }
      });
    }
    return { init: init, intro: intro, setVisible: function (b) { visible = b; } };
  })();

  /* ---------- 4. Navigation ---------- */
  function initNav() {
    var burger = $('#burger'), drawer = $('#drawer');
    function setMenu(open) {
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      drawer.classList.toggle('is-open', open);
      drawer.setAttribute('aria-hidden', String(!open));
    }
    burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
    doc.addEventListener('click', function (e) {
      if (!e.target.closest('#drawer') && !e.target.closest('#burger')) setMenu(false);
    });

    // smooth in-page links (also closes the drawer)
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (id.length < 2) return;
        var t = $(id);
        if (!t) return;
        e.preventDefault();
        setMenu(false);
        t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
        if (history.replaceState) history.replaceState(null, '', id);
      });
    });

    // highlight the section crossing the middle of the viewport
    if ('IntersectionObserver' in window) {
      var links = $$('[data-link]');
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          links.forEach(function (l) { l.classList.toggle('is-active', l.getAttribute('data-link') === en.target.id); });
        });
      }, { rootMargin: '-45% 0px -54% 0px' });
      $$('main .sec').forEach(function (s) { io.observe(s); });
    }
  }

  /* ---------- 5. Pause ambient CSS loops for off-screen sections ---------- */
  function watchViewport() {
    if (!('IntersectionObserver' in window)) { $$('.sec, .intro').forEach(function (s) { s.classList.add('in-view'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { en.target.classList.toggle('in-view', en.isIntersecting); });
    }, { rootMargin: '60px 0px' });
    $$('.sec, .intro').forEach(function (s) { io.observe(s); });
  }

  /* ---------- 6. Hero entrance (runs when the invitation has opened) ---------- */
  function showEverything() {
    $$('[data-h],[data-reveal]').forEach(function (el) { el.style.opacity = 1; el.style.visibility = 'visible'; });
  }

  var mobile = window.matchMedia('(max-width: 859px)').matches;

  function heroReveal() {
    var arch = $('#heroArch');
    var hang = $$('#home .lan--hang[data-h]');
    var texts = $$('#home [data-h="t"]');
    var names = $('#home .names');
    var nameParts = names ? $$('.script', names) : [];
    var photo = $('#home [data-h="photo"]');
    var top = texts.slice(0, 3), rest = texts.slice(3);

    G.set([].concat(hang, texts, photo ? [photo] : []), { autoAlpha: 0 });
    if (names) G.set(names, { autoAlpha: 1 });
    G.set(nameParts, { autoAlpha: 0 });

    var tl = G.timeline({ defaults: { ease: 'power3.out' } });
    if (arch) tl.fromTo(arch, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 1.1, ease: 'power2.out', clearProps: 'transform' }, 0);
    tl.fromTo(hang, { autoAlpha: 0, y: -90 }, { autoAlpha: 1, y: 0, duration: 1.1, stagger: .15 }, .3)
      .fromTo(top, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: .8, stagger: .12 }, .45)
      .fromTo(nameParts, { autoAlpha: 0, y: 16, scale: .97 }, { autoAlpha: 1, y: 0, scale: 1, duration: 1, stagger: .2, clearProps: 'transform' }, .9);
    if (photo) tl.fromTo(photo, { autoAlpha: 0, y: 36, scale: .94 }, { autoAlpha: 1, y: 0, scale: 1, duration: 1.2, ease: 'power2.out', clearProps: 'transform' }, 1.4);
    tl.fromTo(rest, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: .8, stagger: .14 }, 1.9);
    return tl;
  }

  /* ---------- 7. Scroll-driven reveals (light) ---------- */
  function initScroll() {
    if (!canAnimate || !ST) { showEverything(); return; }

    ST.batch('[data-reveal]', {
      start: 'top 92%', once: true,
      onEnter: function (batch) {
        G.fromTo(batch, { autoAlpha: 0, y: 24 },
          { autoAlpha: 1, y: 0, duration: .9, ease: 'power3.out', stagger: .1, overwrite: true, clearProps: 'transform' });
      }
    });

    // venue cards slide in from alternating sides
    $$('.ev').forEach(function (el, i) {
      G.fromTo(el, { autoAlpha: 0, x: i % 2 ? 36 : -36 },
        { autoAlpha: 1, x: 0, duration: 1, ease: 'power3.out', clearProps: 'transform',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
    });
    // family columns
    var cols = $$('.fam__col');
    if (cols.length) G.fromTo(cols, { autoAlpha: 0, y: 26 },
      { autoAlpha: 1, y: 0, duration: .9, stagger: .18, ease: 'power3.out', clearProps: 'transform',
        scrollTrigger: { trigger: '.fam', start: 'top 88%', once: true } });
    // thank-you
    var cres = $('.crescent');
    if (cres) G.fromTo(cres, { autoAlpha: 0, scale: .8 }, { autoAlpha: 1, scale: 1, duration: 1, ease: 'back.out(1.6)', clearProps: 'transform',
      scrollTrigger: { trigger: '#thanks', start: 'top 70%', once: true } });

    ST.create({ trigger: '#cd', start: 'top 88%', once: true, onEnter: countdown.intro });

    // parallax only on desktop (keeps phones smooth)
    if (!mobile) {
      var par = function (sel, vars, trig) {
        var el = $(sel);
        if (!el) return;
        G.to(el, Object.assign({ ease: 'none', immediateRender: false,
          scrollTrigger: { trigger: trig, start: 'top top', end: 'bottom top', scrub: .6 } }, vars));
      };
      par('#home .fl-top-l', { yPercent: -7 }, '#home');
      par('#home .fl-top-r', { yPercent: -7 }, '#home');
    }
  }

  /* ---------- 8. Envelope opening ---------- */
  function unlock() { doc.body.classList.remove('is-locked'); }

  function startSite() {
    unlock();
    $('#nav').classList.add('is-on');
    countdown.setVisible(false);
    if (canAnimate) heroReveal(); else showEverything();
    initScroll();
    if (ST) {
      ST.refresh();
      if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(function () { ST.refresh(); });
    }
  }

  function initIntro() {
    var intro = $('#intro'), env = $('#env');
    if (!intro || !env) { startSite(); return; }
    var opened = false;

    if (canAnimate) {
      G.from('#introStage > *', { autoAlpha: 0, y: 16, duration: 1.1, stagger: .12, ease: 'power2.out', delay: .1 });
      G.from('#intro .fl, #intro .lan', { autoAlpha: 0, duration: 1.6, stagger: .1, ease: 'power1.out' });
    }

    function finishIntro() {
      intro.style.display = 'none';
      intro.setAttribute('aria-hidden', 'true');
    }

    function open() {
      if (opened) return;
      opened = true;
      env.setAttribute('aria-disabled', 'true');
      env.style.animation = 'none';
      

      if (!canAnimate) {                       // reduced-motion: a calm cross-fade
        intro.style.transition = 'opacity .45s ease';
        intro.style.opacity = 0;
        setTimeout(function () { finishIntro(); startSite(); }, 480);
        return;
      }

      var flap = $('#flap'), card = $('#card'), tilt = $('#envTilt'), bow = $('#bow'), seal = $('#seal');
      var fadeOut = $$('#introStage > *').filter(function (n) { return n !== env; });
      G.set(card, { transformOrigin: '50% 50%' });

      var tl = G.timeline({ defaults: { ease: 'power2.inOut' } });
      tl.to('#tap', { autoAlpha: 0, y: 10, duration: .4 }, 0)
        // wax seal: press, then crack away
        .to(seal, { scale: 1.14, duration: .32, ease: 'power1.out', transformOrigin: '50% 50%' }, 0)
        .to(seal, { scale: .92, duration: .22, ease: 'power1.in' })
        .to(seal, { autoAlpha: 0, y: 30, rotation: 14, scale: .7, duration: .6, ease: 'power2.in' })
        // ribbon: untie, then slide apart
        .to(bow, { scale: 1.08, duration: .3, ease: 'power1.out', transformOrigin: '50% 50%' }, .5)
        .to(bow, { scale: .15, rotation: -16, autoAlpha: 0, duration: .65, ease: 'power2.in' }, .82)
        .to('#strip', { scaleY: 0, duration: 1, ease: 'power3.inOut' }, 1.0)
        // envelope straightens, flap opens
        .to(tilt, { rotation: 0, duration: .9 }, 1.35)
        .to(flap, { rotationX: -180, duration: 1.2 }, 1.8)
        .set(flap, { zIndex: 1 }, 2.4)
        // invitation rises
        .to(card, { yPercent: -58, duration: 1.15, ease: 'power3.out' }, 2.4)
        .set(card, { zIndex: 9 }, 3.4)
        .to(fadeOut, { autoAlpha: 0, duration: .8, ease: 'power1.out' }, 3.2)
        .to(card, { scale: 4.8, duration: 1.15, ease: 'power3.in' }, 3.9)
        .to('#flash', { opacity: 1, duration: .6, ease: 'power1.in' }, 4.4)
        // hand over to the main page
        .add(function () { startSite(); }, 5.05)
        .to(intro, { autoAlpha: 0, duration: 1.1, ease: 'power1.out', onComplete: finishIntro }, 5.1);
    }

    intro.addEventListener('click', open);
  }

  /* ---------- boot ---------- */
  bindConfig();
  makeAmbient();
  countdown.init();
  initNav();
  watchViewport();
  initIntro();
})();
