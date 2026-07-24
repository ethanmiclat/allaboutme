"use client";

import { useEffect, useRef } from "react";

/**
 * Headless inline preview playback for a song: renders no UI of its own —
 * mounting it starts playback, unmounting stops it, and `onStatus` reports
 * state so the song row can show its own play/pause/equalizer affordance.
 *
 * Prefers a direct 30s audio clip (Apple's official preview m4a); falls back
 * to a hidden 1×1 YouTube IFrame player for tracks Apple doesn't carry. The
 * page's ambient wave background reacts to playback via the
 * `ethan:music-playing` event.
 */

export type PlaybackStatus = "loading" | "playing" | "paused" | "error";

// ---- Minimal YouTube IFrame API typings (the lib has no bundled types) ----
interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  destroy(): void;
}
interface YTPlayerEvent {
  target: YTPlayer;
  data?: number;
}
interface YTNamespace {
  Player: new (
    el: HTMLElement,
    opts: {
      videoId: string;
      width: string;
      height: string;
      playerVars?: Record<string, string | number>;
      events?: {
        onReady?: (e: YTPlayerEvent) => void;
        onStateChange?: (e: YTPlayerEvent) => void;
        onError?: (e: YTPlayerEvent) => void;
      };
    }
  ) => YTPlayer;
  PlayerState: { PLAYING: number; PAUSED: number; ENDED: number };
}
declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

/** Load the IFrame API once, shared across all players. */
let ytApiPromise: Promise<YTNamespace> | null = null;
function loadYouTubeApi(): Promise<YTNamespace> {
  if (ytApiPromise) return ytApiPromise;
  ytApiPromise = new Promise((resolve) => {
    if (window.YT?.Player) {
      resolve(window.YT);
      return;
    }
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve(window.YT as YTNamespace);
    };
    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }
  });
  return ytApiPromise;
}

/** Broadcast playback so the page background can react (see MusicBackground). */
function announcePlaying(playing: boolean) {
  window.dispatchEvent(new CustomEvent("ethan:music-playing", { detail: playing }));
}

function AudioPlayback({
  src,
  onStatus,
}: {
  src: string;
  onStatus: (s: PlaybackStatus) => void;
}) {
  useEffect(() => {
    // Tearing down a loading <audio> (pause + src="") fires abort/error and
    // rejects the play() promise — none of that is a real playback failure,
    // so a disposed flag keeps it from reaching onStatus. (Without it, React
    // StrictMode's dev double-mount "errors" every song on first click.)
    let disposed = false;
    const audio = new Audio(src);
    audio.preload = "auto";
    const onPlay = () => {
      if (disposed) return;
      announcePlaying(true);
      onStatus("playing");
    };
    const onPause = () => {
      if (disposed) return;
      announcePlaying(false);
      onStatus("paused");
    };
    const onError = () => {
      if (disposed) return;
      onStatus("error");
    };
    audio.addEventListener("playing", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onPause);
    audio.addEventListener("error", onError);
    // Mounting is itself the result of a user click, so autoplay is allowed.
    onStatus("loading");
    audio.play().catch(() => {
      if (!disposed) onStatus("error");
    });

    return () => {
      disposed = true;
      audio.pause();
      announcePlaying(false);
      audio.src = "";
    };
    // onStatus is a setState passthrough; only the clip identity matters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  return null;
}

function YouTubePlayback({
  videoId,
  onStatus,
}: {
  videoId: string;
  onStatus: (s: PlaybackStatus) => void;
}) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    let player: YTPlayer | null = null;
    const host = hostRef.current;
    if (!host) return;
    // The API replaces the target element, so give it a child to consume.
    const target = document.createElement("div");
    host.appendChild(target);

    onStatus("loading");
    loadYouTubeApi().then((YT) => {
      if (cancelled) {
        target.remove();
        return;
      }
      player = new YT.Player(target, {
        videoId,
        width: "1",
        height: "1",
        playerVars: { autoplay: 1, controls: 0, playsinline: 1, rel: 0 },
        events: {
          onReady: (e) => e.target.playVideo(),
          onStateChange: (e) => {
            if (cancelled) return; // destroy() can still fire events
            const playing = e.data === YT.PlayerState.PLAYING;
            announcePlaying(playing);
            onStatus(playing ? "playing" : "paused");
          },
          onError: () => {
            if (!cancelled) onStatus("error");
          },
        },
      });
    });

    return () => {
      cancelled = true;
      announcePlaying(false);
      player?.destroy();
      host.replaceChildren();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  // Visually hidden 1×1 iframe host.
  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      style={{
        position: "absolute",
        width: 1,
        height: 1,
        overflow: "hidden",
        opacity: 0,
        pointerEvents: "none",
      }}
    />
  );
}

export default function SongPlayback({
  previewUrl,
  videoId,
  onStatus,
}: {
  /** Direct 30s audio clip (preferred). */
  previewUrl?: string;
  /** YouTube fallback — used only when there's no direct `previewUrl`. */
  videoId?: string;
  onStatus: (s: PlaybackStatus) => void;
}) {
  if (previewUrl) return <AudioPlayback src={previewUrl} onStatus={onStatus} />;
  if (videoId) return <YouTubePlayback videoId={videoId} onStatus={onStatus} />;
  return null;
}
