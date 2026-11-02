import { SPLAT_OFFSETS } from "./offsets.js";

export class Batch {
  constructor() {
    this.points = [];
  }

  add(x, y, color, radius, z) {
    this.points.push({ x, y, color, radius, z });
  }

  draw(buffer, nmax = 13) {
    if (this.points.length === 0) return;

    this.points.sort((a, b) => a.z - b.z);

    for (const p of this.points) {
      const r = Math.round(Math.min(Math.max(p.color[0], 0), 255));
      const g = Math.round(Math.min(Math.max(p.color[1], 0), 255));
      const b = Math.round(Math.min(Math.max(p.color[2], 0), 255));

      buffer.splat(p.x, p.y, [r, g, b], p.radius, nmax);
    }
  }
}