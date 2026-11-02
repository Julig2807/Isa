import { SPLAT_OFFSETS } from "./offsets.js";

export class CanvasBuffer {
  constructor(width, height) {
    this.width = width;
    this.height = height;

    this.canvas = document.createElement("canvas");
    this.canvas.width = width;
    this.canvas.height = height;

    this.ctx = this.canvas.getContext("2d", { willReadFrequently: true });
    this.imageData = this.ctx.createImageData(width, height);
    this.data = this.imageData.data;
  }

  clear() {
    this.data.fill(0);
  }

  copyFrom(otherBuffer) {
    this.data.set(otherBuffer.data);
  }

  setPixel(x, y, r, g, b) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;

    const i = (y * this.width + x) * 4;

    this.data[i] = r;
    this.data[i + 1] = g;
    this.data[i + 2] = b;
    this.data[i + 3] = 255;
  }

  splat(x, y, color, radius, nmax = 13) {
    const xi = Math.round(x);
    const yi = Math.round(y);
    const r2 = radius * radius;

    const count = Math.min(nmax, SPLAT_OFFSETS.length);

    for (let i = 0; i < count; i++) {
      const [dx, dy, dist2] = SPLAT_OFFSETS[i];

      if (dist2 > r2 + 0.01) continue;

      this.setPixel(xi + dx, yi + dy, color[0], color[1], color[2]);
    }
  }

  drawTo(targetCtx) {
    this.ctx.putImageData(this.imageData, 0, 0);
    targetCtx.drawImage(this.canvas, 0, 0);
  }
}