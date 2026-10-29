/**
 * auth.ts — authentication helpers (sign in / request access / sign out / passwords)
 * against the Django API. Approval workflow: new members start pending until the
 * admin approves vault access.
 */
import {
  api,
  clearAccountRejected,
  clearSessionExpired,
  getRefreshToken,
  setTokens,
  type Tokens,
} from "@/lib/api";
import type { ApiMember } from "@/hooks/useAuth";

type AuthResponse = Tokens & { user: ApiMember };

/** Sign in with email + password. */
export async function signIn(email: string, password: string) {
  const data = await api<AuthResponse>("/auth/login/", {
    method: "POST",
    body: { email, password },
    auth: false,
  });
  clearAccountRejected();
  clearSessionExpired();
  setTokens({ access: data.access, refresh: data.refresh });
  return data.user;
}

/**
 * Request membership: creates the account and signs in. The profile starts as
 * pending until the admin approves vault access.
 */
export async function requestAccess(email: string, password: string, name: string) {
  const data = await api<AuthResponse>("/auth/register/", {
    method: "POST",
    body: { email, password, display_name: name },
    auth: false,
  });
  clearAccountRejected();
  clearSessionExpired();
  setTokens({ access: data.access, refresh: data.refresh });
  return data.user;
}

/** Email a password-reset link (to /reset-password?uid=…&token=…). */
export async function sendPasswordReset(email: string) {
  await api("/auth/password/reset/", { method: "POST", body: { email }, auth: false });
}

/** Set a new password from the reset link's uid + token. */
export async function confirmPasswordReset(uid: string, token: string, newPassword: string) {
  await api("/auth/password/reset/confirm/", {
    method: "POST",
    body: { uid, token, new_password: newPassword },
    auth: false,
  });
}

/** Change the signed-in member's password. */
export async function changePassword(currentPassword: string, newPassword: string) {
  await api("/auth/password/change/", {
    method: "POST",
    body: { current_password: currentPassword, new_password: newPassword },
  });
}

/** Sign out: revoke the refresh token on the server and forget both tokens. */
export async function signOut() {
  const refresh = getRefreshToken();
  setTokens(null);
  if (refresh) {
    await api("/auth/logout/", { method: "POST", body: { refresh }, auth: false }).catch(
      () => undefined,
    );
  }
}
