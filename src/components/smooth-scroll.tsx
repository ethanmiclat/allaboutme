"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

/**
 * Smooth inertia scrolling (Lenis), mirroring the original site.
 * - Skipped under prefers-reduced-motion.
 * - Skipped on the Music page, which is a GSAP ScrollTrigger experience that
 *   drives its own pinned scroll.
 * - Routes in-page anchor links through Lenis for smooth jumps.
 * - Exposes window.__lenis and keeps GSAP ScrollTrigger in sync when present.
 *
 * This is a LAYOUT effect on purpose. As a passive effect, the outgoing
 * route's Lenis survived past the incoming route's first paint (until the
 * post-hydration effect flush — over a second on heavy pages in dev), and its
 * RAF kept re-asserting its stale internal scroll onto the new page: entering
 * an experience re-yanked you to the homepage's depth ("opens at the bottom"),
 * and coming home the experience's ~0 yanked you to the hero. Layout effects
 * clean up at commit, before the new page paints, so the old instance is dead
 * before any of that can happen.
 */
export default function SmoothScroll() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (pathname === "/hobbies/music") return;

    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    // keep ScrollTrigger (if loaded by another page) in sync
    lenis.on("scroll", () => {
      (window as unknown as { ScrollTrigger?: { update: () => void } }).ScrollTrigger?.update();
    });

    const onClick = (e: MouseEvent) => {
      // Leave modified/already-handled clicks to the browser (new tab, etc.).
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
        return;
      const anchor = (e.target as HTMLElement | null)?.closest?.(
        'a[href^="#"]'
      ) as HTMLAnchorElement | null;
      if (!anchor) return;
      const id = anchor.getAttribute("href");
      if (id && id.length > 1) {
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          // Tag it as a nav jump so section gates (e.g. the hobbies snap) let it
          // pass through instead of grabbing it mid-scroll. Lenis clears userData
          // when the scroll completes or the user interrupts.
          lenis.scrollTo(target as HTMLElement, { userData: { nav: true } });
        }
      }
    };
    document.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("click", onClick);
      lenis.destroy();
      (window as unknown as { __lenis?: Lenis }).__lenis = undefined;
    };
  }, [pathname]);

  return null;
}
