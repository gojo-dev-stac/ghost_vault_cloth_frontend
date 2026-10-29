/** AdminOrders.tsx — Orders tab: move orders through Pending → Confirmed → Processing →
 *  Shipped → Delivered, and open any order to see the full details the customer entered
 *  (contact, shipping address, per-item pricing, totals and timestamps). */
import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronDown, Loader2, Mail, MapPin, Phone, User } from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/products";
import { ORDER_STATUSES, setOrderStatus, type Order, type OrderStatus } from "@/lib/orders";

/** Per-status accent dot so the current stage reads at a glance. */
const STATUS_DOT: Record<OrderStatus, string> = {
  Pending: "bg-chrome/60",
  Confirmed: "bg-gold/60",
  Processing: "bg-gold",
  Shipped: "bg-[#8fb8c9]",
  Delivered: "bg-[#9dbb8f]",
};

/** Human labels for the keys the checkout sends in `customer` / stores in `shipping`. */
const SHIPPING_FIELDS: { key: string; label: string; Icon?: typeof Phone }[] = [
  { key: "phone", label: "Phone", Icon: Phone },
  { key: "address1", label: "Street address", Icon: MapPin },
  { key: "city", label: "City" },
  { key: "province", label: "Province / State" },
  { key: "zip", label: "Postal code" },
  { key: "countryCode", label: "Country code" },
];

