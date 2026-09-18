"use client";

import { useEffect } from "react";

/**
 * Sticky hero that the rest of the page slides up over.
 *
 * The hero stays pinned for the first viewport of scrolling while `.content`
 * rises over it like a sheet (the runway and overlap are set up in the "Hero
 * overlap" block in globals.css). This effect just publishes scroll progress
 * as `--hero-exit` (0→1) and fades the hero's text out ahead of the cover.
 */
export default function Hero() {
  useEffect(() => {
    const root = document.documentElement;
    const layers = document.querySelectorAll<HTMLElement>(
      ".topbar, .hero__center, .hero__footer"
    );
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
