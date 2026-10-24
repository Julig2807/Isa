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
      var s = stars[i];
      var alpha = s.base;

      if (s.twinkle && !reduceMotion) {
        alpha = s.base * (0.55 + 0.45 * Math.sin(t * s.speed + s.phase));
      }

      ctx.globalAlpha = Math.max(0.05, Math.min(1, alpha));
      ctx.fillStyle = s.silver ? '#c4c9d6' : '#ffffff';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
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

  function start() {
    if (reduceMotion || rafId) return;
    rafId = requestAnimationFrame(loop);
  }

  function stop() {
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
      stop();
    } else {
      start();
    }
  });

  resize();
  start();

  requestAnimationFrame(function () {
    document.body.classList.remove('is-loading');
    document.body.classList.add('is-ready');
  });

  /* ---------- Aparición al hacer scroll ---------- */

  var revealEls = document.querySelectorAll('.reveal');

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

    revealEls.forEach(function (element) {
      revealObserver.observe(element);
    });
  } else {
    revealEls.forEach(function (element) {
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
    }

    target.focus({ preventScroll: true });

    if (history.replaceState) {
      history.replaceState(null, '', selector);
    }
  }

  document.querySelectorAll('[data-scroll-to]').forEach(function (button) {
    button.addEventListener('click', function () {
      goTo(button.getAttribute('data-scroll-to'));
    });
  });

  document.querySelectorAll('.site-nav a').forEach(function (link) {
    link.addEventListener('click', function (event) {
      event.preventDefault();
      goTo(link.getAttribute('href'));
    });
  });

  /* ---------- Enlace activo en la navegación ---------- */

  var navLinks = document.querySelectorAll('.site-nav a');

  if ('IntersectionObserver' in window) {
    var sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            navLinks.forEach(function (link) {
              link.classList.toggle(
                'is-active',
                link.getAttribute('href') === '#' + entry.target.id
              );
            });
          }
        });
      },
      { threshold: 0.5 }
    );

    ['portada', 'universo', 'capitulo', 'final'].forEach(function (id) {
      var section = document.getElementById(id);

      if (section) {
        sectionObserver.observe(section);
      }
    });
  }

  /* ---------- Mensaje final ---------- */

  var revealButton = document.getElementById('reveal-btn');
  var finalMessage = document.getElementById('final-message');

  if (revealButton && finalMessage) {
    revealButton.addEventListener('click', function () {
      finalMessage.classList.add('is-open');
      revealButton.setAttribute('aria-expanded', 'true');
      revealButton.classList.add('is-hidden');

      setTimeout(function () {
        finalMessage.scrollIntoView({
          behavior: reduceMotion ? 'auto' : 'smooth',
          block: 'center'
        });
      }, 300);
    });
  }

  /* ---------- Marcador si la imagen no se encuentra ---------- */

  var artwork = document.querySelector('.isa-artwork');
  var artworkImage = artwork && artwork.querySelector('.isa-artwork__img');
  var artworkPlaceholder = artwork && artwork.querySelector('.isa-artwork__placeholder');

  if (artworkImage && artworkPlaceholder) {
    artworkImage.addEventListener('error', function () {
      artwork.classList.add('is-missing');
      artworkPlaceholder.hidden = false;
    });
  }
})();
