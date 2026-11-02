import { STEM_PAL, STEM_WILT } from "./config.js";
import { palettePick } from "./palette.js";
import { permute } from "./geometryData.js";

export function buildStem(rng, n = 3600) {
  const data = {
    s: [],
    lat: [],
    live: [],
    wilt: [],
    rn: [],
    radius: [],
  };

  for (let i = 0; i < n; i++) {
    const s = rng.next();
    let lat = rng.float(-1, 1);

    if (rng.next() < 0.18) {
      const sign = lat < 0 ? -1 : 1;
      lat = sign * rng.float(0.85, 1.0);
    }

    let live = palettePick(
      rng,
      STEM_PAL.slice(0, 3),
      s * 0.8 + rng.next() * 0.2
    );

    if (rng.next() < 0.12) {
      const green = STEM_PAL[3];
      const factor = 1 + rng.normal(0, 0.08);

      live = [
        green[0] * factor,
        green[1] * factor,
        green[2] * factor,
      ];
    }

    data.s.push(s);
    data.lat.push(lat);
    data.live.push(live);
    data.wilt.push(palettePick(rng, STEM_WILT, rng.next(), 0.8));
    data.rn.push(rng.next());
    data.radius.push(rng.choice([1.0, 1.5, 2.0], [0.35, 0.45, 0.2]));
  }

  return permute(data, rng);
}

export function stemControlPoints(cx, y0, L, wilt, sway) {
  return [
    [cx, y0 + 4.0],
    [
      cx - 0.06 * L * (1 - wilt) + 0.02 * L * wilt,
      y0 - 0.33 * L,
    ],
    [
      cx + 0.05 * L * (1 - wilt) + 0.08 * L * wilt + sway * 0.5,
      y0 - L * (0.74 + 0.30 * wilt),
    ],
    [
      cx + sway + 0.32 * L * wilt,
      y0 - L * (1 - 0.15 * wilt),
    ],
  ];
}
