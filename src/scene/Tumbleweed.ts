import { Container, Graphics } from "pixi.js";
import { COLORS, DESIGN_WIDTH, GROUND_Y, OVERSCAN } from "../config";

// A tumbleweed that rolls across the arena every so often: it waits offscreen,
// then trundles across the sand spinning and bouncing, then waits again.
export class Tumbleweed {
  container = new Container();
  private ball = new Graphics();
  private radius = 26;

  private wait = 120; // frames until the first roll
  private rolling = false;
  private vx = 0;
  private hopPhase = 0;

  constructor() {
    drawWeed(this.ball, this.radius);
    this.ball.visible = false;
    this.container.addChild(this.ball);
  }

  private launch() {
    this.rolling = true;
    this.ball.visible = true;
    const fromLeft = Math.random() < 0.5;
    this.vx = (3.2 + Math.random() * 1.8) * (fromLeft ? 1 : -1);
    this.ball.x = fromLeft
      ? -OVERSCAN + this.radius
      : DESIGN_WIDTH + OVERSCAN - this.radius;
    this.hopPhase = 0;
  }

  update(delta: number) {
    if (!this.rolling) {
      this.wait -= delta;
      if (this.wait <= 0) this.launch();
      return;
    }

    this.ball.x += this.vx * delta;
    this.ball.rotation += (this.vx / this.radius) * delta; // roll matches travel
    this.hopPhase += Math.abs(this.vx / this.radius) * delta;

    // Bounce: rest the weed on the sand and lift it on each little hop.
    const hop = Math.abs(Math.sin(this.hopPhase)) * 22;
    this.ball.y = GROUND_Y - this.radius - hop;

    const offLeft = this.vx < 0 && this.ball.x < -OVERSCAN - this.radius;
    const offRight =
      this.vx > 0 && this.ball.x > DESIGN_WIDTH + OVERSCAN + this.radius;
    if (offLeft || offRight) {
      this.rolling = false;
      this.ball.visible = false;
      this.wait = 360 + Math.random() * 540; // 6–15s between rolls at 60fps
    }
  }
}

// A scruffy ball of dry twigs: a ring plus a few crossing strokes.
function drawWeed(g: Graphics, r: number) {
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI;
    const jx = Math.cos(a) * r;
    const jy = Math.sin(a) * r;
    g.moveTo(-jx, -jy).lineTo(jx, jy);
  }
  g.stroke({ width: 2.5, color: COLORS.tumbleweed }); // the crossing twigs
  g.circle(0, 0, r).stroke({ width: 3, color: COLORS.tumbleweed });
  g.circle(0, 0, r * 0.62).stroke({
    width: 2,
    color: COLORS.tumbleweed,
    alpha: 0.8,
  });
}
