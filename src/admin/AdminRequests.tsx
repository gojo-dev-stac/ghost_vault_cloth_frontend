/**
 * AdminRequests.tsx — Requests tab: only the members still waiting
 * (pending) for vault access approval.
 */
import { MembersTable } from "@/admin/AdminMembers";
import type { AdminMemberRow } from "@/admin/AdminMembers";

export function AdminRequests({ members }: { members: AdminMemberRow[] }) {
  const pending = members.filter((m) => m.status === "pending");
  return <MembersTable rows={pending} emptyLabel="No pending requests." />;
}
