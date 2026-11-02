const offsets = [];

for (let dy = -3; dy <= 3; dy++) {
  for (let dx = -3; dx <= 3; dx++) {
    const dist2 = dx * dx + dy * dy;

    if (dist2 <= 9) {
      offsets.push([dx, dy, dist2]);
    }
  }
}

offsets.sort((a, b) => a[2] - b[2]);

export const SPLAT_OFFSETS = offsets;