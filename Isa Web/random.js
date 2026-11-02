export class Random {
  constructor(seed) {
    this.state = seed >>> 0;
  }

  next() {
    this.state = (this.state + 0x6D2B79F5) >>> 0;

    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  float(min = 0, max = 1) {
    return min + this.next() * (max - min);
  }

  int(min, max) {
    return Math.floor(this.float(min, max + 1));
  }

  normal(mean = 0, std = 1) {
    let u = 0;
    let v = 0;

    while (u === 0) u = this.next();
    while (v === 0) v = this.next();

    return mean + std * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  choice(values, weights = null) {
    if (!weights) {
      return values[this.int(0, values.length - 1)];
    }

    const total = weights.reduce((sum, w) => sum + w, 0);
    let r = this.next() * total;

    for (let i = 0; i < values.length; i++) {
      r -= weights[i];

      if (r <= 0) {
        return values[i];
      }
    }

    return values[values.length - 1];
  }

  shuffle(array) {
    const out = array.slice();

    for (let i = out.length - 1; i > 0; i--) {
      const j = this.int(0, i);
      [out[i], out[j]] = [out[j], out[i]];
    }

    return out;
  }

  permutation(n) {
    return this.shuffle(Array.from({ length: n }, (_, i) => i));
  }
}