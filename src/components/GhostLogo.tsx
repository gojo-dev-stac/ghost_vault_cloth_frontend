/** GhostLogo.tsx — the GHOST logo (public/brand/ghost-logo.webp, transparent background). Size it with a height class. */
import { cn } from "@/lib/utils";

export function GhostLogo({ className }: { className?: string }) {
  return (
    <img
      src="/brand/ghost-logo.webp"
      alt="GHOST"
      width={454}
      height={480}
      decoding="async"
      className={cn("w-auto object-contain select-none", className)}
    />
  );
}
