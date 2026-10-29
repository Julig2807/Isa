(function () {
  'use strict';

  document.documentElement.classList.add('js');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Fondo de estrellas (canvas, sin servicios externos) ---------- */
  var canvas = document.getElementById('starfield');
  var ctx = canvas ? canvas.getContext('2d') : null;
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
    if (!canvas || !ctx) return;
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
    if (!canvas || !ctx) return;
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
    if (reduceMotion || rafId || !canvas) return;
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
    var dd = document.getElementById('cd-d');
    var hh = document.getElementById('cd-h');
    var mm = document.getElementById('cd-m');
    var ss = document.getElementById('cd-s');
    if (dd) dd.textContent = pad(Math.floor(s / 86400));
    if (hh) hh.textContent = pad(Math.floor((s % 86400) / 3600));
    if (mm) mm.textContent = pad(Math.floor((s % 3600) / 60));
    if (ss) ss.textContent = pad(s % 60);
    return false;
  }

  if (cd && bloque) {
    if (!tickCountdown()) {
      var cdTimer = setInterval(function () {
        if (tickCountdown()) clearInterval(cdTimer);
      }, 1000);
    }
  }

/* ---------- Candado de corazón + PDF ---------- */
(function () {
  // Coloca este archivo junto a index.html,
  // o cambia esta ruta por la ubicación de tu PDF.
  var PDF_URL = 'secreto.pdf';
  var LOCK_CODE = '2609';

  var modal = document.getElementById('lock-modal');
  var openButton = document.getElementById('open-lock');
  var closeButton = document.getElementById('lock-close');
  var stage = document.getElementById('lock-stage');
  var form = document.getElementById('heart-lock-form');
  var status = document.getElementById('lock-status');
  var downloadButton = document.getElementById('heart-download-button');
  var downloadLink = document.getElementById('lock-download');

  var inputs = Array.prototype.slice.call(
    document.querySelectorAll('#heart-code input')
  );

  if (
    !modal || !openButton || !closeButton ||
    !stage || !form || !status ||
    !downloadButton || !downloadLink || inputs.length !== 4
  ) {
    return;
  }

  var unlocked = false;
  var busy = false;
  var downloadTimer = null;

  downloadLink.href = PDF_URL;

  function showStatus(message, state) {
    status.textContent = message;
    status.className = 'lock-status' + (state ? ' ' + state : '');
  }

  function clearErrors() {
    inputs.forEach(function (input) {
      input.removeAttribute('aria-invalid');
    });
  }

  function downloadPDF() {
    downloadLink.click();
  }

  inputs.forEach(function (input, index) {
    input.addEventListener('focus', function () {
      input.select();
    });

    input.addEventListener('input', function () {
      input.value = input.value.replace(/\D/g, '').slice(-1);
      clearErrors();

      showStatus('Escribe la clave para descubrir el secreto.');

      if (input.value && index < inputs.length - 1) {
        inputs[index + 1].focus();
      }
    });

    input.addEventListener('keydown', function (event) {
      if (event.key === 'Backspace' && !input.value && index > 0) {
        event.preventDefault();
        inputs[index - 1].focus();
      }

      if (event.key === 'ArrowLeft' && index > 0) {
        event.preventDefault();
        inputs[index - 1].focus();
      }

      if (event.key === 'ArrowRight' && index < inputs.length - 1) {
        event.preventDefault();
        inputs[index + 1].focus();
      }
    });

    input.addEventListener('paste', function (event) {
      var clipboard = event.clipboardData;
      if (!clipboard) return;

      var value = clipboard.getData('text')
        .replace(/\D/g, '')
        .slice(0, 4);

      if (!value) return;

      event.preventDefault();
      clearErrors();

      inputs.forEach(function (field, position) {
        field.value = value[position] || '';
      });

      inputs[Math.min(value.length, 3)].focus();
      showStatus('Pulsa Descargar PDF para abrir el candado.');
    });
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    if (busy) return;

    if (unlocked) {
      downloadPDF();
      return;
    }

    var code = inputs.map(function (input) {
      return input.value;
    }).join('');

    if (code.length !== 4) {
      showStatus('Completa los cuatro números.', 'is-error');

      var empty = inputs.find(function (input) {
        return !input.value;
      });

      if (empty) empty.focus();
      return;
    }

    if (code !== LOCK_CODE) {
      inputs.forEach(function (input) {
        input.setAttribute('aria-invalid', 'true');
      });

      showStatus(
        'Esa no es la clave. Piensa en nuestra primera conversación.',
        'is-error'
      );

      inputs[0].focus();
      return;
    }

    unlocked = true;
    busy = true;

    clearErrors();
    stage.classList.add('is-open');

    inputs.forEach(function (input) {
      input.readOnly = true;
    });

    downloadButton.disabled = true;
    downloadButton.textContent = 'Abriendo…';

    showStatus('La clave era ese día. Secreto desbloqueado.', 'is-ok');

    var delay = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches ? 0 : 950;

    downloadTimer = window.setTimeout(function () {
      busy = false;
      downloadTimer = null;

      downloadButton.disabled = false;
      downloadButton.textContent = 'Descargar PDF';

      downloadPDF();
    }, delay);
  });

  openButton.addEventListener('click', function () {
    if (!modal.open) modal.showModal();
  });

  closeButton.addEventListener('click', function () {
    modal.close();
  });

  // Cierra solo al pulsar fuera del rectángulo del modal.
  modal.addEventListener('click', function (event) {
    if (event.target !== modal) return;

    var rect = modal.getBoundingClientRect();

    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    ) {
      modal.close();
    }
  });

  // Si se cierra durante la animación, evita descargar en segundo plano.
  modal.addEventListener('close', function () {
    if (downloadTimer !== null) {
      window.clearTimeout(downloadTimer);
      downloadTimer = null;
      busy = false;

      downloadButton.disabled = false;
      downloadButton.textContent = 'Descargar PDF';
    }
  });
})();








