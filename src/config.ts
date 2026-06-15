// All the "magic numbers" and colors live here, so the mood is tunable in one place.

export const COLORS = {
  background: "#0d0d0e",
  star: "#ffed24",
  crab: "#D97757",
  moon: "#ffffff",
  ground: "#ffffff",
};

// Thickness of the white ground line (px).
export const GROUND_LINE_WIDTH = 1;

export const STAR_COUNT = 60;

// Twinkle feel: speed = how fast stars pulse, depth = how much they brighten/dim.
export const TWINKLE_SPEED = 0.05;
export const TWINKLE_DEPTH = 0.2;

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
