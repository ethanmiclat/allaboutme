"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, X } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ALBUM_COLUMNS,
  songPreviewUrl,
  songSearchUrl,
  type Album,
  type Song,
} from "@/lib/albums";
import SongPlayback, {
  type PlaybackStatus,
} from "@/components/ui/song-preview-player";

gsap.registerPlugin(ScrollTrigger);

// Columns are defined explicitly in albums.ts (left, middle, right).
const [COL_1, COL_2, COL_3] = ALBUM_COLUMNS;

const styles = `
  .albums-carousel {
    color: var(--text);
    font-family: var(--font-inter), sans-serif;
    margin: 0;
    /* clip (not hidden) so we don't create a scroll container that fights the
       ScrollTrigger pin. */
    overflow-x: clip;
    /* Vertical breathing room between stacked albums. Sized to leave room for
       an open song panel to hang below a cover without touching the next one. */
    --album-gap: 15vw;
  }
  @media (max-width: 768px) {
    .albums-carousel { --album-gap: 20vh; }
  }

  .col-scroll {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    justify-items: center;
    min-height: 100vh;
    width: 90vw;
    margin: 0 auto;
    box-sizing: border-box;
    padding: 0;
  }

  @media (max-width: 768px) {
    .col-scroll {
      display: flex;
      flex-direction: column;
      width: 100%;
      padding: 0;
      gap: 5vh;
      align-items: center;
    }
  }

  .col-scroll__box {
    display: flex;
    flex-direction: column;
    padding: 10vh 0 15vh;
  }

  .col-scroll__box--odd {
    flex-direction: column-reverse;
    /* Fill the viewport BELOW the intro (--cz-top, measured in JS) instead of a
       flat 100vh — otherwise the box ends below the fold and its bottom album is
       cut off. The list height the scroll animation measures is unchanged. */
    height: calc(100dvh - var(--cz-top, 0px));
    /* +14px nudges the bottom album up those last few pixels into view. */
    padding-bottom: calc(15vh - 1in + 14px);
  }

  @media (max-width: 768px) {
    .col-scroll__box--odd {
      flex-direction: column;
      height: auto;
      padding: 0;
    }
    .col-scroll__box {
      width: 100%;
      align-items: center;
      padding: 2rem 0;
    }
  }

  .col-scroll__list {
    display: flex;
    flex-direction: column;
    will-change: transform;
    /* Single source of truth: this same gap caps how tall an open song panel
       is allowed to grow, so a panel can never reach the next album. */
    gap: var(--album-gap);
  }

  .col-scroll__box--odd .col-scroll__list {
    flex-direction: column-reverse;
  }

  @media (max-width: 768px) {
    .col-scroll__box--odd .col-scroll__list {
      flex-direction: column;
    }
  }

  .album-card {
    position: relative;
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0;
    width: 20vw;
    background: transparent;
  }
  /* An open card floats above its neighbours (the panel overlays the gap). */
  .album-card[data-expanded] {
    z-index: 5;
  }

  @media (max-width: 768px) {
    .album-card {
      width: 82vw;
      margin: 0 0 6vh 0;
    }
    .album-card:last-child {
      margin-bottom: 0;
    }
  }

  .album-card__cover {
    display: block;
    width: 100%;
    margin: 0;
    padding: 0;
    border: 0;
    background: transparent;
    cursor: pointer;
  }
  .album-card__cover:focus-visible {
    outline: 2px solid var(--cream);
    outline-offset: 4px;
    border-radius: 16px;
  }

  .album-card__img-wrapper {
    position: relative;
    display: block;
    aspect-ratio: 1;
    width: 100%;
    overflow: hidden;
    border-radius: 16px;
    border: 1px solid var(--hairline);
    background: var(--card);
    box-shadow: 0 14px 50px rgba(0, 0, 0, 0.4);
  }

  .album-card__img-wrapper img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .album-card:hover img,
  .album-card__cover:focus-visible img {
    transform: scale(1.06);
  }
  .album-card[data-expanded] img {
    transform: scale(1.03);
  }

  /* ---- Click-to-open song panel ----
     The panel hangs BELOW its cover, but is absolutely positioned rather than
     inserted into the column's flow: the left/right columns are GSAP-pinned,
     and any height change inside a pinned element forces a ScrollTrigger
     recalc, which snaps the column (stale pin-spacer height = the visible
     "buffer" + displacement). Floating it keeps every column's measured height
     constant, so opening and closing are pure fade/slide.

     It can never cover the next album because its height is capped to the gap
     between stacked covers (--album-gap, minus the offset and a safety
     margin); a longer tracklist scrolls inside the panel instead of growing. */
  .album-card__drawer {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: 12px;
    z-index: 5;
    visibility: hidden;
    opacity: 0;
    transform: translateY(-10px) scale(0.98);
    transform-origin: top center;
    transition:
      opacity 0.34s ease,
      transform 0.44s cubic-bezier(0.16, 1, 0.3, 1),
      visibility 0s linear 0.44s;
  }
  .album-card__drawer[data-open] {
    visibility: visible;
    opacity: 1;
    transform: translateY(0) scale(1);
    transition:
      opacity 0.34s ease,
      transform 0.44s cubic-bezier(0.16, 1, 0.3, 1),
      visibility 0s;
  }
  /* Bottom-of-column cards (album.dropUp) open UPWARD so the panel isn't
     clipped by the bottom of the page. Same fade/slide, mirrored. */
  .album-card__drawer--up {
    top: auto;
    bottom: 100%;
    margin-top: 0;
    margin-bottom: 12px;
    transform: translateY(10px) scale(0.98);
    transform-origin: bottom center;
  }
  @media (max-width: 768px) {
    /* Mobile is a single flowing column with normal page scroll — no clipping,
       so drop-up cards fall back to opening below their cover. */
    .album-card__drawer--up {
      top: 100%;
      bottom: auto;
      margin-top: 12px;
      margin-bottom: 0;
      transform: translateY(-10px) scale(0.98);
      transform-origin: top center;
    }
  }
  .album-card__drawer--up[data-open] {
    transform: translateY(0) scale(1);
  }
  .album-card__panel {
    box-sizing: border-box;
    /* 12px offset above + 22px clearance below = the panel always stops short
       of the next cover. */
    max-height: calc(var(--album-gap) - 34px);
    display: flex;
    flex-direction: column;
    margin: 0;
    border: 1px solid var(--hairline);
    border-radius: 14px;
    background: rgba(10, 14, 18, 0.94);
    backdrop-filter: blur(8px);
    box-shadow: 0 18px 44px rgba(0, 0, 0, 0.55);
    overflow: hidden;
  }
  .album-card__panel-in {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    scrollbar-width: thin;
    padding: 14px 14px 10px;
  }

  .album-card__panel-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 10px;
  }
  .album-card__panel-titles {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  /* The open panel covers the cover button, so it needs its own way out. */
  .album-card__panel-close {
    flex: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border: 1px solid rgba(227, 230, 236, 0.2);
    border-radius: 50%;
    background: transparent;
    color: rgba(227, 230, 236, 0.6);
    cursor: pointer;
    transition: color 0.2s ease, border-color 0.2s ease;
  }
  .album-card__panel-close:hover,
  .album-card__panel-close:focus-visible {
    color: var(--cream);
    border-color: var(--cream);
  }
  .album-card__panel-close:focus-visible {
    outline: 2px solid var(--cream);
    outline-offset: 2px;
  }
  .album-card__panel-close svg {
    width: 13px;
    height: 13px;
  }
  .album-card__panel-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--text);
    line-height: 1.25;
  }
  .album-card__panel-artist {
    font-size: 12px;
    color: rgba(227, 230, 236, 0.6);
  }

  .album-card__songs {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
  }
  .album-card__song {
    border-top: 1px solid rgba(227, 230, 236, 0.1);
  }
  .album-card__song-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 9px 2px;
    border: 0;
    background: transparent;
    color: var(--text);
    font-family: inherit;
    font-size: 13px;
    text-align: left;
    cursor: pointer;
    transition: color 0.2s ease;
  }
  .album-card__song-btn:hover,
  .album-card__song-btn:focus-visible {
    color: var(--cream);
  }
  .album-card__song-btn:focus-visible {
    outline: 2px solid var(--cream);
    outline-offset: 2px;
    border-radius: 6px;
  }
  .album-card__song-btn[aria-pressed="true"] {
    color: var(--cream);
  }
  .album-card__song-num {
    font-size: 11px;
    color: rgba(227, 230, 236, 0.45);
    font-variant-numeric: tabular-nums;
    min-width: 16px;
  }
  .album-card__song-title {
    flex: 1;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  /* Right-side play/pause affordance on every row (+ eq pulse when playing). */
  .album-card__song-side {
    flex: none;
    margin-left: auto;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: rgba(227, 230, 236, 0.4);
    transition: color 0.2s ease;
  }
  .album-card__song-side svg {
    width: 12px;
    height: 12px;
  }
  .album-card__song-btn:hover .album-card__song-side,
  .album-card__song-btn:focus-visible .album-card__song-side,
  .album-card__song-btn[aria-pressed="true"] .album-card__song-side {
    color: var(--cream);
  }
  /* Tiny "now playing" equalizer glyph (not a visualizer — just a pulse). */
  .album-card__song-eq {
    display: inline-flex;
    align-items: flex-end;
    gap: 2px;
    height: 12px;
    flex: none;
  }
  .album-card__song-eq i {
    width: 2px;
    background: var(--cream);
    animation: songEq 0.9s ease-in-out infinite;
  }
  .album-card__song-eq i:nth-child(1) { height: 60%; animation-delay: 0s; }
  .album-card__song-eq i:nth-child(2) { height: 100%; animation-delay: 0.25s; }
  .album-card__song-eq i:nth-child(3) { height: 45%; animation-delay: 0.5s; }
  @keyframes songEq {
    0%, 100% { transform: scaleY(0.4); }
    50% { transform: scaleY(1); }
  }
`;

