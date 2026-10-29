/** VaultVideo.tsx — the vault intro on / and on demand, looping video elsewhere. */
import { useEffect, useRef, useState } from "react";
import { useLocation } from "@tanstack/react-router";

// Full-quality 1080p intro: the original H.264 MP4 (plays in every browser).
const INTRO_SOURCES = [{ src: "/media/vault-intro.mp4", type: "video/mp4" }];
// Lighter 720p loop for content pages: H.264 MP4 first, WebM fallback.
const LOOP_SOURCES = [
  { src: "/media/ghost-vault-loop.mp4", type: "video/mp4" },
  { src: "/media/ghost-vault-loop.webm", type: "video/webm" },
];

const VIDEO_ENDED_EVENT = "ghost:vault-intro-ended";
const VIDEO_PLAY_EVENT = "ghost:vault-video-play";
const VIDEO_BLOCKED_EVENT = "ghost:vault-video-blocked";

export function VaultVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const completedRef = useRef(false);
  const playOnceRef = useRef(false);
  const requestedPlaybackRef = useRef(false);
  const { pathname } = useLocation();
  const [ready, setReady] = useState(false);
  const entry = pathname === "/";
  const entryOrAuth = entry || pathname === "/auth";
  const sources = entryOrAuth ? INTRO_SOURCES : LOOP_SOURCES;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const showVideoWhenReady = () => {
      if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) setReady(true);
    };
    showVideoWhenReady();
    video.addEventListener("loadeddata", showVideoWhenReady);
    video.addEventListener("canplay", showVideoWhenReady);
    video.addEventListener("playing", showVideoWhenReady);

    return () => {
      video.removeEventListener("loadeddata", showVideoWhenReady);
      video.removeEventListener("canplay", showVideoWhenReady);
      video.removeEventListener("playing", showVideoWhenReady);
    };
  }, [entryOrAuth]);

  useEffect(() => {
    completedRef.current = false;
    const video = videoRef.current;
    if (!video) return;

    const play = () => {
      if (pathname === "/auth") {
        playOnceRef.current = true;
        completedRef.current = false;
        requestedPlaybackRef.current = true;
        video.currentTime = 0;
      }
      video.play().catch(() => window.dispatchEvent(new Event(VIDEO_BLOCKED_EVENT)));
    };
    window.addEventListener(VIDEO_PLAY_EVENT, play);
    if (entry) play();
    return () => window.removeEventListener(VIDEO_PLAY_EVENT, play);
  }, [entry, pathname]);

  // /auth opened directly: rest on the intro's final frame. Covers metadata that
  // loaded before hydration (onLoadedMetadata never fires then); an intro that is
  // already playing (arrived from /) is left alone.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || pathname !== "/auth") return;
    const toLastFrame = () => {
      if (
        requestedPlaybackRef.current ||
        !Number.isFinite(video.duration) ||
        video.currentTime > 0
      ) {
        return;
      }
      video.currentTime = Math.max(0, video.duration - 0.04);
      video.pause();
    };
    if (video.readyState >= 1) toLastFrame();
    else video.addEventListener("loadedmetadata", toLastFrame, { once: true });
    return () => video.removeEventListener("loadedmetadata", toLastFrame);
  }, [pathname]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || entryOrAuth) return;
    video.muted = true;
    video.play().catch(() => undefined);
  }, [entryOrAuth]);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-0 overflow-hidden bg-background transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}
    >
      <video
        key={entryOrAuth ? "intro" : "loop"}
        ref={videoRef}
        autoPlay={entry || !entryOrAuth}
        muted
        playsInline
        preload={entryOrAuth ? "auto" : "metadata"}
        onLoadedMetadata={(event) => {
          const video = event.currentTarget;
          if (
            pathname === "/auth" &&
            !requestedPlaybackRef.current &&
            Number.isFinite(video.duration)
          ) {
            video.currentTime = Math.max(0, video.duration - 0.04);
            video.pause();
          }
        }}
        onCanPlay={() => setReady(true)}
        onEnded={(event) => {
          const video = event.currentTarget;
          if (entry || (pathname === "/auth" && playOnceRef.current)) {
            if (completedRef.current) return;
            completedRef.current = true;
            video.pause();
            window.dispatchEvent(new Event(VIDEO_ENDED_EVENT));
            return;
          }

          video.currentTime = 0;
          video.play().catch(() => undefined);
        }}
        className={`h-full w-full object-cover transition-[filter,transform,opacity] duration-1000 ${entryOrAuth ? "scale-100 opacity-100" : "scale-[1.02] opacity-85"}`}
      >
        {sources.map((s) => (
          <source key={s.src} src={s.src} type={s.type} />
        ))}
      </video>
      {!entry && <div className="absolute inset-0 bg-background/25" />}
      {!entry && (
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/35 to-background/70" />
      )}
    </div>
  );
}

export { VIDEO_BLOCKED_EVENT, VIDEO_ENDED_EVENT, VIDEO_PLAY_EVENT };
