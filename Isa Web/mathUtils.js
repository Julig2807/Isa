export function clamp(x, min, max) {
  return Math.min(Math.max(x, min), max);
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function smoothstep(x, a, b) {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
}

export function sinc(x) {
  if (x === 0) return 1;
  return Math.sin(x) / x;
}

export function profile(u) {
  const c = clamp(u, 0, 1);
  return Math.pow(Math.sin(Math.PI * Math.pow(c, 0.75)), 0.85);
}

export function catmullRom(p0, p1, p2, p3, u) {
  const u2 = u * u;
  const u3 = u2 * u;

  return 0.5 * (
    2 * p1 +
    (p2 - p0) * u +
    (2 * p0 - 5 * p1 + 4 * p2 - p3) * u2 +
    (3 * p1 - p0 - 3 * p2 + p3) * u3
  );
}

export function bezier(P, s) {
  const [P0, P1, P2, P3] = P;
  const q = 1 - s;

  const q2 = q * q;
  const q3 = q2 * q;
  const s2 = s * s;
  const s3 = s2 * s;

  const x =
    q3 * P0[0] +
    3 * q2 * s * P1[0] +
    3 * q * s2 * P2[0] +
    s3 * P3[0];

  const y =
    q3 * P0[1] +
    3 * q2 * s * P1[1] +
    3 * q * s2 * P2[1] +
    s3 * P3[1];

  const dx =
    3 * q2 * (P1[0] - P0[0]) +
    6 * q * s * (P2[0] - P1[0]) +
    3 * s2 * (P3[0] - P2[0]);

  const dy =
    3 * q2 * (P1[1] - P0[1]) +
    6 * q * s * (P2[1] - P1[1]) +
    3 * s2 * (P3[1] - P2[1]);

  return { x, y, dx, dy };
}

export function mixColor(live, wilt, w) {
  return [
    lerp(live[0], wilt[0], w),
    lerp(live[1], wilt[1], w),
    lerp(live[2], wilt[2], w),
  ];
}
