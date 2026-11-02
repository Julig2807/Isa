import { LEAF_PAL, LEAF_WILT, RIB_PAL, LEAF_DEFS } from "./config.js";
import { palettePick } from "./palette.js";
import { areaU, sampleV, permute } from "./geometryData.js";

export function buildLeaves(rng, d = 900) {
  const data = {
    lid: [],
    u: [],
    v: [],
    live: [],
    wilt: [],
    rn: [],
    radius: [],
  };

  for (let j = 0; j < LEAF_DEFS.length; j++) {
    const u = areaU(rng, d);
    const v = sampleV(rng, d, 0.10);

    for (let i = 0; i < d; i++) {
      let vi = v[i];
      let live = palettePick(
        rng,
        LEAF_PAL,
        u[i] + rng.normal(0, 0.1)
      );

      if (rng.next() < 0.09) {
        vi = rng.normal(0, 0.03);
        live = palettePick(rng, RIB_PAL, rng.next());
      }

      data.lid.push(j);
      data.u.push(u[i]);
      data.v.push(vi);
      data.live.push(live);
      data.wilt.push(palettePick(rng, LEAF_WILT, rng.next(), 0.8));
      data.rn.push(rng.next());
      data.radius.push(rng.choice([1.0, 1.5, 2.0], [0.35, 0.45, 0.2]));
    }
  }

  return permute(data, rng);
}