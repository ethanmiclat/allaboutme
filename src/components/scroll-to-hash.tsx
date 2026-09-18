"use client";

import { useEffect, useLayoutEffect } from "react";

/**
 * Sections tracked for the URL hash, in document order. The individual hobby
 * covers are tracked too (they're sticky panels inside #hobbies): parked on a
 * cover, the hash reads #hobby-<key>, so the browser's own Back button — which
 * returns to whatever hash the homepage last had — re-lands on that exact
 * cover, the same place the experiences' in-page Back links target.
 */
const SECTION_IDS = [
  "home",
  "about",
  "hobbies",
  "hobby-music",
  "hobby-sports",
  "hobby-games",
  "hobby-films",
  "projects",
  "contact",
  "location",
];

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
    // chain rather than getBoundingClientRect: getBoundingClientRect reflects
    // any in-flight transform (e.g. a .reveal entrance) and varies with when
    // it's read, whereas offsetTop reports the untransformed layout position.
    // For the sticky hobby panels that flow position is exactly
    // the scroll offset at which the panel locks to the top of the viewport.
    const measure = () => {
      let top = 0;
      for (
        let node: HTMLElement | null = el;
        node;
        node = node.offsetParent as HTMLElement | null
      ) {
        top += node.offsetTop;
      }
      return top;
    };
    let top = measure();

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
      // Re-measure each frame: web fonts / images settling during the hold can
      // shift the sections above the target, and a target computed once at
      // mount would then land slightly short ("near" the right spot).
      top = measure();
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

    // Positions come from the offsetTop chain against scrollY, NOT
    // getBoundingClientRect: rects reflect in-flight transforms and can lag a
    // frame behind other scroll handlers; offsetTop is transform-immune.
    // (For a STUCK sticky hobby panel, Chrome's offsetTop
    // reports the stuck position, making top - scrollY = 0 — i.e. "this
    // panel is on screen now" — which is exactly the right answer here.)
    //
    // These positions don't move while scrolling — only the document's flow
    // layout changes them, not scroll position — so they're measured once
    // (and re-measured on resize/content-size changes) rather than walked on
    // every scroll frame. Reading offsetTop live on every frame, right after
    // the hero's per-frame style writes, was forcing a full
    // synchronous layout recalculation tens of thousands of times over a few
    // seconds of scrolling — the site's actual "laggy" bottleneck.
    let tops: number[] = [];
    const measure = () => {
      tops = sections.map((s) => {
        let top = 0;
        for (
          let node: HTMLElement | null = s;
          node;
          node = node.offsetParent as HTMLElement | null
        ) {
          top += node.offsetTop;
        }
        return top;
      });
    };
    measure();

    const apply = () => {
      ticking = false;
      // The section whose top has most recently passed a probe line a third of
      // the way down the viewport is the one being read.
      const probe = window.innerHeight * 0.35;
      const y = window.scrollY;
      let activeId = sections[0].id;
      for (let i = 0; i < sections.length; i++) {
        if (tops[i] - y <= probe) activeId = sections[i].id;
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

    // Re-measure whenever the document's flow layout could have shifted:
    // viewport resize, or content growing/shrinking (web fonts swapping in,
    // images finishing decode, the project folder's ResizeObserver-driven
    // height sync, etc.) — both are rare compared to scroll events, so this
    // doesn't reintroduce the thrashing the caching above avoids.
    let remeasureTicking = false;
    const scheduleRemeasure = () => {
      if (remeasureTicking) return;
      remeasureTicking = true;
      requestAnimationFrame(() => {
        remeasureTicking = false;
        measure();
        apply();
      });
    };
    window.addEventListener("resize", scheduleRemeasure);
    const ro = new ResizeObserver(scheduleRemeasure);
    ro.observe(document.body);

    window.addEventListener("scroll", onScroll, { passive: true });
    apply();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", scheduleRemeasure);
      ro.disconnect();
    };
  }, []);

  return null;
}
