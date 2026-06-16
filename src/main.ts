import { Application, Container, Graphics, TextureSource } from "pixi.js";
import {
  COLORS,
  CRAB_SIZE,
  DESIGN_HEIGHT,
  DESIGN_WIDTH,
  GROUND_Y,
  WHIP_DAMAGE,
} from "./config";
import { Input } from "./Input";
import { World } from "./World";
import { Sun } from "./Sun";
import { Cactus } from "./Cactus";
import { Crab, type Rect, type CrabState } from "./Crab";
import { Hud } from "./Hud";
import { showLobby } from "./lobby";

TextureSource.defaultOptions.scaleMode = "nearest";

function overlap(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
  );
}

(async () => {
  const { net, role } = await showLobby();

  // Boot PixiJS and attach the canvas to the page.
  const app = new Application();
  await app.init({ background: COLORS.sky, resizeTo: window });
  document.getElementById("pixi-container")!.appendChild(app.canvas);

  const root = new Container();

  const debug = new Graphics();
  root.addChild(debug);

  function layout() {
    const s = Math.min(
      app.screen.width / DESIGN_WIDTH,
      app.screen.height / DESIGN_HEIGHT,
    );
    root.scale.set(s);

    root.x = (app.screen.width - DESIGN_WIDTH * s) / 2;
    root.y = (app.screen.height - DESIGN_HEIGHT * s) / 2;
  }

  layout();
  app.renderer.on("resize", layout);

  // Build the pieces of the game.
  const groundY = GROUND_Y;

  const input = new Input();
  const world = new World(groundY);
  const sun = await Sun.create(DESIGN_WIDTH * 0.82, DESIGN_HEIGHT * 0.2);
  const cactusLeft = await Cactus.create(160, GROUND_Y, 190);
  const cactusRight = await Cactus.create(1120, GROUND_Y, 150);
  const hud = new Hud();
  // Center anchor + 50px size → feet are 25px below the position, so place the
  // crab a half-height above groundY to rest its feet on the ground line.
  const leftCrab = await Crab.create(
    "/assets/crab.png",
    DESIGN_WIDTH * 0.3,
    GROUND_Y - CRAB_SIZE / 2,
    1,
  );
  const rightCrab = await Crab.create(
    "/assets/crab.png",
    DESIGN_WIDTH * 0.7,
    GROUND_Y - CRAB_SIZE / 2,
    -1,
  );

  // Draw order (back to front): sky, scenery, crabs, HUD.
  root.addChild(world.container);
  root.addChild(sun.container);
  root.addChild(cactusLeft.container);
  root.addChild(cactusRight.container);
  root.addChild(leftCrab.container);
  root.addChild(rightCrab.container);
  root.addChild(hud.container);

  const mine = role === "host" ? leftCrab : rightCrab;
  const theirs = role === "host" ? rightCrab : leftCrab;
  theirs.isLocal = false;

  net.onData = (msg) => {
    const m = msg as { t: string; s?: CrabState };
    if (m.t === "state" && m.s) {
      theirs.applyState(m.s); // copy their crab's position/whip/hp
    } else if (m.t === "hit") {
      mine.hit(WHIP_DAMAGE, theirs.facing); // they hit me → I lose my own HP
    }
  };

  // The game loop: read input, move the world.
  app.ticker.add((time) => {
    const delta = time.deltaTime;

    // Drive MY crab from the keyboard.
    const direction =
      (input.isDown("d") ? 1 : 0) + (input.isDown("a") ? -1 : 0);
    mine.setMove(direction);
    if (input.justPressed(" ")) mine.attack();

    // mine simulates; theirs just renders the last synced state.
    mine.update(delta);
    theirs.update(delta);

    // Broadcast my crab's state to the opponent every frame.
    net.send({ t: "state", s: mine.netState() });

    // If my whip connects, tell them to take damage (they own their HP).
    if (mine.whipActive() && overlap(mine.whipBox(), theirs.body())) {
      mine.markHit();
      net.send({ t: "hit" });
    }

    hud.update(leftCrab.hp, rightCrab.hp);
  });

  app.stage.addChild(root);
})();
