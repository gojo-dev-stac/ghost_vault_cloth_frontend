/** CheckoutPage.tsx — checkout: delivery details, bag summary, COD or Stripe (label) payment, editorial edition. */
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Banknote, CreditCard, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { ApprovedGate } from "@/components/ApprovedGate";
import { Tilt } from "@/components/Tilt";
import { useCartStore } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { placeOrder } from "@/lib/orders";
import { formatPrice } from "@/lib/products";
import { useQueryClient } from "@tanstack/react-query";
import "@/styles/vault-ui.css";

type Form = {
  firstName: string;
  lastName: string;
  phone: string;
  address1: string;
  city: string;
  province: string;
  zip: string;
  countryCode: string;
};

export function CheckoutPage() {
  const { data: member } = useAuth();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const qc = useQueryClient();
  const [mounted, setMounted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [payment, setPayment] = useState<"COD" | "Stripe">("COD");
  const [form, setForm] = useState<Form>({
    firstName: "",
    lastName: "",
    phone: "",
    address1: "",
    city: "",
    province: "",
    zip: "",
    countryCode: "PK",
  });
  useEffect(() => setMounted(true), []);

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!items.length) return;
    setBusy(true);
    try {
      const orderId = await placeOrder(
        items.map((i) => ({ product_id: i.productId, size: i.size, quantity: i.quantity })),
        payment,
        { ...form, name: `${form.firstName} ${form.lastName}`.trim(), email: member?.email ?? "" },
      );
      clearCart();
      setDone(orderId);
      qc.invalidateQueries();
      toast.success(`Order ${orderId} placed`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not place order");
    } finally {
      setBusy(false);
    }
  };

  const field = "vsite-field";

  return (
    <div className="vsite min-h-screen">
      <div className="relative max-w-6xl mx-auto px-5 md:px-10 pt-32 pb-24">
        <div className="fog-layer" />
        <header className="vsite-head">
          <p className="vsite-index">
            <span>Checkout</span>
            <span>Secure the pieces</span>
          </p>
          <span className="vsite-rule" />
          <p className="vsite-eyebrow">Cash on delivery · Card coming soon</p>
          <div className="vsite-head-row">
            <h1 className="vsite-title">
              Secure the <em>Pieces.</em>
            </h1>
            <p className="vsite-lede">
              Confirm where it ships and how you'll pay. Your pieces stay sealed in the vault until
              the order is confirmed.
            </p>
          </div>
        </header>

        {done ? (
          <Tilt className="relative mt-14 max-w-xl animate-rise">
            <div className="vsite-panel p-10 text-center">
              <p className="vsite-eyebrow">Order sealed</p>
              <p className="mt-3 font-display text-7xl text-gold-metal">{done}</p>
              <p className="mt-4 text-sm text-muted-foreground">
                Your order is in the vault. Track it any time in My Vault.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link to="/me" className="vsite-cta">
                  <span>My Vault</span>
                  <span className="vsite-cta-arrow" aria-hidden="true">
                    ↗
                  </span>
                </Link>
                <Link to="/vault" className="vsite-cta-quiet">
                  <span>Keep browsing</span>
                </Link>
              </div>
            </div>
          </Tilt>
        ) : mounted && items.length === 0 ? (
          <div className="vsite-panel relative mt-14 p-10 max-w-xl">
            <p className="vsite-panel-title">
              The bag is <em>empty.</em>
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Nothing sealed yet — the collection is one click away.
            </p>
            <Link to="/vault" className="vsite-cta-quiet mt-6 inline-flex">
              <span>← Back to the Vault</span>
            </Link>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="relative mt-14 grid grid-cols-1 lg:grid-cols-5 gap-8"
          >
            <div className="lg:col-span-3 space-y-8">
              <section className="vsite-panel p-6 md:p-8 animate-rise">
                <p className="vsite-eyebrow">01 — Delivery</p>
                <h2 className="vsite-panel-title mt-2">
                  Where it <em>ships.</em>
                </h2>
                <p className="mt-2 text-xs text-muted-foreground">
                  Receipt goes to {member?.email}
                </p>
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="vsite-field-wrap">
                    <span className="vsite-field-label">First name</span>
                    <input
                      required
                      className={field}
                      value={form.firstName}
                      onChange={set("firstName")}
                      autoComplete="given-name"
                    />
                  </label>
                  <label className="vsite-field-wrap">
                    <span className="vsite-field-label">Last name</span>
                    <input
                      required
                      className={field}
                      value={form.lastName}
                      onChange={set("lastName")}
                      autoComplete="family-name"
                    />
                  </label>
                  <label className="vsite-field-wrap sm:col-span-2">
                    <span className="vsite-field-label">Phone</span>
                    <input
                      required
                      type="tel"
                      className={field}
                      value={form.phone}
                      onChange={set("phone")}
                      autoComplete="tel"
                    />
                  </label>
                  <label className="vsite-field-wrap sm:col-span-2">
                    <span className="vsite-field-label">Street address</span>
                    <input
                      required
                      className={field}
                      value={form.address1}
                      onChange={set("address1")}
                      autoComplete="street-address"
                    />
                  </label>
                  <label className="vsite-field-wrap">
                    <span className="vsite-field-label">City</span>
                    <input
                      required
                      className={field}
                      value={form.city}
                      onChange={set("city")}
                      autoComplete="address-level2"
                    />
                  </label>
                  <label className="vsite-field-wrap">
                    <span className="vsite-field-label">Province / State</span>
                    <input
                      className={field}
                      value={form.province}
                      onChange={set("province")}
                      autoComplete="address-level1"
                    />
                  </label>
                  <label className="vsite-field-wrap">
                    <span className="vsite-field-label">Postal code</span>
                    <input
                      className={field}
                      value={form.zip}
                      onChange={set("zip")}
                      autoComplete="postal-code"
                    />
                  </label>
                  <label className="vsite-field-wrap">
                    <span className="vsite-field-label">Country code</span>
                    <input
                      required
                      maxLength={2}
                      placeholder="PK"
                      className={`${field} uppercase`}
                      value={form.countryCode}
                      onChange={set("countryCode")}
                      autoComplete="country"
                    />
                  </label>
                </div>
              </section>

              <section
                className="vsite-panel p-6 md:p-8 animate-rise"
                style={{ animationDelay: "100ms" }}
              >
                <p className="vsite-eyebrow">02 — Payment</p>
                <h2 className="vsite-panel-title mt-2">
                  How you <em>pay.</em>
                </h2>
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(
                    [
                      {
                        id: "COD",
                        label: "Cash on Delivery",
                        sub: "Pay when it arrives",
                        Icon: Banknote,
                      },
                      {
                        id: "Stripe",
                        label: "Card · Stripe",
                        sub: "Payment collected later",
                        Icon: CreditCard,
                      },
                    ] as const
                  ).map(({ id, label, sub, Icon }) => (
                    <button
                      type="button"
                      key={id}
                      onClick={() => setPayment(id)}
                      aria-pressed={payment === id}
                      className={`relative p-5 text-left rounded-[10px] border transition duration-300 hover:-translate-y-0.5 ${
                        payment === id
                          ? "border-[rgba(201,162,74,0.75)] bg-[linear-gradient(140deg,rgba(43,34,22,0.9),rgba(15,14,13,0.95))] shadow-[0_18px_44px_-24px_rgba(201,162,74,0.55)]"
                          : "border-[rgba(226,220,203,0.16)] bg-[rgb(13,12,11,0.6)] hover:border-[rgba(201,162,74,0.4)]"
                      }`}
                    >
                      {payment === id && (
                        <span
                          className="absolute top-0 bottom-0 left-0 w-[2px] rounded-l-[10px] bg-[linear-gradient(180deg,#f4d690,#987229)]"
                          aria-hidden="true"
                        />
                      )}
                      <Icon
                        className={`h-5 w-5 ${payment === id ? "text-gold" : "text-muted-foreground"}`}
                      />
                      <p className="mt-3 font-display text-xl tracking-wider">{label}</p>
                      <p className="text-xs text-muted-foreground">{sub}</p>
                    </button>
                  ))}
                </div>
                {payment === "Stripe" && (
                  <p className="mt-4 text-xs text-muted-foreground">
                    Online card payment isn't live yet — your order will be reserved and marked as
                    Stripe.
                  </p>
                )}
              </section>
            </div>

            <aside className="lg:col-span-2">
              <div
                className="vsite-panel p-6 md:p-8 lg:sticky lg:top-28 animate-rise"
                style={{ animationDelay: "200ms" }}
              >
                <p className="vsite-eyebrow">Summary</p>
                <h2 className="vsite-panel-title mt-2">
                  Your <em>Bag.</em>
                </h2>
                <div className="mt-4 divide-y divide-[rgba(226,220,203,0.1)] max-h-80 overflow-y-auto">
                  {items.map((i) => (
                    <div key={i.key} className="py-3 flex gap-3">
                      <div className="w-14 h-16 bg-secondary overflow-hidden flex-shrink-0 rounded-[6px]">
                        {i.imageUrl && (
                          <img
                            src={i.imageUrl}
                            alt={i.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{i.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Size {i.size} · ×{i.quantity}
                        </p>
                      </div>
                      <p className="text-sm text-gold">{formatPrice(i.price * i.quantity)}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-[rgba(226,220,203,0.14)] flex justify-between items-baseline">
                  <span className="vsite-stat-label">Subtotal</span>
                  <span className="font-display text-3xl">{formatPrice(subtotal)}</span>
                </div>
                <button
                  type="submit"
                  disabled={busy || !items.length}
                  className="vsite-cta mt-6 w-full"
                >
                  <span className="flex items-center gap-2">
                    {busy ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Lock className="h-3.5 w-3.5" /> Place Order
                      </>
                    )}
                  </span>
                  <span className="vsite-cta-arrow" aria-hidden="true">
                    ↗
                  </span>
                </button>
              </div>
            </aside>
          </form>
        )}
      </div>
    </div>
  );
}
