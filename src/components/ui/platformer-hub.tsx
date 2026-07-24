"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { LEVELS } from "@/lib/levels";
import PlatformerLevel from "@/components/ui/platformer-level";

const CLEARED_KEY = "arcade-cleared-levels";
const COINS_KEY = "arcade-collected-coins";
const GRID_COLS = 3;

/** Total coins across every level (each "*" in a grid). */
const TOTAL_COINS = LEVELS.reduce(
  (sum, lvl) =>
    sum + lvl.grid.reduce((s, row) => s + (row.match(/\*/g)?.length ?? 0), 0),
  0
);

// Tiny external store for the cleared-level set so it survives navigation
// (localStorage) without setState-in-effect hydration dances.
const EMPTY_CLEARED: Set<string> = new Set();
let clearedCache: Set<string> | null = null;
const clearedListeners = new Set<() => void>();
function getCleared(): Set<string> {
  if (!clearedCache) {
    try {
      const saved = localStorage.getItem(CLEARED_KEY);
      clearedCache = new Set(saved ? (JSON.parse(saved) as string[]) : []);
    } catch {
      clearedCache = new Set();
    }
  }
  return clearedCache;
}
function addCleared(rank: string) {
  if (getCleared().has(rank)) return;
  clearedCache = new Set(getCleared()).add(rank);
  try {
    localStorage.setItem(CLEARED_KEY, JSON.stringify([...clearedCache]));
  } catch {
    // ignore — clears just won't persist
  }
  clearedListeners.forEach((l) => l());
}
function subscribeCleared(onChange: () => void) {
  clearedListeners.add(onChange);
  return () => {
    clearedListeners.delete(onChange);
  };
}

// Same pattern for coins: the best number collected per level (keyed by rank),
// so the hub can show a running "coins collected" total across all levels.
const EMPTY_COINS: Map<string, number> = new Map();
let coinsCache: Map<string, number> | null = null;
const coinsListeners = new Set<() => void>();
function getCoins(): Map<string, number> {
  if (!coinsCache) {
    try {
      const saved = localStorage.getItem(COINS_KEY);
      coinsCache = new Map(
        saved ? Object.entries(JSON.parse(saved) as Record<string, number>) : []
      );
    } catch {
      coinsCache = new Map();
    }
  }
  return coinsCache;
}
function recordCoins(rank: string, collected: number) {
  if (collected <= (getCoins().get(rank) ?? 0)) return; // keep the best run
  coinsCache = new Map(getCoins()).set(rank, collected);
  try {
    localStorage.setItem(COINS_KEY, JSON.stringify(Object.fromEntries(coinsCache)));
  } catch {
    // ignore — the tally just won't persist
  }
  coinsListeners.forEach((l) => l());
}
function subscribeCoins(onChange: () => void) {
  coinsListeners.add(onChange);
  return () => {
    coinsListeners.delete(onChange);
  };
}

/**
 * The arcade CRT's contents after diving into the cabinet: a level-select
 * grid (one black-and-white platformer level per favorite game) that launches
 * into <PlatformerLevel>. Fully keyboard-driven like the old high-score list:
 * arrows move the selection, Enter launches, Esc backs out (level → hub →
 * arcade room via `onExitToRoom`). Cleared levels keep a ★ (persisted in
 * localStorage), as does the running coins-collected tally.
 *
 * `levelIndex` (which level is open, or null) is owned by the parent so the
 * page-level BACK button can step level → hub → room in the same order Esc
 * does, rather than jumping straight back to the room.
 */
export default function PlatformerHub({
  active,
  onExitToRoom,
  levelIndex,
  onOpenLevel,
  onCloseLevel,
}: {
  /** False while the room scene is showing (suspends key handling). */
  active: boolean;
  onExitToRoom: () => void;
  /** Index of the open level, or null for the level-select grid. */
  levelIndex: number | null;
  onOpenLevel: (i: number) => void;
  onCloseLevel: () => void;
}) {
  const [selected, setSelected] = useState(0);
  const cleared = useSyncExternalStore(
    subscribeCleared,
    getCleared,
    () => EMPTY_CLEARED
  );
  const coins = useSyncExternalStore(subscribeCoins, getCoins, () => EMPTY_COINS);
  const coinsCollected = [...coins.values()].reduce((a, b) => a + b, 0);

  // Esc: level → hub, hub → arcade room. Hub grid keys: arrows + Enter.
  useEffect(() => {
    if (!active) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        if (levelIndex != null) onCloseLevel();
        else onExitToRoom();
        return;
      }
      if (levelIndex != null) return; // level owns the rest of the keys
      const max = LEVELS.length - 1;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setSelected((i) => Math.min(max, i + 1));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setSelected((i) => Math.max(0, i - 1));
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelected((i) => Math.min(max, i + GRID_COLS));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelected((i) => Math.max(0, i - GRID_COLS));
      } else if (e.key === "Home") {
        e.preventDefault();
        setSelected(0);
      } else if (e.key === "End") {
        e.preventDefault();
        setSelected(max);
      } else if (e.key === "Enter") {
        // Let a focused tile activate natively; otherwise launch the highlight.
        if (document.activeElement?.closest(".platformer-hub__grid")) return;
        e.preventDefault();
        onOpenLevel(selected);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, levelIndex, selected, onCloseLevel, onExitToRoom, onOpenLevel]);

  if (levelIndex != null) {
    const level = LEVELS[levelIndex];
    const isLast = levelIndex === LEVELS.length - 1;
    return (
      <>
        <div className="arcade__scanlines" aria-hidden="true" />
        <PlatformerLevel
          level={level}
          onCleared={() => addCleared(level.rank)}
          onCoins={(n) => recordCoins(level.rank, n)}
          onExit={onCloseLevel}
          onNext={() => (isLast ? onCloseLevel() : onOpenLevel(levelIndex + 1))}
        />
      </>
    );
  }

  return (
    <>
      <div className="arcade__scanlines" aria-hidden="true" />

      <p className="arcade__screen-title">&#9733; SELECT LEVEL &#9733;</p>
      <p className="platformer-hub__sub">ONE TINY PLATFORMER PER FAVORITE GAME</p>

      <ol className="platformer-hub__grid">
        {LEVELS.map((level, i) => (
          <li key={level.rank}>
            <button
              type="button"
              className="platformer-hub__tile"
              aria-selected={selected === i || undefined}
              onMouseEnter={() => setSelected(i)}
              onClick={() => onOpenLevel(i)}
            >
              <span className="platformer-hub__rank">{level.rank}</span>
              <span className="platformer-hub__title">{level.title}</span>
              {cleared.has(level.rank) && (
                <span className="platformer-hub__star" aria-label="Cleared">
                  ★
                </span>
              )}
            </button>
          </li>
        ))}
      </ol>

      <div className="arcade__screen-footer">
        <span>
          &#9670; COINS {coinsCollected}/{TOTAL_COINS}
        </span>
        <span>
          CLEARED {cleared.size}/{LEVELS.length}
        </span>
      </div>
    </>
  );
}
