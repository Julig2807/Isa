import { SEED, T_END } from "./config.js";
import { Random } from "./random.js";
import { CanvasBuffer } from "./canvasBuffer.js";
import { Batch } from "./batch.js";
import { createSoil } from "./soil.js";
import { buildStem, stemControlPoints } from "./stem.js";
import { buildLeaves } from "./leaves.js";
import { buildHead } from "./head.js";
import { buildStamens } from "./stamens.js";
import { buildEffects } from "./effects.js";
import { getState } from "./state.js";
import { bezier, clamp, lerp, mixColor, sinc, smoothstep } from "./mathUtils.js";
import { LEAF_DEFS } from "./config.js";

export class Plant {
  constructor(size) {
    this.size = size;
    this.rng = new Random(SEED);

    this.cx = size / 2;
    this.y0 = size * 0.80;
    this.Ls = size * 0.38;
    this.Lf = size * 0.235;

    this.buffer = new CanvasBuffer(size, size);
    this.base = new CanvasBuffer(size, size);

    const soil = createSoil(this.base, this.rng, this.cx, this.y0);

    this.surface = soil.surface;
    this.crumbs = soil.crumbs;

    this.stem = buildStem(this.rng);
    this.leaves = buildLeaves(this.rng);
    this.head = buildHead(this.rng);
    this.stamens = buildStamens(this.rng);
    this.effects = buildEffects(this.rng, this.cx, this.surface);
  }

  render(t, targetCtx) {
    const H = this.size;
    const W = this.size;

    const {
      stem,
      size,
      bloom,
      wilt,
      leaf,
      glow,
    } = getState(t);

    this.buffer.copyFrom(this.base);

    const batch = new Batch();
    const nodes = new Batch();

    const L = this.Ls * stem;
    const sway =
      0.012 * H * Math.sin(t * 0.9) * stem * (1 - 0.6 * wilt);

    const P = stemControlPoints(this.cx, this.y0, L, wilt, sway);
    const hx = P[3][0];
    const hy = P[3][1];

    if (stem > 0.01) {
      this.renderStem(batch, P, stem, wilt, sway);
    }

    if (leaf > 0.02 && stem > 0.05) {
      this.renderLeaves(batch, P, leaf, wilt);
    }

    let phi = 0;
    let tau = 0;
    let Ls = 0;

    if (stem > 0.01 && size > 0.05) {
      phi = wilt * 2.75 + 0.035 * Math.sin(t * 0.9 + 1.0) * (1 - wilt);
      tau = 0.20 + 0.36 * bloom - 0.40 * wilt;

      const cphi = Math.cos(phi);
      const sphi = Math.sin(phi);
      const ct = Math.cos(tau);
      const st = Math.sin(tau);

      Ls = this.Lf * size;

      const project = (xl, yl, zl) => {
        const yp = yl * ct - zl * st;
        const zp = yl * st + zl * ct;

        return {
          x: hx + xl * cphi + yp * sphi,
          y: hy - (-xl * sphi + yp * cphi),
          z: zp,
          yp,
        };
      };

      this.renderHead(batch, project, Ls, size, bloom, wilt);
      this.renderStamens(batch, project, Ls, bloom, wilt);
    }

    if (glow > 0.02) {
      this.renderGlow(batch, nodes, hx, hy, phi, Ls, glow, t);
    }

    if (wilt > 0.02) {
      this.renderFallingPetals(batch, hx, hy, Ls, wilt);
    }

    batch.draw(this.buffer, 13);
    nodes.draw(this.buffer, 29);

    this.renderCrumbs(t);

    this.buffer.drawTo(targetCtx);
  }

  renderStem(batch, P, stem, wilt) {
    const H = this.size;
    const S = this.stem;
    const nv = Math.floor(S.s.length * clamp(stem, 0.08, 1));

    for (let i = 0; i < nv; i++) {
      const s = S.s[i];
      const point = bezier(P, s);

      const norm = Math.hypot(point.dx, point.dy) + 1e-6;

      const width =
        0.0085 * H *
        (1 - 0.3 * s) *
        (1 - 0.25 * wilt) *
        clamp(0.4 + stem * 1.2, 0.4, 1);

      const lat = S.lat[i] * width;

      const wi = clamp(
        wilt * (0.75 + 0.5 * s) * (0.7 + 0.5 * S.rn[i]),
        0,
        1
      );

      const x = point.x - (point.dy / norm) * lat;
      const y = point.y + (point.dx / norm) * lat;
      const color = mixColor(S.live[i], S.wilt[i], wi);

      batch.add(x, y, color, S.radius[i], -500);
    }
  }

