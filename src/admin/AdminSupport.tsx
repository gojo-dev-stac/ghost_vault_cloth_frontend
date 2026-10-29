/**
 * AdminSupport.tsx — Support tab: read contact-form messages (complaints)
 * and reply (the server emails the reply to the sender). Part of the Admin Dashboard.
 */
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { fetchComplaints, replyToComplaint, type Complaint } from "@/lib/contact";

export function AdminSupport() {
  const { data = [], isLoading } = useQuery({ queryKey: ["admin-complaints"], queryFn: fetchComplaints });
  if (isLoading) return <div className="p-12 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-gold" /></div>;
  if (!data.length) return <p className="p-8 text-sm text-muted-foreground">No messages yet.</p>;
  return <div className="divide-y divide-border/50">{data.map((c) => <ComplaintRow key={c.id} c={c} />)}</div>;
}

function ComplaintRow({ c }: { c: Complaint }) {
  const qc = useQueryClient();
  const [reply, setReply] = useState(c.admin_reply ?? "");
  const save = useMutation({
    mutationFn: () => replyToComplaint(c.id, reply),
    onSuccess: () => {
      toast.success(`Reply emailed to ${c.email}`);
      qc.invalidateQueries({ queryKey: ["admin-complaints"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save reply"),
  });
  return (
    <div className="p-5 md:p-6">
      <div className="flex flex-wrap justify-between gap-2">
        <div>
          <p className="font-display text-2xl tracking-wider">{c.subject}</p>
          <p className="text-xs text-muted-foreground">{c.name} · {c.email} · {new Date(c.created_at).toLocaleString()}</p>
        </div>
        <span className={`text-[10px] tracking-[0.3em] uppercase ${c.status === "Replied" ? "text-gold" : "text-crimson"}`}>{c.status}</span>
      </div>
      <p className="mt-4 text-sm whitespace-pre-line text-foreground/85">{c.message}</p>
      <textarea value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Write a reply…" className="mt-4 w-full h-24 bg-background/40 border border-border focus:border-gold outline-none px-4 py-3 text-sm resize-none" />
      <button onClick={() => reply.trim() && save.mutate()} disabled={save.isPending} className="mt-2 h-10 px-4 flex items-center gap-2 bg-gold-metal text-primary-foreground text-[10px] tracking-[0.25em] uppercase font-semibold disabled:opacity-60">
        <Mail className="h-3.5 w-3.5" /> Reply by Email
      </button>
    </div>
  );
}
