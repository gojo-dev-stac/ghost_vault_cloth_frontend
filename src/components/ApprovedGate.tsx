/** ApprovedGate.tsx — only approved accounts see the protected pages; pending accounts see their status. */
import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/auth";

export function ApprovedGate({ children }: { children: ReactNode }) {
  const { data: member, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </div>
    );
  }

  if (member?.status === "approved") return <>{children}</>;

  return <AccessStatusScreen status={member?.status === "rejected" ? "rejected" : "pending"} />;
}

/** The PENDING / REJECTED vault status screen. */
export function AccessStatusScreen({
  status,
  onBack,
}: {
  status: "pending" | "rejected";
  onBack?: () => void;
}) {
  const rejected = status === "rejected";
  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
      <div className="fog-layer" />
      <div className="glass relative max-w-md w-full p-10 text-center animate-rise">
        <p className="text-[11px] tracking-[0.5em] uppercase text-crimson">Vault Status</p>
        <h1 className="mt-4 font-display text-6xl text-gold-metal">
          {rejected ? "REJECTED" : "PENDING"}
        </h1>
        <p className="mt-6 text-sm text-muted-foreground leading-relaxed">
          {rejected
            ? "Your access request was not approved, so this account cannot sign in. Contact GHOST if you believe this is a mistake."
            : "Your request to enter The Vault is under review. You'll be able to shop once an admin approves your membership."}
        </p>
        <div className="mt-8 flex justify-center gap-6 text-[11px] tracking-[0.3em] uppercase">
          <Link to="/contact" className="text-foreground/70 hover:text-gold">
            Contact GHOST
          </Link>
          {rejected ? (
            onBack && (
              <button
                onClick={onBack}
                className="text-foreground/70 hover:text-gold uppercase tracking-[0.3em]"
              >
                Back to login
              </button>
            )
          ) : (
            <button
              onClick={async () => {
                await signOut();
                window.location.href = "/auth";
              }}
              className="text-foreground/70 hover:text-crimson uppercase tracking-[0.3em]"
            >
              Sign out
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
