(function () {
  'use strict';

  document.documentElement.classList.add('js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Fondo de estrellas ---------- */

  var canvas = document.getElementById('starfield');
  var ctx = canvas.getContext('2d');
  var stars = [];
  var w = 0;
  var h = 0;
  var dpr = 1;
  var rafId = null;
  var lastFrame = 0;

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
      var star = stars[i];
      var alpha = star.base;

      if (star.twinkle && !reduceMotion) {
        alpha = star.base * (0.55 + 0.45 * Math.sin(t * star.speed + star.phase));
      }

      ctx.globalAlpha = Math.max(0.05, Math.min(1, alpha));
      ctx.fillStyle = star.silver ? '#c4c9d6' : '#ffffff';
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  }

  function loop(t) {
    if (t - lastFrame > 66) {
      draw(t);
      lastFrame = t;
    }

    rafId = requestAnimationFrame(loop);
  }

  function startAnimation() {
    if (reduceMotion || rafId) return;
    rafId = requestAnimationFrame(loop);
  }

  function stopAnimation() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  var resizeTimer;

  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 200);
  });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      stopAnimation();
    } else {
      startAnimation();
    }
  });

  resize();
  startAnimation();

  requestAnimationFrame(function () {
    document.body.classList.remove('is-loading');
    document.body.classList.add('is-ready');
  });

  /* ---------- Aparición al hacer scroll ---------- */

  var revealElements = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -5% 0px'
      }
    );

    revealElements.forEach(function (element) {
      revealObserver.observe(element);
    });
  } else {
    revealElements.forEach(function (element) {
      element.classList.add('is-visible');
    });
  }

  /* ---------- Navegación suave ---------- */

  function goTo(selector) {
    var target = document.querySelector(selector);

    if (!target) return;

    target.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start'
    });

    if (!target.hasAttribute('tabindex')) {
      target.setAttribute('tabindex', '-1');
