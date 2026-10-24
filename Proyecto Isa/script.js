/**
 * Proyecto: Una experiencia web personalizada para Isa
 * Archivo: script.js
 * Descripción: Interacciones vanilla JS, fondo de estrellas con canvas,
 * navegación entre secciones, scroll reveal y revelación del mensaje final.
 */

(function () {
  'use strict';

  // ==================== ESTADO ==================== //
  const sections = document.querySelectorAll('.section');
  let currentIndex = 0;

  // ==================== FONDO GALÁCTICO (CANVAS) ==================== //
  const canvas = document.getElementById('stars-canvas');
  const ctx = canvas.getContext('2d');
  let width, height;
  let stars = [];
  let animationId;

  const STAR_COUNT = 120;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function createStar() {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.7 + 0.2,
      speed: Math.random() * 0.03 + 0.01,
      twinkleOffset: Math.random() * Math.PI * 2,
      twinkleSpeed: Math.random() * 0.02 + 0.01
    };
  }

  function initStars() {
    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push(createStar());
    }
  }

  function drawStars() {
    ctx.clearRect(0, 0, width, height);
    const time = Date.now() * 0.001;

    stars.forEach((star) => {
      if (reducedMotion) {
        ctx.globalAlpha = star.opacity;
      } else {
        ctx.globalAlpha = star.opacity + Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.15;
      }

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    });

    if (!reducedMotion) {
      animationId = requestAnimationFrame(drawStars);
    }
  }

  window.addEventListener('resize', resize);
  resize();
  initStars();

  if (!reducedMotion) {
    drawStars();
  } else {
    ctx.clearRect(0, 0, width, height);
    stars.forEach((star) => {
      ctx.globalAlpha = star.opacity;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // ==================== NAVEGACIÓN ENTRE SECCIONES ==================== //
  function showSection(index) {
    sections.forEach((sec, i) => {
      sec.classList.toggle('active', i === index);
    });
    currentIndex = index;
  }

  const startBtn = document.getElementById('start-btn');
  const backBtn = document.getElementById('back-btn');

  if (startBtn) {
    startBtn.addEventListener('click', () => {
      showSection(1);
    });
  }

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      showSection(0);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ==================== SCROLL REVEAL CON INTERSECTIONOBSERVER ==================== //
  const revealBlocks = document.querySelectorAll('.reveal-block');

  const observerOptions = {
    threshold: 0.12,
    rootMargin: '0px 0px -50px 0px'
  };

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealBlocks.forEach((block) => {
    revealObserver.observe(block);
  });

  // ==================== REVELACIÓN DEL MENSAJE FINAL ==================== //
  const revealBtn = document.getElementById('reveal-btn');
  const finalMessage = document.getElementById('final-message');

  if (revealBtn && finalMessage) {
    revealBtn.addEventListener('click', () => {
      if (finalMessage.classList.contains('hidden')) {
        finalMessage.classList.remove('hidden');
        revealBtn.textContent = 'Mensaje revelado';
        revealBtn.disabled = true;
      }
    });
  }

  // ==================== INICIALIZACIÓN ==================== //
  // La portada está activa por defecto (clase 'active' en el HTML).
  // Si JavaScript no carga, todas las secciones siguen visibles en el DOM.
})();