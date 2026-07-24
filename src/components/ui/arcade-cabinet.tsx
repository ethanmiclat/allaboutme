"use client";

/**
 * Presentational pieces for "Ethan's Arcade" (/hobbies/games), rendered by
 * <ArcadeExperience>:
 *   - <WelcomeScreen> : the attract screen overlaid on the room photo's cabinet.
 * (The CRT contents after the dive are the platformer hub — see
 * platformer-hub.tsx.)
 * Motion is CSS (disabled under prefers-reduced-motion via globals.css).
 */

// Classic 11x8 space-invader bitmap (single colour, follows CSS `color`).
const INVADER = [
  "00100000100",
  "00010001000",
  "00111111100",
  "01101110110",
  "11111111111",
  "10111111101",
  "10100000101",
  "00011011000",
];

export function Invader({ className }: { className?: string }) {
  const h = INVADER.length;
  const w = INVADER[0].length;
  return (
    <svg
      className={className}
      viewBox={`0 0 ${w} ${h}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      {INVADER.flatMap((row, y) =>
        row.split("").map((bit, x) =>
          bit === "1" ? (
            <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="currentColor" />
          ) : null
        )
      )}
    </svg>
  );
}

/**
 * The cabinet's "attract" / welcome screen — what shows on the center machine
 * before you dive in. A title + a blinking "click to start" prompt, framed like
 * a classic arcade attract mode. Clicking the machine starts the dive (the click
 * target is the invisible .arcade-scene__enter hotspot over the whole cabinet).
 */
export function WelcomeScreen() {
  return (
    <>
      <div className="arcade__scanlines" aria-hidden="true" />

      <div className="arcade__welcome">
        <Invader className="arcade__welcome-invader" />
        <p className="arcade__welcome-title">
          <span className="arcade__welcome-lead">WELCOME TO</span>
          <span className="arcade__welcome-name">ETHAN&rsquo;S ARCADE</span>
        </p>
        <p className="arcade__welcome-start arcade__blink">CLICK HERE TO START!</p>
      </div>
    </>
  );
}
