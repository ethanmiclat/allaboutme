import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AlbumImpactCarousel from "@/components/ui/album-impact-carousel";
import MusicBackground from "@/components/ui/music-background";
import ScrollToTop from "@/components/scroll-to-top";

export const metadata: Metadata = { title: "Music — Ethan Miclat" };

/**
 * Standalone full-page music experience. It deliberately does NOT use the
 * shared HobbyDetail shell: that shell applies an entrance `transform`, and a
 * transformed ancestor breaks GSAP ScrollTrigger's `position: fixed` pin
 * (it collapses the pinned carousel into a small box). Here the carousel owns
 * the whole page, with only a fixed (non-transformed) back link overlaid.
 */
export default function MusicPage() {
  return (
    <main className="music-page">
      <div className="music-page__bg" aria-hidden="true" />
      <MusicBackground />
      <ScrollToTop />
      <Link className="music-page__back" href="/#hobby-music" scroll={false}>
        <ArrowLeft aria-hidden="true" />
        Back
      </Link>

      <div className="music-page__intro container">
        <p className="eyebrow">A few of my favorite things</p>
        <h1 className="music-page__title">Music</h1>
      </div>

      <AlbumImpactCarousel />
    </main>
  );
}
