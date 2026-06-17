import { Container, Graphics } from "pixi.js";
import { COLORS, DESIGN_WIDTH, OVERSCAN } from "../config";

interface Cloud {
  g: Graphics;
  speed: number; // design px per frame at 60fps
}

// A handful of soft pixel clouds drifting across the sky and wrapping around.
export class Clouds {
  container = new Container();
  private clouds: Cloud[] = [];
  private readonly spawnLeft = -OVERSCAN;
  private readonly spawnRight = DESIGN_WIDTH + OVERSCAN;

  constructor() {
    // (x, y, scale, speed) — spread across the sky at different depths/speeds.
    const defs = [
      [150, 90, 1.0, 0.18],
      [620, 150, 0.7, 0.12],
      [980, 70, 1.2, 0.24],
      [1180, 200, 0.6, 0.1],
    ];
    for (const [x, y, scale, speed] of defs) {
      const g = makeCloud(scale);
      g.position.set(x, y);
      g.alpha = 0.92;
      this.container.addChild(g);
      this.clouds.push({ g, speed });
    }
  }

  update(delta: number) {
    for (const c of this.clouds) {
      c.g.x += c.speed * delta;
      if (c.g.x - 120 > this.spawnRight) c.g.x = this.spawnLeft - 120;
    }
  }
}

// A cloud built from a few overlapping blocky puffs — reads as pixel art.
function makeCloud(scale: number): Graphics {
  const g = new Graphics();
  const puffs = [
    [0, 18, 64, 22],
    [22, 6, 46, 26],
    [50, 14, 50, 22],
    [12, 28, 90, 16],
  ];
  for (const [x, y, w, h] of puffs) g.rect(x, y, w, h).fill(COLORS.cloud);
  g.scale.set(scale);
  return g;
}
