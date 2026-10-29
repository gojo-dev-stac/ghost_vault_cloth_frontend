/** ReviewSection.tsx — product reviews: average rating, member reviews and admin replies. */
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Stars } from "@/components/Stars";
import { useAuth } from "@/hooks/useAuth";
import { averageRating, fetchReviews, submitReview} from "@/lib/reviews";

export function ReviewSection({ productId }: { productId: string }) {
  const qc = useQueryClient();
  const { data: member } = useAuth();
  const { data: reviews = [], isLoading } = useQuery({ queryKey: ["reviews", productId], queryFn: () => fetchReviews(productId) });
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const avg = averageRating(reviews);

  const post = useMutation({
    mutationFn: () => submitReview(productId, rating, comment),
    onSuccess: () => {
      toast.success("Review posted");
      setComment("");
      setRating(5);
      qc.invalidateQueries({ queryKey: ["reviews"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not post review"),
  });

  return (
    <section className="relative mt-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
        <div>
          <p className="text-[11px] tracking-[0.5em] uppercase text-crimson">Member Verdicts</p>
          <h2 className="font-display text-5xl md:text-6xl text-chrome leading-none mt-2">Reviews</h2>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-display text-6xl text-gold-metal leading-none">{reviews.length ? avg.toFixed(1) : "–"}</span>
          <div>
            <Stars value={avg} size="h-5 w-5" />
            <p className="mt-1 text-[10px] tracking-[0.3em] uppercase text-muted-foreground">{reviews.length} review{reviews.length === 1 ? "" : "s"}</p>
          </div>
        </div>
      </div>

      <div className="mt-10 grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1">
          {member ? (
            <form
              onSubmit={(e) => { e.preventDefault(); if (comment.trim()) post.mutate(); }}
              className="glass p-6 space-y-4 lg:sticky lg:top-28"
            >
              <p className="text-[11px] tracking-[0.3em] uppercase text-muted-foreground">Your rating</p>
              <Stars value={rating} size="h-7 w-7" onChange={setRating} />
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={2000}
                required
                placeholder="Fit, fabric, feel…"
                className="w-full h-32 bg-background/40 border border-border focus:border-gold outline-none px-4 py-3 text-sm resize-none"
              />
              <button disabled={post.isPending} className="w-full h-12 bg-gold-metal text-primary-foreground text-[11px] font-semibold tracking-[0.3em] uppercase flex items-center justify-center disabled:opacity-60">
                {post.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Post Review"}
              </button>
            </form>
          ) : (
            <div className="glass p-6 text-center">
              <p className="text-sm text-muted-foreground">Sign in to share your verdict.</p>
              <Link to="/auth" className="mt-4 inline-block text-[11px] tracking-[0.3em] uppercase text-gold">Sign in →</Link>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-gold" />
          ) : reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">No reviews yet. Be the first.</p>
          ) : (
            reviews.map((r, i) => (
              <article key={r.id} className="glass p-6 animate-rise" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-display text-xl tracking-wider">{r.author_name}</p>
                    <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                  <Stars value={r.rating} />
                </div>
                <p className="mt-4 text-sm leading-relaxed text-foreground/85 whitespace-pre-line">{r.comment}</p>
                {r.admin_reply && (
                  <div className="mt-4 border-l-2 border-gold pl-4">
                    <p className="text-[10px] tracking-[0.3em] uppercase text-gold">GHOST replied</p>
                    <p className="mt-1 text-sm text-muted-foreground whitespace-pre-line">{r.admin_reply}</p>
                  </div>
                )}
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
