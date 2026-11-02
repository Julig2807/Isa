import {
  LAYERS,
  RIM_PAL,
  HI_PAL,
  GOLD_PAL,
  WILT_PAL,
} from "./config.js";
import { palettePick } from "./palette.js";
import { areaU, sampleV, permute } from "./geometryData.js";
import { profile, clamp } from "./mathUtils.js";

export function buildHead(rng) {
  const data = {
    th: [],
    aj: [],
    pj: [],
    wj: [],
    u: [],
    v: [],
    ac: [],
    ao: [],
    kc: [],
    ko: [],
    L: [],
    wc: [],
    wo: [],
    live: [],
    wilt: [],
    rn: [],
    radius: [],
    sp: [],
  };

  for (const layer of LAYERS) {
    for (let i = 0; i < layer.n; i++) {
      const th =
        2 * Math.PI * i / layer.n +
        layer.off +
        rng.normal(0, 0.10);

      const aj = rng.normal(0, 0.06);
      const lj = rng.float(0.92, 1.08);
      const pj = rng.next();
      const wj = rng.float(-0.5, 0.5);

      const u = areaU(rng, layer.d);
      const v = sampleV(rng, layer.d);

      for (let k = 0; k < layer.d; k++) {
        let color = palettePick(
          rng,
          layer.pal,
          u[k] + rng.normal(0, 0.10)
        );

        if (Math.abs(v[k]) > 0.86 && rng.next() < 0.55) {
          color = palettePick(rng, RIM_PAL, rng.next());
        }

        if (rng.next() < 0.04) {
          color = palettePick(rng, HI_PAL, rng.next());
        }

        if (rng.next() < 0.02 && u[k] < 0.55) {
          color = palettePick(rng, GOLD_PAL, rng.next());
        }

        data.th.push(th);
        data.aj.push(aj);
        data.pj.push(pj);
        data.wj.push(wj);
        data.u.push(u[k]);
        data.v.push(v[k]);
        data.ac.push(layer.ac);
        data.ao.push(layer.ao);
        data.kc.push(layer.kc);
        data.ko.push(layer.ko);
        data.L.push(layer.L * lj);
        data.wc.push(layer.wc);
        data.wo.push(layer.wo);
        data.live.push(color);
        data.wilt.push(
          palettePick(
            rng,
            WILT_PAL,
            0.4 * u[k] + 0.6 * rng.next(),
            0.7
          )
        );
        data.rn.push(rng.next());
        data.radius.push(
          rng.choice([1.0, 1.5, 2.0], [0.3, 0.45, 0.25])
        );
        data.sp.push(profile(u[k]));
      }
    }
  }

  return permute(data, rng);
}