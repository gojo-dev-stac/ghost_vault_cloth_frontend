/**
 * useProducts.ts — product queries: the full catalog and single-product lookups
 * via TanStack Query.
 */
import { queryOptions, useQuery } from "@tanstack/react-query";
import { fetchProduct, fetchProducts } from "@/lib/products";

export const productsQueryOptions = queryOptions({
  queryKey: ["products"],
  queryFn: fetchProducts,
});

export const productQueryOptions = (id: string) =>
  queryOptions({ queryKey: ["product", id], queryFn: () => fetchProduct(id) });

export function useProducts() {
  return useQuery(productsQueryOptions);
}

export function useProduct(id: string) {
  return useQuery(productQueryOptions(id));
}
