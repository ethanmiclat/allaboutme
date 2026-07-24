"use client";

import { useEffect, useRef } from "react";

/**
 * Interactive ambient background for the music page: a handful of flowing
 * sound-wave lines (a loose nod to a staff / waveform) drifting across the
 * viewport. The waves swell near the cursor, and the whole field gains energy
 * while a song preview is playing (via the "ethan:music-playing" event from
 * SongPreviewPlayer). Sits behind the album columns; pure decoration
 * (pointer-events: none, aria-hidden), and renders one static frame under
 * prefers-reduced-motion.
 */

const LINES = [
  // yFrac: vertical position; amp: base amplitude px; speed: phase drift;
  // wavelength px; color: stroke. Mint/teal strokes match the section's cover
  // (a stadium of green lightsticks).
  { yFrac: 0.18, amp: 9, speed: 0.5, wavelength: 340, color: "rgba(110, 232, 180, 0.16)" },
  { yFrac: 0.34, amp: 13, speed: 0.34, wavelength: 460, color: "rgba(227, 230, 236, 0.10)" },
  { yFrac: 0.5, amp: 8, speed: 0.62, wavelength: 300, color: "rgba(52, 190, 150, 0.15)" },
  { yFrac: 0.66, amp: 14, speed: 0.4, wavelength: 520, color: "rgba(227, 230, 236, 0.08)" },
  { yFrac: 0.82, amp: 10, speed: 0.55, wavelength: 380, color: "rgba(110, 232, 180, 0.12)" },
];

export default function MusicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let dpr = 1;
    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // Pointer with easing so the swell trails the cursor gracefully.
    const mouse = { x: -9999, y: -9999 };
    const eased = { x: -9999, y: -9999 };
    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (eased.x < -999) {
        eased.x = mouse.x;
        eased.y = mouse.y;
      }
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerout", onLeave);

    // Playback energy: waves breathe harder while a preview plays.
    let playing = false;
    let energy = 0;
    const onPlaying = (e: Event) => {
      playing = Boolean((e as CustomEvent).detail);
    };
    window.addEventListener("ethan:music-playing", onPlaying);

    let raf = 0;
    const draw = (tMs: number) => {
      const t = tMs / 1000;
      energy += ((playing ? 1 : 0) - energy) * 0.02;
      if (mouse.x > -999) {
        eased.x += (mouse.x - eased.x) * 0.08;
        eased.y += (mouse.y - eased.y) * 0.08;
      }

      ctx.clearRect(0, 0, w, h);
      const step = 6;
      for (const line of LINES) {
        const baseY = line.yFrac * h;
        ctx.beginPath();
        for (let x = -step; x <= w + step; x += step) {
          // Cursor swell: gaussian falloff in x and in distance to the line.
          const dx = x - eased.x;
          const dy = baseY - eased.y;
          const near = Math.exp(-(dx * dx) / (2 * 180 * 180)) * Math.exp(-(dy * dy) / (2 * 140 * 140));
          const amp = line.amp * (1 + energy * 1.6) * (1 + near * 3.2);
          const y =
            baseY +
            Math.sin((x / line.wavelength) * Math.PI * 2 + t * line.speed * Math.PI * 2) * amp +
            Math.sin((x / (line.wavelength * 0.37)) * Math.PI * 2 - t * line.speed * 1.7) *
              amp *
              0.25;
          if (x < 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = line.color;
        ctx.lineWidth = 1.25;
        ctx.stroke();
      }
      raf = requestAnimationFrame(draw);
    };

    if (reduceMotion) {
      // Single static frame: gentle frozen waves, no cursor/playback response.
      ctx.clearRect(0, 0, w, h);
      for (const line of LINES) {
        const baseY = line.yFrac * h;
        ctx.beginPath();
        for (let x = 0; x <= w; x += 6) {
          const y = baseY + Math.sin((x / line.wavelength) * Math.PI * 2) * line.amp;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = line.color;
        ctx.lineWidth = 1.25;
        ctx.stroke();
      }
    } else {
      raf = requestAnimationFrame(draw);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerout", onLeave);
      window.removeEventListener("ethan:music-playing", onPlaying);
    };
  }, []);

  return <canvas ref={canvasRef} className="music-page__waves" aria-hidden="true" />;
}
