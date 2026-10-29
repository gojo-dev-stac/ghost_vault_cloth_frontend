/**
 * AdminMembers.tsx — Members tab and the shared members table.
 * AdminRequests reuses MembersTable for the pending-only view.
 *
 * The owner can't be changed or deleted, nobody manages their own account here,
 * and only the owner can manage other admins or grant / remove admin rights.
 * The server enforces all of this; the table just hides actions you can't take.
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, ShieldCheck, ShieldOff, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { deleteMember, setMemberAdmin, setMemberStatus, type AdminMemberRow } from "@/lib/members";

export type { AdminMemberRow };

type Action =
  | { kind: "status"; id: string; status: "approved" | "rejected" | "pending" }
  | { kind: "admin"; id: string; isAdmin: boolean }
  | { kind: "delete"; id: string };

const btn = "h-9 px-3 flex items-center gap-1.5 text-[10px] tracking-[0.2em] uppercase transition";

/** Table of members with Approve / Reject / admin / Delete actions; `rows` is filtered by the caller. */
export function MembersTable({ rows, emptyLabel }: { rows: AdminMemberRow[]; emptyLabel: string }) {
  const qc = useQueryClient();
  const { data: viewer } = useAuth();
  const mutation = useMutation({
    mutationFn: (a: Action) =>
      a.kind === "status"
        ? setMemberStatus(a.id, a.status)
        : a.kind === "admin"
          ? setMemberAdmin(a.id, a.isAdmin)
          : deleteMember(a.id),
    onSuccess: (_, a) => {
      toast.success(
        a.kind === "status"
          ? `Member ${a.status}`
          : a.kind === "admin"
            ? a.isAdmin
              ? "Admin rights granted"
              : "Admin rights removed"
            : "Account deleted",
      );
      qc.invalidateQueries({ queryKey: ["admin-overview"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not update member"),
  });

  if (rows.length === 0) return <p className="p-8 text-sm text-muted-foreground">{emptyLabel}</p>;
  return (
    <table className="w-full text-sm">
      <thead className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
        <tr className="border-b border-border">
          <th className="text-left p-4">Member</th>
          <th className="text-left p-4">Joined</th>
          <th className="text-left p-4">Status</th>
          <th className="text-right p-4">Action</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((m) => {
          const isSelf = m.id === viewer?.id;
          const canManage = !m.is_owner && !isSelf && (!m.is_admin || !!viewer?.isOwner);
          return (
            <tr key={m.id} className="border-b border-border/50 last:border-0">
              <td className="p-4">
                <p className="flex items-center gap-2">
                  {m.display_name || "—"}
                  {m.is_owner ? (
                    <span className="text-[9px] tracking-[0.25em] uppercase text-gold border border-gold/50 px-1.5 py-0.5">
                      Owner
                    </span>
                  ) : m.is_admin ? (
                    <span className="text-[9px] tracking-[0.25em] uppercase text-chrome border border-border px-1.5 py-0.5">
                      Admin
                    </span>
                  ) : null}
                  {isSelf && (
                    <span className="text-[9px] tracking-[0.25em] uppercase text-muted-foreground">
                      (you)
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">{m.email}</p>
              </td>
              <td className="p-4 text-muted-foreground">
                {new Date(m.created_at).toLocaleDateString()}
              </td>
              <td className="p-4">
                <span
                  className={`text-[10px] tracking-[0.3em] uppercase ${m.status === "approved" ? "text-gold" : m.status === "rejected" ? "text-crimson" : "text-chrome"}`}
                >
                  {m.status}
                </span>
              </td>
              <td className="p-4">
                {canManage ? (
                  <div className="flex flex-wrap justify-end gap-2">
                    {m.status !== "approved" && (
                      <button
                        onClick={() =>
                          mutation.mutate({ kind: "status", id: m.id, status: "approved" })
                        }
                        disabled={mutation.isPending}
                        className={`${btn} bg-gold-metal text-primary-foreground font-semibold`}
                      >
                        <Check className="h-3.5 w-3.5" /> Approve
                      </button>
                    )}
                    {m.status !== "rejected" && (
                      <button
                        onClick={() =>
                          mutation.mutate({ kind: "status", id: m.id, status: "rejected" })
                        }
                        disabled={mutation.isPending}
                        className={`${btn} border border-crimson text-crimson hover:bg-crimson hover:text-foreground`}
                      >
                        <X className="h-3.5 w-3.5" /> Reject
                      </button>
                    )}
                    {viewer?.isOwner && (
                      <button
                        onClick={() =>
                          mutation.mutate({ kind: "admin", id: m.id, isAdmin: !m.is_admin })
                        }
                        disabled={mutation.isPending}
                        className={`${btn} border border-gold/50 text-gold hover:bg-gold/10`}
                      >
                        {m.is_admin ? (
                          <ShieldOff className="h-3.5 w-3.5" />
                        ) : (
                          <ShieldCheck className="h-3.5 w-3.5" />
                        )}
                        {m.is_admin ? "Remove admin" : "Make admin"}
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete ${m.email}? This cannot be undone.`))
                          mutation.mutate({ kind: "delete", id: m.id });
                      }}
                      disabled={mutation.isPending}
                      aria-label={`Delete ${m.email}`}
                      className={`${btn} border border-border text-muted-foreground hover:border-crimson hover:text-crimson`}
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                ) : (
                  <p className="text-right text-[10px] tracking-[0.25em] uppercase text-muted-foreground/70">
                    {m.is_owner ? "Permanent" : isSelf ? "—" : "Owner only"}
                  </p>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

/** Members tab: the full member list. */
export function AdminMembers({ members }: { members: AdminMemberRow[] }) {
  return <MembersTable rows={members} emptyLabel="No members yet." />;
}
