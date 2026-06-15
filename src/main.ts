import { Application, Container } from "pixi.js";
import { COLORS, CRAB_SIZE, DESIGN_HEIGHT, DESIGN_WIDTH, GROUND_Y } from "./config";
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

  const root = new Container();

  function layout() {
    const s = Math.min(app.screen.width / DESIGN_WIDTH, app.screen.height / DESIGN_HEIGHT)
    root.scale.set(s)

    root.x = (app.screen.width - DESIGN_WIDTH * s) / 2
    root.y = (app.screen.height - DESIGN_HEIGHT * s) / 2
  }

  layout();
  app.renderer.on("resize", layout);

  // Build the pieces of the game.
  const groundY = GROUND_Y;
  
  const input = new Input();
  const world = new World(groundY);
  const moon = new Moon(DESIGN_WIDTH * 0.78, DESIGN_HEIGHT * 0.22);
  const stars = new Stars(DESIGN_WIDTH, groundY);
  // Center anchor + 50px size → feet are 25px below the position, so place the
  // crab a half-height above groundY to rest its feet on the ground line.
  const crab = await Crab.create("/assets/crab.png", DESIGN_WIDTH * 0.3, GROUND_Y - CRAB_SIZE / 2, 1)

  // Draw order (back to front): world, moon, stars, crab.
  root.addChild(world.container);
  root.addChild(moon.container);
  root.addChild(stars.container);
  root.addChild(crab.container);

  // The game loop: read input, move the world, twinkle the sky.
  app.ticker.add((time) => {
    const delta = time.deltaTime;

    const movingRight = input.isDown("d");
    const movingLeft = input.isDown("a");
    if (input.isDown(" ")) crab.attack();

    // +1 = forward, -1 = backward, 0 = standing (both/neither held).
    const direction = (movingRight ? 1 : 0) + (movingLeft ? -1 : 0);
    crab.setMove(direction);
    crab.update(delta);
    stars.update(delta);
  });

  app.stage.addChild(root);
})();
