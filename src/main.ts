import { Application, Assets } from "pixi.js";
import { COLORS } from "./config";
import { Input } from "./Input";
import { World } from "./World";
import { Stars } from "./Stars";
import { Moon } from "./Moon";
import { Crab } from "./Crab";

(async () => {
  // Boot PixiJS and attach the canvas to the page.
  const app = new Application();
  await app.init({ background: COLORS.background, resizeTo: window });
  document.getElementById("pixi-container")!.appendChild(app.canvas);

  // Load image assets before building anything that needs them.
  const crabTexture = await Assets.load("/assets/crab.png");

  // Build the pieces of the game.
  const groundY = app.screen.height - 120;

  const input = new Input();
  const world = new World(groundY);
  const moon = new Moon(app.screen.width * 0.78, app.screen.height * 0.22);
  const stars = new Stars(app.screen.width, groundY);
  const crab = new Crab(crabTexture, app.screen.width / 2, groundY - 50);

  // Draw order (back to front): world, moon, stars, crab.
  app.stage.addChild(world.container);
  app.stage.addChild(moon.container);
  app.stage.addChild(stars.container);
  app.stage.addChild(crab.container);

  // The game loop: read input, move the world, twinkle the sky.
  app.ticker.add((time) => {
    const delta = time.deltaTime;

    const movingRight = input.isDown("d");
    const movingLeft = input.isDown("a");

    if (movingRight) world.scroll(1, delta);
    if (movingLeft) world.scroll(-1, delta);

    crab.update(delta, movingRight || movingLeft);
    stars.update(delta);
  });
})();
