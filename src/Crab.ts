import { AnimatedSprite, Container, Graphics } from "pixi.js";
import { buildCrabWalkFrames, type CrabFrames } from "./crabAnimation";
import { ARENA_MARGIN, COLORS, CRAB_SIZE, DESIGN_WIDTH, MAX_HP, MOVE_SPEED, WHIP_ACTIVE, WHIP_COOLDOWN, WHIP_REACH, WHIP_RECOVER, WHIP_WINDUP } from "./config";

const WALK_SPEED = 0.15; // how fast the legs shuffle through the cycle
const WHIP_TOTAL = WHIP_WINDUP + WHIP_ACTIVE + WHIP_RECOVER;
export interface Rect { x: number; y: number; w: number; h: number; }


// The player character. Its walk cycle is an AnimatedSprite whose frames are
// generated from crab.png at load time (see crabAnimation.ts).
export class Crab {
  container = new Container();
  x: number;
  y: number;
  facing: number;

  private whipGfx: Graphics;
  private whipFrame = -1; // -1 means idle; 0..TOTAL means mid-swing.
  private cooldown = 0;
  hp = MAX_HP;
  private hitDone = false;

  private sprite: AnimatedSprite;
  private frames: CrabFrames;
  private bobTime = 0;
  private moving = 0;   // -1 / 0 / +1

  static async create(url: string, x: number, y: number, facing = 1): Promise<Crab> {
    const frames = await buildCrabWalkFrames(url);
    return new Crab(frames, x, y, facing);
  }

  constructor(frames: CrabFrames, x: number, y: number, facing = 1) {
    this.frames = frames;
    this.x = x;
    this.y = y;
    this.whipGfx = new Graphics();
    this.sprite = new AnimatedSprite(frames.walk);
    this.sprite.anchor.set(0.5);
    this.sprite.setSize(CRAB_SIZE); 
    this.sprite.texture = frames.rest;

    this.container.addChild(this.sprite);
    this.container.addChild(this.whipGfx);
    this.container.position.set(x, y);
    this.facing = facing;
  }

  setMove(dir: number) {
    this.moving = dir;
  }

  attack() {
    if (this.whipFrame < 0 && this.cooldown <= 0) {
      this.whipFrame = 0;
      this.hitDone = false;
    }
  }

  body(): Rect {
    const w = CRAB_SIZE * 0.7;
    const h = CRAB_SIZE * 0.9;
    return { x: this.x - w / 2, y: this.y - h / 2, w, h };
  }

  whipBox(): Rect {
    const near = CRAB_SIZE * 0.3;
    const far = near + WHIP_REACH;
    const h = CRAB_SIZE * 0.8;
    const x = this.facing >= 0 ? this.x + near : this.x - far;
    return { x, y: this.y - h / 2, w: far - near, h };
  }

  whipActive(): boolean {
    return (
      this.whipFrame >= WHIP_WINDUP &&
      this.whipFrame < WHIP_WINDUP + WHIP_ACTIVE &&
      !this.hitDone
    );
  }

  markHit() {
    this.hitDone = true;
  }

  hit(damage: number) {
    this.hp = Math.max(0, this.hp - damage);
  }


  // Called every frame. `direction`: 0 = standing, +1 = forward, -1 = backward.
  update(delta: number) {
    if (this.moving != 0) {
      this.x += this.moving * MOVE_SPEED * delta;
      this.x = Math.max(ARENA_MARGIN, Math.min(DESIGN_WIDTH - ARENA_MARGIN, this.x));
    }

    if (this.whipFrame >= 0) {
      this.whipFrame += delta;
      if (this.whipFrame >= WHIP_TOTAL) {
        this.whipFrame = -1;
        this.cooldown = WHIP_COOLDOWN;
      }
    } else if (this.cooldown > 0) {
      this.cooldown -= delta;
    }


    if (this.moving != 0) {
      this.facing = Math.sign(this.moving);
    }

    const mag = Math.abs(this.sprite.scale.x);
    this.sprite.scale.x = mag * (this.facing >= 0 ? 1 : -1);

    if (this.moving !== 0) {
      this.sprite.animationSpeed = WALK_SPEED;
      if (!this.sprite.playing) this.sprite.play();
      this.bobTime += delta * 0.3;
      this.sprite.y = -Math.abs(Math.sin(this.bobTime)) * 8;
    } else {
      if (this.sprite.playing) this.sprite.stop();
      this.sprite.texture = this.frames.rest;
      this.sprite.y += (0 - this.sprite.y) * 0.2;
    }

    this.container.position.set(this.x, this.y);
    this.drawWhip(this.whipExtension());
  }

  private whipExtension(): number {
    const f = this.whipFrame;
    if (f < 0) return 0;                                       // idle: no lash
    if (f < WHIP_WINDUP) return f / WHIP_WINDUP;               // 0→1: shooting out
    if (f < WHIP_WINDUP + WHIP_ACTIVE) return 1;               // hold: fully cracked
    const r = (f - WHIP_WINDUP - WHIP_ACTIVE) / WHIP_RECOVER;  // 0→1 across recover
    return 1 - r;                                              // 1→0: retracting
  }

  private drawWhip(extend: number) {
    const g = this.whipGfx;
    g.clear();                     // erase last frame
    if (extend <= 0.02) return;    // idle / fully retracted → draw nothing

    const dir = this.facing >= 0 ? 1 : -1;      // which way the crab faces
    const startX = dir * CRAB_SIZE * 0.34;      // start just past the body edge
    const tipX = startX + dir * WHIP_REACH * extend;  // tip = reach × how-extended
     
    g.moveTo(startX, 0)            // pen at the crab's front
     .lineTo(tipX, 0)             // drag out to the tip
     .stroke({ width: 3, color: COLORS.crab, cap: "round" });
  }

}
