/** ResetPasswordPage.tsx — set a new password after following the reset email link (?uid=…&token=…). */
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { confirmPasswordReset } from "@/lib/auth";
import { AuthField } from "@/components/AuthField";

export function ResetPasswordPage({ uid, token }: { uid: string; token: string }) {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await confirmPasswordReset(uid, token, password);
      toast.success("Password updated. Sign in with your new password.");
      navigate({ to: "/auth", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update password");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative min-h-[100svh] flex items-center justify-center px-5 pt-24 overflow-hidden">
      <div className="absolute inset-0 bg-background/50" />
      <div className="fog-layer" />
      {!uid || !token ? (
        <div className="glass relative w-full max-w-md p-10 text-center animate-rise">
          <h1 className="font-display text-5xl text-gold-metal">LINK EXPIRED</h1>
          <p className="mt-4 text-sm text-muted-foreground">This reset link is incomplete. Request a new one from the login page.</p>
          <Link to="/auth" className="mt-6 inline-block text-[11px] tracking-[0.3em] uppercase text-gold">← Back to login</Link>
        </div>
      ) : (
        <form onSubmit={submit} className="glass relative w-full max-w-md p-10 space-y-5 animate-rise">
          <h1 className="font-display text-5xl text-gold-metal text-center">NEW PASSWORD</h1>
          <AuthField
            label="New password"
            type="password"
            minLength={8}
            required
            autoComplete="new-password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          />
          <button disabled={busy} className="w-full h-12 bg-gold-metal text-primary-foreground text-[11px] font-semibold tracking-[0.35em] uppercase">
            {busy ? "Saving…" : "Save Password"}
          </button>
        </form>
      )}
    </div>
  );
}
