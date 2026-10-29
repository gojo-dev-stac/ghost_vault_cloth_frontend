/**
 * AdminReviews.tsx — Reviews tab: read every product review and publish a
 * public reply under it. Part of the Admin Dashboard.
 */
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Stars } from "@/components/Stars";
import { fetchReviews, replyToReview, type Review } from "@/lib/reviews";
import type { Product } from "@/lib/products";

export function AdminReviews({ products }: { products: Product[] }) {
  const { data = [], isLoading } = useQuery({ queryKey: ["reviews", "all"], queryFn: () => fetchReviews() });
  const names = Object.fromEntries(products.map((p) => [p.id, p.name]));
  if (isLoading) return <div className="p-12 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-gold" /></div>;
  if (!data.length) return <p className="p-8 text-sm text-muted-foreground">No reviews yet.</p>;
  return <div className="divide-y divide-border/50">{data.map((r) => <ReviewRow key={r.id} r={r} product={names[r.product_id] ?? "Product"} />)}</div>;
}

function ReviewRow({ r, product }: { r: Review; product: string }) {
  const qc = useQueryClient();
  const [reply, setReply] = useState(r.admin_reply ?? "");
  const save = useMutation({
    mutationFn: () => replyToReview(r.id, reply),
    onSuccess: () => { toast.success("Reply published"); qc.invalidateQueries({ queryKey: ["reviews"] }); },
    onError: () => toast.error("Could not save reply"),
  });
  return (
    <div className="p-5 md:p-6">
      <div className="flex flex-wrap justify-between gap-2">
        <div>
          <p className="text-[10px] tracking-[0.3em] uppercase text-crimson">{product}</p>
          <p className="font-display text-xl tracking-wider">{r.author_name}</p>
          <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</p>
        </div>
        <Stars value={r.rating} />
      </div>
      <p className="mt-3 text-sm whitespace-pre-line text-foreground/85">{r.comment}</p>
      <textarea value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Public reply shown under this review…" className="mt-4 w-full h-20 bg-background/40 border border-border focus:border-gold outline-none px-4 py-3 text-sm resize-none" />
      <button onClick={() => save.mutate()} disabled={save.isPending} className="mt-2 h-10 px-4 bg-gold-metal text-primary-foreground text-[10px] tracking-[0.25em] uppercase font-semibold disabled:opacity-60">
        {r.admin_reply ? "Update Reply" : "Publish Reply"}
      </button>
    </div>
  );
}