export default function AlbumImpactCarousel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [nowPlaying, setNowPlaying] = useState<{
    albumId: string;
    song: Song;
  } | null>(null);
  const [playStatus, setPlayStatus] = useState<PlaybackStatus>("loading");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // make ScrollTrigger reachable for any smooth-scroll sync
    (window as unknown as { ScrollTrigger?: typeof ScrollTrigger }).ScrollTrigger =
      ScrollTrigger;

    // Measure how far the carousel sits below the top of the page (= the intro
    // height) and expose it as --cz-top so the side columns size to the
    // remaining viewport. Without this their bottom album falls below the fold.
    const setTopOffset = () => {
      const top = container.getBoundingClientRect().top + window.scrollY;
      container.style.setProperty("--cz-top", `${Math.max(0, Math.round(top))}px`);
    };
    setTopOffset();
    // Re-measure once fonts settle (the big title can change the intro height).
    document.fonts?.ready.then(() => {
      setTopOffset();
      ScrollTrigger.refresh();
    });

    // Only apply scroll animation on desktop
    const mm = gsap.matchMedia();

    mm.add("(min-width: 769px)", () => {
      const ctx = gsap.context(() => {
        const reverseTrigger = gsap.utils.toArray<HTMLElement>(
          ".col-scroll__box--odd .col-scroll__list"
        );

        reverseTrigger.forEach((element) => {
          const elementHeight = element.offsetHeight;
          const viewportHeight = window.innerHeight;
          const extraSpace = viewportHeight * 0.2;
          const scrollDistance = elementHeight + viewportHeight + extraSpace;

          gsap.to(element, {
            yPercent: 100,
            scrollTrigger: {
              trigger: element,
              start: 0,
              end: `+=${scrollDistance}`,
              scrub: true,
              pin: true,
            },
          });
        });
      }, containerRef);

      return () => ctx.revert();
    });

    const onResize = () => {
      setTopOffset();
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      mm.revert();
    };
  }, []);

  // No ScrollTrigger.refresh() on expand/collapse: the panel is overlaid, so
  // column heights never change and the pinned scroll math stays valid.

  const toggleAlbum = (album: Album) => {
    const next = expandedId === album.id ? null : album.id;
    setExpandedId(next);
    // Collapsing or switching albums stops the running preview.
    if (nowPlaying && nowPlaying.albumId !== next) setNowPlaying(null);
  };

  const playSong = (album: Album, song: Song) => {
    // Inline playback needs a 30s Apple preview or a YouTube fallback; songs
    // with neither open a YouTube search instead.
    if (!songPreviewUrl(album, song) && !song.youtubeId) {
      window.open(songSearchUrl(album, song), "_blank", "noopener,noreferrer");
      return;
    }
    setPlayStatus("loading");
    setNowPlaying((cur) =>
      cur?.albumId === album.id && cur.song.title === song.title
        ? null
        : { albumId: album.id, song }
    );
  };

  const onPlayStatus = (s: PlaybackStatus) => {
    setPlayStatus(s);
    // A dead preview shouldn't leave a phantom "now playing" row.
    if (s === "error") setNowPlaying(null);
  };

  const renderCard = (album: Album) => (
    <AlbumCard
      key={album.id}
      album={album}
      expanded={expandedId === album.id}
      nowPlaying={nowPlaying?.albumId === album.id ? nowPlaying.song : null}
      playStatus={playStatus}
      onPlayStatus={onPlayStatus}
      onToggle={() => toggleAlbum(album)}
      onPlay={(song) => playSong(album, song)}
    />
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="albums-carousel">
        <div ref={containerRef} className="col-scroll">
          {/* Column 1 (odd — reverse scroll, pinned) */}
          <div className="col-scroll__box col-scroll__box--odd">
            <div className="col-scroll__list">{COL_1.map(renderCard)}</div>
          </div>

          {/* Column 2 (even — normal scroll) */}
          <div className="col-scroll__box">
            <div className="col-scroll__list">{COL_2.map(renderCard)}</div>
          </div>

          {/* Column 3 (odd — reverse scroll, pinned) */}
          <div className="col-scroll__box col-scroll__box--odd">
            <div className="col-scroll__list">{COL_3.map(renderCard)}</div>
          </div>
        </div>
      </div>
    </>
  );
}

