/** VaultPage.tsx — The Vault: the members-only store grid for approved members. */
import { useQuery } from "@tanstack/react-query";
import { productsQueryOptions } from "@/hooks/useProducts";
import { Loader2 } from "lucide-react";
import { ProductGrid } from "@/components/ProductGrid";
import { CatalogHero } from "@/components/CatalogHero";
import { Footer } from "@/components/Footer";
import { ApprovedGate } from "@/components/ApprovedGate";
import { fetchProducts } from "@/lib/products";
import "@/styles/vault-ui.css";

export function VaultPage() {
  const { data: products, isLoading } = useQuery(productsQueryOptions);

  return (
    <div className="min-h-screen">
      <CatalogHero />
      <section id="shop" className="vsite relative max-w-7xl mx-auto px-5 md:px-10 py-24 md:py-32">
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <p className="vsite-index">
              <span>Drop 001</span>
              <span>Index / 2026</span>
            </p>
            <span className="vsite-rule" />
            <p className="vsite-eyebrow">Sealed runs · Members only</p>
            <h2 className="vsite-title">
              The <em>Collection.</em>
            </h2>
          </div>
          <p className="vsite-lede md:mb-2">
            Heavyweight cotton. Limited runs. Each piece sealed inside the vault until you claim it.
          </p>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-32">
            <Loader2 className="h-6 w-6 animate-spin text-gold" />
          </div>
        ) : (
          <ProductGrid products={products ?? []} />
        )}
      </section>
      <Footer />
    </div>
  );
}
