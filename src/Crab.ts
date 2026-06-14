import { AnimatedSprite, Container } from "pixi.js";
import { buildCrabWalkFrames, type CrabFrames } from "./crabAnimation";

const WALK_SPEED = 0.15; // how fast the legs shuffle through the cycle

// The player character. Its walk cycle is an AnimatedSprite whose frames are
// generated from crab.png at load time (see crabAnimation.ts).
export class Crab {
  container = new Container();

  private sprite: AnimatedSprite;
  private frames: CrabFrames;
  private bobTime = 0;

  // Async because the walk frames are built from the image on demand.
  static async create(url: string, x: number, y: number): Promise<Crab> {
    const frames = await buildCrabWalkFrames(url);
    return new Crab(frames, x, y);
  }

  constructor(frames: CrabFrames, x: number, y: number) {
    this.frames = frames;
    this.sprite = new AnimatedSprite(frames.walk);
    this.sprite.anchor.set(0.5); // pivot from the center, so positioning is easy
    this.sprite.setSize(50); // scale the 640px image down to ~50px
    this.sprite.texture = frames.rest; // start standing still, all legs planted

    this.container.addChild(this.sprite);
    this.container.position.set(x, y);
  }

  // Called every frame. `direction`: 0 = standing, +1 = forward, -1 = backward.
  update(delta: number, direction: number) {
    if (direction !== 0) {
      // Run the leg cycle (reversed when walking backward) and add a small hop
      // so it reads as footsteps. abs() keeps the body above the ground line.
      this.sprite.animationSpeed = WALK_SPEED * Math.sign(direction);
      if (!this.sprite.playing) this.sprite.play();
      this.bobTime += delta * 0.3;
      this.sprite.y = -Math.abs(Math.sin(this.bobTime)) * 8;
    } else {
      // Plant every leg on the ground and settle gently back down.
      if (this.sprite.playing) this.sprite.stop();
      this.sprite.texture = this.frames.rest;
      this.sprite.y += (0 - this.sprite.y) * 0.2;
    }
  }
}
