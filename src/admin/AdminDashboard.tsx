/**
 * AdminDashboard.tsx — the admin control room: stats and the six tabs
 * (Requests, Members, Inventory & Products, Orders, Support, Reviews).
 * Rendered by the /admin route after the admin check.
 */
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { fetchMembers } from "@/lib/members";
import { AdminOrders } from "@/admin/AdminOrders";
import { AdminInventory } from "@/admin/AdminInventory";
import { AdminMembers } from "@/admin/AdminMembers";
import { AdminRequests } from "@/admin/AdminRequests";
import { AdminSupport } from "@/admin/AdminSupport";
import { AdminReviews } from "@/admin/AdminReviews";
import { fetchProducts } from "@/lib/products";
import { fetchOrders } from "@/lib/orders";

type Tab = "requests" | "members" | "products" | "orders" | "support" | "reviews";

export function AdminDashboard() {
  return <Dashboard />;
}

function Dashboard() {
  const [tab, setTab] = useState<Tab>("requests");
  const { data: members = [], isLoading } = useQuery({ queryKey: ["admin-overview"], queryFn: fetchMembers });
  const products = useQuery({ queryKey: ["admin-products"], queryFn: fetchProducts });
  const orders = useQuery({ queryKey: ["admin-orders"], queryFn: () => fetchOrders() });

  const pending = members.filter((m) => m.status === "pending");
  const stats = [
    { label: "Members", value: members.length },
    { label: "Pending", value: pending.length },
    { label: "Products", value: products.data?.length ?? 0 },
    { label: "Orders", value: orders.data?.length ?? 0 },
  ];

  return (
    <div className="min-h-screen">
      <div className="relative max-w-7xl mx-auto px-5 md:px-10 pt-32 pb-24">
        <div className="fog-layer" />
        <p className="relative text-[11px] tracking-[0.5em] uppercase text-crimson">Control Room</p>
        <h1 className="relative font-display text-7xl md:text-9xl text-gold-metal leading-none mt-2">ADMIN</h1>

        <div className="relative mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div key={s.label} className="glass p-6 animate-rise" style={{ animationDelay: `${i * 80}ms` }}>
              <p className="text-[10px] tracking-[0.4em] uppercase text-muted-foreground">{s.label}</p>
              <p className="mt-2 font-display text-5xl text-chrome">{isLoading ? "–" : s.value}</p>
            </div>
          ))}
        </div>

        <div className="relative mt-10 flex gap-3 overflow-x-auto">
          {(["requests", "members", "products", "orders", "support", "reviews"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 h-11 text-[11px] tracking-[0.3em] uppercase whitespace-nowrap border transition-all duration-200 ${
                tab === t
                  ? "bg-gold-metal text-primary-foreground border-gold/60 shadow-gold font-semibold"
                  : "bg-secondary/70 text-foreground/85 border-gold/25 hover:text-gold hover:bg-gold/10 hover:border-gold/50"
              }`}
            >
              {t === "requests" ? `Requests (${pending.length})` : t === "products" ? "Inventory & Products" : t}
            </button>
          ))}
        </div>

        <div className="relative mt-6 glass overflow-x-auto">
          {isLoading ? (
            <div className="p-12 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-gold" /></div>
          ) : tab === "requests" ? (
            <AdminRequests members={members} />
          ) : tab === "members" ? (
            <AdminMembers members={members} />
          ) : tab === "products" ? (
            <AdminInventory products={products.data ?? []} />
          ) : tab === "support" ? (
            <AdminSupport />
          ) : tab === "reviews" ? (
            <AdminReviews products={products.data ?? []} />
          ) : (
            <AdminOrders orders={orders.data ?? []} />
          )}
        </div>
      </div>
    </div>
  );
}
