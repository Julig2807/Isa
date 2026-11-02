import { profile } from "./mathUtils.js";

export function areaU(rng, n) {
  const out = [];

  while (out.length < n) {
    const candidates = [];

    for (let i = 0; i < n * 3; i++) {
      candidates.push(rng.next());
    }

    for (const u of candidates) {
      if (rng.next() < profile(u)) {
        out.push(u);

        if (out.length >= n) break;
      }
    }
  }

  return out;
}

export function sampleV(rng, n, rim = 0.14) {
  const v = [];

  for (let i = 0; i < n; i++) {
    v.push(rng.float(-1, 1));
  }

  for (let i = 0; i < n; i++) {
    if (rng.next() < rim) {
      const sign = v[i] < 0 ? -1 : 1;
      v[i] = sign * rng.float(0.88, 1.0);
    }
  }

  return v;
}

export function permute(data, rng) {
  const keys = Object.keys(data);
  const n = data[keys[0]].length;
  const permutation = rng.permutation(n);

  const result = {};

  for (const key of keys) {
    result[key] = permutation.map((index) => data[key][index]);
  }

  return result;
}