/**
 * products.ts — product data access for the GHOST catalog (Django API).
 * Each product carries per-size stock in `sizes`.
 */
import { api, ApiError } from "@/lib/api";

export const SIZES = ["S", "M", "L", "XL"] as const;
export type Size = (typeof SIZES)[number];
export type SizeStock = Record<Size, number>;

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  sizes: SizeStock;
  category: string;
  created_at: string;
};

export type ProductInput = Omit<Product, "id" | "created_at">;

const normSizes = (s: unknown): SizeStock => {
  const o = (s ?? {}) as Record<string, unknown>;
  return { S: Number(o["S"] ?? 0), M: Number(o["M"] ?? 0), L: Number(o["L"] ?? 0), XL: Number(o["XL"] ?? 0) };
};
const toProduct = (r: Record<string, unknown>): Product =>
  ({ ...(r as unknown as Product), price: Number(r["price"]), sizes: normSizes(r["sizes"]) });

/** Total stock across all sizes. */
export const totalStock = (p: Product) => SIZES.reduce((n, s) => n + p.sizes[s], 0);

export async function fetchProducts(): Promise<Product[]> {
  const rows = await api<Record<string, unknown>[]>("/products/");
  return rows.map(toProduct);
}

export async function fetchProduct(id: string): Promise<Product | null> {
  try {
    return toProduct(await api<Record<string, unknown>>(`/products/${encodeURIComponent(id)}/`));
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

/** Admin only: create a product (no id) or update an existing one (with id). */
export async function saveProduct(input: ProductInput, id?: string) {
  if (id) await api(`/products/${id}/`, { method: "PATCH", body: input });
  else await api("/products/", { method: "POST", body: input });
}

/** Admin only: remove a product from the catalog. */
export async function deleteProduct(id: string) {
  await api(`/products/${id}/`, { method: "DELETE" });
}

/** Format a price in USD for display. */
export const formatPrice = (amount: number | string, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(Number(amount));
