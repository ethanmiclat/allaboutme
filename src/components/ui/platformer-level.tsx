"use client";

import { useEffect, useRef, useState } from "react";
import { PlatformerEngine } from "@/lib/platformer-engine";
import type { GameLevel } from "@/lib/levels";

/**
 * Hosts one running platformer level on the arcade CRT: mounts the canvas,
 * runs the engine, and layers the intro/cleared screens over it. Keyboard:
 * arrows/WASD + space are the engine's; Enter starts / advances to the next
 * level; Esc (handled by the hub) backs out.
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
    return () => engine.destroy();
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

  return (
    <div className="platformer" data-phase={phase}>
      <div className="platformer__head">
        <span className="platformer__rank">{level.rank}</span>
        <span className="platformer__name">{level.title.toUpperCase()}</span>
      </div>

      <div className="platformer__stage">
        <canvas ref={canvasRef} className="platformer__canvas" />

        {phase === "intro" && (
          <div className="platformer__card">
            <p className="platformer__mechanic">{level.mechanic}</p>
            <p className="platformer__hint">ARROWS / WASD MOVE · SPACE JUMPS</p>
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
