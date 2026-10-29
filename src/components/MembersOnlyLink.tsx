/** MembersOnlyLink.tsx — shown instead of buy buttons for visitors and unapproved members; useCanBuy decides. */
import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

/** Shown instead of purchase buttons for visitors and members who aren't approved yet. */
export function MembersOnlyLink({
  className = "",
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const { data: member } = useAuth();
  const pending = member && member.status !== "approved" && !member.isAdmin;
  if (pending) {
    return (
      <Link
        to="/me"
        className={`flex items-center justify-center gap-2 border border-crimson/60 text-crimson text-[10px] tracking-[0.25em] uppercase text-center px-3 ${className}`}
      >
        <Lock className="h-3.5 w-3.5 flex-shrink-0" />
        {compact ? "Access pending" : `Access ${member.status} — Members Only`}
      </Link>
    );
  }
  return (
    <Link
      to="/auth"
      search={{ mode: "signup" }}
      onClick={(e) => e.stopPropagation()}
      className={`flex items-center justify-center gap-2 border border-gold/60 text-gold text-[10px] tracking-[0.25em] uppercase text-center px-3 hover:bg-gold/10 transition ${className}`}
    >
      <Lock className="h-3.5 w-3.5 flex-shrink-0" />
      {compact ? "Request access" : "Members Only — Request Vault Access to Purchase"}
    </Link>
  );
}
