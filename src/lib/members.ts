/**
 * members.ts — admin-only member management: list everyone and approve /
 * reject / reset vault access.
 */
import { api } from "@/lib/api";
import type { MemberStatus } from "@/hooks/useAuth";

export type AdminMemberRow = {
  id: string;
  email: string;
  display_name: string | null;
  status: MemberStatus;
  is_admin: boolean;
  /** The permanent owner: can never be rejected or deleted. */
  is_owner: boolean;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
};

export const fetchMembers = () => api<AdminMemberRow[]>("/auth/members/");

export const setMemberStatus = (id: string, status: MemberStatus) =>
  api<AdminMemberRow>(`/auth/members/${id}/`, { method: "PATCH", body: { status } });

/** Owner only: grant or remove admin rights (granting also approves the account). */
export const setMemberAdmin = (id: string, isAdmin: boolean) =>
  api<AdminMemberRow>(`/auth/members/${id}/`, { method: "PATCH", body: { is_admin: isAdmin } });

/** Permanently delete an account (never the owner; admins only by the owner). */
export const deleteMember = (id: string) => api(`/auth/members/${id}/`, { method: "DELETE" });
