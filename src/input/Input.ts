// Tracks which keys are currently held down.
// Create one of these, then ask it `input.isDown("d")` anywhere.

export class Input {
  private keys: Record<string, boolean> = {};
  private pressed: Set<string> = new Set();

  constructor() {
    document.addEventListener("keydown", (ev) => {
      if (!this.keys[ev.key]) this.pressed.add(ev.key);
      this.keys[ev.key] = true;
    });
    document.addEventListener("keyup", (ev) => {
      this.keys[ev.key] = false;
    });
  }

  isDown(key: string): boolean {
    return this.keys[key] === true;
  }

  justPressed(key: string): boolean {
    if (this.pressed.has(key)) {
      this.pressed.delete(key);
      return true;
    }
    return false;
  }
}
