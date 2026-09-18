"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { PROJECTS } from "@/lib/projects";

/** Folders shown at once — half in each column flanking the preview. */
const PAGE_SIZE = 6;
const PAGES = Math.ceil(PROJECTS.length / PAGE_SIZE);
const pageOf = (i: number) => Math.floor(i / PAGE_SIZE);
/** How long the outgoing folders take to slide away — matches the
    folder-page-out animation in globals.css. */
const PAGE_EXIT_MS = 380;

/**
 * Interactive "project folder": file-divider tabs flank a preview sheet.
 * Hovering or focusing a tab previews that project; the sheet crossfades and
 * its screen recording starts playing. With more than one page of projects,
 * arrows on the outer edges page through the tabs — the preview stays put
 * until a tab on the new page is picked.
 */
export default function ProjectFolder() {
  const [active, setActive] = useState(0);
  const [page, setPage] = useState(0);
  // Which way the last page turn went, so the incoming tabs slide in from
  // that side.
  const [dir, setDir] = useState(1);
  // True while the current page's folders slide out, before the next page
  // mounts and slides in.
  const [leaving, setLeaving] = useState(false);
  const leaveTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(leaveTimer.current), []);
  // Keyboard nav can cross onto another page; the target tab only exists
  // after that page renders, so focus it in an effect.
  const focusNext = useRef<number | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const sheetRefs = useRef<(HTMLElement | null)[]>([]);
  const folderRef = useRef<HTMLDivElement | null>(null);

  // The Projects section sits well down the homepage — without this, the
  // effect below would start the active preview decoding the instant the
  // page mounts, looping away in the background for as long as a visitor
  // sits up on the hero/about sections. Gate playback to when the folder is
  // actually on screen.
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = folderRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => setInView(Boolean(entries[0]?.isIntersecting)),
      { rootMargin: "200px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

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

  // Only the active sheet's recording plays, and only while the folder is
  // actually in view; every other video (and all of them once scrolled away)
  // stays paused.
  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i === active && inView) v.play().catch(() => {});
      else v.pause();
    });
  }, [active, inView]);

  useEffect(() => {
    if (focusNext.current === null) return;
    tabRefs.current[focusNext.current]?.focus();
    focusNext.current = null;
  }, [page, active]);

  const turnPage = (step: number) => {
    if (leaving) return;
    setDir(step);
    const flip = () => setPage((p) => (p + step + PAGES) % PAGES);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      flip();
      return;
    }
    setLeaving(true);
    leaveTimer.current = window.setTimeout(() => {
      flip();
      setLeaving(false);
    }, PAGE_EXIT_MS);
  };

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
    if (pageOf(next) !== page) {
      setDir(dir);
      setPage(pageOf(next));
    }
    setActive(next);
    focusNext.current = next;
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
      tabIndex={i === rovingTab ? 0 : -1}
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

  const start = page * PAGE_SIZE;
  const onPage = PROJECTS.slice(start, start + PAGE_SIZE);
  const mid = Math.ceil(onPage.length / 2);
  // The one tab reachable with Tab: the active one if it's on this page,
  // otherwise the page's first.
  const rovingTab = pageOf(active) === page ? active : start;

  return (
    <div
      className="folder"
      ref={folderRef}
      data-paged={PAGES > 1 ? "" : undefined}
      data-leaving={leaving ? "" : undefined}
    >
      {PAGES > 1 && (
        <button
          type="button"
          className="folder__arrow folder__arrow--prev"
          aria-label="Previous projects"
          onClick={() => turnPage(-1)}
        >
          <ChevronLeft aria-hidden="true" />
        </button>
      )}

      <div
        key={`left-${page}`}
        className="folder__tabs folder__tabs--left"
        role="tablist"
        aria-label="Projects"
        aria-orientation="vertical"
        style={{ "--page-dir": dir } as React.CSSProperties}
        onKeyDown={onKeyDown}
      >
        {onPage.slice(0, mid).map((p, i) => renderTab(p, start + i))}
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
        key={`right-${page}`}
        className="folder__tabs folder__tabs--right"
        role="tablist"
        aria-label="Projects (continued)"
        aria-orientation="vertical"
        style={{ "--page-dir": dir } as React.CSSProperties}
        onKeyDown={onKeyDown}
      >
        {onPage.slice(mid).map((p, i) => renderTab(p, start + mid + i))}
      </div>

      {PAGES > 1 && (
        <>
          <button
            type="button"
            className="folder__arrow folder__arrow--next"
            aria-label="Next projects"
            onClick={() => turnPage(1)}
          >
            <ChevronRight aria-hidden="true" />
          </button>
          <p className="folder__page" aria-live="polite">
            {page + 1} / {PAGES}
          </p>
        </>
      )}
    </div>
  );
}
