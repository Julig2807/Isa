import { SOIL_PAL } from "./config.js";
import { palettePick } from "./palette.js";
import { clamp } from "./mathUtils.js";

export function createSoil(buffer, rng, cx, y0) {
  const W = buffer.width;
  const H = buffer.height;

  const surface = (x) => {
    return (
      y0 -
      0.022 * H * Math.exp(-(((x - cx) / (0.2 * W)) ** 2)) -
      0.003 * H * Math.sin(x * 0.045) -
      0.002 * H * Math.sin(x * 0.13 + 1.3)
    );
  };

  const n = 26000;

  for (let i = 0; i < n; i++) {
    const x = rng.float(0, W);
    const d = Math.pow(rng.next(), 1.5) * 0.14 * H;
    const y = surface(x) + d;

    const depth = d / (0.14 * H);
    const edge = Math.pow(
      clamp(Math.min(x, W - x) / (0.2 * W), 0, 1),
      0.8
    );

    const clump =
      0.5 +
      0.5 *
        Math.sin(x * 0.07 + y * 0.05) *
        Math.sin(y * 0.11 - x * 0.03);

    const bright =
      Math.pow(1 - depth, 0.8) *
      edge *
      (0.55 + 0.35 * clump + 0.35 * rng.next());

    const color = palettePick(rng, SOIL_PAL, rng.next(), 1.0);
    const radius = rng.choice([1.0, 1.5, 2.0], [0.4, 0.4, 0.2]);

    buffer.splat(
      x,
      y,
      [
        clamp(color[0] * bright, 0, 255),
        clamp(color[1] * bright, 0, 255),
        clamp(color[2] * bright, 0, 255),
      ],
      radius,
      13
    );
  }

  const k = 170;

  for (let i = 0; i < k; i++) {
    const x = rng.float(0.05 * W, 0.95 * W);
    const y = surface(x) + Math.pow(rng.next(), 1.3) * 0.1 * H;

    let color = palettePick(
      rng,
      [
        [58, 52, 48],
        [84, 74, 64],
        [104, 90, 76],
        [46, 38, 32],
      ],
      rng.next(),
      0.7
    );

    const edge = Math.pow(
      clamp(Math.min(x, W - x) / (0.2 * W), 0, 1),
      0.8
    );

    color = [
      color[0] * edge,
      color[1] * edge,
      color[2] * edge,
    ];

    const radius = rng.choice([2.0, 3.0], [0.6, 0.4]);

    buffer.splat(
      x,
      y,
      [
        clamp(color[0], 0, 255),
        clamp(color[1], 0, 255),
        clamp(color[2], 0, 255),
      ],
      radius,
      29
    );
  }

  const m = 520;
  const crumbs = {
    x: [],
    y: [],
    amp: [],
    delay: [],
    color: [],
    radius: [],
  };

  for (let i = 0; i < m; i++) {
    const x = cx + rng.normal(0, 0.03 * H);

    crumbs.x.push(x);
    crumbs.y.push(surface(x) - rng.next() * 0.006 * H);
    crumbs.amp.push(H * 0.05 * Math.pow(rng.next(), 2.2));
    crumbs.delay.push(rng.float(0, 2.5));

    const color = palettePick(rng, SOIL_PAL, rng.float(0.3, 1), 0.8);

    crumbs.color.push([
      color[0] * 0.8,
      color[1] * 0.8,
      color[2] * 0.8,
    ]);

    crumbs.radius.push(rng.choice([1.0, 1.5, 2.0], [0.4, 0.4, 0.2]));
  }

  return {
    surface,
    crumbs,
  };
}
