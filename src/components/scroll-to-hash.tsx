"use client";

import { useEffect, useLayoutEffect } from "react";

/** Sections tracked for the URL hash, in document order. */
const SECTION_IDS = ["home", "about", "hobbies", "projects", "contact", "location"];

/**
 * Keeps the URL in sync with the section you're actually looking at.
 *
 * 1. On arrival with a hash — e.g. a hobby "Back" button (→ /#hobbies) — it jumps
 *    straight to that section in a layout effect (before paint), so the page opens
 *    already on the section instead of loading at the top and scrolling down. The
 *    back links use `scroll={false}` so Next.js doesn't also scroll; this owns it.
 * 2. As you scroll, it rewrites the hash to the current section (and clears it at
 *    the top) via history.replaceState — so the URL never gets stuck on, say,
 *    /#hobbies once you've scrolled away. replaceState doesn't scroll or pollute
 *    the back button.
 */
export default function ScrollToHash() {
  // (1) Land on the incoming hash before the first paint.
  useLayoutEffect(() => {
    const hash = window.location.hash;
    if (!hash || hash.length < 2) return;
    const el = document.querySelector(hash);
    if (!el || !(el instanceof HTMLElement)) return;

    // Absolute document position to land on, via the accumulated offsetTop
    // chain rather than getBoundingClientRect. This matters because the hero
    // handoff applies a translateY transform to `.content`; getBoundingClientRect
    // reflects that visual shift (skewing the target by a whole viewport, and
    // by a varying amount depending on when it's read — the source of the
    // intermittent wrong landing), whereas offsetTop reports the untransformed
    // layout position. For the sticky hobby panels that flow position is exactly
    // the scroll offset at which the panel locks to the top of the viewport.
    let top = 0;
    for (
      let node: HTMLElement | null = el;
      node;
      node = node.offsetParent as HTMLElement | null
    ) {
      top += node.offsetTop;
    }

    // Land immediately (pre-paint, so there's no flash of the top).
    window.scrollTo({ top, behavior: "instant" as ScrollBehavior });

    // Then hold the position for a short window. Coming back from a hobby page,
    // the previous route's Lenis instance is torn down and a fresh one is
    // created on this page; in the gap a stale RAF can yank the scroll back to
    // ~0 (the hero), or the new Lenis can initialize from a clobbered position.
    // Re-asserting — and pushing the new Lenis to the target once it exists —
    // defeats both races. We stop the moment the user actually scrolls, so this
    // never fights a real interaction.
    //
    // The window is measured in WALL-CLOCK time, not a frame count: a fixed
    // number of frames lasts only ~66ms on a 120Hz ProMotion display (vs ~266ms
    // at 60Hz) — too short for the incoming Lenis to settle, which let the race
    // slip through and land on the hero on high-refresh screens. A fixed 500ms
    // holds long enough on any refresh rate.
    type LenisLike = {
      scrollTo: (t: number, o?: { immediate?: boolean; force?: boolean }) => void;
    };
    const HOLD_MS = 500;
    const startedAt = performance.now();
    let raf = 0;
    let done = false;
    const stop = () => {
      done = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchstart", stop);
      window.removeEventListener("keydown", stop);
    };
    const hold = () => {
      if (done) return;
      const lenis = (window as unknown as { __lenis?: LenisLike }).__lenis;
      if (lenis) {
        // Lenis owns the scroll — set its internal target so it can't drift back.
        lenis.scrollTo(top, { immediate: true, force: true });
      } else if (Math.abs(window.scrollY - top) > 2) {
        window.scrollTo({ top, behavior: "instant" as ScrollBehavior });
      }
      if (performance.now() - startedAt < HOLD_MS) raf = requestAnimationFrame(hold);
      else stop();
    };
    raf = requestAnimationFrame(hold);
    window.addEventListener("wheel", stop, { passive: true });
    window.addEventListener("touchstart", stop, { passive: true });
    window.addEventListener("keydown", stop);
    return stop;
  }, []);

  // (2) Scrollspy: keep the hash pointing at the section in view.
  useEffect(() => {
    const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null
    );
    if (!sections.length) return;

    let current = window.location.hash.slice(1);
    let ticking = false;
    // The first pass only syncs `current` — it must NOT rewrite the URL.
    // Effect (1) may have just landed on a panel anchor like #hobby-games;
    // rewriting it to #hobbies here would make a remount (e.g. StrictMode's
    // dev double-mount) re-land on the section top instead of the panel.
    let settled = false;

    const apply = () => {
      ticking = false;
      // The section whose top has most recently passed a probe line a third of
      // the way down the viewport is the one being read.
      const probe = window.innerHeight * 0.35;
      let activeId = sections[0].id;
      for (const s of sections) {
        if (s.getBoundingClientRect().top <= probe) activeId = s.id;
      }
      const first = !settled;
      settled = true;
      if (activeId === current) return;
      current = activeId;
      if (first) return;
      // "home" (the hero) clears the hash so the top of the site is just "/".
      const url =
        activeId && activeId !== "home"
          ? `#${activeId}`
          : window.location.pathname + window.location.search;
      window.history.replaceState(null, "", url);
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(apply);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    apply();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return null;
}
