"use client";

import { useLayoutEffect } from "react";

/**
 * Lands the page directly on a hash section with no visible scroll.
 *
 * When you arrive via a cross-page link that carries a hash — e.g. a hobby
 * "Back" button (→ /#hobbies) — this jumps to that section in a layout effect,
 * which runs *before the browser paints*, so the page simply opens already on
 * the section instead of loading at the top and then scrolling/jumping down.
 *
 * The back links use `scroll={false}` so Next.js doesn't also try to scroll;
 * this owns it. Lenis (smooth scrolling) initialises after paint and reads this
 * position, so nothing animates afterward.
 */
export default function ScrollToHash() {
  useLayoutEffect(() => {
    const hash = window.location.hash;
    if (!hash || hash.length < 2) return;
    const el = document.querySelector(hash);
    if (el) {
      el.scrollIntoView({ behavior: "instant" as ScrollBehavior, block: "start" });
    }
  }, []);

  return null;
}
