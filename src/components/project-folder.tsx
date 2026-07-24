"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowUpRight, Info } from "lucide-react";
import { PROJECTS } from "@/lib/projects";

/**
 * Interactive "project folder": file-divider tabs on the left, a preview
 * sheet on the right. Hovering or focusing a tab previews that project;
 * the sheet crossfades and its screen recording starts playing.
 */
export default function ProjectFolder() {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const sheetRefs = useRef<(HTMLElement | null)[]>([]);

  // The sheets stack in one grid cell, so the tallest one would set the
  // preview box's height — leaving its outline hanging below a shorter
  // sheet's "Visit Site" link. Size the box to the *active* sheet instead
  // (and follow it via ResizeObserver, e.g. when the video's media loads).
  useLayoutEffect(() => {
    const box = previewRef.current;
    const sheet = sheetRefs.current[active];
    if (!box || !sheet) return;
    const fit = () => {
      const cs = getComputedStyle(box);
      const extra =
        parseFloat(cs.paddingTop) +
        parseFloat(cs.paddingBottom) +
        parseFloat(cs.borderTopWidth) +
        parseFloat(cs.borderBottomWidth);
      box.style.height = `${sheet.offsetHeight + extra}px`;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(sheet);
    return () => ro.disconnect();
  }, [active]);

  // Only the visible sheet's recording plays; the rest pause where they are.
  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i === active) v.play().catch(() => {});
      else v.pause();
    });
  }, [active]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const dir =
      e.key === "ArrowDown" || e.key === "ArrowRight"
        ? 1
        : e.key === "ArrowUp" || e.key === "ArrowLeft"
          ? -1
          : 0;
    if (!dir) return;
    e.preventDefault();
    const next = (active + dir + PROJECTS.length) % PROJECTS.length;
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  // Tabs are split into two columns flanking the preview; `i` stays the
  // project's global index so the active state and keyboard nav still line up.
  const renderTab = (p: (typeof PROJECTS)[number], i: number) => (
    <button
      key={p.key}
      ref={(el) => {
        tabRefs.current[i] = el;
      }}
      type="button"
      role="tab"
      id={`folder-tab-${p.key}`}
      aria-selected={i === active}
      aria-controls={`folder-sheet-${p.key}`}
      tabIndex={i === active ? 0 : -1}
      className="folder-tab"
      data-active={i === active ? "" : undefined}
      data-placeholder={p.placeholder ? "" : undefined}
      onClick={() => setActive(i)}
      onMouseEnter={() => setActive(i)}
      onFocus={() => setActive(i)}
    >
      <span className="folder-tab__meta">{p.meta}</span>
      <span className="folder-tab__name">{p.name}</span>
      <span className="folder-tab__blurb">{p.blurb}</span>
    </button>
  );

  const mid = Math.ceil(PROJECTS.length / 2);

  return (
    <div className="folder">
      <div
        className="folder__tabs folder__tabs--left"
        role="tablist"
        aria-label="Projects"
        aria-orientation="vertical"
        onKeyDown={onKeyDown}
      >
        {PROJECTS.slice(0, mid).map((p, i) => renderTab(p, i))}
      </div>

      <div className="folder__preview" ref={previewRef}>
        {PROJECTS.map((p, i) => {
          const isActive = i === active;
          return (
            <figure
              key={p.key}
              ref={(el) => {
                sheetRefs.current[i] = el;
              }}
              id={`folder-sheet-${p.key}`}
              role="tabpanel"
              aria-labelledby={`folder-tab-${p.key}`}
              className="folder-sheet"
              data-active={isActive ? "" : undefined}
              aria-hidden={!isActive}
            >
              <div className="folder-sheet__media">
                {p.video ? (
                  <video
                    ref={(el) => {
                      videoRefs.current[i] = el;
                    }}
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    poster={p.poster}
                  >
                    <source src={p.video} type="video/mp4" />
                  </video>
                ) : p.placeholder ? (
                  <div className="folder-sheet__empty">
                    <span className="folder-sheet__empty-title ital">
                      A future project
                    </span>
                    <span className="folder-sheet__empty-text">
                      This slot is ready for a screen recording.
                    </span>
                  </div>
                ) : (
                  <div className="folder-sheet__empty">
                    <span className="folder-sheet__empty-title ital">
                      {p.tagline}
                    </span>
                    <span className="folder-sheet__empty-text">{p.blurb}</span>
                  </div>
                )}
              </div>
              <figcaption className="folder-sheet__info">
                <span className="folder-sheet__meta">{p.meta}</span>
                <h3 className="folder-sheet__title">{p.name}</h3>
                <p className="folder-sheet__desc">{p.description}</p>
                {p.note && (
                  <p className="folder-sheet__note" role="note">
                    <Info className="folder-sheet__note-icon" aria-hidden="true" />
                    <span>{p.note}</span>
                  </p>
                )}
                {p.href && (
                  <a
                    className="folder-sheet__link"
                    href={p.href}
                    target="_blank"
                    rel="noopener"
                    tabIndex={isActive ? undefined : -1}
                  >
                    {p.linkLabel ?? "Visit Site"}
                    <ArrowUpRight aria-hidden="true" />
                  </a>
                )}
              </figcaption>
            </figure>
          );
        })}
      </div>

      <div
        className="folder__tabs folder__tabs--right"
        role="tablist"
        aria-label="Projects (continued)"
        aria-orientation="vertical"
        onKeyDown={onKeyDown}
      >
        {PROJECTS.slice(mid).map((p, i) => renderTab(p, i + mid))}
      </div>
    </div>
  );
}
