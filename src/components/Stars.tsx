/** Stars.tsx — the 1–5 star display used by reviews. */
import { Star } from "lucide-react";

export function Stars({ value, size = "h-4 w-4", onChange }: { value: number; size?: string; onChange?: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= Math.round(value);
        const icon = <Star className={`${size} ${filled ? "fill-gold text-gold" : "text-muted-foreground/40"}`} />;
        return onChange ? (
          <button key={n} type="button" onClick={() => onChange(n)} aria-label={`${n} star${n > 1 ? "s" : ""}`} className="transition hover:scale-110">
            {icon}
          </button>
        ) : (
          <span key={n}>{icon}</span>
        );
      })}
    </div>
  );
}
