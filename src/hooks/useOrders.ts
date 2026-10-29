/**
 * useOrders.ts — order queries: the member's own history and the admin's
 * full order list via TanStack Query.
 */
import { useQuery } from "@tanstack/react-query";
import { fetchOrders } from "@/lib/orders";

export function useOrders(opts: { mine?: boolean } = {}) {
  return useQuery({
    queryKey: ["orders", opts.mine ? "mine" : "all"],
    queryFn: () => fetchOrders(opts),
  });
}
