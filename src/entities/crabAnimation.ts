import { Texture } from "pixi.js";

// Builds a walk-cycle "sprite sheet" out of the single crab.png.
//
// We only have one drawn pose, so instead of asking an artist for frames we
// generate them: detect where the legs are, then redraw each leg through a
// stride (lift + horizontal sweep) per frame. Cycling through the resulting
// textures with an AnimatedSprite reads as a crab walking; playing the cycle in
// reverse reads as walking the other way.
//
// All the work happens on an offscreen <canvas> at load time, so there are no
// extra image files or build steps — just textures handed to the Crab.

interface Leg {
  x0: number; // left edge of this leg (source pixels)
  x1: number; // right edge (exclusive)
}

export interface CrabFrames {
  walk: Texture[]; // the looping stride
  rest: Texture; // all legs planted (shown when standing still)
}

export async function buildCrabWalkFrames(
  url: string,
  frameCount = 8,
  color?: string,
): Promise<CrabFrames> {
  const bitmap = await createImageBitmap(await (await fetch(url)).blob());
  const w = bitmap.width;
  const h = bitmap.height;

  // Draw the source once so we can read its pixels and copy regions out of it.
  const src = document.createElement("canvas");
  src.width = w;
  src.height = h;
  const sctx = src.getContext("2d")!;
  sctx.drawImage(bitmap, 0, 0);
  const { data } = sctx.getImageData(0, 0, w, h);

  const solid = (x: number, y: number) => data[(y * w + x) * 4 + 3] > 128;

  // --- Find the "hip line": where the body ends and the legs begin. ---
  // The body is the widest part; legs are a few thin columns below it. Walk
  // down the rows and call it the hip once a row's filled width collapses.
  let maxWidth = 0;
  const rowWidth: number[] = [];
  for (let y = 0; y < h; y++) {
    let count = 0;
    for (let x = 0; x < w; x++) if (solid(x, y)) count++;
    rowWidth[y] = count;
    if (count > maxWidth) maxWidth = count;
  }

  let hipY = 0;
  let legsBottom = 0;
  for (let y = 0; y < h; y++) {
    if (rowWidth[y] > maxWidth * 0.5) hipY = y; // still body-width → still body
    if (rowWidth[y] > 0) legsBottom = y; // last row with any pixel → foot tips
  }
  const legBandTop = hipY + 1;
  const legBandH = legsBottom - hipY;

  // --- Recolor the (flat) crab into a livelier tone --------------------
  // The art is a single solid color, so a tint could only darken it. Instead
  // we repaint every opaque pixel to `color`, shaded from a bright top to a
  // darker belly so the crab reads as rounded rather than a flat cut-out.
  if (color) {
    let contentTop = 0;
    for (let y = 0; y < h; y++)
      if (rowWidth[y] > 0) {
        contentTop = y;
        break;
      }
    const [br, bg, bb] = hexToRgb(color);
    const span = Math.max(1, legsBottom - contentTop);
    const img = sctx.getImageData(0, 0, w, h);
    const px = img.data;
    for (let y = 0; y < h; y++) {
      const t = (y - contentTop) / span; // 0 at the top of the crab, 1 at feet
      const shade = 1.18 - 0.46 * Math.min(1, Math.max(0, t));
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        if (px[i + 3] > 0) {
          px[i] = clamp8(br * shade);
          px[i + 1] = clamp8(bg * shade);
          px[i + 2] = clamp8(bb * shade);
        }
      }
    }
    sctx.putImageData(img, 0, 0);
  }

  // --- Split the leg band into individual legs (contiguous column runs). ---
  const legs: Leg[] = [];
  let runStart = -1;
  for (let x = 0; x <= w; x++) {
    let hasPixel = false;
    if (x < w) {
      for (let y = legBandTop; y <= legsBottom; y++) {
        if (solid(x, y)) {
          hasPixel = true;
          break;
        }
      }
    }
    if (hasPixel && runStart === -1) runStart = x;
    else if (!hasPixel && runStart !== -1) {
      legs.push({ x0: runStart, x1: x });
      runStart = -1;
    }
  }

  // Stride dimensions, in source pixels.
  const lift = Math.round(legBandH * 0.7); // how high a foot rises mid-step
  const stride = Math.round(legBandH * 0.4); // how far a foot sweeps front/back

  // Compose one frame: body unchanged, each leg offset by (dx, dy).
  const compose = (
    offset: (legIndex: number) => { dx: number; dy: number },
  ) => {
    const frame = document.createElement("canvas");
    frame.width = w;
    frame.height = h;
    const fctx = frame.getContext("2d")!;

    // Everything above the hip (body, eyes, claws) is unchanged.
    fctx.drawImage(src, 0, 0, w, legBandTop, 0, 0, w, legBandTop);

    legs.forEach((leg, j) => {
      const { dx, dy } = offset(j);
      const legW = leg.x1 - leg.x0;
      fctx.drawImage(
        src,
        leg.x0,
        legBandTop,
        legW,
        legBandH, // source: this leg
        leg.x0 + dx,
        legBandTop + dy,
        legW,
        legBandH, // dest: swept + lifted
      );
    });

    return Texture.from(frame);
  };

  // Rest pose: every leg in its original spot, planted on the ground.
  const rest = compose(() => ({ dx: 0, dy: 0 }));

  // Walk cycle. Each leg traces a stride: planted feet drag backward to propel
  // the body forward, then lift and swing forward to reset. Staggering the
  // phase across legs makes the steps ripple along the body like a real crab.
  const walk: Texture[] = [];
  for (let i = 0; i < frameCount; i++) {
    const base = (i / frameCount) * Math.PI * 2;
    walk.push(
      compose((j) => {
        const theta = base + (j / legs.length) * Math.PI * 2;
        return {
          dx: Math.round(-stride * Math.cos(theta)),
          dy: -Math.round(lift * Math.max(0, Math.sin(theta))),
        };
      }),
    );
  }

  return { walk, rest };
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const clamp8 = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
