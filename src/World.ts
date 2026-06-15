import { Container, Graphics } from "pixi.js";
import { COLORS, DESIGN_HEIGHT, DESIGN_WIDTH, GROUND_LINE_WIDTH } from "./config";

// Everything the crab walks past lives inside this container.
// The crab stays centered; we move the world instead (a simple 2D camera).
export class World {
  container = new Container();

  constructor(groundY: number) {
    // A flat ground so the world has a floor (fills the area below the line).
    const ground = new Graphics()
      .rect(0, groundY, DESIGN_WIDTH, DESIGN_HEIGHT - groundY)
      .fill(COLORS.background);
    this.container.addChild(ground);

    // A white line at the top edge of the ground so the crab reads as standing
    // on a surface instead of floating against the background.
    const groundLine = new Graphics()
      .rect(0, groundY, DESIGN_WIDTH, GROUND_LINE_WIDTH)
      .fill(COLORS.ground);
    this.container.addChild(groundLine);
  }
}
