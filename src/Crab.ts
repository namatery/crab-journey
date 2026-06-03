import { Container, Sprite, Texture } from "pixi.js";

// The player character. Built from the crab.png texture (loaded in main.ts).
export class Crab {
  container = new Container();

  private sprite: Sprite;
  private bobTime = 0;

  constructor(texture: Texture, x: number, y: number) {
    this.sprite = new Sprite(texture);
    this.sprite.anchor.set(0.5); // pivot from the center, so positioning is easy
    this.sprite.setSize(110); // scale the 640px image down to ~110px

    this.container.addChild(this.sprite);
    this.container.position.set(x, y);
  }

  // Called every frame. `moving` = is the crab walking right now?
  update(delta: number, moving: boolean) {
    if (moving) {
      // Each "step" hops the sprite up a few pixels. abs() keeps it above the
      // ground line (never dips below), so it reads like footsteps.
      this.bobTime += delta * 0.3;
      this.sprite.y = -Math.abs(Math.sin(this.bobTime)) * 8;
    } else {
      // Settle gently back to rest when standing still.
      this.sprite.y += (0 - this.sprite.y) * 0.2;
    }
  }
}
