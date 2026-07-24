"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

type Panel = {
  key: string;
  href: string;
  title: string;
  mediaClass: string;
};

const PANELS: Panel[] = [
  {
    key: "music",
    href: "/hobbies/music",
    title: "Music",
    mediaClass: "hobby-panel__media--music",
  },
  {
    key: "sports",
    href: "/hobbies/sports",
    title: "Sports",
    mediaClass: "hobby-panel__media--sports",
  },
  {
    key: "games",
    href: "/hobbies/games",
    title: "Video Games",
    mediaClass: "hobby-panel__media--games",
  },
  {
    key: "films",
    href: "/hobbies/films",
    title: "Shows / Movies",
    mediaClass: "hobby-panel__media--films",
  },
];

/**
 * Hobbies as a sticky scroll-stack: each hobby is a full-height panel pinned
 * with `position: sticky`, and the next panel scrolls up and covers it. No
 * arrows or dots — the whole section is traversed by scrolling. Each panel is a
 * link into that hobby's takeover route. The Sports panel keeps the sway/fade
 * handoff into the Hall of Fame page.
 */
export default function HobbiesScroll() {
  // Which panels have scrolled into view (one-time entrance for the body copy).
  const [shown, setShown] = useState<Set<string>>(new Set());
  // Clicking Sports lets its panel sway + fade before routing into the page.
  const [entering, setEntering] = useState(false);
  const router = useRouter();
  const enterTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const stackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => () => clearTimeout(enterTimer.current), []);

  // Fade each panel's text up the first time the panel fills most of the screen.
  useEffect(() => {
    const root = stackRef.current;
    if (!root) return;
    const panels = Array.from(
      root.querySelectorAll<HTMLElement>("[data-panel]")
    );
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)) {
      setShown(new Set(panels.map((p) => p.dataset.panel as string)));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        const revealed: string[] = [];
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            revealed.push((entry.target as HTMLElement).dataset.panel as string);
            io.unobserve(entry.target);
          }
        });
        if (revealed.length) {
          setShown((prev) => {
            const next = new Set(prev);
            revealed.forEach((k) => next.add(k));
            return next;
          });
        }
      },
      { threshold: 0.6 }
    );
    panels.forEach((p) => io.observe(p));
    return () => io.disconnect();
  }, []);

  // Close the curtains, then route to the Sports page. Modified clicks (new tab)
  // and reduced-motion skip straight to navigation.
  const enterSports = (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      router.push("/hobbies/sports");
      return;
    }
    router.prefetch("/hobbies/sports");
    setEntering(true);
    enterTimer.current = setTimeout(() => router.push("/hobbies/sports"), 320);
  };

  return (
    <div className="hobby-stack" ref={stackRef}>
      {/* Intro panel — introduces the section (not a link). */}
      <section className="hobby-panel hobby-panel--intro">
        <div className="hobby-panel__media hobby-panel__media--intro" />
        <div className="hobby-panel__scrim" />
        <div className="hobby-panel__body">
          <p className="eyebrow">Interests &amp; Pursuits</p>
          <h2 className="hobby-panel__title hobby-panel__title--intro ital">
            The things I love
          </h2>
          <span className="hobby-panel__hint" aria-hidden="true">
            Scroll to wander through
          </span>
        </div>
      </section>

      {PANELS.map((p, i) => (
        <Link
          key={p.key}
          href={p.href}
          // Anchor per panel so each hobby page's Back link can land the
          // scroll-stack right back on the panel the user left from.
          id={`hobby-${p.key}`}
          className="hobby-panel"
          data-panel={p.key}
          data-shown={shown.has(p.key) ? "" : undefined}
          data-entering={p.key === "sports" && entering ? "" : undefined}
          aria-label={`Open ${p.title}`}
          onClick={p.key === "sports" ? enterSports : undefined}
        >
          <div className={`hobby-panel__media ${p.mediaClass}`} />
          <div className="hobby-panel__scrim" />
          <div className="hobby-panel__body">
            <span className="hobby-panel__index" aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
              <span className="hobby-panel__index-sep">/</span>
              {String(PANELS.length).padStart(2, "0")}
            </span>
            <h3 className="hobby-panel__title ital">{p.title}</h3>
            <span className="hobby-panel__cta">
              Explore
              <ArrowRight aria-hidden="true" />
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
