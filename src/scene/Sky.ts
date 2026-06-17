import { Container, Graphics } from "pixi.js";
import { COLORS, DESIGN_WIDTH, GROUND_Y, OVERSCAN } from "../config";

// The far background: a banded sky gradient (deeper blue up high, hazy pale at
// the horizon) with a couple of distant dune ridges peeking over the skyline.
// Everything here is static — depth, not motion.
export class Sky {
  container = new Container();

  constructor() {
    const left = -OVERSCAN;
    const width = DESIGN_WIDTH + OVERSCAN * 2;

    // --- Banded gradient sky ---------------------------------------------
    // A handful of solid bands instead of a smooth ramp keeps the retro feel.
    const BANDS = 9;
    const top = -OVERSCAN;
    const skyHeight = GROUND_Y - top;
    const sky = new Graphics();
    for (let i = 0; i < BANDS; i++) {
      const t = i / (BANDS - 1);
      const y = top + (skyHeight * i) / BANDS;
      const h = skyHeight / BANDS + 1; // +1 so bands overlap (no seams)
      sky
        .rect(left, y, width, h)
        .fill(lerpHex(COLORS.skyTop, COLORS.skyHorizon, t));
    }
    this.container.addChild(sky);

    // --- Distant dunes ----------------------------------------------------
    // Two ridges of rolling hills. Their bases sit below the horizon (the
    // foreground ground draws over them), so only the crests show.
    this.container.addChild(
      makeDunes(left, width, COLORS.duneFar, GROUND_Y - 70, 26, 540, 0.6),
    );
    this.container.addChild(
      makeDunes(left, width, COLORS.duneNear, GROUND_Y - 42, 34, 360, 2.1),
    );
  }
}

// A filled hill silhouette: a wavy top edge dropping to a flat base that the
// foreground ground will cover. Two summed sines give it a natural roll.
function makeDunes(
  left: number,
  width: number,
  color: string,
  crest: number,
  amp: number,
  wavelength: number,
  phase: number,
): Graphics {
  const g = new Graphics();
  const base = GROUND_Y + 60; // well below the horizon, hidden by the ground
  g.moveTo(left, base);
  for (let x = left; x <= left + width; x += 10) {
    const k = (x / wavelength) * Math.PI * 2;
    const y =
      crest -
      amp * (0.5 + 0.5 * Math.sin(k + phase)) -
      amp * 0.25 * Math.sin(k * 0.5);
    g.lineTo(x, y);
  }
  g.lineTo(left + width, base);
  g.closePath();
  g.fill(color);
  return g;
}

// Linear-interpolate between two "#rrggbb" colors, returning a 0xRRGGBB number.
function lerpHex(a: string, b: string, t: number): number {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const lerp = (x: number, y: number) => Math.round(x + (y - x) * t);
  const r = lerp((pa >> 16) & 255, (pb >> 16) & 255);
  const g = lerp((pa >> 8) & 255, (pb >> 8) & 255);
  const bl = lerp(pa & 255, pb & 255);
  return (r << 16) | (g << 8) | bl;
}
