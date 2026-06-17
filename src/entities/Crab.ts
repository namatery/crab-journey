import { AnimatedSprite, Container, Graphics } from "pixi.js";
import { buildCrabWalkFrames, type CrabFrames } from "./crabAnimation";
import {
  ARENA_MARGIN,
  COLORS,
  CRAB_SIZE,
  DESIGN_WIDTH,
  HIT_FLASH,
  KNOCKBACK,
  KNOCKBACK_DECAY,
  MAX_HP,
  MOVE_SPEED,
  WHIP_ACTIVE,
  WHIP_COOLDOWN,
  WHIP_REACH,
  WHIP_RECOVER,
  WHIP_WINDUP,
} from "../config";

const WALK_SPEED = 0.15; // how fast the legs shuffle through the cycle
const WHIP_TOTAL = WHIP_WINDUP + WHIP_ACTIVE + WHIP_RECOVER;
export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface CrabState {
  x: number;
  facing: number;
  moving: number;
  whipFrame: number;
  hp: number;
  flash: number;
}

// The player character. Its walk cycle is an AnimatedSprite whose frames are
// generated from crab.png at load time (see crabAnimation.ts).
export class Crab {
  container = new Container();
  x: number;
  y: number;
  facing: number;
  isLocal = true;
  color: string;

  private whipGfx: Graphics;
  private whipFrame = -1; // -1 means idle; 0..TOTAL means mid-swing.
  private cooldown = 0;
  hp = MAX_HP;
  private hitDone = false;

  private sprite: AnimatedSprite;
  private frames: CrabFrames;
  private bobTime = 0;
  private moving = 0; // -1 / 0 / +1

  private knockbackVx = 0; // sideways shove velocity, decays to 0
  private flash = 0; // frames of red tint remaining

  static async create(
    url: string,
    x: number,
    y: number,
    facing = 1,
    color = COLORS.crab,
  ): Promise<Crab> {
    const frames = await buildCrabWalkFrames(url, 8, color);
    return new Crab(frames, x, y, facing, color);
  }

