"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ALBUMS, type Album } from "@/lib/albums";

gsap.registerPlugin(ScrollTrigger);

// Split albums into 3 columns
const per = Math.ceil(ALBUMS.length / 3);
const COL_1 = ALBUMS.slice(0, per);
const COL_2 = ALBUMS.slice(per, per * 2);
const COL_3 = ALBUMS.slice(per * 2);

const styles = `
  .albums-carousel {
    color: var(--text);
    font-family: var(--font-inter), sans-serif;
    margin: 0;
    /* clip (not hidden) so we don't create a scroll container that fights the
       ScrollTrigger pin. */
    overflow-x: clip;
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
    gap: 10vw;
  }

  .col-scroll__box--odd .col-scroll__list {
    flex-direction: column-reverse;
  }

  @media (max-width: 768px) {
    .col-scroll__box--odd .col-scroll__list {
      flex-direction: column;
    }
    .col-scroll__list {
      gap: 6vh;
    }
  }

  .album-card {
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0;
    width: 20vw;
    background: transparent;
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

  .album-card__img-wrapper {
    position: relative;
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

  .album-card:hover img {
    transform: scale(1.06);
  }
`;

export default function AlbumImpactCarousel() {
  const containerRef = useRef<HTMLDivElement>(null);

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

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="albums-carousel">
        <div ref={containerRef} className="col-scroll">
          {/* Column 1 (odd — reverse scroll, pinned) */}
          <div className="col-scroll__box col-scroll__box--odd">
            <div className="col-scroll__list">
              {COL_1.map((album) => (
                <AlbumCard key={album.id} album={album} />
              ))}
            </div>
          </div>

          {/* Column 2 (even — normal scroll) */}
          <div className="col-scroll__box">
            <div className="col-scroll__list">
              {COL_2.map((album) => (
                <AlbumCard key={album.id} album={album} />
              ))}
            </div>
          </div>

          {/* Column 3 (odd — reverse scroll, pinned) */}
          <div className="col-scroll__box col-scroll__box--odd">
            <div className="col-scroll__list">
              {COL_3.map((album) => (
                <AlbumCard key={album.id} album={album} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function AlbumCard({ album }: { album: Album }) {
  // Relative offset only — preserves layout flow, so the scroll animation
  // (which measures list height) is unaffected.
  const style = album.nudgeDown
    ? { position: "relative" as const, top: "0.5in" }
    : undefined;
  return (
    <figure className="album-card" style={style}>
      <div className="album-card__img-wrapper">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={album.cover} alt={`${album.title} by ${album.artist}`} />
      </div>
    </figure>
  );
}
