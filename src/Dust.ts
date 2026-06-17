import { Container, Graphics } from "pixi.js";
import { COLORS, DESIGN_WIDTH, GROUND_Y, OVERSCAN } from "./config";

interface Speck {
  x: number;
  y: number;
  vx: number; // blows leftward (wind); design px per frame
  len: number; // streak length
  alpha: number;
}

// Wind-blown sand: thin pale streaks drifting low across the scene, hinting at
// a steady desert breeze. Redrawn into one Graphics each frame (cheap).
export class Dust {
  container = new Container();
  private g = new Graphics();
  private specks: Speck[] = [];
  private readonly left = -OVERSCAN;
  private readonly right = DESIGN_WIDTH + OVERSCAN;
  private readonly top = GROUND_Y - 220;
  private readonly bottom = GROUND_Y + 20;

  constructor(count = 34) {
    this.container.addChild(this.g);
    for (let i = 0; i < count; i++) this.specks.push(this.spawn(true));
  }

  private spawn(anywhere: boolean): Speck {
    return {
      x: anywhere
        ? this.left + Math.random() * (this.right - this.left)
        : this.right + Math.random() * 80,
      y: this.top + Math.random() * (this.bottom - this.top),
      vx: -(1.6 + Math.random() * 2.4),
      len: 5 + Math.random() * 10,
      alpha: 0.25 + Math.random() * 0.4,
    };
  }

  update(delta: number) {
    const g = this.g;
    g.clear();
    for (const s of this.specks) {
      s.x += s.vx * delta;
      s.y += 0.15 * delta; // a gentle downward sink as it blows
      if (s.x + s.len < this.left || s.y > this.bottom) {
        Object.assign(s, this.spawn(false));
      }
      g.rect(s.x, s.y, s.len, 2).fill({ color: COLORS.dust, alpha: s.alpha });
    }
  }
}
