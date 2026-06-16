import { Container, Graphics } from "pixi.js";
import { MAX_HP, DESIGN_WIDTH } from "./config";

const BAR_W = 420;
const BAR_H = 26;
const MARGIN = 40; // distance from the top and side edges

export class Hud {
  container = new Container();
  private leftBar = new Graphics();
  private rightBar = new Graphics();

  constructor() {
    this.container.addChild(this.leftBar);
    this.container.addChild(this.rightBar);
  }

  // Call every frame with both crabs' hp.
  update(leftHp: number, rightHp: number) {
    this.drawBar(this.leftBar, MARGIN, leftHp, true);
    this.drawBar(this.rightBar, DESIGN_WIDTH - MARGIN - BAR_W, rightHp, false);
  }

  private drawBar(g: Graphics, barX: number, hp: number, drainsRight: boolean) {
    g.clear();

    // background track
    g.rect(barX, MARGIN, BAR_W, BAR_H).fill({ color: 0x000000, alpha: 0.4 });

    // colored fill
    const frac = Math.max(0, hp / MAX_HP);
    const fillW = BAR_W * frac;
    const fillX = drainsRight ? barX + (BAR_W - fillW) : barX;
    g.rect(fillX, MARGIN, fillW, BAR_H).fill(0x00cc66);
  }
}
