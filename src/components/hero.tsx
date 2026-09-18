"use client";

import { useEffect } from "react";

/**
 * Sticky hero that the rest of the page slides in over, from the right.
 *
 * Scrolling through the first viewport moves nothing vertically: the hero
 * stays pinned while `.content` slides in over it from the right like a sheet
 * laid on top. This effect drives that from one scroll-progress value
 * (`--hero-exit`, 0→1) — the CSS half (see the "Hero overlap" block in
 * globals.css) sets up the runway and dims the hero; the JS half below moves
 * the content.
 *
 * The content's vertical hold: globals.css pulls `.content` up by one viewport
 * so its natural top lands at scrollY = 100dvh. Before that point we cancel the
 * leftover distance with translateY, so the content stays level with the top
 * of the screen and only travels horizontally. Both offsets hit zero at the
 * same instant, so the transform can be dropped and normal scrolling continues
 * seamlessly.
 *
 * Everything here is skipped under prefers-reduced-motion, which is also what
 * gates the CSS — so the two stay consistent and the page just scrolls plainly.
 */
export default function Hero() {
  useEffect(() => {
    const root = document.documentElement;
    const layers = document.querySelectorAll<HTMLElement>(
      ".topbar, .hero__center, .hero__footer"
    );
    const content = document.querySelector<HTMLElement>(".content");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let ticking = false;
    const update = () => {
      const runway = window.innerHeight;
      const p = Math.min(Math.max(window.scrollY / runway, 0), 1);
      // Text clears well before the content covers the hero.
      const opacity = String(1 - Math.min(1, p * 1.6));
      layers.forEach((el) => {
        el.style.opacity = opacity;
      });
      root.style.setProperty("--hero-exit", p.toFixed(4));
      if (content && !reduced) {
        // translateX is a percentage of the content's own width (= one
        // viewport) rather than 100vw, so a visible scrollbar can't skew it.
        content.style.transform =
          p < 1
            ? `translate3d(${((1 - p) * 100).toFixed(3)}%, ${(
                window.scrollY - runway
              ).toFixed(2)}px, 0)`
            : "";
      }
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    // The runway length is a viewport height, so a resize changes the math.
    window.addEventListener("resize", onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section className="hero" id="home">
      <div
        className="hero__bg"
        role="img"
        aria-label="Ethan Miclat watching a rainbow over the sea"
      />
      <div className="hero__overlay" />

      <header className="topbar" aria-hidden="true" />

      <div className="hero__center">
        <h1 className="hero__title">Ethan Miclat</h1>
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
