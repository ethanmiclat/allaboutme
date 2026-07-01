"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { HERO_TITLE_GLYPHS, HERO_TITLE_VIEWBOX } from "@/lib/hero-title";

// When the write-on starts and how long it takes (seconds).
const START_DELAY = 0.4;
const DRAW_DURATION = 3.4;
// The reveal frontier leans forward (top leads bottom) to match the script's
// slant, so letters uncover along their own axis rather than a hard vertical cut.
const FRONTIER_SLANT = 6;

const [VX, VY, , VH] = HERO_TITLE_VIEWBOX.split(" ").map(Number);
const MIN_X = Math.min(...HERO_TITLE_GLYPHS.map((g) => g.x0));
const MAX_X = Math.max(...HERO_TITLE_GLYPHS.map((g) => g.x1));
const TOP = VY - 5;
const BOT = VY + VH + 5;
const LEFT = VX - 20;

// The clip is a single parallelogram covering everything left of the frontier at
// penX. ONE value (penX) drives the whole reveal.
function clipPoints(penX: number) {
  return `${LEFT},${TOP} ${penX + FRONTIER_SLANT},${TOP} ${penX - FRONTIER_SLANT},${BOT} ${LEFT},${BOT}`;
}
const FULL_POINTS = clipPoints(MAX_X + 30);

/** Sticky hero. Foreground layers fade out on scroll while the bg stays. */
export default function Hero() {
  const clipRef = useRef<SVGPolygonElement>(null);
  const inkRefs = useRef<(SVGPathElement | null)[]>([]);

  // Draw-on: one penX sweeps left→right. It drives (a) the fill clip frontier and
  // (b) each glyph's outline stroke-dashoffset — from the SAME value, so the ink
  // edge and the filled body can never desync. Revealing a SOLID filled glyph with
  // a monotonic frontier is why there are no junction gaps/notches or detached
  // fragments (unlike a centerline pen mask). Runs pre-paint so nothing flashes;
  // without JS or under reduced-motion the finished word stays shown.
  useLayoutEffect(() => {
    const inks = inkRefs.current;
    // stroke-dasharray = each path's own measured length (per subpath), so every
    // glyph draws — never "some draw, some don't".
    const lens = inks.map((el) => (el ? el.getTotalLength() : 0));
    inks.forEach((el, i) => {
      if (!el) return;
      el.style.strokeDasharray = `${lens[i]}`;
    });

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      inks.forEach((el) => el && (el.style.strokeDashoffset = "0"));
      clipRef.current?.setAttribute("points", FULL_POINTS);
      return;
    }

    const apply = (penX: number) => {
      clipRef.current?.setAttribute("points", clipPoints(penX));
      HERO_TITLE_GLYPHS.forEach((g, i) => {
        const el = inks[i];
        if (!el) return;
        const local = Math.min(Math.max((penX - g.x0) / (g.x1 - g.x0), 0), 1);
        el.style.strokeDashoffset = `${lens[i] * (1 - local)}`;
      });
    };

    apply(MIN_X); // start hidden, before first paint (no flash)

    let raf = 0;
    let t0 = 0;
    const tick = (now: number) => {
      if (!t0) t0 = now;
      const t = (now - t0) / 1000;
      const p = Math.min(Math.max((t - START_DELAY) / DRAW_DURATION, 0), 1);
      apply(MIN_X + p * (MAX_X - MIN_X));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const layers = document.querySelectorAll<HTMLElement>(
      ".topbar, .hero__center, .hero__footer"
    );
    let ticking = false;
    const update = () => {
      const fadeOver = window.innerHeight * 0.85;
      const p = Math.min(Math.max(window.scrollY / fadeOver, 0), 1);
      const opacity = String(1 - p);
      layers.forEach((el) => {
        el.style.opacity = opacity;
      });
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="hero" id="home">
      <div
        className="hero__bg"
        role="img"
        aria-label="Ethan Miclat watching a rainbow over the sea"
      />
      <div className="hero__overlay" />

      <header className="topbar">
        <a className="brandmark" href="#home" aria-label="Ethan Miclat — home">
          Ethan Miclat
        </a>
      </header>

      <div className="hero__center">
        <h1 className="hero__title" aria-label="All About Me">
          <svg
            className="hero__sign"
            viewBox={HERO_TITLE_VIEWBOX}
            aria-hidden="true"
            focusable="false"
          >
            <defs>
              <clipPath id="hero-title-clip" clipPathUnits="userSpaceOnUse">
                {/* One frontier for the whole reveal; JS sweeps its points. */}
                <polygon ref={clipRef} points={FULL_POINTS} />
              </clipPath>
            </defs>
            <g clipPath="url(#hero-title-clip)">
              {/* Solid real Dancing Script glyphs — the visible ink. */}
              {HERO_TITLE_GLYPHS.map((g, i) => (
                <path key={`f${i}`} className="hero__sign-fill" d={g.d} />
              ))}
              {/* Same outlines stroked (dashoffset) for a crisp inked edge at the
                  frontier; clipped to the same reveal so no stray marks. */}
              {HERO_TITLE_GLYPHS.map((g, i) => (
                <path
                  key={`s${i}`}
                  className="hero__sign-ink"
                  ref={(el) => {
                    inkRefs.current[i] = el;
                  }}
                  d={g.d}
                />
              ))}
            </g>
          </svg>
        </h1>
      </div>

      <footer className="hero__footer">
        <span className="scroll-cue">scroll</span>
        <a className="pill pill--dark contact-pill" href="#contact">
          Contact Me
        </a>
      </footer>
    </section>
  );
}