function AlbumCard({
  album,
  expanded,
  nowPlaying,
  playStatus,
  onPlayStatus,
  onToggle,
  onPlay,
}: {
  album: Album;
  expanded: boolean;
  nowPlaying: Song | null;
  playStatus: PlaybackStatus;
  onPlayStatus: (s: PlaybackStatus) => void;
  onToggle: () => void;
  onPlay: (song: Song) => void;
}) {
  // Relative offset only — preserves layout flow, so the scroll animation
  // (which measures list height) is unaffected.
  const style = album.nudgeDown
    ? { position: "relative" as const, top: "0.5in" }
    : undefined;
  const panelId = `album-panel-${album.id}`;
  return (
    <figure className="album-card" style={style} data-expanded={expanded || undefined}>
      <button
        type="button"
        className="album-card__cover"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={panelId}
      >
        <span className="album-card__img-wrapper">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={album.cover} alt={`${album.title} by ${album.artist}`} />
        </span>
      </button>

      <div
        className={`album-card__drawer${album.dropUp ? " album-card__drawer--up" : ""}`}
        data-open={expanded || undefined}
        onKeyDown={(e) => {
          if (e.key === "Escape" && expanded) onToggle();
        }}
      >
        <figcaption className="album-card__panel" id={panelId}>
          <div className="album-card__panel-in">
            <div className="album-card__panel-head">
              <div className="album-card__panel-titles">
                <span className="album-card__panel-title">{album.title}</span>
                <span className="album-card__panel-artist">{album.artist}</span>
              </div>
              <button
                type="button"
                className="album-card__panel-close"
                onClick={onToggle}
                aria-label={`Close ${album.title} track list`}
                tabIndex={expanded ? undefined : -1}
              >
                <X aria-hidden="true" />
              </button>
            </div>
            <ul className="album-card__songs">
              {album.songs.map((song, i) => {
                const isCurrent = nowPlaying?.title === song.title;
                const isPlaying = isCurrent && playStatus === "playing";
                return (
                  <li className="album-card__song" key={song.title}>
                    <button
                      type="button"
                      className="album-card__song-btn"
                      onClick={() => onPlay(song)}
                      aria-pressed={isCurrent}
                      tabIndex={expanded ? undefined : -1}
                      title={
                        songPreviewUrl(album, song) || song.youtubeId
                          ? isCurrent
                            ? `Stop ${song.title}`
                            : `Play a preview of ${song.title}`
                          : `Search YouTube for ${song.title}`
                      }
                    >
                      <span className="album-card__song-num">{i + 1}</span>
                      <span className="album-card__song-title">{song.title}</span>
                      <span className="album-card__song-side" aria-hidden="true">
                        {isPlaying && (
                          <span className="album-card__song-eq">
                            <i />
                            <i />
                            <i />
                          </span>
                        )}
                        {isPlaying ? <Pause /> : <Play />}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
          {/* Headless playback engine — the active row above is its UI. */}
          {nowPlaying && (
            <SongPlayback
              key={nowPlaying.title}
              previewUrl={songPreviewUrl(album, nowPlaying)}
              videoId={nowPlaying.youtubeId}
              onStatus={onPlayStatus}
            />
          )}
        </figcaption>
      </div>
    </figure>
  );
}
