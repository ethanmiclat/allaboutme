import type { Metadata } from "next";
import TrophyRoomExperience from "@/components/ui/trophy-room-experience";

export const metadata: Metadata = { title: "Hall of Fame — Ethan Miclat" };

/**
 * Standalone Sports "Hall of Fame" page. Like the arcade and ETHANFLIX, this
 * hobby takes over the whole screen rather than using the shared HobbyDetail
 * shell: two velvet curtains part to reveal lit shelves of gold trophy statues.
 * All of it lives in <TrophyRoomExperience> (a client component).
 */
export default function SportsPage() {
  return (
    <main className="trophy-room-page">
      <TrophyRoomExperience />
    </main>
  );
}
