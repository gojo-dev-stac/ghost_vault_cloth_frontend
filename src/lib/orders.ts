/**
 * orders.ts — order placement and order status for GHOST (Django API).
 * The server checks approval, prices from the database and decrements per-size
 * stock atomically; status follows Pending → Confirmed → Processing → Shipped → Delivered.
 */
import { api } from "@/lib/api";
import type { Size } from "@/lib/products";

export const ORDER_STATUSES = [
  "Pending",
  "Confirmed",
  "Processing",
  "Shipped",
  "Delivered",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type OrderItem = {
  product_id: string | null;
  name: string;
  size: Size;
  quantity: number;
  price: number;
  image_url: string | null;
};
export type Order = {
  id: string;
  order_id: string;
  customer_email: string;
  customer_name: string | null;
  shipping: Record<string, string>;
  items: OrderItem[];
  total: number;
  payment_method: "COD" | "Stripe";
  status: OrderStatus;
  created_at: string;
  updated_at?: string;
};

const toOrder = (r: Record<string, unknown>): Order => ({
  ...(r as unknown as Order),
  total: Number(r["total"]),
});

/** Place an order. Returns the public order id (e.g. "GV-1A2B3C4D"). */
export async function placeOrder(
  items: { product_id: string; size: Size; quantity: number }[],
  paymentMethod: "COD" | "Stripe",
  customer: Record<string, string>,
): Promise<string> {
  const order = await api<Order>("/orders/", {
    method: "POST",
    body: { items, payment_method: paymentMethod, customer },
  });
  return order.order_id;
}

/**
 * Fetch orders. Members always get their own; admins get every order unless
 * `mine` is set.
 */
export async function fetchOrders(opts: { mine?: boolean } = {}): Promise<Order[]> {
  const rows = await api<Record<string, unknown>[]>(opts.mine ? "/orders/?mine=1" : "/orders/");
  return rows.map(toOrder);
}

/** Admin only: move an order to another fulfillment stage. */
export async function setOrderStatus(id: string, status: OrderStatus) {
  await api(`/orders/${id}/status/`, { method: "PATCH", body: { status } });
}
