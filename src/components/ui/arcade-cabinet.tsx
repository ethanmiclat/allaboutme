"use client";

import { useEffect, useRef } from "react";
import { GAMES } from "@/lib/games";

/**
 * Presentational pieces for "Ethan's Arcade" (/hobbies/games), rendered by
 * <ArcadeExperience>:
 *   - <WelcomeScreen> : the attract screen overlaid on the room photo's cabinet.
 *   - <GamesScreen>   : the CRT contents (HUD + favorite-games table) shown after
 *                       the dive into the machine.
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

/**
 * The retro CRT contents: HUD, title, the favorite-games high-score table,
 * footer. Used on the full-page screen stage.
 *
 * When `selectedIndex` is supplied (driven by the arrow keys in
 * <ArcadeExperience>), that row is highlighted and kept scrolled into view, and
 * hovering/clicking a row reports it back via `onSelect`.
 */
export function GamesScreen({
  selectedIndex,
  onSelect,
}: {
  selectedIndex?: number;
  onSelect?: (index: number) => void;
} = {}) {
  const listRef = useRef<HTMLOListElement>(null);

  // Keep the keyboard-selected row visible as you scroll the list.
  useEffect(() => {
    if (selectedIndex == null) return;
    const row = listRef.current?.children[selectedIndex] as HTMLElement | undefined;
    row?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  return (
    <>
      <div className="arcade__scanlines" aria-hidden="true" />

      <div className="arcade__hud">
        <span>
          <b>1UP</b>
          <br />
          012300
        </span>
        <span className="arcade__hud-mid">
          <b>HI-SCORE</b>
          <br />
          045000
        </span>
        <span>
          <b>2UP</b>
          <br />
          000000
        </span>
      </div>

      <p className="arcade__screen-title">&#9733; FAVORITE GAMES &#9733;</p>

      <ol className="arcade__list" ref={listRef}>
        {GAMES.map((g, i) => (
          <li key={g.rank}>
            <a
              className="arcade__row"
              href={g.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-selected={selectedIndex === i || undefined}
              onMouseEnter={onSelect ? () => onSelect(i) : undefined}
            >
              <span className="arcade__rank">{g.rank}</span>
              <span className="arcade__title">{g.title}</span>
              <span className="arcade__dots" aria-hidden="true" />
              <span className="arcade__score">{g.score}</span>
            </a>
          </li>
        ))}
      </ol>

      <div className="arcade__screen-footer">
        <span className="arcade__blink">INSERT COIN</span>
        <span>CREDIT 67</span>
      </div>
    </>
  );
}

