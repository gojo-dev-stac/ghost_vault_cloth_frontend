/**
 * useAuth.ts — the current member hook: profile approval status + admin role
 * from the Django API, cached under ["member"]. Use `useAuth()` anywhere in the
 * app to know who is signed in and whether they may enter the Vault.
 */
import { useQuery } from "@tanstack/react-query";
import { api, ApiError, hasSession } from "@/lib/api";

export type MemberStatus = "pending" | "approved" | "rejected";

/** The member as the API returns it. */
export type ApiMember = {
  id: string;
  email: string;
  display_name: string;
  status: MemberStatus;
  created_at: string;
  is_admin: boolean;
  is_owner: boolean;
};

export type Member = {
  id: string;
  email: string;
  display_name: string | null;
  status: MemberStatus;
  created_at: string;
  isAdmin: boolean;
  /** The permanent owner account (always approved admin; manages other admins). */
  isOwner: boolean;
};

export const memberQueryKey = ["member"] as const;

export const toMember = (m: ApiMember): Member => ({
  id: m.id,
  email: m.email,
  display_name: m.display_name || null,
  status: m.status,
  created_at: m.created_at,
  isAdmin: m.is_admin,
  isOwner: m.is_owner,
});

export async function fetchMember(): Promise<Member | null> {
  if (!hasSession()) return null;
  try {
    return toMember(await api<ApiMember>("/auth/me/"));
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) return null;
    throw err;
  }
}

/** Current member: null when signed out; check `.status` and `.isAdmin`. */
export function useAuth() {
  return useQuery({ queryKey: memberQueryKey, queryFn: fetchMember });
}