  renderLeaves(batch, P, leaf, wilt) {
    const H = this.size;
    const S = this.leaves;
    const nv = Math.floor(S.u.length * clamp(leaf, 0.15, 1));

    for (let i = 0; i < nv; i++) {
      const lid = S.lid[i];
      const def = LEAF_DEFS[lid];

      const point = bezier(P, def[0]);

      const lfac = def[2];
      const a0 = def[3] + (1 - leaf) * 0.8 - 0.6 * wilt;
      const c = def[4] - 0.5 * wilt;

      const u = S.u[i];
      const v = S.v[i];

      const LL = 0.19 * H * lfac * leaf * (1 - 0.25 * wilt);
      const am = a0 + c * u * 0.5;
      const al = a0 + c * u;
      const sc = sinc(c * u * 0.5);
      const lat = v * 0.27 * LL * (Math.sin(Math.PI * clamp(u, 0, 1) ** 0.75) ** 0.85);

      const X =
        point.x +
        LL * u * def[1] * Math.cos(am) * sc -
        lat * Math.sin(al);

      const Yup =
        LL * u * Math.sin(am) * sc +
        lat * def[1] * Math.cos(al);

      const wi = clamp(
        wilt * (0.9 + 0.5 * u + 0.3 * S.rn[i]) - 0.1,
        0,
        1
      );

      const color = mixColor(S.live[i], S.wilt[i], wi);

      batch.add(X, point.y - Yup, color, S.radius[i], -450);
    }
  }

  renderHead(batch, project, Ls, size, bloom, wilt) {
    const h = this.head;
    const vis = clamp(size * size * 1.15, 0.2, 1.0);
    const nv = Math.floor(h.u.length * vis);

    for (let i = 0; i < nv; i++) {
      const u = h.u[i];
      const v = h.v[i];

      let A0 =
        h.ac[i] + (h.ao[i] - h.ac[i]) * bloom + h.aj[i];

      A0 = A0 * (1 - 0.55 * wilt) + wilt * h.wj[i] * 0.3;

      const K =
        h.kc[i] +
        (h.ko[i] - h.kc[i]) * bloom +
        wilt * (0.6 + 0.6 * h.pj[i]);

      const Lp = Ls * h.L[i] * (1 - 0.28 * wilt * h.pj[i]);

      const am = A0 + K * u * 0.5;
      const sc = sinc(K * u * 0.5);

      let rr = Lp * u * Math.sin(am) * sc;
      const hh = Lp * u * Math.cos(am) * sc;

      const lat =
        v * (h.wc[i] + (h.wo[i] - h.wc[i]) * bloom) * Lp * h.sp[i];

      rr = rr + 0.025 * Ls - 0.5 * lat * lat / (Lp + 1.0);

      const cth = Math.cos(h.th[i]);
      const sth = Math.sin(h.th[i]);

      const p = project(
        cth * rr - sth * lat,
        hh,
        sth * rr + cth * lat
      );

      const shade = clamp(
        0.72 +
          0.28 * clamp(p.z / Ls * 0.5 + 0.5, 0, 1) +
          0.12 * (hh / Ls),
        0.5,
        1.2
      );

      const wi = clamp(
        wilt * (1.0 + 0.7 * u + 0.4 * h.rn[i]) - 0.2,
        0,
        1
      );

      const mixed = mixColor(h.live[i], h.wilt[i], wi);

      batch.add(
        p.x,
        p.y,
        [
          mixed[0] * shade,
          mixed[1] * shade,
          mixed[2] * shade,
        ],
        h.radius[i],
        p.z
      );
    }
  }

  renderStamens(batch, project, Ls, bloom, wilt) {
    const ss = smoothstep(bloom, 0.30, 0.85);

    if (ss <= 0.02) return;

    const S = this.stamens;
    const nv = Math.floor(S.t.length * clamp(1, 0.25, 1));

    for (let i = 0; i < nv; i++) {
      const ell = Ls * ss * S.ell[i];
      const beta =
        S.beta[i] * (0.6 + 0.4 * bloom) + wilt * 0.3;

      const t = S.t[i];

      const r = ell * t * Math.sin(beta) + 0.02 * Ls;
      const yl = 0.05 * Ls + ell * t * Math.cos(beta);

      const p = project(
        Math.cos(S.th[i]) * r,
        yl,
        Math.sin(S.th[i]) * r
      );

      const color = mixColor(S.live[i], S.wilt[i], wilt);

      batch.add(p.x, p.y, color, S.radius[i], p.z + 3);
    }
  }

