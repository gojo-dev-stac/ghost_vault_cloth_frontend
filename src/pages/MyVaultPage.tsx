/** MyVaultPage.tsx — My Vault: the member area with access status and order history, editorial edition. */
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Tilt } from "@/components/Tilt";
import { useAuth } from "@/hooks/useAuth";
import { fetchOrders } from "@/lib/orders";
import { formatPrice } from "@/lib/products";
import "@/styles/vault-ui.css";

const statusColor = {
  approved: "text-gold",
  pending: "text-chrome",
  rejected: "text-crimson",
} as const;

export function MyVaultPage() {
  const { data: member, isLoading } = useAuth();
  const orders = useQuery({
    queryKey: ["my-orders", member?.id],
    queryFn: () => fetchOrders({ mine: true }),
    enabled: !!member,
  });

  if (isLoading || !member) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </div>
    );
  }

  const since = new Date(member.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const handle = member.email.split("@")[0] ?? "";
  const initials = (member.display_name || handle).slice(0, 2).toUpperCase();

  return (
    <div className="vsite min-h-screen">
      <div className="relative max-w-6xl mx-auto px-5 md:px-10 pt-32 pb-24">
        <div className="fog-layer" />
        <header className="vsite-head">
          <p className="vsite-index">
            <span>Member area</span>
            <span>{member.isAdmin ? "Administrator" : "Member"} / 2026</span>
          </p>
          <span className="vsite-rule" />
          <p className="vsite-eyebrow">Your access, status & orders</p>
          <div className="vsite-head-row">
            <h1 className="vsite-title">
              My <em>Vault.</em>
            </h1>
            <p className="vsite-lede">
              Everything tied to your membership — access status, the details on file, and every
              piece you've claimed from the drop.
            </p>
          </div>
        </header>

        <div className="relative mt-14 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Tilt className="lg:col-span-1 animate-float">
            <div className="relative overflow-hidden p-8 aspect-[1.6/1] lg:aspect-auto lg:h-full bg-gold-metal text-primary-foreground shadow-gold flex flex-col justify-between rounded-[18px]">
              <div
                className="absolute inset-3 rounded-[12px] border border-primary-foreground/25"
                aria-hidden="true"
              />
              <div className="relative flex justify-between items-start">
                <span className="font-display text-4xl tracking-[0.25em]">GHOST</span>
                <span className="text-[10px] tracking-[0.3em] uppercase font-semibold">
                  Vault Card
                </span>
              </div>
              <div className="relative">
                <p className="text-[10px] tracking-[0.4em] uppercase opacity-80">Member</p>
                <p className="font-display text-3xl tracking-wider truncate">
                  {member.display_name || member.email.split("@")[0]}
                </p>
                <div className="mt-3 flex items-center justify-between text-[10px] tracking-[0.3em] uppercase">
                  <span>Since {since}</span>
                  <span className="font-display text-xl tracking-[0.2em]">{initials}</span>
                </div>
              </div>
            </div>
          </Tilt>

          <div className="vsite-panel lg:col-span-2 p-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
            <Stat label="Name" value={member.display_name || "—"} />
            <Stat label="Email" value={member.email} />
            <Stat label="Member Since" value={since} />
            <div>
              <p className="vsite-stat-label">Vault Status</p>
              <p className={`vsite-stat-value ${statusColor[member.status]}`}>
                {member.status.toUpperCase()}
              </p>
            </div>
            <Stat label="Access Level" value={member.isAdmin ? "Administrator" : "Member"} />
          </div>
        </div>

        <section className="relative mt-16">
          <p className="vsite-index">
            <span>Order history</span>
            <span>{orders.data ? `${orders.data.length} recorded` : "Loading"}</span>
          </p>
          <span className="vsite-rule" />
          <h2 className="vsite-title text-[clamp(40px,6vw,72px)]">
            Claimed <em>pieces.</em>
          </h2>
          <div className="vsite-panel mt-8 px-6 py-2">
            {orders.isLoading ? (
              <div className="p-10 flex justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-gold" />
              </div>
            ) : !orders.data?.length ? (
              <div className="p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No orders yet. Your first piece is waiting in The Vault.
                </p>
                <Link to="/vault" className="vsite-cta-quiet mt-6 inline-flex">
                  <span>Browse the collection</span>
                </Link>
              </div>
            ) : (
              orders.data.map((o, i) => (
                <div key={o.id} className="vsite-row">
                  <span className="vsite-row-index">O / {String(i + 1).padStart(2, "0")}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-2xl tracking-wider">{o.order_id}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(o.created_at).toLocaleDateString()} ·{" "}
                      {o.items.map((it) => `${it.quantity}× ${it.name} (${it.size})`).join(", ")}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-gold font-semibold">{formatPrice(o.total)}</p>
                    <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
                      {o.status} · {o.payment_method}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="vsite-stat-label">{label}</p>
      <p className="mt-2 text-lg truncate">{value}</p>
    </div>
  );
}
