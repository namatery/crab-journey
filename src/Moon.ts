import { Container, Graphics } from "pixi.js";
import { COLORS } from "./config";

// A crescent moon. Trick: draw the full lit disc, then overlay an offset
// circle in the sky color to "bite" a crescent shape out of it.
export class Moon {
  container = new Container();

  constructor(x: number, y: number, radius = 45) {
    const disc = new Graphics().circle(0, 0, radius).fill(COLORS.moon);

    // The "shadow": an offset circle in the sky color that carves the crescent.
    // Move it right/up and shrink it slightly to leave a sliver on the left.
    const shadow = new Graphics()
      .circle(radius * 0.55, -radius * 0.18, radius * 0.92)
      .fill(COLORS.background);

    this.container.addChild(disc, shadow);
    this.container.position.set(x, y);
  }
}
