import { STAMEN_PAL, STAMEN_WILT } from "./config.js";
import { palettePick } from "./palette.js";
import { permute } from "./geometryData.js";

export function buildStamens(rng, n = 700, nf = 60) {
  const filaments = {
    th: [],
    beta: [],
    ell: [],
  };

  for (let i = 0; i < nf; i++) {
    filaments.th.push(rng.float(0, 2 * Math.PI));
    filaments.beta.push(rng.float(0.2, 0.85));
    filaments.ell.push(rng.float(0.30, 0.55));
  }

  const data = {
    th: [],
    beta: [],
    ell: [],
    t: [],
    live: [],
    wilt: [],
    radius: [],
  };

  for (let i = 0; i < n; i++) {
    const fid = rng.int(0, nf - 1);
    const t = 1 - Math.pow(rng.next(), 1.6);

    data.th.push(filaments.th[fid]);
    data.beta.push(filaments.beta[fid]);
    data.ell.push(filaments.ell[fid]);
    data.t.push(t);
    data.live.push(palettePick(rng, STAMEN_PAL, t, 0.35));
    data.wilt.push(palettePick(rng, STAMEN_WILT, rng.next(), 0.6));

    if (t > 0.88) {
      data.radius.push(2.0);
    } else {
      data.radius.push(rng.choice([1.0, 1.5], [0.5, 0.5]));
    }
  }

  return permute(data, rng);
}