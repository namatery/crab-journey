import { Container, Graphics } from "pixi.js";
import { COLORS, SCROLL_SPEED } from "./config";

// Everything the crab walks past lives inside this container.
// The crab stays centered; we move the world instead (a simple 2D camera).
export class World {
  container = new Container();

  constructor(groundY: number) {
    // A flat ground line so the world has a floor.
    const ground = new Graphics().rect(-2000, groundY, 8000, 600).fill(COLORS.background);
    this.container.addChild(ground);

    // Temporary markers so you can SEE the world scroll. Delete these later.
    for (let x = -1000; x < 4000; x += 300) {
      const post = new Graphics().rect(x, groundY - 80, 12, 80).fill("#2a3358");
      this.container.addChild(post);
    }
  }

  // direction: +1 = crab moving right (world slides left), -1 = left.
  scroll(direction: number, delta: number) {
    this.container.x -= direction * SCROLL_SPEED * delta;
  }
}
