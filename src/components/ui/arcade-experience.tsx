"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { WelcomeScreen } from "@/components/ui/arcade-cabinet";
import PlatformerHub from "@/components/ui/platformer-hub";

/**
 * Ethan's Arcade — a two-stage "dive in" experience for the Video Games page:
 *
 *   scene  → the FULL arcade room; Ethan's Arcade is the center machine.
 *            Click it…
 *   screen → …to dive straight into the CRT, blown up to fill the whole page.
 *            The CRT hosts a level-select hub of tiny black-and-white
 *            platformer levels — one per favorite game (<PlatformerHub>).
 *
 * The "scene" is the room photo (sized to cover the viewport) with the CRT
 * overlaid onto its center cabinet's blank screen — the marquee name is already
 * in the photo. Clicking the machine zooms the scene toward the screen while the
 * full-page CRT crossfades in, as one slow, smooth motion. Esc walks back one
 * step at a time (level → hub → room; handled inside the hub). Motion is CSS,
 * auto-disabled under prefers-reduced-motion.
 */
type Stage = "scene" | "screen";

export default function ArcadeExperience() {
  const [stage, setStage] = useState<Stage>("scene");
  // Which level is open (or null for the level-select hub). Lifted out of the
  // hub so the page BACK button can step level → hub → room, matching Esc,
  // instead of jumping straight back to the room from inside a level.
  const [levelIndex, setLevelIndex] = useState<number | null>(null);

  const enter = useCallback(() => setStage("screen"), []);
  const closeLevel = useCallback(() => setLevelIndex(null), []);
  const exitToRoom = useCallback(() => {
    setLevelIndex(null);
    setStage("scene");
  }, []);

  // BACK on the full screen: out of a level lands on the hub first; from the
  // hub it lands back in the arcade room.
  const handleBack = useCallback(() => {
    if (levelIndex != null) setLevelIndex(null);
    else exitToRoom();
  }, [levelIndex, exitToRoom]);

  return (
    <div className="arcade-stage" data-stage={stage}>
      {stage === "scene" ? (
        <Link className="arcade-page__back" href="/#hobby-games" scroll={false}>
          <ArrowLeft aria-hidden="true" />
          BACK
        </Link>
      ) : (
        <button type="button" className="arcade-page__back" onClick={handleBack}>
          <ArrowLeft aria-hidden="true" />
          BACK
        </button>
      )}

      {/* The room, with the attract screen overlaid on the center machine.
          `stepBack` no longer exists — the room's own enter/leave now runs
          through exitToRoom / handleBack above. */}
      <div className="arcade-layer arcade-layer--room" inert={stage === "screen"}>
        <div className="arcade-scene">
          {/* eslint-disable-next-line @next/next/no-img-element -- public static art; next/image adds no value here */}
          <img
            className="arcade-scene__img"
            src="/assets/arcade-scene.png"
            alt="A retro black-and-white arcade with three cabinets; Ethan's Arcade is the machine in the center"
          />

          {/* Attract screen — overlaid onto the center cabinet's (blank) CRT. */}
          <div className="arcade-scene__screen">
            <WelcomeScreen />
          </div>

          {/* Click anywhere on the center machine to dive straight to full screen. */}
          <button
            type="button"
            className="arcade-scene__enter"
            onClick={enter}
            aria-label="Open Ethan's Arcade — play a tiny platformer level per favorite game"
          />
        </div>
      </div>

      {/* The screen, blown up to fill the whole page. The black backdrop wipes in
          to cover the flown-in room (black-on-black), then the inner content
          resolves into focus — so the dive reads as one seamless motion. */}
      <div className="arcade-layer arcade-layer--screen" inert={stage !== "screen"}>
        <div className="arcade-screen-full">
          <div className="arcade-screen-full__in">
            <PlatformerHub
              active={stage === "screen"}
              onExitToRoom={exitToRoom}
              levelIndex={levelIndex}
              onOpenLevel={setLevelIndex}
              onCloseLevel={closeLevel}
            />
          </div>
        </div>
      </div>

      {/* Hint line — only on the full screen (the room is left clean). */}
      {stage === "screen" && (
        <p className="arcade-stage__tagline">
          ARROWS TO NAVIGATE • ENTER TO PLAY • ESC TO STEP OUT
        </p>
      )}
    </div>
  );
}
