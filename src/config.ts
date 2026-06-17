// All the "magic numbers" and colors live here, so the mood is tunable in one place.

export const COLORS = {
  sky: "#8ecae6", // daytime desert sky (the app background)
  skyTop: "#5aa6d2", // deeper blue at the top of the sky gradient
  skyHorizon: "#c6e6f1", // pale, hazy band where the sky meets the land
  sand: "#e3c184", // sun-baked ground
  sandTop: "#ecd198", // lighter, sun-bleached strip just below the horizon
  sandDeep: "#d3ad63", // a deeper band lower in the ground for depth
  sandShadow: "#caa25c", // a darker band right at the horizon
  duneFar: "#dcccA4", // distant dunes, hazed toward the sky color
  duneNear: "#cdb583", // nearer dunes, a touch warmer/darker
  cloud: "#fbfcff", // drifting pixel clouds
  dust: "#efe2c4", // wind-blown sand specks
  pebble: "#b88f54", // little stones scattered on the ground
  grass: "#9fa857", // dry, khaki desert grass tufts
  tumbleweed: "#a97c46", // the rolling tumbleweed
  sun: "#ffd23f", // square pixel sun (body)
  sunLight: "#ffe98a", // sunlit top band / glow
  sunDeep: "#f4a72e", // sun rays + shaded edge
  crab: "#d97757", // legacy terracotta (fallback / whip default)
  crabHost: "#ff5a3c", // host crab — vivid coral red
  crabGuest: "#ff5a3c", // guest crab — lively teal
  whipCord: "#6f4423", // braided leather whip cord
  whipHandle: "#3f2817", // dark wooden grip the crab holds
  whipHi: "#a9712f", // lit sheen running down the cord
  whipCrack: "#fff4d6", // little snap-spark at the tip on the strike
};

// Scenery is laid out in the fixed design space and then scaled to the window.
// We draw the sky and ground OVERSIZED by this much past the design box so the
// letterbox bars (on aspect ratios that aren't 16:9) still read as sky/sand.
export const OVERSCAN = 800;

// --- Duel arena ---------------------------------------------------------
// The whole game is laid out in this fixed "design" resolution and then scaled
// to fit the window. Both players share this coordinate space, so a crab's x
// means the same thing on both screens no matter how big each window is.
export const DESIGN_WIDTH = 1280;
export const DESIGN_HEIGHT = 720;
export const GROUND_Y = 600; // the horizon line, in design pixels

export const CRAB_SIZE = 64; // on-screen size of a crab (px)
export const MOVE_SPEED = 4.2; // walk speed (design px per frame at 60fps)
export const ARENA_MARGIN = 60; // crabs can't walk past this from either edge

// --- Combat -------------------------------------------------------------
export const MAX_HP = 100;
export const WHIP_DAMAGE = 9; // ~11 clean hits to win

// The whiplash is a quick directional crack: a short wind-up, a brief window
// where it can actually hit, then a retract, then a cooldown before the next.
export const WHIP_REACH = 130; // how far the whip reaches past the crab (px)
export const WHIP_WINDUP = 5; // frames before the hitbox goes live
export const WHIP_ACTIVE = 6; // frames the hitbox is live
export const WHIP_RECOVER = 9; // frames to retract
export const WHIP_COOLDOWN = 22; // frames you must wait before whipping again

export const KNOCKBACK = 16; // initial shove when hit (px per frame)
export const KNOCKBACK_DECAY = 0.82; // how fast the shove bleeds off
export const HIT_FLASH = 10; // frames a crab flashes after taking a hit
