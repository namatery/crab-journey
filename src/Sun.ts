import { Assets, Container, Sprite, Texture } from "pixi.js";

// A pixel-art sun hanging in the sky. Just a loaded sprite, scaled + placed.
export class Sun {
  container = new Container();

  static async create(x: number, y: number, size = 150): Promise<Sun> {
    const texture = await Assets.load("/assets/sun.png");
    return new Sun(texture, x, y, size);
  }

  private constructor(texture: Texture, x: number, y: number, size: number) {
    const sprite = new Sprite(texture);
    sprite.anchor.set(0.5); // center the disc on (x, y)
    sprite.width = size;
    sprite.height = size;
    this.container.addChild(sprite);
    this.container.position.set(x, y);
  }
}
