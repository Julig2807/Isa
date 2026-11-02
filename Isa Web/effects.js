import { WILT_PAL } from "./config.js";
import { palettePick } from "./palette.js";
import { permute } from "./geometryData.js";

export function buildEffects(rng, cx, surface) {
  const H = surface.H;

  const haloCount = 1800;
  const halo = {
    a: [],
    r: [],
    b: [],
    fl: [],
  };

  for (let i = 0; i < haloCount; i++) {
    const r = Math.min(Math.abs(rng.normal(0, 0.55)), 1.6);

    halo.a.push(rng.float(0, 2 * Math.PI));
    halo.r.push(r);
    halo.b.push(Math.pow(1 - r / 1.6, 1.5) * 0.55);
    halo.fl.push(rng.next());
  }

  const ring = {
    cf: [],
    cj: [],
    rho: [],
    a: [],
    fl: [],
  };

  for (let j = 0; j < 7; j++) {
    const m = j === 0 ? 700 : 170;
    const cf = j === 0 ? 0.0 : 0.5;
    const cj = Math.max(j - 1, 0);
    const rho = j === 0 ? 1.0 : 0.5;

    for (let i = 0; i < m; i++) {
      ring.cf.push(cf);
      ring.cj.push(cj);
      ring.rho.push(rho);
      ring.a.push(rng.float(0, 2 * Math.PI));
      ring.fl.push(rng.next());
    }
  }

  const sparkCount = 280;
  const spark = {
    a: [],
    rho: [],
    ph: [],
    sp: [],
    radius: [],
    hue: [],
  };

  for (let i = 0; i < sparkCount; i++) {
    spark.a.push(rng.float(0, 2 * Math.PI));
    spark.rho.push(rng.next());
    spark.ph.push(rng.next());
    spark.sp.push(rng.float(0.6, 1.4));
    spark.radius.push(rng.choice([1.0, 2.0], [0.7, 0.3]));
    spark.hue.push(rng.next());
  }

  const fallCount = 260;
  const fall = {
    r0: [],
    ox: [],
    oy: [],
    xl: [],
    yl: [],
    ph: [],
    color: [],
    radius: [],
  };

  for (let i = 0; i < fallCount; i++) {
    const xl = cx + rng.normal(0, 0.12 * H);

    fall.r0.push(rng.next());
    fall.ox.push(rng.normal(0, 1));
    fall.oy.push(rng.normal(0, 1));
    fall.xl.push(xl);
    fall.yl.push(surface(xl) - rng.next() * 0.012 * H);
    fall.ph.push(rng.float(0, 6.28));
    fall.color.push(palettePick(rng, WILT_PAL, rng.next(), 0.8));
    fall.radius.push(rng.choice([1.5, 2.0], [0.5, 0.5]));
  }

  return {
    halo: permute(halo, rng),
    ring: permute(ring, rng),
    spark,
    fall,
  };
}