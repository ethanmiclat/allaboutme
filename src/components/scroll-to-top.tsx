"use client";

import { useLayoutEffect } from "react";

/**
 * Forces the window to the top on mount (before paint), so the page doesn't
 * land mid-scroll after navigation. Runs as a layout effect so it happens
 * before the carousel's ScrollTrigger measures.
 */
export default function ScrollToTop() {
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  return null;
}
