/**
 * reviews.ts — product reviews and admin replies (Django API).
 * Reviews are public to read; approved members can post their own,
 * and the admin's reply shows under the review for everyone.
 */
import { api } from "@/lib/api";

export type Review = {
  id: string;
  product_id: string;
  author_name: string;
  rating: number;
  comment: string;
  admin_reply: string | null;
  replied_at: string | null;
  created_at: string;
  is_mine: boolean;
};

export function fetchReviews(productId?: string): Promise<Review[]> {
  return api<Review[]>(productId ? `/reviews/?product=${encodeURIComponent(productId)}` : "/reviews/");
}

export async function submitReview(productId: string, rating: number, comment: string) {
  await api("/reviews/", { method: "POST", body: { product_id: productId, rating, comment: comment.trim() } });
}

/** Admin only: attach (or clear, with an empty string) a reply under a review. */
export async function replyToReview(id: string, reply: string) {
  await api(`/reviews/${id}/reply/`, { method: "PATCH", body: { reply: reply.trim() } });
}

/** Average star rating across a set of reviews (0 when empty). */
export const averageRating = (reviews: Review[]) =>
  reviews.length ? reviews.reduce((n, r) => n + r.rating, 0) / reviews.length : 0;
