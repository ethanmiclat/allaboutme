/**
 * Tiny black-and-white tile platformer engine for "Ethan's Arcade"
 * (/hobbies/games). Framework-agnostic: give it a canvas + a level grid, it
 * runs a fixed-timestep loop with AABB tile collision and draws stark 1-bit
 * visuals (black bg, white marks) that sit nicely under the CRT scanlines.
 *
 * Tile alphabet (see levels.ts for the level set):
 *   #  solid block
 *   =  breakable block — walk/jump into it to smash it, or press Down while
 *      standing on one to mine straight through it
 *   ^  hazard (spikes) — touch = respawn at S
 *   ~  bounce pad — landing launches the player upward
 *   *  collectible
 *   S  player spawn
 *   G  goal (reach it to clear the level)
 *   .  empty space
 *
 * Per-level abilities (LevelAbility) bend the rules per game: double jump,
 * floatier gravity, speed multiplier, and a "chase wall" that sweeps in from
 * the left once the player first moves (instant respawn on contact).
 */

export interface LevelAbility {
  /** One mid-air jump allowed (resets on landing). */
  doubleJump?: boolean;
  /** Floatier arcs — gravity halved. */
  lowGravity?: boolean;
  /** Horizontal speed multiplier (default 1). */
  speed?: number;
  /** Kill-wall sweeping from the left at this many px/s (0/undefined = none). */
  chaseWall?: number;
}

export interface EngineLevel {
  grid: string[];
  ability?: LevelAbility;
}

export interface EngineCallbacks {
  onWin: () => void;
  /** Fired on every respawn (spikes, chase wall, falling out). */
  onDeath?: (deaths: number) => void;
  /** Fired each time a coin is collected, with the run's running total. */
  onCoin?: (collected: number) => void;
}

const TILE = 16;
export const VIEW_W = 640;
export const VIEW_H = 360;

const GRAVITY = 900;
const FALL_CAP = 420;
const MOVE_SPEED = 140;
const JUMP_VEL = 340;
const PAD_VEL = 520;
const COYOTE = 0.09;
const JUMP_BUFFER = 0.12;
const STEP = 1 / 120;

const PLAYER_W = 12;
const PLAYER_H = 14;

