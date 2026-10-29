/**
 * AuthPage.tsx — the /auth screen: login, request access (register) and
 * forgot-password, rendered over the vault video's final frame.
 */
import { AuthForm } from "@/components/AuthForm";

export function AuthPage({
  initialMode = "login",
  rejected = false,
  expired = false,
}: {
  initialMode?: "login" | "signup";
  rejected?: boolean;
  expired?: boolean;
}) {
  return <AuthForm initialMode={initialMode} rejected={rejected} expired={expired} />;
}
