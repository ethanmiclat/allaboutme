"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { ROWS, type FlixItem } from "@/lib/films";

/**
 * ETHANFLIX — the Films / Movies page (/hobbies/films), styled as a Netflix
 * takeover:
 *
 *   intro  → a black screen with the big red "E" logo (a Netflix-intro homage:
 *            the letter lights up, a sheen sweeps across, then it zooms past the
 *            "camera" and hands off to the catalogue). Plays once on load.
 *   browse → a Netflix-style catalogue: the ETHANFLIX wordmark header over rows
 *            (Movies / Shows / Anime / Books), each a horizontally-scrollable
 *            strip of poster tiles. Clicking a tile opens its trailer in a tab.
 *
 * The intro is CSS-driven; under prefers-reduced-motion (or on click/Esc to
 * skip) it's bypassed so the catalogue shows immediately.
 */
export default function EthanflixExperience() {
  // The intro plays once, then we settle into the catalogue.
  const [intro, setIntro] = useState(true);

  useEffect(() => {
    // Honor reduced-motion: skip straight to the catalogue (0ms), else play the
    // ~3s intro. setState stays inside the timer callback (not the effect body).
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = window.setTimeout(() => setIntro(false), reduce ? 0 : 3000);
    return () => window.clearTimeout(t);
  }, []);

  // Let the viewer skip the intro with a click or Esc.
  useEffect(() => {
    if (!intro) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" || e.key === "Enter") setIntro(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [intro]);

  return (
    <div className="flix" data-intro={intro ? "" : undefined}>
      <Catalogue />

      {/* Intro overlay — stays mounted but inert/faded once done so the dive
          reads as one motion into the catalogue underneath. */}
      <div
        className="flix-intro"
        aria-hidden="true"
        inert={!intro}
        onClick={() => setIntro(false)}
      >
        {/* One element carries the single continuous zoom for the whole intro
            (logo + flood + lines), so nothing starts a second zoom. */}
        <span className="flix-intro__zoom">
          <span className="flix-intro__logo">
            {/* Surface lighting + travelling sheen, masked to the E. */}
            <span className="flix-intro__shade" />
            {/* The fold shadow — middle arm only, right of the spine. */}
            <span className="flix-intro__fold" />
          </span>
          {/* Red we dive "into" mid-zoom, bridging the letter to the lines. */}
          <span className="flix-intro__flood" />
          {/* Warp: the red becomes many fine streaking lines on the dive-in. */}
          <span className="flix-intro__lines" />
        </span>
      </div>
    </div>
  );
}

function Catalogue() {
  return (
    <main className="flix-catalogue">
      <header className="flix-topbar">
        <span className="flix-wordmark">ETHANFLIX</span>
        <Link className="flix-back" href="/#hobbies" scroll={false}>
          <ArrowLeft aria-hidden="true" />
          Back
        </Link>
      </header>

      <section className="flix-billboard">
        <h1 className="flix-billboard__title">Ethan&rsquo;s Picks</h1>
        <p className="flix-billboard__blurb">
          The movies, shows, anime, and books on heavy rotation. Pick a tile to
          roll its trailer.
        </p>
      </section>

      <div className="flix-rows">
        {ROWS.map((row) => (
          <Row key={row.category} category={row.category} items={row.items} />
        ))}
      </div>
    </main>
  );
}

/** Pixels the auto-drift advances each frame (~60fps → a slow, readable crawl). */
const DRIFT_SPEED = 0.45;
/** Idle delay before the auto-drift resumes after the viewer interacts. */
const RESUME_DELAY = 1400;

function Row({ category, items }: { category: string; items: FlixItem[] }) {
  const stripRef = useRef<HTMLUListElement>(null);
  // A row only loops once it actually overflows its viewport — short rows (e.g.
  // a single book) render once so we never show side-by-side duplicates.
  const [looping, setLooping] = useState(false);

  // Drift is paused while the viewer hovers/grabs/scrolls, then resumes on idle.
  const pausedRef = useRef(false);
  const resumeTimer = useRef<number | undefined>(undefined);
  // Click-drag ("grab and scroll") bookkeeping.
  const drag = useRef({ active: false, startX: 0, startLeft: 0, moved: false });

  const pause = () => {
    pausedRef.current = true;
    window.clearTimeout(resumeTimer.current);
  };
  const resumeSoon = () => {
    window.clearTimeout(resumeTimer.current);
    resumeTimer.current = window.setTimeout(() => {
      pausedRef.current = false;
    }, RESUME_DELAY);
  };

  // Detect overflow (so we know whether to loop) and re-check on resize.
  useEffect(() => {
    const el = stripRef.current;
    if (!el) return;
    const measure = () => {
      const oneSet = looping ? el.scrollWidth / 3 : el.scrollWidth;
      if (!looping && oneSet - el.clientWidth > 4) setLooping(true);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [looping, items.length]);

  // Once looping, start centred in the middle copy so there's room to wrap both
  // ways, then run the auto-drift (skipped under prefers-reduced-motion).
  useEffect(() => {
    const el = stripRef.current;
    if (!el || !looping) return;

    el.scrollLeft = el.scrollWidth / 3;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    // scrollLeft snaps to whole pixels, so a sub-pixel step would round to zero
    // and never move. Accumulate the fraction and apply only whole-pixel jumps.
    let raf = 0;
    let acc = 0;
    const tick = () => {
      if (!pausedRef.current && !drag.current.active) {
        acc += DRIFT_SPEED;
        const step = Math.floor(acc);
        if (step) {
          acc -= step;
          el.scrollLeft += step;
        }
      }
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [looping]);

  // Seamless wrap: each of the 3 copies is identical, so jumping by exactly one
  // set width whenever we cross a seam is visually invisible.
  const onScroll = () => {
    const el = stripRef.current;
    if (!el || !looping) return;
    const w = el.scrollWidth / 3;
    if (el.scrollLeft < w) el.scrollLeft += w;
    else if (el.scrollLeft >= 2 * w) el.scrollLeft -= w;
  };

  const nudge = (dir: 1 | -1) => {
    const el = stripRef.current;
    if (!el) return;
    pause();
    resumeSoon();
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  // Pointer drag-to-scroll. We pause drift on press and only swallow the click
  // if the pointer actually moved (so taps still open the trailer).
  const onPointerDown = (e: React.PointerEvent<HTMLUListElement>) => {
    const el = stripRef.current;
    if (!el || e.button !== 0) return;
    drag.current = { active: true, startX: e.clientX, startLeft: el.scrollLeft, moved: false };
    pause();
  };
  const onPointerMove = (e: React.PointerEvent<HTMLUListElement>) => {
    const el = stripRef.current;
    const d = drag.current;
    if (!el || !d.active) return;
    const dx = e.clientX - d.startX;
    if (Math.abs(dx) > 4) d.moved = true;
    el.scrollLeft = d.startLeft - dx;
  };
  const endDrag = () => {
    if (!drag.current.active) return;
    drag.current.active = false;
    resumeSoon();
  };
  const onClickCapture = (e: React.MouseEvent<HTMLUListElement>) => {
    if (drag.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = false;
    }
  };

  // Hover (mouse only) holds the drift; touch relies on press/scroll + idle.
  const onPointerEnter = (e: React.PointerEvent<HTMLUListElement>) => {
    if (e.pointerType === "mouse") pause();
  };
  const onPointerLeave = (e: React.PointerEvent<HTMLUListElement>) => {
    endDrag();
    if (e.pointerType === "mouse") resumeSoon();
  };

  const rendered = looping ? [...items, ...items, ...items] : items;

  return (
    <section className="flix-row">
      <h2 className="flix-row__label">{category}</h2>

      <div className="flix-row__viewport">
        <button
          type="button"
          className="flix-row__arrow flix-row__arrow--left"
          aria-label={`Scroll ${category} left`}
          onClick={() => nudge(-1)}
        >
          <ChevronLeft aria-hidden="true" />
        </button>

        <ul
          className="flix-strip"
          ref={stripRef}
          data-looping={looping ? "" : undefined}
          onScroll={onScroll}
          onWheel={() => {
            pause();
            resumeSoon();
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onPointerEnter={onPointerEnter}
          onPointerLeave={onPointerLeave}
          onClickCapture={onClickCapture}
        >
          {rendered.map((item, i) => (
            <li key={`${category}-${i}`} className="flix-card" aria-hidden={looping && i >= items.length ? "true" : undefined}>
              <a
                className="flix-card__link"
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                draggable={false}
                tabIndex={looping && i >= items.length ? -1 : undefined}
              >
                {item.poster ? (
                  // eslint-disable-next-line @next/next/no-img-element -- user art; next/image adds no value here
                  <img
                    className="flix-card__poster"
                    src={item.poster}
                    alt={item.title}
                    draggable={false}
                  />
                ) : (
                  <span
                    className="flix-card__placeholder"
                    style={{ ["--i" as string]: i % items.length }}
                  >
                    <span className="flix-card__brand">E</span>
                    <span className="flix-card__title">{item.title}</span>
                  </span>
                )}
                <span className="flix-card__caption">{item.title}</span>
              </a>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="flix-row__arrow flix-row__arrow--right"
          aria-label={`Scroll ${category} right`}
          onClick={() => nudge(1)}
        >
          <ChevronRight aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