export class PlatformerEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private cb: EngineCallbacks;
  private ability: Required<Pick<LevelAbility, "speed">> & LevelAbility;

  private grid: string[][];
  private cols: number;
  private rows: number;
  private spawn = { x: 0, y: 0 };
  private totalStars = 0;

  private px = 0;
  private py = 0;
  private vx = 0;
  private vy = 0;
  private grounded = false;
  private coyote = 0;
  private jumpBuf = 0;
  private airJumps = 0;
  private facing = 1;
  private stars = 0;
  private deaths = 0;
  private moved = false;
  private wallX = -TILE * 3;
  private time = 0;
  private won = false;

  private keys = new Set<string>();
  private raf = 0;
  private last = 0;
  private acc = 0;
  private destroyed = false;

  constructor(canvas: HTMLCanvasElement, level: EngineLevel, cb: EngineCallbacks) {
    this.canvas = canvas;
    canvas.width = VIEW_W;
    canvas.height = VIEW_H;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2d context unavailable");
    this.ctx = ctx;
    this.ctx.imageSmoothingEnabled = false;
    this.cb = cb;
    this.ability = { speed: 1, ...level.ability };

    // Copy the grid (breakables mutate it) and find spawn/star count.
    this.grid = level.grid.map((row) => row.split(""));
    this.rows = this.grid.length;
    this.cols = Math.max(...this.grid.map((r) => r.length));
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const t = this.tile(x, y);
        if (t === "S") {
          this.spawn = { x: x * TILE + 2, y: y * TILE + (TILE - PLAYER_H) };
          this.grid[y][x] = ".";
        } else if (t === "*") {
          this.totalStars++;
        }
      }
    }
    this.respawn(false);
  }

  start() {
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  destroy() {
    this.destroyed = true;
    cancelAnimationFrame(this.raf);
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
  }

  // ------------------------------------------------------------- input ----

  private onKeyDown = (e: KeyboardEvent) => {
    const k = e.key;
    if (
      ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " ", "w", "a", "s", "d"].includes(k)
    ) {
      e.preventDefault();
    }
    if (k === "ArrowUp" || k === "w" || k === " ") {
      if (!this.keys.has("jump")) this.jumpBuf = JUMP_BUFFER;
      this.keys.add("jump");
    }
    if (k === "ArrowLeft" || k === "a") this.keys.add("left");
    if (k === "ArrowRight" || k === "d") this.keys.add("right");
    if (k === "ArrowDown" || k === "s") this.keys.add("down");
  };

  private onKeyUp = (e: KeyboardEvent) => {
    const k = e.key;
    if (k === "ArrowUp" || k === "w" || k === " ") this.keys.delete("jump");
    if (k === "ArrowLeft" || k === "a") this.keys.delete("left");
    if (k === "ArrowRight" || k === "d") this.keys.delete("right");
    if (k === "ArrowDown" || k === "s") this.keys.delete("down");
  };

  // -------------------------------------------------------------- loop ----

  private frame = (now: number) => {
    if (this.destroyed) return;
    const dt = Math.min(0.1, (now - this.last) / 1000);
    this.last = now;
    if (!this.won) {
      this.acc += dt;
      while (this.acc >= STEP) {
        this.step(STEP);
        this.acc -= STEP;
      }
    }
    this.render();
    this.raf = requestAnimationFrame(this.frame);
  };

  private tile(x: number, y: number): string {
    if (x < 0 || x >= this.cols) return "#"; // walled sides
    if (y < 0) return "."; // open sky
    if (y >= this.rows) return "."; // falling out kills via bounds check
    return this.grid[y][x] ?? ".";
  }

  private solid(t: string) {
    // Pads are solid so the player can land on them (landing triggers launch).
    return t === "#" || t === "=" || t === "~";
  }

  private respawn(countDeath: boolean) {
    this.px = this.spawn.x;
    this.py = this.spawn.y;
    this.vx = 0;
    this.vy = 0;
    this.grounded = false;
    this.airJumps = 0;
    this.moved = false;
    this.wallX = -TILE * 3;
    if (countDeath) {
      this.deaths++;
      this.cb.onDeath?.(this.deaths);
    }
  }

  private step(dt: number) {
    this.time += dt;
    const speed = MOVE_SPEED * this.ability.speed;
    const gravity = this.ability.lowGravity ? GRAVITY * 0.5 : GRAVITY;

    // Horizontal intent
    let dir = 0;
    if (this.keys.has("left")) dir -= 1;
    if (this.keys.has("right")) dir += 1;
    this.vx = dir * speed;
    if (dir !== 0) {
      this.facing = dir;
      this.moved = true;
    }

    // Jumping (buffered + coyote; optional double jump)
    this.jumpBuf = Math.max(0, this.jumpBuf - dt);
    this.coyote = this.grounded ? COYOTE : Math.max(0, this.coyote - dt);
    if (this.jumpBuf > 0) {
      if (this.grounded || this.coyote > 0) {
        this.vy = -JUMP_VEL;
        this.grounded = false;
        this.coyote = 0;
        this.jumpBuf = 0;
        this.moved = true;
        if (this.ability.doubleJump) this.airJumps = 1;
      } else if (this.ability.doubleJump && this.airJumps > 0) {
        this.vy = -JUMP_VEL;
        this.airJumps--;
        this.jumpBuf = 0;
      }
    }

    this.vy = Math.min(FALL_CAP, this.vy + gravity * dt);

    // Mine straight down: Down while standing on a breakable.
    if (this.keys.has("down") && this.grounded) {
      const footY = Math.floor((this.py + PLAYER_H + 1) / TILE);
      const x0 = Math.floor(this.px / TILE);
      const x1 = Math.floor((this.px + PLAYER_W - 1) / TILE);
      for (let x = x0; x <= x1; x++) {
        if (this.tile(x, footY) === "=") this.grid[footY][x] = ".";
      }
    }

    // --- integrate X, resolve against solids (breakables smash) ---
    this.px += this.vx * dt;
    this.collide(true);

    // --- integrate Y, resolve ---
    const wasFalling = this.vy > 0;
    this.py += this.vy * dt;
    this.grounded = false;
    this.collide(false);

    // Ground rest: collide() only reacts to overlap, so a player sitting FLUSH
    // on a floor (feet exactly on a tile boundary) isn't detected as colliding
    // — gravity then sinks it a sub-pixel each step until it overlaps, snaps it
    // back flush, and repeats, jittering ~1px forever. Snap to rest whenever the
    // feet are flush against a solid tile just below (and not being launched).
    if (!this.grounded && this.vy >= 0) {
      // The tile row the feet sit in, and the flush rest position on its top.
      const feetTile = Math.floor((this.py + PLAYER_H) / TILE);
      const restY = feetTile * TILE - PLAYER_H;
      const penetration = this.py - restY; // 0 = flush; collide() owns >= 1
      if (penetration >= 0 && penetration < 1) {
        const x0 = Math.floor(this.px / TILE);
        const x1 = Math.floor((this.px + PLAYER_W - 1) / TILE);
        for (let x = x0; x <= x1; x++) {
          if (this.solid(this.tile(x, feetTile))) {
            this.py = restY;
            this.vy = 0;
            this.grounded = true;
            this.airJumps = this.ability.doubleJump ? 1 : 0;
            break;
          }
        }
      }
    }

    // Bounce pads: landing on a '~' launches upward.
    if (this.grounded && wasFalling) {
      const padY = Math.floor((this.py + PLAYER_H + 1) / TILE);
      const x0 = Math.floor(this.px / TILE);
      const x1 = Math.floor((this.px + PLAYER_W - 1) / TILE);
      for (let x = x0; x <= x1; x++) {
        if (this.tile(x, padY) === "~") {
          this.vy = -PAD_VEL;
          this.grounded = false;
          break;
        }
      }
    }

    // Chase wall
    if (this.ability.chaseWall && this.moved) {
      this.wallX += this.ability.chaseWall * dt;
      if (this.wallX > this.px) {
        this.respawn(true);
        return;
      }
    }

    // Overlap checks: hazards, stars, goal.
    const x0 = Math.floor(this.px / TILE);
    const x1 = Math.floor((this.px + PLAYER_W - 1) / TILE);
    const y0 = Math.floor(this.py / TILE);
    const y1 = Math.floor((this.py + PLAYER_H - 1) / TILE);
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const t = this.tile(x, y);
        if (t === "^") {
          this.respawn(true);
          return;
        }
        if (t === "*") {
          this.grid[y][x] = ".";
          this.stars++;
          this.cb.onCoin?.(this.stars);
        }
        if (t === "G") {
          this.won = true;
          this.cb.onWin();
          return;
        }
      }
    }

    // Fell out of the world
    if (this.py > this.rows * TILE + TILE * 4) this.respawn(true);
  }

  /** Resolve overlap with solid tiles on one axis; smash '=' on contact. */
  private collide(horizontal: boolean) {
    const x0 = Math.floor(this.px / TILE);
    const x1 = Math.floor((this.px + PLAYER_W - 1) / TILE);
    const y0 = Math.floor(this.py / TILE);
    const y1 = Math.floor((this.py + PLAYER_H - 1) / TILE);
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const t = this.tile(x, y);
        if (!this.solid(t)) continue;
        // Breakables (Mario-style): smash by walking into them or bumping them
        // from below; landing on top stands on them (so Down-mining works).
        if (
          t === "=" &&
          y >= 0 &&
          y < this.rows &&
          (horizontal || this.vy < 0)
        ) {
          this.grid[y][x] = ".";
          continue;
        }
        if (horizontal) {
          if (this.vx > 0) this.px = x * TILE - PLAYER_W;
          else if (this.vx < 0) this.px = (x + 1) * TILE;
          this.vx = 0;
        } else {
          if (this.vy > 0) {
            this.py = y * TILE - PLAYER_H;
            this.grounded = true;
            this.airJumps = this.ability.doubleJump ? 1 : 0;
          } else if (this.vy < 0) {
            this.py = (y + 1) * TILE;
          }
          this.vy = 0;
        }
      }
    }
  }

  // ------------------------------------------------------------ render ----

  private render() {
    const ctx = this.ctx;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);

    // Camera: follow, clamped to level bounds.
    const levelW = this.cols * TILE;
    const levelH = this.rows * TILE;
    const camX = Math.round(
      Math.max(0, Math.min(levelW - VIEW_W, this.px + PLAYER_W / 2 - VIEW_W / 2))
    );
    // Levels shorter than the view get vertically centered (negative camY
    // letterboxes them); taller ones scroll with the player.
    const camY =
      levelH < VIEW_H
        ? Math.round(-(VIEW_H - levelH) / 2)
        : Math.round(
            Math.max(0, Math.min(levelH - VIEW_H, this.py + PLAYER_H / 2 - VIEW_H / 2))
          );

    ctx.save();
    ctx.translate(-camX, -camY);
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "#fff";

    const tx0 = Math.floor(camX / TILE);
    const tx1 = Math.ceil((camX + VIEW_W) / TILE);
    const ty0 = Math.floor(camY / TILE);
    const ty1 = Math.ceil((camY + VIEW_H) / TILE);

    for (let y = ty0; y <= ty1; y++) {
      for (let x = tx0; x <= tx1; x++) {
        const t = this.tile(x, y);
        const gx = x * TILE;
        const gy = y * TILE;
        switch (t) {
          case "#": {
            ctx.fillRect(gx, gy, TILE, TILE);
            // 1px black seam so runs of blocks keep a tiled texture
            ctx.fillStyle = "#000";
            ctx.fillRect(gx + TILE - 1, gy, 1, TILE);
            ctx.fillRect(gx, gy + TILE - 1, TILE, 1);
            ctx.fillStyle = "#fff";
            break;
          }
          case "=": {
            ctx.strokeRect(gx + 1.5, gy + 1.5, TILE - 3, TILE - 3);
            ctx.beginPath();
            ctx.moveTo(gx + 2, gy + TILE - 2);
            ctx.lineTo(gx + TILE - 2, gy + 2);
            ctx.stroke();
            break;
          }
          case "^": {
            ctx.beginPath();
            ctx.moveTo(gx, gy + TILE);
            ctx.lineTo(gx + TILE / 2, gy + 4);
            ctx.lineTo(gx + TILE, gy + TILE);
            ctx.closePath();
            ctx.fill();
            break;
          }
          case "~": {
            // Flat boost pad: a wide base bar with a shallow launch chevron, so
            // it reads as a pad you boost off (rather than a tall spike).
            ctx.fillRect(gx + 1, gy + TILE - 3, TILE - 2, 2);
            ctx.beginPath();
            ctx.moveTo(gx + 2, gy + TILE - 4);
            ctx.lineTo(gx + TILE / 2, gy + TILE - 8);
            ctx.lineTo(gx + TILE - 2, gy + TILE - 4);
            ctx.stroke();
            break;
          }
          case "*": {
            const bob = Math.sin(this.time * 4 + x) * 1.5;
            ctx.save();
            ctx.translate(gx + TILE / 2, gy + TILE / 2 + bob);
            ctx.rotate(Math.PI / 4);
            ctx.fillRect(-3, -3, 6, 6);
            ctx.restore();
            break;
          }
          case "G": {
            // Blinking flag on a pole
            ctx.fillRect(gx + 3, gy - TILE, 2, TILE * 2);
            if (Math.floor(this.time * 2) % 2 === 0) {
              ctx.beginPath();
              ctx.moveTo(gx + 5, gy - TILE);
              ctx.lineTo(gx + TILE, gy - TILE + 5);
              ctx.lineTo(gx + 5, gy - TILE + 10);
              ctx.closePath();
              ctx.fill();
            }
            break;
          }
        }
      }
    }

    // Chase wall — dithered static band with a hard leading edge.
    if (this.ability.chaseWall && this.moved) {
      const edge = Math.round(this.wallX);
      ctx.fillStyle = "#fff";
      ctx.fillRect(edge - 2, camY, 2, VIEW_H);
      for (let y = camY; y < camY + VIEW_H; y += 4) {
        for (let x = Math.max(camX, edge - 90); x < edge - 2; x += 4) {
          if ((x * 31 + y * 17 + Math.floor(this.time * 20)) % 7 < 3) {
            ctx.fillRect(x, y, 2, 2);
          }
        }
      }
    }

    // Player — white block with black eyes, squashes a touch when falling.
    const squash = this.grounded ? 0 : Math.min(2, Math.abs(this.vy) / 200);
    ctx.fillStyle = "#fff";
    ctx.fillRect(
      Math.round(this.px),
      Math.round(this.py - squash),
      PLAYER_W,
      PLAYER_H + squash
    );
    ctx.fillStyle = "#000";
    const bx = Math.round(this.px);
    const by = Math.round(this.py);
    const shift = this.facing > 0 ? 1 : -1;
    ctx.fillRect(bx + 3 + shift, by + 4, 2, 3);
    ctx.fillRect(bx + 7 + shift, by + 4, 2, 3);

    ctx.restore();

    // HUD (screen-space)
    ctx.fillStyle = "#fff";
    ctx.font = '10px "Courier New", monospace';
    ctx.textBaseline = "top";
    if (this.totalStars > 0) {
      ctx.fillText(`◆ ${this.stars}/${this.totalStars}`, 8, 8);
    }
    ctx.fillText(`DEATHS ${this.deaths}`, VIEW_W - 80, 8);
  }
}
