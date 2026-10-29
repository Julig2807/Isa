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
var revealEls = document.querySelectorAll('.reveal, .recuerdo');
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

/* ---------- Navegación suave + seguimiento del scroll ---------- */
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

var navLinks = document.querySelectorAll('.site-nav a');
var spyIds = ['inicio', 'universo', 'capitulo', 'final', 'galeria', 'resultados'];
var spyTicking = false;

function updateActiveNav() {
  spyTicking = false;
  var line = window.innerHeight * 0.35;
  var current = spyIds[0];
  spyIds.forEach(function (id) {
    var el = document.getElementById(id);
    if (el && el.getBoundingClientRect().top <= line) current = id;
  });
  var atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
  if (atBottom) current = spyIds[spyIds.length - 1];
  navLinks.forEach(function (l) {
    l.classList.toggle('is-active', l.getAttribute('href') === '#' + current);
  });
}
function requestSpy() {
  if (!spyTicking) { spyTicking = true; requestAnimationFrame(updateActiveNav); }
}
window.addEventListener('scroll', requestSpy, { passive: true });
window.addEventListener('resize', requestSpy);
updateActiveNav();

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
var UNLOCK_AT = new Date('2026-11-11T00:00:00-05:00').getTime(); // hora de Colombia
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

  /* ---------- Candado + PDF ---------- */
// ▼▼▼ AQUÍ VA LA RUTA DE TU PDF (súbelo a esa carpeta o cambia la ruta) ▼▼▼
var PDF_URL = 'assets/secreto.pdf';
var LOCK_CODE = '2609';

var lockModal = document.getElementById('lock-modal');
var openLock = document.getElementById('open-lock');
var closeLock = document.getElementById('lock-close');
var lockSvg = document.getElementById('lock');
var lockForm = document.getElementById('lock-form');
var lockStatus = document.getElementById('lock-status');
var lockDownload = document.getElementById('lock-download');
var pinInputs = Array.prototype.slice.call(document.querySelectorAll('#pin input'));
var unlocked = false;

if (lockModal && openLock) {
  lockDownload.setAttribute('href', PDF_URL);

  function setStatus(msg, cls) {
    lockStatus.textContent = msg;
    lockStatus.className = 'lock-status' + (cls ? ' ' + cls : '');
  }
  function resetPin() {
    pinInputs.forEach(function (i) { i.value = ''; });
    pinInputs[0].focus();
  }
  function tryUnlock() {
    if (unlocked) return;
    var code = pinInputs.map(function (i) { return i.value; }).join('');
    if (code.length < 4) { setStatus('Faltan dígitos', 'is-error'); return; }
    if (code === LOCK_CODE) {
      unlocked = true;
      lockSvg.classList.add('is-open');
      pinInputs.forEach(function (i) { i.disabled = true; });
      document.getElementById('lock-submit').hidden = true;
      setStatus('Desbloqueado', 'is-ok');
      setTimeout(function () {
        lockDownload.hidden = false;
        lockDownload.click();
      }, 1100);
    } else {
      setStatus('Clave incorrecta', 'is-error');
      lockSvg.classList.remove('is-error');
      void lockSvg.getBoundingClientRect();
      lockSvg.classList.add('is-error');
      resetPin();
    }
  }

  openLock.addEventListener('click', function () {
    lockModal.showModal();
    if (!unlocked) { setStatus('Escribe la clave'); pinInputs[0].focus(); }
  });
  closeLock.addEventListener('click', function () { lockModal.close(); });
  lockModal.addEventListener('click', function (e) { if (e.target === lockModal) lockModal.close(); });

  pinInputs.forEach(function (input, idx) {
    input.addEventListener('input', function () {
      input.value = input.value.replace(/\D/g, '').slice(-1);
      if (input.value && idx < pinInputs.length - 1) pinInputs[idx + 1].focus();
      if (pinInputs.every(function (i) { return i.value; })) tryUnlock();
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Backspace' && !input.value && idx > 0) pinInputs[idx - 1].focus();
    });
    input.addEventListener('paste', function (e) {
      var text = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '').slice(0, 4);
      if (!text) return;
      e.preventDefault();
      text.split('').forEach(function (d, i) { pinInputs[i].value = d; });
      if (text.length === 4) tryUnlock(); else pinInputs[text.length].focus();
    });
  });
  lockForm.addEventListener('submit', function (e) { e.preventDefault(); tryUnlock(); });
}
})();
