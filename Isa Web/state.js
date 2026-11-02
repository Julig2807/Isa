import { KEYS, T_END } from "./config.js";
import { clamp, catmullRom } from "./mathUtils.js";

export function getState(t) {
  const time = clamp(t, 0, T_END);
  const times = KEYS.map((row) => row[0]);

  let i = 0;

  for (let j = 0; j < times.length - 1; j++) {
    if (time >= times[j]) {
      i = j;
    }
  }

  i = Math.min(i, KEYS.length - 2);

  const t0 = times[i];
  const t1 = times[i + 1];
  const u = (time - t0) / (t1 - t0);

  const p0 = KEYS[Math.max(i - 1, 0)].slice(1);
  const p1 = KEYS[i].slice(1);
  const p2 = KEYS[i + 1].slice(1);
  const p3 = KEYS[Math.min(i + 2, KEYS.length - 1)].slice(1);

  const values = [];

  for (let k = 0; k < 6; k++) {
    values.push(
      clamp(
        catmullRom(p0[k], p1[k], p2[k], p3[k], u),
        0,
        1
      )
    );
  }

  return {
    stem: values[0],
    size: values[1],
    bloom: values[2],
    wilt: values[3],
    leaf: values[4],
    glow: values[5],
  };
}