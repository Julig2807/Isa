(function () {
  'use strict';

  document.documentElement.classList.add('js');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Fondo de estrellas (canvas, sin servicios externos) ---------- */ 
  var canvas = document.getElementById('starfield'); 
  var ctx = canvas.getContext('2d');
  var stars = [];
  var w = 0, h = 0, dpr = 1;
  var rafId = null;
  var lastFrame = 0;

  /* ---------- Var de los botones ---------- */
  
var openBtn = document.getElementById('open-results');
var closeBtn = document.getElementById('close-results');
var modal = document.getElementById('results-modal');
var frame = document.getElementById('results-frame');
if (openBtn && modal && frame) {
  openBtn.addEventListener('click', function () {
    if (!frame.src) frame.src = 'https://resultados.udea.edu.co/';
    modal.showModal();
  });
  closeBtn.addEventListener('click', function () { modal.close(); });
}

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    createStars();
    draw(performance.now());
  }

  function createStars() {
    var count = Math.min(Math.round((w * h) / 4500), 280);
    stars = [];
    for (var i = 0; i < count; i++) {
      var depth = Math.random();
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.3 + depth * 1.2,
        base: 0.2 + depth * 0.6,
        speed: 0.0004 + Math.random() * 0.0012,
        phase: Math.random() * Math.PI * 2,
        twinkle: Math.random() < 0.25,
        silver: Math.random() < 0.15
      });
    }
  }

  function draw(t) {
    ctx.clearRect(0, 0, w, h);
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var a = s.base;
      if (s.twinkle && !reduceMotion) {
        a = s.base * (0.55 + 0.45 * Math.sin(t * s.speed + s.phase));
      }
      ctx.globalAlpha = Math.max(0.05, Math.min(1, a));
      ctx.fillStyle = s.silver ? '#c4c9d6' : '#ffffff';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function loop(t) {
    if (t - lastFrame > 66) { // ~15 fps, suficiente para destellos suaves
      draw(t);
      lastFrame = t;
    }
    rafId = requestAnimationFrame(loop);
  }

  function start() {
    if (reduceMotion || rafId) return;
    rafId = requestAnimationFrame(loop);
  }
  function stop() {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  }

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 200);
  });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop(); else start();
  });

  resize();
  requestAnimationFrame(function () {
    document.body.classList.remove('is-loading');
    document.body.classList.add('is-ready');
  });
  start();

  /* Destello ocasional: una estrella aleatoria brilla brevemente */
  function flare() {
    if (reduceMotion || document.hidden || !stars.length) return;
    var s = stars[Math.floor(Math.random() * stars.length)];
    var origR = s.r, origBase = s.base;
    s.r = origR * 2.2;
    s.base = Math.min(1, origBase + 0.4);
    setTimeout(function () { s.r = origR; s.base = origBase; }, 900);
  }
  if (!reduceMotion) {
    (function schedule() {
      setTimeout(function () { flare(); schedule(); }, 3500 + Math.random() * 5000);
    })();
  }

  /* ---------- Aparición al hacer scroll ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -5% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Navegación suave ---------- */
  function goTo(selector) {
    var target = document.querySelector(selector);
    if (!target) return;
    target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    if (history.replaceState) history.replaceState(null, '', selector);
  }

  document.querySelectorAll('[data-scroll-to]').forEach(function (btn) {
    btn.addEventListener('click', function () { goTo(btn.getAttribute('data-scroll-to')); });
  });
  document.querySelectorAll('.site-nav a').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      goTo(link.getAttribute('href'));
    });
  });

  /* Enlace activo en la navegación */
  var navLinks = document.querySelectorAll('.site-nav a');
  if ('IntersectionObserver' in window) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          navLinks.forEach(function (l) {
            l.classList.toggle('is-active', l.getAttribute('href') === '#' + entry.target.id);
          });
        }
      });
    }, { threshold: 0.5 });
    ['portada', 'universo', 'capitulo', 'final', 'resultados'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) sectionObserver.observe(el);
    });
  }

  /* ---------- Mensaje final ---------- */
  var revealBtn = document.getElementById('reveal-btn');
  var message = document.getElementById('final-message');
  if (revealBtn && message) {
    revealBtn.addEventListener('click', function () {
      message.classList.add('is-open');
      revealBtn.setAttribute('aria-expanded', 'true');
      revealBtn.classList.add('is-hidden');
      setTimeout(function () {
        message.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      }, 300);
    });
  }


  
  /* ---------- SVG: marcador si el archivo no se encuentra ---------- */
  var art = document.querySelector('.isa-artwork');
  var img = art && art.querySelector('.isa-artwork__img');
  var ph = art && art.querySelector('.isa-artwork__placeholder');
  if (img && ph) {
    img.addEventListener('error', function () {
      art.classList.add('is-missing');
      ph.hidden = false;
    });
  }

  /* ---------- Temporizador: desbloqueo de Resultados ---------- */
var UNLOCK_AT = new Date('2026-10-27T15:43:00-05:00').getTime(); // hora de Colombia
var cd = document.getElementById('countdown');
var bloque = document.getElementById('bloque-resultados');

function pad(n) { return String(n).padStart(2, '0'); }

function tickCountdown() {
  var diff = UNLOCK_AT - Date.now();
  if (diff <= 0) {
    if (bloque) bloque.hidden = false;
    if (cd) cd.hidden = true;
    return true;
  }
  var s = Math.floor(diff / 1000);
  document.getElementById('cd-d').textContent = pad(Math.floor(s / 86400));
  document.getElementById('cd-h').textContent = pad(Math.floor((s % 86400) / 3600));
  document.getElementById('cd-m').textContent = pad(Math.floor((s % 3600) / 60));
  document.getElementById('cd-s').textContent = pad(s % 60);
  return false;
}

if (cd && bloque) {
  if (!tickCountdown()) {
    var cdTimer = setInterval(function () {
      if (tickCountdown()) clearInterval(cdTimer);
    }, 1000);
  }
}

  /* ---------- Menú hamburguesa (solo móvil) ---------- */
var navToggle = document.getElementById('nav-toggle');
var navMenu = document.getElementById('nav-menu');

if (navToggle && navMenu) {
  navToggle.addEventListener('click', function () {
    var open = navMenu.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    navToggle.setAttribute('aria-label', open ? 'Cerrar menú de navegación' : 'Abrir menú de navegación');
  });

  // Cerrar el menú al tocar un enlace
  navMenu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      navMenu.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}
})();
