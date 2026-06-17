import { Container, Graphics } from "pixi.js";
import { COLORS } from "./config";

// A blocky, square pixel-art sun — drawn entirely in code (no texture asset).
// A solid square body with a sunlit top band and a corner glint for life, a
// shaded bottom edge, and eight little square rays so it still reads as a sun.
export class Sun {
  container = new Container();

  constructor(x: number, y: number, size = 140) {
    const g = new Graphics();
    const h = size / 2;

    // Eight square rays radiating from the body (drawn first, behind it).
    const ray = size * 0.17;
    const reach = h + size * 0.16;
    const dirs = [
      [0, -1],
      [1, 0],
      [0, 1],
      [-1, 0],
      [1, -1],
      [1, 1],
      [-1, 1],
      [-1, -1],
    ];
    for (const [dx, dy] of dirs) {
      const f = dx !== 0 && dy !== 0 ? 0.72 : 1; // pull diagonals in a touch
      g.rect(dx * reach * f - ray / 2, dy * reach * f - ray / 2, ray, ray).fill(
        COLORS.sunDeep,
      );
    }

    // Square body.
    g.rect(-h, -h, size, size).fill(COLORS.sun);
    // Sunlit top band.
    g.rect(-h, -h, size, size * 0.4).fill(COLORS.sunLight);
    // Shaded bottom edge so it doesn't read as flat.
    g.rect(-h, h - size * 0.13, size, size * 0.13).fill(COLORS.sunDeep);
    // Bright corner glint.
    g.rect(-h + size * 0.13, -h + size * 0.13, size * 0.2, size * 0.2).fill(
      "#fffbe0",
    );

    this.container.addChild(g);
    this.container.position.set(x, y);
  }
}
