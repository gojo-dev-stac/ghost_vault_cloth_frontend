import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { AdminDashboard } from "@/admin/AdminDashboard";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin — GHOST Vault" },
      { name: "description", content: "Manage GHOST members, access requests, stock and orders." },
      { property: "og:title", content: "Admin — GHOST Vault" },
      { property: "og:description", content: "Manage GHOST members, access requests, stock and orders." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminRoute,
});

function AdminRoute() {
  const { data: member, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-gold" /></div>;
  if (!member?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-6">
        <div>
          <h1 className="font-display text-6xl text-crimson">RESTRICTED</h1>
          <Link to="/vault" className="mt-6 inline-block text-xs tracking-[0.3em] uppercase text-gold">← Back to the Vault</Link>
        </div>
      </div>
    );
  }
  return <AdminDashboard />;
}
