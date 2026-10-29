/** AuthForm.tsx — the login / request access / forgot-password screen over the video's final frame. */
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  clearAccountRejected,
  hasSession,
  isRejectedError,
  wasAccountRejected,
  wasSessionExpired,
} from "@/lib/api";
import { AccessStatusScreen } from "@/components/ApprovedGate";
import { requestAccess, sendPasswordReset, signIn } from "@/lib/auth";
import { AuthField } from "@/components/AuthField";
import { GhostLogo } from "@/components/GhostLogo";
import "@/styles/auth.css";

type Mode = "login" | "signup" | "forgot";

const modeCopy = {
  login: {
    eyebrow: "Members' entrance",
    title: (
      <>
        Enter the
        <br />
        <em>Vault.</em>
      </>
    ),
    lede: "Members only. Sign in to continue into The Vault.",
  },
  signup: {
    eyebrow: "Request access",
    title: (
      <>
        Request
        <br />
        <em>access.</em>
      </>
    ),
    lede: "A private list. Every request is reviewed by GHOST before The Vault opens.",
  },
  forgot: {
    eyebrow: "Account recovery",
    title: (
      <>
        Reset your
        <br />
        <em>key.</em>
      </>
    ),
    lede: "Enter the email on your account and a reset link will follow.",
  },
} as const;

export function AuthForm({
  initialMode = "login",
  rejected = false,
  expired = false,
}: {
  initialMode?: "login" | "signup";
  rejected?: boolean;
  expired?: boolean;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [entering, setEntering] = useState(false);
  const [showRejected, setShowRejected] = useState(() => rejected || wasAccountRejected());
  // The flag is cleared on the next successful sign-in (see lib/auth.ts), so the
  // protected-route guard can still see it while this screen mounts.
  const [showExpired, setShowExpired] = useState(() => expired || wasSessionExpired());
  useEffect(() => {
    if (rejected) setShowRejected(true);
  }, [rejected]);
  useEffect(() => {
    if (expired) setShowExpired(true);
  }, [expired]);

  useEffect(() => {
    if (hasSession()) navigate({ to: "/vault", replace: true });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setNotice(null);
    setShowExpired(false);
    try {
      if (mode === "login") {
        await signIn(email, password);
        await queryClient.invalidateQueries();
        setEntering(true);
        setTimeout(() => navigate({ to: "/vault", replace: true }), 900);
      } else if (mode === "signup") {
        await requestAccess(email, password, name);
        await queryClient.invalidateQueries();
        toast.success("Access requested. An admin will review your membership.");
        setEntering(true);
        setTimeout(() => navigate({ to: "/vault", replace: true }), 900);
      } else {
        await sendPasswordReset(email);
        setNotice("If that email exists, a reset link is on its way.");
      }
    } catch (err) {
      if (isRejectedError(err)) {
        setShowRejected(true);
        return;
      }
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  if (showRejected) {
    return (
      <AccessStatusScreen
        status="rejected"
        onBack={() => {
          clearAccountRejected();
          setShowRejected(false);
          setPassword("");
          if (rejected) navigate({ to: "/auth", replace: true });
        }}
      />
    );
  }

  const copy = modeCopy[mode];

  return (
    <div className={`auth ${entering ? "is-leaving" : ""}`}>
      <div className="auth-shade" aria-hidden="true" />

      <section className="auth-copy" key={mode} aria-label={copy.eyebrow}>
        <div className="auth-index" aria-hidden="true">
          <span>GHOST</span>
          <span>Members only</span>
        </div>
        <span className="auth-rule" aria-hidden="true" />
        <p className="auth-eyebrow">{copy.eyebrow}</p>
        <h1 className="auth-title">{copy.title}</h1>
        <p className="auth-lede">{copy.lede}</p>
        <p className="auth-copy-meta" aria-hidden="true">
          <span>The Vault</span>
          <span>Est. 2026</span>
        </p>
      </section>

      <div
        className={`auth-panel ${entering ? "is-leaving" : "is-entered"}`}
        aria-hidden={entering}
      >
        <div className="auth-panel-brand">
          <GhostLogo />
          <i aria-hidden="true" />
          <span>The Vault</span>
        </div>

        {showExpired && (
          <p className="auth-expired" role="status">
            Your session has expired. Please sign in again.
          </p>
        )}

        {mode !== "forgot" && (
          <div className="auth-tabs" role="group" aria-label="Choose sign-in mode">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={mode === m}
                className={`auth-tab ${mode === m ? "is-active" : ""}`}
                onClick={() => {
                  setMode(m);
                  setNotice(null);
                  setShowExpired(false);
                }}
              >
                {m === "login" ? "Login" : "Request Access"}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={submit} className="auth-form">
          {mode === "signup" && (
            <AuthField
              label="Name"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          )}
          <AuthField
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            required
          />
          {mode !== "forgot" && (
            <AuthField
              label="Password"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              minLength={8}
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
            />
          )}
          <button type="submit" disabled={busy} className={`auth-submit ${busy ? "is-busy" : ""}`}>
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-label="Working" />
            ) : (
              <>
                <span className="auth-submit-label">
                  {mode === "login"
                    ? "Unlock"
                    : mode === "signup"
                      ? "Request Access"
                      : "Send Reset Link"}
                </span>
                <span className="auth-submit-arrow" aria-hidden="true">
                  ↗
                </span>
              </>
            )}
          </button>
        </form>

        <Link to="/collection" className="auth-secondary">
          Explore the Drop
        </Link>

        {notice && (
          <p className="auth-notice" role="status">
            {notice}
          </p>
        )}

        <div className="auth-links">
          {mode === "forgot" ? (
            <button type="button" className="auth-link" onClick={() => setMode("login")}>
              ← Back to login
            </button>
          ) : mode === "login" ? (
            <button type="button" className="auth-link" onClick={() => setMode("forgot")}>
              Forgot password?
            </button>
          ) : (
            <p className="auth-note">New members are reviewed before entering The Vault.</p>
          )}
          <Link to="/contact" className="auth-contact">
            Contact Us
          </Link>
        </div>
      </div>

      <p className="auth-bottomline" aria-hidden="true">
        <span>Independent by design</span>
        <span>GHOST · 2026</span>
      </p>
    </div>
  );
}