  constructor(
    frames: CrabFrames,
    x: number,
    y: number,
    facing = 1,
    color = COLORS.crab,
  ) {
    this.frames = frames;
    this.x = x;
    this.y = y;
    this.color = color;
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

  hit(damage: number, fromDir: number) {
    this.hp = Math.max(0, this.hp - damage);
    this.knockbackVx = KNOCKBACK * fromDir;
    this.flash = HIT_FLASH;
  }

  netState(): CrabState {
    return {
      x: this.x,
      facing: this.facing,
      moving: this.moving,
      whipFrame: this.whipFrame,
      hp: this.hp,
      flash: this.flash,
    };
  }

  applyState(s: CrabState) {
    this.x = s.x;
    this.facing = s.facing;
    this.moving = s.moving;
    this.whipFrame = s.whipFrame;
    this.hp = s.hp;
    this.flash = s.flash;
  }

  // Called every frame. `delta` is the frame time scale (1 at 60fps).
  update(delta: number) {
    // --- Simulation: only the crab's OWNER runs this. The remote crab's
    // position/whip/flash come straight from applyState() over the network. ---
    if (this.isLocal) {
      if (this.moving != 0) {
        this.x += this.moving * MOVE_SPEED * delta; // walk
      }
      this.x += this.knockbackVx * delta; // the shove
      this.knockbackVx *= KNOCKBACK_DECAY; // bleed it off each frame
      this.x = Math.max(
        ARENA_MARGIN,
        Math.min(DESIGN_WIDTH - ARENA_MARGIN, this.x),
      );

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

      if (this.flash > 0) this.flash -= delta;
    }

    // --- Render: BOTH crabs run this, using current x / facing / moving / whipFrame / flash. ---
    this.sprite.tint = this.flash > 0 ? 0xff5555 : 0xffffff;

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
    this.drawWhip();
  }

  // The whip's pose for the current frame: the tip's direction (`angle`, radians
  // from "forward", positive = up), how far it reaches (`len`), how much the cord
  // bows to one side (`curl`, the lashing arc), and `crack` — the snap intensity
  // at the tip during the strike. The cord is held up-and-back at rest, cocks
  // further back on the wind-up, then whips forward and down on the active frames
  // (the crack), and finally settles back to rest as it recovers.
  private whipPose(): {
    angle: number;
    len: number;
    curl: number;
    crack: number;
  } {
    const f = this.whipFrame;
    const R = WHIP_REACH;
    const REST_A = (118 * Math.PI) / 180,
      REST_L = R * 0.42;
    const COCK_A = (152 * Math.PI) / 180,
      COCK_L = R * 0.58;
    const STRK_A = (-7 * Math.PI) / 180,
      STRK_L = R;
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const smooth = (t: number) => t * t * (3 - 2 * t);

    if (f < 0) {
      // Idle: coiled, resting up over the shoulder — the crab just holds it.
      return { angle: REST_A, len: REST_L, curl: 0.32, crack: 0 };
    }
    if (f < WHIP_WINDUP) {
      const t = smooth(f / WHIP_WINDUP);
      return {
        angle: lerp(REST_A, COCK_A, t),
        len: lerp(REST_L, COCK_L, t),
        curl: lerp(0.32, 0.5, t), // bow further back as it cocks
        crack: 0,
      };
    }
    if (f < WHIP_WINDUP + WHIP_ACTIVE) {
      const t = (f - WHIP_WINDUP) / WHIP_ACTIVE;
      const e = t * (2 - t); // ease-out: a fast snap that settles forward
      return {
        angle: lerp(COCK_A, STRK_A, e),
        len: lerp(COCK_L, STRK_L, e),
        curl: lerp(0.5, -0.22, e), // arc flips: over the top, then crack down
        crack: Math.max(0, 1 - Math.abs(t - 0.75) / 0.25), // peaks late
      };
    }
    const t = smooth((f - WHIP_WINDUP - WHIP_ACTIVE) / WHIP_RECOVER);
    return {
      angle: lerp(STRK_A, REST_A, t),
      len: lerp(STRK_L, REST_L, t),
      curl: lerp(-0.22, 0.32, t),
      crack: 0,
    };
  }

  private drawWhip() {
    const g = this.whipGfx;
    g.clear(); // erase last frame

    const dir = this.facing >= 0 ? 1 : -1; // which way the crab faces
    const { angle, len, curl, crack } = this.whipPose();

    // Work in "forward space" (x = distance in front of the crab, y = screen
    // down) and mirror x by `dir` when emitting points, so the whole whip just
    // follows the facing. The hand sits just past the body edge, up in the claw.
    const hf = CRAB_SIZE * 0.3;
    const hy = -CRAB_SIZE * 0.06;
    const tx = hf + len * Math.cos(angle);
    const ty = hy - len * Math.sin(angle);

    // Quadratic bezier from hand to tip, bowed sideways by `curl` so the cord
    // reads as a flexible lash rather than a stick.
    const mx = (hf + tx) / 2;
    const my = (hy + ty) / 2;
    let dx = tx - hf,
      dy = ty - hy;
    const dm = Math.hypot(dx, dy) || 1;
    dx /= dm;
    dy /= dm;
    const cx = mx + dy * curl * len; // push the control point along the normal
    const cy = my - dx * curl * len;

    const N = 16;
    const cen: { x: number; y: number }[] = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const u = 1 - t;
      const fx = u * u * hf + 2 * u * t * cx + t * t * tx;
      const fy = u * u * hy + 2 * u * t * cy + t * t * ty;
      cen.push({ x: dir * fx, y: fy });
    }

    // Turn the centerline into a tapered ribbon: thick at the grip, hair-thin at
    // the popper. Offset each point along its local normal by half the width.
    const HANDLE_W = 6;
    const leftPts: number[] = [];
    const rightPts: { x: number; y: number }[] = [];
    for (let i = 0; i <= N; i++) {
      const a = cen[Math.max(0, i - 1)];
      const b = cen[Math.min(N, i + 1)];
      let ux = b.x - a.x,
        uy = b.y - a.y;
      const m = Math.hypot(ux, uy) || 1;
      ux /= m;
      uy /= m;
      const half = (HANDLE_W * (1 - i / N) + 0.8) / 2;
      leftPts.push(cen[i].x - uy * half, cen[i].y + ux * half);
      rightPts.push({ x: cen[i].x + uy * half, y: cen[i].y - ux * half });
    }
    const poly = leftPts.slice();
    for (let i = rightPts.length - 1; i >= 0; i--) {
      poly.push(rightPts[i].x, rightPts[i].y);
    }
    g.poly(poly).fill(COLORS.whipCord);

    // A thin sheen down the cord for a little leather shine.
    g.moveTo(cen[0].x, cen[0].y);
    for (let i = 1; i <= N; i++) g.lineTo(cen[i].x, cen[i].y);
    g.stroke({ width: 1.4, color: COLORS.whipHi, cap: "round", alpha: 0.85 });

    // The grip: a short, fat handle the crab holds, butting back from the hand
    // along the cord's base direction, with a band in the crab's own colour.
    const hx = dir * hf;
    let bx = cen[1].x - cen[0].x,
      by = cen[1].y - cen[0].y;
    const bm = Math.hypot(bx, by) || 1;
    bx /= bm;
    by /= bm;
    const grip = CRAB_SIZE * 0.17;
    g.moveTo(hx - bx * grip, hy - by * grip)
      .lineTo(hx, hy)
      .stroke({ width: 7, color: COLORS.whipHandle, cap: "round" });
    g.moveTo(hx, hy)
      .lineTo(hx + bx * 5, hy + by * 5)
      .stroke({ width: 7, color: this.color, cap: "round" }); // identity band

    // A bright little snap-spark at the popper on the active crack frames.
    if (crack > 0.35) {
      const tip = cen[N];
      let tdx = cen[N].x - cen[N - 1].x,
        tdy = cen[N].y - cen[N - 1].y;
      const tm = Math.hypot(tdx, tdy) || 1;
      tdx /= tm;
      tdy /= tm;
      for (const a of [-0.6, 0, 0.6]) {
        const ca = Math.cos(a),
          sa = Math.sin(a);
        const rx = tdx * ca - tdy * sa;
        const ry = tdx * sa + tdy * ca;
        const reach = 5 + crack * 6;
        g.moveTo(tip.x, tip.y)
          .lineTo(tip.x + rx * reach, tip.y + ry * reach)
          .stroke({ width: 1.6, color: COLORS.whipCrack, alpha: crack });
      }
    }
  }
}
