"use client";

import { useEffect, useRef } from "react";

/**
 * Portrait with a gentle 3D tilt that follows the pointer, plus a soft
 * light sweep. Direct style writes throttled to one rAF per frame; no
 * React state. Disabled for touch and reduced motion.
 */
export default function TiltPortrait() {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(hover: none)").matches) return;

    let raf = 0;
    let px = 0.5;
    let py = 0.5;

    const apply = () => {
      raf = 0;
      const rx = (py - 0.5) * -8; // rotateX from vertical position
      const ry = (px - 0.5) * 10; // rotateY from horizontal position
      wrap.style.setProperty("--tilt-rx", `${rx.toFixed(2)}deg`);
      wrap.style.setProperty("--tilt-ry", `${ry.toFixed(2)}deg`);
      wrap.style.setProperty("--tilt-mx", `${(px * 100).toFixed(1)}%`);
      wrap.style.setProperty("--tilt-my", `${(py * 100).toFixed(1)}%`);
    };

    const onMove = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      px = (e.clientX - r.left) / r.width;
      py = (e.clientY - r.top) / r.height;
      if (!raf) raf = requestAnimationFrame(apply);
    };

    const onLeave = () => {
      px = 0.5;
      py = 0.5;
      if (!raf) raf = requestAnimationFrame(apply);
    };

    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={wrapRef} className="tilt">
      <div className="tilt__inner">
        <div
          className="portrait"
          role="img"
          aria-label="Portrait of Ethan Miclat"
        />
        <div className="tilt__shine" aria-hidden="true" />
      </div>
    </div>
  );
}
