import { TIME_SCALE, T_END, LOOP } from "./config.js";
import { Plant } from "./plant.js";

document.documentElement.classList.add("js");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const starfield = document.getElementById("starfield");
const starCtx = starfield.getContext("2d");
const canvas = document.getElementById("flower");
const ctx = canvas.getContext("2d");
const title = document.getElementById("intro-title");
const subtitle = document.getElementById("intro-subtitle");
const cta = document.getElementById("intro-cta");

let plant = null;
let clock = 0;
let lastTime = performance.now();
let paused = false;
let stars = [];
let starAnimation = null;
let lastStarFrame = 0;
let width = 0;
let height = 0;
let pixelRatio = 1;
const TRAIL_FADE_SECONDS = 0.4;

function createStars() {
  const count = Math.min(Math.round((width * height) / 4500), 280);
  stars = [];

  for (let i = 0; i < count; i++) {
    const depth = Math.random();
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 0.3 + depth * 1.2,
      base: 0.2 + depth * 0.6,
      speed: 0.0004 + Math.random() * 0.0012,
      phase: Math.random() * Math.PI * 2,
      twinkle: Math.random() < 0.25,
      silver: Math.random() < 0.15,
    });
  }
}

function drawStars(time) {
  starCtx.clearRect(0, 0, width, height);

  for (const star of stars) {
    let alpha = star.base;
    if (star.twinkle && !reduceMotion) {
      alpha *= 0.55 + 0.45 * Math.sin(time * star.speed + star.phase);
    }

    starCtx.globalAlpha = Math.max(0.05, Math.min(1, alpha));
    starCtx.fillStyle = star.silver ? "#c4c9d6" : "#ffffff";
    starCtx.beginPath();
    starCtx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    starCtx.fill();
  }

  starCtx.globalAlpha = 1;
}

function animateStars(time) {
  if (time - lastStarFrame > 66) {
    drawStars(time);
    lastStarFrame = time;
  }
  starAnimation = requestAnimationFrame(animateStars);
}

function startStars() {
  if (reduceMotion || starAnimation || document.hidden) return;
  starAnimation = requestAnimationFrame(animateStars);
}

function stopStars() {
  if (!starAnimation) return;
  cancelAnimationFrame(starAnimation);
  starAnimation = null;
}

function resize() {
  pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  starfield.width = width * pixelRatio;
  starfield.height = height * pixelRatio;
  starCtx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  createStars();
  drawStars(performance.now());

  const size = Math.floor(
    Math.min(window.innerWidth * 0.82, window.innerHeight * 0.48, 620)
  );
  canvas.width = size;
  canvas.height = size;
  ctx.clearRect(0, 0, size, size);
  plant = new Plant(size);
}

function tick(now) {
  const dt = (now - lastTime) / 1000;
  lastTime = now;

  const fade = 1 - Math.exp(-dt / TRAIL_FADE_SECONDS);
  ctx.globalCompositeOperation = "destination-out";
  ctx.fillStyle = `rgba(0, 0, 0, ${fade})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = "source-over";

  if (!paused) {
    clock += dt * TIME_SCALE;

    if (LOOP && clock > T_END + 4) {
      clock = 0;
    }
  }

  plant.render(clock, ctx);
  requestAnimationFrame(tick);
}

function revealButton() {
  requestAnimationFrame(() => cta.classList.add("is-visible"));
}

function startTyping() {
  const text = subtitle.getAttribute("aria-label");
  subtitle.textContent = "";

  if (reduceMotion) {
    subtitle.textContent = text;
    revealButton();
    return;
  }

  subtitle.classList.add("is-typing");
  let index = 0;

  function typeNextCharacter() {
    subtitle.textContent += text[index];
    index += 1;

    if (index < text.length) {
      window.setTimeout(typeNextCharacter, 42);
      return;
    }

    subtitle.classList.remove("is-typing");
    revealButton();
  }

  typeNextCharacter();
}

if (reduceMotion) {
  startTyping();
} else {
  title.addEventListener("animationend", startTyping, { once: true });
}

window.addEventListener("resize", resize);
window.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    paused = !paused;
  }

  if (event.code === "KeyR") {
    clock = 0;
  }
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stopStars();
  } else {
    startStars();
  }
});

resize();
document.body.classList.add("is-ready");
startStars();
requestAnimationFrame(tick);
