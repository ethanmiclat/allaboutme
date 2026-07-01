"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { GamesScreen, WelcomeScreen } from "@/components/ui/arcade-cabinet";
import { GAMES } from "@/lib/games";

/**
 * Ethan's Arcade — a two-stage "dive in" experience for the Video Games page:
 *
 *   scene  → the FULL arcade room; Ethan's Arcade is the center machine.
 *            Click it…
 *   screen → …to dive straight into the CRT, blown up to fill the whole page
 *            (all favorite games).
 *
 * The "scene" is the room photo (sized to cover the viewport) with the games CRT
 * overlaid onto its center cabinet's blank screen — the marquee name is already
 * in the photo. Clicking the machine zooms the scene toward the screen while the
 * full-page CRT crossfades in, as one slow, smooth motion. Back (or Esc) returns
 * to the room; from the room, Back returns to the home page. Motion is CSS,
 * auto-disabled under prefers-reduced-motion.
 */
type Stage = "scene" | "screen";

export default function ArcadeExperience() {
  const [stage, setStage] = useState<Stage>("scene");
  // Which game row is highlighted on the full screen (arrow-key navigable).
  const [selected, setSelected] = useState(0);
  // Mirror for the Enter handler (whose listener is bound once per stage).
  const selectedRef = useRef(0);
  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  const stepBack = useCallback(() => setStage("scene"), []);

  const enter = useCallback(() => {
    setSelected(0);
    setStage("screen");
  }, []);

  // Esc steps back to the room (matches the Back button).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") stepBack();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stepBack]);

  // On the full screen, the arrow keys move/scroll through the games list.
  useEffect(() => {
    if (stage !== "screen") return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        setSelected((i) => Math.min(GAMES.length - 1, i + 1));
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        setSelected((i) => Math.max(0, i - 1));
      } else if (e.key === "Home") {
        e.preventDefault();
        setSelected(0);
      } else if (e.key === "End") {
        e.preventDefault();
        setSelected(GAMES.length - 1);
      } else if (e.key === "Enter") {
        // Open the highlighted game — unless a row link is already focused,
        // in which case let the browser activate it natively.
        if (document.activeElement?.closest(".arcade__list")) return;
        e.preventDefault();
        const game = GAMES[selectedRef.current];
        if (game) window.open(game.url, "_blank", "noopener,noreferrer");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stage]);

  return (
    <div className="arcade-stage" data-stage={stage}>
      {stage === "scene" ? (
        <Link className="arcade-page__back" href="/#hobbies" scroll={false}>
          <ArrowLeft aria-hidden="true" />
          BACK
        </Link>
      ) : (
        <button type="button" className="arcade-page__back" onClick={stepBack}>
          <ArrowLeft aria-hidden="true" />
          BACK
        </button>
      )}

      {/* The room, with Ethan's games overlaid on the center machine's screen */}
      <div className="arcade-layer arcade-layer--room" inert={stage === "screen"}>
        <div className="arcade-scene">
          {/* eslint-disable-next-line @next/next/no-img-element -- public static art; next/image adds no value here */}
          <img
            className="arcade-scene__img"
            src="/assets/arcade-scene.png"
            alt="A retro black-and-white arcade with three cabinets; Ethan's Arcade is the machine in the center"
          />

          {/* Attract screen — overlaid onto the center cabinet's (blank) CRT. The
              marquee name is already baked into the photo. Clicking dives in, where
              the full-page CRT shows the actual games list. */}
          <div className="arcade-scene__screen">
            <WelcomeScreen />
          </div>

          {/* Click anywhere on the center machine to dive straight to full screen. */}
          <button
            type="button"
            className="arcade-scene__enter"
            onClick={enter}
            aria-label="Open Ethan's Arcade — view all favorite games full-screen"
          />
        </div>
      </div>

      {/* The screen, blown up to fill the whole page. The black backdrop wipes in
          to cover the flown-in room (black-on-black), then the inner content
          resolves into focus — so the dive reads as one seamless motion. */}
      <div className="arcade-layer arcade-layer--screen" inert={stage !== "screen"}>
        <div className="arcade-screen-full">
          <div className="arcade-screen-full__in">
            <GamesScreen selectedIndex={selected} onSelect={setSelected} />
          </div>
        </div>
      </div>

      {/* Hint line — only on the full screen (the room is left clean). */}
      {stage === "screen" && (
        <p className="arcade-stage__tagline">
          IN NO PARTICULAR ORDER • PRESS ESC OR BACK TO STEP OUT
        </p>
      )}
    </div>
  );
}
