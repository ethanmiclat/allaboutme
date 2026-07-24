import type { LevelAbility } from "@/lib/platformer-engine";

/**
 * The 15 arcade platformer levels — one per favorite game (same order/ranks as
 * GAMES in games.ts). Each level is a tile grid (see platformer-engine.ts for
 * the tile alphabet) with a game-specific twist: Overwatch gets hero mobility,
 * Fortnite a closing storm, Minecraft diggable ground, R6 breachable walls…
 *
 * Grids are authored against the engine's physics: a jump clears ~4 tiles of
 * height and ~6 of distance, so gaps stay ≤4 and single-jump rises ≤3 unless
 * the level's ability says otherwise.
 */

export interface GameLevel {
  /** Two-digit rank, matches the GAMES list. */
  rank: string;
  title: string;
  /** One-line arcade-style hint shown before the level starts. */
  mechanic: string;
  ability?: LevelAbility;
  grid: string[];
}

/** Build a `w`-wide row of "." with [col, glyphs] marks (later marks win). */
function r(w: number, ...marks: [number, string][]): string {
  const a: string[] = Array(w).fill(".");
  for (const [c, s] of marks) {
    for (let i = 0; i < s.length; i++) a[c + i] = s[i];
  }
  return a.join("");
}
const solid = (w: number) => "#".repeat(w);
const fill = (w: number) => "=".repeat(w);

