import { clamp } from "./mathUtils.js";

export function palettePick(rng, palette, gradient, spread = 0.55, jitter = 0.07) {
  const lastIndex = palette.length - 1;
  const g = clamp(gradient, 0, 1);

  const raw = g * lastIndex + rng.normal(0, spread);
  const index = clamp(Math.round(raw), 0, lastIndex);

  const base = palette[index];
  const factor = 1 + rng.normal(0, jitter);

  return [
    clamp(base[0] * factor, 0, 255),
    clamp(base[1] * factor, 0, 255),
    clamp(base[2] * factor, 0, 255),
  ];
}
