import { Container, Graphics } from "pixi.js";
import { COLORS, GROUND_LINE_WIDTH, SCROLL_SPEED } from "./config";

// Everything the crab walks past lives inside this container.
// The crab stays centered; we move the world instead (a simple 2D camera).
export class World {
  container = new Container();

  constructor(groundY: number) {
    // A flat ground so the world has a floor (fills the area below the line).
    const ground = new Graphics().rect(-2000, groundY, 8000, 600).fill(COLORS.background);
    this.container.addChild(ground);

    // A white line at the top edge of the ground so the crab reads as standing
    // on a surface instead of floating against the background.
    const groundLine = new Graphics()
      .rect(-2000, groundY, 8000, GROUND_LINE_WIDTH)
      .fill(COLORS.ground);
    this.container.addChild(groundLine);

    // Temporary markers so you can SEE the world scroll. Delete these later.
    // for (let x = -1000; x < 4000; x += 300) {
    //   const post = new Graphics().rect(x, groundY - 80, 12, 80).fill("#2a3358");
    //   this.container.addChild(post);
    // }
  }

  // direction: +1 = crab moving right (world slides left), -1 = left.
  scroll(direction: number, delta: number) {
    this.container.x -= direction * SCROLL_SPEED * delta;
  }
}