  renderGlow(batch, nodes, hx, hy, phi, Ls, glow, t) {
    const axis = [Math.sin(phi), -Math.cos(phi)];
    const ccx = hx + axis[0] * 0.5 * Ls;
    const ccy = hy + axis[1] * 0.5 * Ls;

    const halo = this.effects.halo;
    const nh = Math.floor(halo.a.length * glow);

    for (let i = 0; i < nh; i++) {
      const rh = halo.r[i] * Ls * 1.1;

      const br =
        halo.b[i] *
        glow *
        (0.85 + 0.3 * Math.sin(t * 1.3 + halo.fl[i] * 6.28));

      batch.add(
        ccx + Math.cos(halo.a[i]) * rh,
        ccy + Math.sin(halo.a[i]) * rh,
        [150 * br, 70 * br, 240 * br],
        1,
        -2000
      );
    }

    const ring = this.effects.ring;
    const nr = Math.floor(ring.a.length * glow);
    const Rs = Ls * 1.25;

    for (let i = 0; i < nr; i++) {
      const cang = 2 * Math.PI * ring.cj[i] / 6 + t * 0.15;
      const a = ring.a[i] + t * 0.05;

      const rx =
        ccx +
        Rs * (ring.cf[i] * Math.cos(cang) + ring.rho[i] * Math.cos(a));

      const ry =
        ccy +
        Rs * (ring.cf[i] * Math.sin(cang) + ring.rho[i] * Math.sin(a));

      const bb =
        (0.40 + 0.60 * glow) *
        (0.65 + 0.35 * Math.sin(t * 2 + ring.fl[i] * 20));

      batch.add(
        rx,
        ry,
        [210 * bb, 145 * bb, 255 * bb],
        1,
        -1500
      );
    }

    for (let j = 0; j < 6; j++) {
      const ja = 2 * Math.PI * j / 6 + t * 0.15;

      nodes.add(
        ccx + Rs * Math.cos(ja),
        ccy + Rs * Math.sin(ja),
        [255 * glow, 215 * glow, 255 * glow],
        3,
        0
      );
    }

    const spark = this.effects.spark;

    for (let i = 0; i < spark.a.length; i++) {
      const life = (t * 0.10 * spark.sp[i] + spark.ph[i]) % 1;

      const rho =
        (0.25 + 1.15 * spark.rho[i]) * Ls * (0.6 + 0.6 * life);

      const px = ccx + Math.cos(spark.a[i]) * rho;
      const py =
        ccy + Math.sin(spark.a[i]) * rho - life * 0.25 * Ls;

      const bs = Math.pow(Math.sin(Math.PI * life), 0.8) * glow;

      const color =
        spark.hue[i] < 0.5
          ? [255 * bs, 215 * bs, 255 * bs]
          : [255 * bs, 150 * bs, 235 * bs];

      batch.add(px, py, color, spark.radius[i], 2000);
    }
  }

  renderFallingPetals(batch, hx, hy, Ls, wilt) {
    const H = this.size;
    const F = this.effects.fall;

    for (let i = 0; i < F.r0.length; i++) {
      const fp = clamp((wilt * 1.05 - F.r0[i] * 0.7) / 0.35, 0, 1);

      if (fp <= 0) continue;

      const sx = hx + F.ox[i] * 0.18 * Ls;
      const sy = hy + F.oy[i] * 0.18 * Ls + 0.25 * Ls;

      const x =
        sx +
        (F.xl[i] - sx) * fp +
        Math.sin(fp * 6.28 + F.ph[i]) * 0.03 * H * (1 - fp);

      const y = sy + (F.yl[i] - sy) * fp * fp;

      batch.add(x, y, F.color[i], F.radius[i], 500);
    }
  }

  renderCrumbs(t) {
    const C = this.crumbs;

    for (let i = 0; i < C.x.length; i++) {
      const e = clamp((t - C.delay[i]) / 3.0, 0, 1);
      const sy = C.y[i] - C.amp[i] * Math.sin(Math.PI * e);

      this.buffer.splat(
        C.x[i],
        sy,
        [
          clamp(C.color[i][0], 0, 255),
          clamp(C.color[i][1], 0, 255),
          clamp(C.color[i][2], 0, 255),
        ],
        C.radius[i],
        13
      );
    }
  }
}