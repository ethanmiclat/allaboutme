"use client";

import { useEffect, useRef, useState } from "react";
import { PlatformerEngine, type PlatformerAction } from "@/lib/platformer-engine";
import type { GameLevel } from "@/lib/levels";

/**
 * One button on the on-screen pad. Pointer events only (no click/touch
 * handlers), so mouse and finger share a single path with no synthetic-event
 * double-fire. Capturing the pointer keeps the release tied to the button the
 * press started on, which is what lets one finger hold "left" while another
 * taps "jump" — every pointer id is tracked on its own.
 */
function PadButton({
  action,
  label,
  glyph,
  press,
  release,
}: {
  action: PlatformerAction;
  label: string;
  glyph: string;
  press: (action: PlatformerAction) => void;
  release: (action: PlatformerAction) => void;
}) {
  return (
    <button
      type="button"
      className="platformer__pad-btn"
      aria-label={label}
      onPointerDown={(e) => {
        // No focus steal, and no long-press callout on a held mine button.
        e.preventDefault();
        // Register the press before asking for capture: capture is a nicety
        // (it keeps the release tied to this button if the finger slides off),
        // so a browser refusing it must not cost us the input itself.
        press(action);
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerUp={() => release(action)}
      onPointerCancel={() => release(action)}
      onPointerLeave={() => release(action)}
    >
      {glyph}
    </button>
  );
}

/**
 * Hosts one running platformer level on the arcade CRT: mounts the canvas,
 * runs the engine, and layers the intro/cleared screens over it. Keyboard:
 * arrows/WASD + space are the engine's; Enter starts / advances to the next
 * level; Esc (handled by the hub) backs out.
 *
 * Touch devices have no keys to press, so while a level is running they also
 * get an on-screen pad (move / jump / mine) laid over the stage — CSS decides
 * whether it's visible, see the `hover: none` block in globals.css.
 */
export default function PlatformerLevel({
  level,
  onCleared,
  onExit,
  onNext,
  onCoins,
}: {
  level: GameLevel;
  /** Level reached its goal (hub marks it cleared). */
  onCleared: () => void;
  /** Back to the level-select hub. */
  onExit: () => void;
  /** Advance to the next level (hub swaps `level` to the next one). */
  onNext: () => void;
  /** Running count of coins collected this run (hub keeps the best). */
  onCoins?: (collected: number) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // The running engine, so the on-screen pad's handlers (which live out in the
  // render tree, not in the effect that builds it) can drive it.
  const engineRef = useRef<PlatformerEngine | null>(null);
  // Held in a ref so the engine (created once per run) always calls the latest
  // callback without being torn down and rebuilt on every render.
  const onCoinsRef = useRef(onCoins);
  useEffect(() => {
    onCoinsRef.current = onCoins;
  }, [onCoins]);
  // "intro" → title card; "play" → engine runs; "won" → cleared card.
  const [phase, setPhase] = useState<"intro" | "play" | "won">("intro");

  // The hub swaps `level` in place (rather than remounting) when advancing to
  // the next level, so reset back to the intro card for the new level.
  useEffect(() => {
    setPhase("intro");
  }, [level]);

  useEffect(() => {
    if (phase !== "play") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const engine = new PlatformerEngine(
      canvas,
      { grid: level.grid, ability: level.ability },
      { onWin: () => setPhase("won"), onCoin: (n) => onCoinsRef.current?.(n) }
    );
    engine.start();
    engineRef.current = engine;
    return () => {
      engineRef.current = null;
      engine.destroy();
    };
  }, [phase, level]);

  // Report a win upward once per win-phase entry.
  useEffect(() => {
    if (phase === "won") onCleared();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fire on phase change only
  }, [phase]);

  // Enter advances the intro / moves to the next level after a win.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Enter") return;
      e.preventDefault();
      if (phase === "intro") setPhase("play");
      else if (phase === "won") onNext();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, onNext]);

  const press = (action: PlatformerAction) => engineRef.current?.press(action);
  const release = (action: PlatformerAction) => engineRef.current?.release(action);

  return (
    <div className="platformer" data-phase={phase}>
      <div className="platformer__head">
        <span className="platformer__rank">{level.rank}</span>
        <span className="platformer__name">{level.title.toUpperCase()}</span>
      </div>

      <div className="platformer__stage">
        <canvas ref={canvasRef} className="platformer__canvas" />

        {phase === "play" && (
          <div className="platformer__pad">
            <div className="platformer__pad-group">
              <PadButton action="left" label="Move left" glyph="◀" press={press} release={release} />
              <PadButton action="right" label="Move right" glyph="▶" press={press} release={release} />
            </div>
            <div className="platformer__pad-group">
              <PadButton action="down" label="Mine downward" glyph="▼" press={press} release={release} />
              <PadButton action="jump" label="Jump" glyph="▲" press={press} release={release} />
            </div>
          </div>
        )}

        {phase === "intro" && (
          <div className="platformer__card">
            <p className="platformer__mechanic">{level.mechanic}</p>
            <p className="platformer__hint">ARROWS / WASD MOVE · SPACE JUMPS</p>
            <p className="platformer__hint platformer__hint--touch">
              ◀▶ MOVE · ▲ JUMPS · ▼ MINES
            </p>
            <button
              type="button"
              className="platformer__action arcade__blink"
              onClick={() => setPhase("play")}
            >
              PRESS ENTER TO START
            </button>
          </div>
        )}

        {phase === "won" && (
          <div className="platformer__card">
            <p className="platformer__mechanic">LEVEL CLEARED ★</p>
            <button
              type="button"
              className="platformer__action arcade__blink"
              onClick={onNext}
            >
              PRESS ENTER FOR NEXT LEVEL
            </button>
            <button type="button" className="platformer__action" onClick={onExit}>
              ESC — BACK TO GAMES
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