export const LEVELS: GameLevel[] = [
  {
    rank: "01",
    title: "Overwatch",
    mechanic: "HERO MOBILITY — DOUBLE JUMP TO THE POINT",
    ability: { doubleJump: true },
    grid: [
      r(40),
      r(40, [34, "G"]),
      r(40, [30, "##########"]),
      r(40),
      r(40),
      r(40, [19, "########"]),
      r(40),
      r(40),
      r(40, [6, "########"]),
      r(40),
      r(40),
      r(40, [18, "########"]),
      r(40),
      r(40),
      r(40, [29, "########"]),
      r(40),
      r(40),
      r(40, [10, "########"]),
      r(40),
      r(40),
      r(40, [4, "S"]),
      solid(40),
    ],
  },
  {
    rank: "02",
    title: "Fortnite",
    mechanic: "THE STORM IS CLOSING — KEEP MOVING",
    ability: { chaseWall: 90 },
    grid: [
      ...Array.from({ length: 15 }, () => r(96)),
      r(96, [30, "*"], [55, "*"], [75, "*"]),
      r(96),
      r(96, [2, "S"], [93, "G"]),
      r(96, [0, "#".repeat(20)], [24, "#".repeat(20)], [48, "#".repeat(16)], [68, "#".repeat(12)], [84, "#".repeat(12)]),
    ],
  },
  {
    rank: "03",
    title: "Valorant",
    mechanic: "SPIKE PLANTED — PIXEL-PERFECT FOOTWORK",
    grid: [
      ...Array.from({ length: 17 }, () => r(60)),
      r(60, [2, "S"], [5, "^^^^"], [11, "^^^^"], [18, "^^^^"], [24, "^^^^"], [31, "^^^^"], [37, "^^^^"], [51, "G"]),
      solid(60),
    ],
  },
  {
    rank: "04",
    title: "Call of Duty",
    mechanic: "TRENCH RUN — VAULT THE WALLS, DODGE THE WIRE",
    grid: [
      ...Array.from({ length: 15 }, () => r(64)),
      r(64, [14, "*"], [18, "#"], [30, "*"], [34, "#"], [46, "*"], [50, "#"]),
      r(64, [10, "#"], [18, "#"], [26, "#"], [34, "#"], [42, "#"], [50, "#"]),
      r(64, [2, "S"], [10, "#"], [18, "#"], [22, "^^"], [26, "#"], [34, "#"], [38, "^^"], [42, "#"], [50, "#"], [54, "^^"], [60, "G"]),
      solid(64),
    ],
  },
  {
    rank: "05",
    title: "Rocket League",
    mechanic: "AERIAL PLAY — BOOST OVER THE WALLS",
    ability: { lowGravity: true },
    grid: [
      ...Array.from({ length: 13 }, () => r(60)),
      r(60, [14, "*"], [28, "*"], [42, "*"]), // coins perched above each wall
      r(60),
      // Walls too tall to clear with a normal (low-grav) jump — only a boost
      // pad launch gets you over. Rows 15–24 are the walls at cols 14/28/42.
      r(60, [14, "#"], [28, "#"], [42, "#"]),
      r(60, [14, "#"], [28, "#"], [42, "#"]),
      r(60, [14, "#"], [28, "#"], [42, "#"]),
      r(60, [14, "#"], [28, "#"], [42, "#"]),
      r(60, [14, "#"], [28, "#"], [42, "#"]),
      r(60, [14, "#"], [28, "#"], [42, "#"]),
      r(60, [14, "#"], [28, "#"], [42, "#"]),
      r(60, [14, "#"], [28, "#"], [42, "#"]),
      r(60, [14, "#"], [28, "#"], [42, "#"]),
      r(60, [2, "S"], [14, "#"], [28, "#"], [42, "#"], [56, "G"]),
      // Floor with boost pads set into the track (drive over one to launch).
      r(60, [0, solid(60)], [10, "~"], [24, "~"], [38, "~"]),
    ],
  },
  {
    rank: "06",
    title: "NBA 2K",
    mechanic: "DUNK CONTEST — BOUNCE TO THE RIM",
    grid: [
      ...Array.from({ length: 7 }, () => r(48)),
      r(48, [32, "G"]),
      r(48, [28, "#########"]),
      r(48),
      r(48, [20, "*"]),
      r(48),
      r(48),
      r(48, [16, "####"]),
      r(48),
      r(48, [10, "*"]),
      r(48),
      r(48, [2, "S"], [10, "~"], [22, "~~"]),
      solid(48),
    ],
  },
  {
    rank: "07",
    title: "League of Legends",
    mechanic: "PICK A LANE — TOP, MID, OR BOT TO THE NEXUS",
    grid: [
      ...Array.from({ length: 6 }, () => r(80)),
      r(80, [10, "##############"], [28, "############"], [44, "####################"]),
      r(80),
      r(80),
      r(80, [4, "###"], [30, "*"], [50, "*"]),
      r(80),
      r(80),
      r(80, [8, "############"], [24, "################"], [44, "######################"]),
      r(80),
      r(80),
      r(80, [4, "###"], [20, "*"], [62, "*"]),
      r(80),
      r(80, [2, "S"], [30, "^^"], [52, "^^"], [76, "G"]),
      solid(80),
    ],
  },
  {
    rank: "08",
    title: "Rainbow Six Siege",
    mechanic: "BREACH — SMASH THROUGH THE SOFT WALLS",
    grid: [
      ...Array.from({ length: 12 }, () => r(64)),
      r(64, [14, "##"], [28, "##"], [42, "##"], [54, "##"]),
      r(64, [14, "=="], [28, "=="], [42, "=="], [54, "=="]),
      r(64, [14, "=="], [28, "=="], [42, "=="], [54, "=="]),
      r(64, [14, "=="], [20, "*"], [28, "=="], [34, "*"], [42, "=="], [48, "*"], [54, "=="]),
      r(64, [14, "=="], [28, "=="], [42, "=="], [54, "=="]),
      r(64, [2, "S"], [14, "=="], [28, "=="], [42, "=="], [54, "=="], [60, "G"]),
      solid(64),
    ],
  },
  {
    rank: "09",
    title: "Minecraft",
    mechanic: "DIG — HOLD DOWN TO MINE, WATCH FOR LAVA",
    grid: [
      r(40),
      r(40),
      r(40, [4, "S"]),
      r(40, [0, fill(40)]),
      r(40, [0, fill(40)]),
      r(40, [0, fill(40)]),
      r(40, [0, fill(40)], [20, "*"]),
      r(40, [0, fill(40)]),
      r(40, [0, fill(40)], [8, "#######"]),
      r(40, [0, fill(40)]),
      r(40, [0, fill(40)], [24, "^^^"]),
      r(40, [0, fill(40)]),
      r(40, [0, fill(40)], [20, "#########"]),
      r(40, [0, fill(40)], [33, "*"]),
      r(40, [0, fill(40)], [10, "^^^"]),
      r(40, [0, fill(40)]),
      r(40, [0, fill(40)], [5, "######"]),
      r(40, [0, fill(40)]),
      r(40, [0, fill(40)]),
      r(40, [0, fill(40)], [16, "^^^"]),
      r(40, [0, fill(40)]),
      r(40, [0, fill(40)], [8, "*"]),
      r(40, [0, fill(40)]),
      r(40, [0, fill(40)], [30, "..G.."]),
      solid(40),
      solid(40),
    ],
  },
  {
    rank: "10",
    title: "Teamfight Tactics",
    mechanic: "THE CAROUSEL — HOP THE HEXES, GRAB THE ITEMS",
    grid: [
      ...Array.from({ length: 9 }, () => r(56)),
      r(56, [23, "*"], [27, "*"], [31, "*"]),
      r(56, [23, "##"], [31, "##"]),
      r(56, [19, "*"], [35, "*"]),
      r(56, [19, "##"], [27, "##"], [35, "##"]),
      r(56, [15, "*"], [39, "*"]),
      r(56, [15, "##"], [39, "##"]),
      r(56, [11, "*"], [43, "*"]),
      r(56, [11, "##"], [43, "##"]),
      r(56, [2, "S"], [52, "G"]),
      r(56, [0, "#########"], [48, "########"]),
    ],
  },
  {
    rank: "11",
    title: "GTA V",
    mechanic: "FULL THROTTLE — TOP SPEED, LONG JUMPS",
    ability: { speed: 1.9 },
    grid: [
      ...Array.from({ length: 15 }, () => r(110)),
      r(110, [29, "*"], [60, "*"], [89, "*"]), // coins float mid-gap, grabbed at the jump's apex
      r(110),
      r(110, [2, "S"], [44, "#"], [74, "#"], [105, "G"]),
      // Wider 9-tile gaps between platforms — only clearable at full throttle.
      r(110, [0, "#".repeat(25)], [34, "#".repeat(22)], [65, "#".repeat(20)], [94, "#".repeat(16)]),
    ],
  },
  {
    rank: "12",
    title: "Chess",
    mechanic: "ONE SQUARE AT A TIME — DON'T FALL OFF THE BOARD",
    grid: [
      ...Array.from({ length: 13 }, () => r(52)),
      r(52, [9, "*"], [19, "*"], [29, "*"], [39, "*"]), // coins above the high squares
      r(52, [9, "#"], [19, "#"], [29, "#"], [39, "#"]), // single-block high squares
      r(52, [2, "S"], [46, "G"]),
      // Single-block low squares between the start and goal plates — the path
      // hops square to square, alternating high and low.
      r(52, [0, "#####"], [14, "#"], [24, "#"], [34, "#"], [44, "#####"]),
    ],
  },
  {
    rank: "13",
    title: "MLB the Show",
    mechanic: "RUN THE BASES — FIRST, SECOND, THIRD, HOME",
    // A baseball diamond of slab "bases" over the void. Start on the batter's
    // box (bottom right), then round the diamond: up-right to FIRST, up-left to
    // SECOND (the top), down-left to THIRD, then drop onto HOME plate (bottom
    // left) where the flag waits. Miss a base and you fall — respawn at the box.
    grid: [
      ...Array.from({ length: 8 }, () => r(40)),
      r(40, [18, "*"]), // coin above second base
      r(40),
      r(40, [16, "#####"]), // SECOND base (top of the diamond)
      r(40, [9, "*"], [27, "*"]), // coins above third & first
      r(40),
      r(40, [7, "#####"], [25, "#####"]), // THIRD (left) & FIRST (right)
      r(40),
      r(40, [11, "G"], [24, "S"]), // home-plate flag & batter's-box spawn
      r(40, [9, "#####"], [23, "####"]), // HOME plate & batter's box
    ],
  },
  {
    rank: "14",
    title: "Fifa",
    mechanic: "TOP CORNER — BEAT THE BACK LINE, SLIDE INTO THE NET",
    grid: [
      ...Array.from({ length: 12 }, () => r(72)),
      r(72, [62, "#######"]),
      r(72, [62, "#"], [68, "#"]),
      r(72, [30, "*"], [62, "#"], [68, "#"]),
      r(72, [29, "###"], [62, "#"], [68, "#"]),
      r(72, [12, "#"], [24, "#"], [36, "#"], [48, "#"], [68, "#"]),
      r(72, [2, "S"], [12, "#"], [18, "^"], [24, "#"], [30, "^"], [36, "#"], [42, "^"], [48, "#"], [65, "G"], [68, "#"]),
      solid(72),
    ],
  },
  {
    rank: "15",
    title: "Counter-Strike",
    mechanic: "RUSH B — CRATES BREAK, PLANT AT THE SITE",
    grid: [
      ...Array.from({ length: 14 }, () => r(64)),
      r(64, [23, "*"]),
      r(64, [22, "==="], [44, "#"]),
      r(64, [10, "=="], [22, "==="], [36, "=="], [42, "=="], [44, "#"]),
      r(64, [2, "S"], [10, "=="], [22, "==="], [28, "^^"], [36, "=="], [42, "=="], [44, "#"], [50, "*"], [58, "G"]),
      solid(64),
    ],
  },
];
