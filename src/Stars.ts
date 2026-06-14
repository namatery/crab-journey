import { Container, Graphics } from "pixi.js";
import {
  COLORS,
  STAR_COUNT,
  TWINKLE_SPEED,
  TWINKLE_DEPTH,
  STAR_PARALLAX,
  SCROLL_SPEED,
} from "./config";

// The night sky. Builds a field of stars and gently twinkles them each frame.
export class Stars {
  container = new Container();

  // gfx = the visible dot, base = its normal brightness, phase = its place in the wave.
  private stars: { gfx: Graphics; base: number; phase: number }[] = [];
  private elapsed = 0;
  private width: number;

  // skyHeight = the bottom of the sky (usually the horizon / groundY).
  constructor(width: number, skyHeight: number) {
    this.width = width;

    for (let i = 0; i < STAR_COUNT; i++) {
      const gfx = new Graphics().circle(0, 0, Math.random() * 2 + 1).fill(COLORS.star);

      // Multiplying two randoms skews the result toward 0 (the top of the sky),
      // so stars cluster up high and thin out toward the horizon.
      const y = Math.random() * Math.random() * skyHeight;
      gfx.position.set(Math.random() * width, y);

      const base = 0.3 + Math.random() * 0.5;
      const phase = Math.random() * Math.PI * 2;

      gfx.alpha = base;
      this.container.addChild(gfx);
      this.stars.push({ gfx, base, phase });
    }
  }

  // Drift the stars when the crab walks. Slower than the ground (parallax),
  // and each star wraps around horizontally so the sky never empties out.
  // direction: +1 = crab moving right (sky slides left), -1 = left.
  scroll(direction: number, delta: number) {
    const dx = direction * SCROLL_SPEED * STAR_PARALLAX * delta;
    for (const star of this.stars) {
      star.gfx.x -= dx;
      if (star.gfx.x < 0) star.gfx.x += this.width;
      else if (star.gfx.x >= this.width) star.gfx.x -= this.width;
    }
  }

  update(delta: number) {
    this.elapsed += delta * TWINKLE_SPEED;
    for (const star of this.stars) {
      star.gfx.alpha = star.base + Math.sin(this.elapsed + star.phase) * TWINKLE_DEPTH;
    }
  }
}
