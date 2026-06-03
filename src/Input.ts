// Tracks which keys are currently held down.
// Create one of these, then ask it `input.isDown("d")` anywhere.

export class Input {
  private keys: Record<string, boolean> = {};

  constructor() {
    document.addEventListener("keydown", (ev) => {
      this.keys[ev.key] = true;
    });
    document.addEventListener("keyup", (ev) => {
      this.keys[ev.key] = false;
    });
  }

  isDown(key: string): boolean {
    return this.keys[key] === true;
  }
}
