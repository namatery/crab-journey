import { Container, Graphics } from "pixi.js";
import { COLORS, DESIGN_HEIGHT, DESIGN_WIDTH, OVERSCAN } from "../config";

// Everything the crab walks past lives inside this container.
// The crab stays centered; we move the world instead (a simple 2D camera).
export class World {
  container = new Container();

  constructor(groundY: number) {
    const left = -OVERSCAN;
    const width = DESIGN_WIDTH + OVERSCAN * 2;
    const bottom = DESIGN_HEIGHT + OVERSCAN;

    // Main ground fill, extended past the design box so it fills the letterbox.
    const ground = new Graphics()
      .rect(left, groundY, width, bottom - groundY)
      .fill(COLORS.sand);
    this.container.addChild(ground);

    // A sun-bleached strip just under the horizon, then a deeper band lower
    // down — two soft layers so the sand reads as a surface, not a flat slab.
    const bands = new Graphics();
    bands.rect(left, groundY, width, 34).fill(COLORS.sandTop);
    bands
      .rect(left, groundY + 150, width, bottom - groundY - 150)
      .fill(COLORS.sandDeep);
    this.container.addChild(bands);

    // The crisp shadow line right at the horizon (kept from before).
    const groundLine = new Graphics()
      .rect(left, groundY, width, 4)
      .fill(COLORS.sandShadow);
    this.container.addChild(groundLine);

    // --- Scattered detail -------------------------------------------------
    // Deterministic pseudo-random placement so the ground looks lived-in but
    // doesn't reshuffle every reload.
    const rnd = mulberry32(0x5eed);
    const detail = new Graphics();

    // Hairline cracks in the baked earth.
    for (let i = 0; i < 14; i++) {
      const x = left + rnd() * width;
      const y = groundY + 20 + rnd() * 120;
      const len = 18 + rnd() * 40;
      const dy = (rnd() - 0.5) * 10;
      detail.moveTo(x, y).lineTo(x + len, y + dy);
    }
    detail.stroke({ width: 2, color: COLORS.sandShadow, alpha: 0.5 });

    // Little pebbles.
    for (let i = 0; i < 40; i++) {
      const x = left + rnd() * width;
      const y = groundY + 10 + rnd() * 150;
      const s = 2 + rnd() * 4;
      detail.rect(x, y, s, s).fill({ color: COLORS.pebble, alpha: 0.7 });
    }
    this.container.addChild(detail);

    // Dry grass tufts poking up along the surface.
    const grass = new Graphics();
    for (let i = 0; i < 22; i++) {
      const x = left + rnd() * width;
      const baseY = groundY + 2 + rnd() * 10;
      const blades = 3 + Math.floor(rnd() * 3);
      for (let b = 0; b < blades; b++) {
        const bx = x + (b - blades / 2) * 3;
        const h = 6 + rnd() * 10;
        const lean = (rnd() - 0.5) * 6;
        grass.moveTo(bx, baseY).lineTo(bx + lean, baseY - h);
      }
    }
    grass.stroke({ width: 2, color: COLORS.grass, alpha: 0.85 });
    this.container.addChild(grass);
  }
}

// Tiny seeded PRNG so the scattered detail is stable across reloads.
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
