/** VaultIntroPage.tsx — the cinematic vault intro on /: the video plays once, then opens login. */
import { Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { VIDEO_BLOCKED_EVENT, VIDEO_ENDED_EVENT, VIDEO_PLAY_EVENT } from "@/components/VaultVideo";

export function VaultIntroPage() {
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);
  const [needsTap, setNeedsTap] = useState(false);

  const finish = useCallback(() => {
    if (leaving) return;
    setLeaving(true);
    navigate({ to: "/auth", replace: true });
  }, [leaving, navigate]);

  useEffect(() => {
    const ended = () => void finish();
    const blocked = () => setNeedsTap(true);
    window.addEventListener(VIDEO_ENDED_EVENT, ended);
    window.addEventListener(VIDEO_BLOCKED_EVENT, blocked);
    return () => {
      window.removeEventListener(VIDEO_ENDED_EVENT, ended);
      window.removeEventListener(VIDEO_BLOCKED_EVENT, blocked);
    };
  }, [finish]);

  return (
    <div
      className={`fixed inset-0 z-20 transition-opacity duration-700 ${leaving ? "opacity-0" : "opacity-100"}`}
    >
      {needsTap && (
        <button
          onClick={() => {
            window.dispatchEvent(new Event(VIDEO_PLAY_EVENT));
            setNeedsTap(false);
          }}
          className="absolute inset-0 flex items-center justify-center font-display text-4xl tracking-[0.3em] text-gold-metal"
        >
          TAP TO ENTER
        </button>
      )}
      <Link
        to="/auth"
        replace
        onClick={() => setLeaving(true)}
        className="absolute bottom-6 right-6 text-[10px] tracking-[0.4em] uppercase text-foreground/40 hover:text-gold transition-colors"
      >
        Skip
      </Link>
    </div>
  );
}
