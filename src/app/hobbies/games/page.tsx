import type { Metadata } from "next";
import ArcadeExperience from "@/components/ui/arcade-experience";

export const metadata: Metadata = { title: "Ethan's Arcade — Ethan Miclat" };

/**
 * Standalone, fully black & white 8-bit "Ethan's Arcade" page. Deliberately
 * does NOT use the shared HobbyDetail shell — this hobby takes over the whole
 * screen. The interactive dive-in (room → full-screen CRT) and its own pixel
 * Back button live in <ArcadeExperience> (a client component).
 */
export default function GamesPage() {
  return (
    <main className="arcade-page">
      <ArcadeExperience />
    </main>
  );
}
