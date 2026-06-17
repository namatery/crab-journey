// The win/lose/draw banner shown once a crab's HP hits zero. It's a DOM overlay
// (like the lobby) so it reuses the same pixel panel styling and the Press Start
// 2P font, sitting on top of the live game canvas.

export type Outcome = "win" | "lose" | "draw";

const TITLES: Record<Outcome, string> = {
  win: "YOU WIN",
  lose: "YOU LOSE",
  draw: "DRAW",
};

const SUBS: Record<Outcome, string> = {
  win: "The desert has its champion.",
  lose: "Your shell rests in the sand.",
  draw: "Both crabs fall as one.",
};

export function showEndScreen(outcome: Outcome) {
  const el = document.getElementById("gameover")!;
  document.getElementById("gameover-title")!.textContent = TITLES[outcome];
  document.getElementById("gameover-sub")!.textContent = SUBS[outcome];

  const btn = document.getElementById("rematch-btn") as HTMLButtonElement;
  btn.onclick = () => location.reload(); // simplest clean restart: re-lobby

  el.classList.remove("hidden");
}
