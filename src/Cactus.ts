import { Assets, Container, Sprite, Texture } from "pixi.js";

// A cactus standing on the ground. Anchored at its base so it rests on the
// horizon line, and scaled by height (preserving the sprite's aspect ratio).
export class Cactus {
  container = new Container();

  static async create(
    x: number,
    groundY: number,
    height = 170,
  ): Promise<Cactus> {
    const texture = await Assets.load("/assets/cactus.png");
    return new Cactus(texture, x, groundY, height);
  }

  private constructor(
    texture: Texture,
    x: number,
    groundY: number,
    height: number,
  ) {
    const sprite = new Sprite(texture);
    sprite.anchor.set(0.5, 1); // bottom-center → feet sit on the ground
    sprite.scale.set(height / texture.height); // same scale on x & y = no distortion
    this.container.addChild(sprite);
    this.container.position.set(x, groundY);
  }
}