export function AdminOrders({ orders }: { orders: Order[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const qc = useQueryClient();
  const m = useMutation({
    mutationFn: (v: { id: string; status: OrderStatus }) => setOrderStatus(v.id, v.status),
    onSuccess: (_, v) => {
      toast.success(`Status set to ${v.status}`);
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not update order"),
  });

  if (!orders.length) return <p className="p-8 text-sm text-muted-foreground">No orders yet.</p>;

  return (
    <div className="divide-y divide-border">
      {orders.map((o, idx) => {
        const open = openId === o.id;
        return (
          <div key={o.id} className="animate-rise" style={{ animationDelay: `${idx * 40}ms` }}>
            <div
              role="button"
              tabIndex={0}
              aria-expanded={open}
              onClick={() => setOpenId(open ? null : o.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setOpenId(open ? null : o.id);
                }
              }}
              className={`p-5 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 cursor-pointer transition-colors ${
                open ? "bg-gold/5" : "hover:bg-foreground/[0.03]"
              }`}
            >
              <div className="md:col-span-3">
                <div className="flex items-center gap-2">
                  <p className="font-display text-2xl tracking-wider">{o.order_id}</p>
                  <ChevronDown
                    className={`h-4 w-4 text-gold transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(o.created_at).toLocaleString()}
                </p>
                <p className="mt-2 text-sm">{o.customer_name || "—"}</p>
                <p className="text-xs text-muted-foreground truncate">{o.customer_email}</p>
              </div>
              <div className="md:col-span-4 text-sm text-muted-foreground">
                {o.items.map((i, k) => (
                  <p key={k}>
                    {i.quantity}× {i.name} · {i.size}
                  </p>
                ))}
              </div>
              <div className="md:col-span-2">
                <p className="text-gold font-semibold">{formatPrice(o.total)}</p>
                <p className="mt-1 text-[10px] tracking-[0.3em] uppercase">{o.payment_method}</p>
              </div>
              <div className="md:col-span-3" onClick={(e) => e.stopPropagation()}>
                <StatusSelect
                  value={o.status}
                  busy={m.isPending}
                  onChange={(status) => m.mutate({ id: o.id, status })}
                />
              </div>
            </div>

            {open && <OrderDetails order={o} />}
          </div>
        );
      })}
    </div>
  );
}

/**
 * StatusSelect — a themed replacement for the native <select>: the browser popup
 * can't be styled, so this renders the vault's own panel with gold hairlines,
 * a status dot per stage and a check on the active one. Keyboard + outside-click
 * friendly (Escape closes, focus returns to the trigger).
 */
function StatusSelect({
  value,
  busy = false,
  onChange,
}: {
  value: OrderStatus;
  busy?: boolean;
  onChange: (status: OrderStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={wrap} className="relative">
      <button
        ref={trigger}
        type="button"
        disabled={busy}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-full items-center justify-between gap-2 rounded-[10px] border border-[rgba(226,220,203,0.18)] bg-[rgba(13,12,11,0.72)] px-3 text-[11px] font-semibold tracking-[0.24em] uppercase transition-colors hover:border-[rgba(201,162,74,0.55)] focus:outline-none focus:border-gold disabled:opacity-60"
      >
        <span className="flex min-w-0 items-center gap-2">
          <span
            className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${STATUS_DOT[value]}`}
            aria-hidden="true"
          />
          <span className="truncate">{busy ? "Saving…" : value}</span>
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 flex-shrink-0 text-gold/80 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Order status"
          className="absolute right-0 top-[calc(100%+6px)] z-30 w-full min-w-[190px] overflow-hidden rounded-[10px] border border-[rgba(201,162,74,0.3)] bg-[linear-gradient(140deg,rgba(37,31,23,0.97),rgba(15,14,13,0.99))] shadow-[0_24px_60px_rgba(0,0,0,0.55)]"
        >
          {ORDER_STATUSES.map((s) => {
            const active = s === value;
            return (
              <li key={s}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    setOpen(false);
                    if (!active) onChange(s);
                  }}
                  className={`flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[11px] font-semibold tracking-[0.24em] uppercase transition-colors ${
                    active
                      ? "text-gold"
                      : "text-foreground/75 hover:bg-[rgba(201,162,74,0.1)] hover:text-gold"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${STATUS_DOT[s]}`}
                    aria-hidden="true"
                  />
                  <span className="flex-1">{s}</span>
                  {active && <Check className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function OrderDetails({ order }: { order: Order }) {
  const s = order.shipping ?? {};
  const named: {
    label: string;
    value: string | null | undefined;
    Icon?: typeof Phone | undefined;
  }[] = [
    { label: "Full name", value: order.customer_name, Icon: User },
    { label: "Email", value: order.customer_email, Icon: Mail },
    ...SHIPPING_FIELDS.map(({ key, label, Icon }) => ({ label, value: s[key], Icon })),
  ].filter((row) => row.value && String(row.value).trim());

  const subtotal = order.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <div className="px-5 md:px-6 pb-6 grid grid-cols-1 lg:grid-cols-3 gap-6 border-t border-border/60 pt-6">
      <section className="lg:col-span-1">
        <p className="text-[10px] tracking-[0.4em] uppercase text-muted-foreground">
          Customer & delivery
        </p>
        <ul className="mt-4 space-y-3">
          {named.map(({ label, value, Icon }) => (
            <li key={label} className="flex items-start gap-3 text-sm">
              {Icon ? (
                <Icon className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-gold/80" />
              ) : (
                <span className="mt-1.5 h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
              )}
              <span className="min-w-0">
                <span className="block text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
                  {label}
                </span>
                <span className="block break-words">{value}</span>
              </span>
            </li>
          ))}
          {!named.length && (
            <li className="text-sm text-muted-foreground">No customer details recorded.</li>
          )}
        </ul>
      </section>

      <section className="lg:col-span-2">
        <p className="text-[10px] tracking-[0.4em] uppercase text-muted-foreground">Items</p>
        <div className="mt-4 divide-y divide-border/50">
          {order.items.map((i, k) => (
            <div key={k} className="flex items-center gap-4 py-3">
              <div className="h-16 w-14 flex-shrink-0 overflow-hidden rounded-sm bg-secondary">
                {i.image_url && (
                  <img src={i.image_url} alt={i.name} className="h-full w-full object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{i.name}</p>
                <p className="text-xs text-muted-foreground">
                  Size {i.size} · {i.quantity} × {formatPrice(i.price)}
                </p>
              </div>
              <p className="flex-shrink-0 text-sm text-gold">{formatPrice(i.price * i.quantity)}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-1.5 border-t border-border pt-4 text-sm">
          <Row label="Subtotal" value={formatPrice(subtotal)} />
          <Row label="Delivery" value="Free" />
          <Row label={`Total (${order.payment_method})`} value={formatPrice(order.total)} strong />
          <p className="pt-2 text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
            Placed {new Date(order.created_at).toLocaleString()}
            {order.updated_at && order.updated_at !== order.created_at && (
              <> · Updated {new Date(order.updated_at).toLocaleString()}</>
            )}
          </p>
        </div>
      </section>
    </div>
  );
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-xs tracking-[0.25em] uppercase text-muted-foreground">{label}</span>
      <span className={strong ? "font-display text-2xl text-gold" : ""}>{value}</span>
    </div>
  );
}
