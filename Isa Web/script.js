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

/* ---------- Candado de corazón + PDF ---------- */
// ▼▼▼ AQUÍ VA LA RUTA DE TU PDF ▼▼▼
var PDF_URL = 'secreto.pdf';
var LOCK_CODE = '2609';

var lockModal = document.getElementById('lock-modal');
var openLock = document.getElementById('open-lock');
var closeLock = document.getElementById('lock-close');
var lockStage = document.getElementById('lock-stage');
var wheelsBox = document.getElementById('wheels');
var lockStatus = document.getElementById('lock-status');
var lockDownload = document.getElementById('lock-download');

if (lockModal && openLock && wheelsBox) {
  var digits = [0, 0, 0, 0];
  var wheelEls = [];
  var unlocked = false;
  var checkTimer = null;
  var CHEVRON_UP = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 15l6-6 6 6"/></svg>';
  var CHEVRON_DOWN = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';

  lockDownload.setAttribute('href', PDF_URL);

  function renderDigit(i, dir) {
    var w = wheelEls[i];
    w.digit.textContent = digits[i];
    w.win.setAttribute('aria-valuenow', digits[i]);
    w.digit.classList.remove('roll-up', 'roll-down');
    if (dir) {
      void w.digit.offsetWidth;
      w.digit.classList.add(dir > 0 ? 'roll-up' : 'roll-down');
    }
  }

  function step(i, delta) {
    if (unlocked) return;
    digits[i] = (digits[i] + delta + 10) % 10;
    renderDigit(i, delta);
    if (navigator.vibrate) navigator.vibrate(8);
    clearTimeout(checkTimer);
    checkTimer = setTimeout(checkCode, 350);
  }

  function setDigit(i, value) {
    if (unlocked) return;
    digits[i] = value;
    renderDigit(i, 1);
    clearTimeout(checkTimer);
    checkTimer = setTimeout(checkCode, 350);
  }

  function checkCode() {
    if (unlocked || digits.join('') !== LOCK_CODE) return;
    unlocked = true;
    lockStage.classList.add('is-open');
    wheelEls.forEach(function (w) {
      w.up.disabled = true;
      w.down.disabled = true;
      w.win.setAttribute('tabindex', '-1');
    });
    lockStatus.textContent = '¡Se abrió!';
    lockStatus.className = 'lock-status is-ok';
    if (navigator.vibrate) navigator.vibrate([30, 40, 60]);
    setTimeout(function () {
      lockDownload.hidden = false;
      lockDownload.click();
    }, 1300);
  }

  for (var n = 0; n < 4; n++) {
    (function (i) {
      var wheel = document.createElement('div');
      wheel.className = 'wheel';
      wheel.innerHTML =
        '<button type="button" class="wheel__btn" aria-label="Subir dígito ' + (i + 1) + '">' + CHEVRON_UP + '</button>' +
        '<div class="wheel__window" tabindex="0" role="spinbutton" aria-label="Dígito ' + (i + 1) + '" aria-valuemin="0" aria-valuemax="9" aria-valuenow="0"><span class="wheel__digit">0</span></div>' +
        '<button type="button" class="wheel__btn" aria-label="Bajar dígito ' + (i + 1) + '">' + CHEVRON_DOWN + '</button>';
      wheelsBox.appendChild(wheel);

      var btns = wheel.querySelectorAll('.wheel__btn');
      var w = {
        up: btns[0],
        down: btns[1],
        win: wheel.querySelector('.wheel__window'),
        digit: wheel.querySelector('.wheel__digit')
      };
      wheelEls.push(w);

      w.up.addEventListener('click', function () { step(i, 1); });
      w.down.addEventListener('click', function () { step(i, -1); });

      // Arrastrar con el dedo / ratón: hacia arriba sube, hacia abajo baja
      var lastY = null, acc = 0;
      w.win.addEventListener('pointerdown', function (e) {
        lastY = e.clientY; acc = 0;
        w.win.setPointerCapture(e.pointerId);
      });
      w.win.addEventListener('pointermove', function (e) {
        if (lastY === null) return;
        acc += lastY - e.clientY;
        lastY = e.clientY;
        while (acc >= 22) { step(i, 1); acc -= 22; }
        while (acc <= -22) { step(i, -1); acc += 22; }
      });
      function endDrag() { lastY = null; acc = 0; }
      w.win.addEventListener('pointerup', endDrag);
      w.win.addEventListener('pointercancel', endDrag);

      // Rueda del ratón
      w.win.addEventListener('wheel', function (e) {
        e.preventDefault();
        step(i, e.deltaY < 0 ? 1 : -1);
      }, { passive: false });

      // Teclado
      w.win.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowUp') { e.preventDefault(); step(i, 1); }
        else if (e.key === 'ArrowDown') { e.preventDefault(); step(i, -1); }
        else if (/^[0-9]$/.test(e.key)) { setDigit(i, Number(e.key)); }
        else if (e.key === 'ArrowRight' && wheelEls[i + 1]) { wheelEls[i + 1].win.focus(); }
        else if (e.key === 'ArrowLeft' && wheelEls[i - 1]) { wheelEls[i - 1].win.focus(); }
      });
    })(n);
  }

  openLock.addEventListener('click', function () {
    lockModal.showModal();
    if (unlocked) lockDownload.hidden = false;
  });
  closeLock.addEventListener('click', function () { lockModal.close(); });
  lockModal.addEventListener('click', function (e) { if (e.target === lockModal) lockModal.close(); });
}
    });
  });
  lockForm.addEventListener('submit', function (e) { e.preventDefault(); tryUnlock(); });
}
})();
