"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

/**
 * Smooth inertia scrolling (Lenis), mirroring the original site.
 * - Skipped under prefers-reduced-motion.
 * - Skipped on the Music page, which is a GSAP ScrollTrigger experience that
 *   drives its own pinned scroll.
 * - Routes in-page anchor links through Lenis for smooth jumps.
 * - Exposes window.__lenis and keeps GSAP ScrollTrigger in sync when present.
 */
export default function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
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
      const anchor = (e.target as HTMLElement | null)?.closest?.(
        'a[href^="#"]'
      ) as HTMLAnchorElement | null;
      if (!anchor) return;
      const id = anchor.getAttribute("href");
      if (id && id.length > 1) {
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          lenis.scrollTo(target as HTMLElement);
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
