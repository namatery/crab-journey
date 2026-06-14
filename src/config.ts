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

// How fast the world scrolls past the crab (pixels per frame at 60fps).
export const SCROLL_SPEED = 5;

// Twinkle feel: speed = how fast stars pulse, depth = how much they brighten/dim.
export const TWINKLE_SPEED = 0.05;
export const TWINKLE_DEPTH = 0.2;

// Stars are far away, so they drift slower than the ground (parallax). 0 = static, 1 = same speed as ground.
export const STAR_PARALLAX = 0.3;
