/** PublicGalleryPage.tsx — public product gallery (Explore the Drop): anyone can browse; purchasing is members-only. */
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Footer } from "@/components/Footer";
import { ProductGrid } from "@/components/ProductGrid";
import { fetchProducts} from "@/lib/products";

export function PublicGalleryPage() {
  const { data, isLoading } = useQuery({ queryKey: ["products"], queryFn: fetchProducts });
  return (
    <div className="min-h-screen">
      <section className="relative max-w-7xl mx-auto px-5 md:px-10 pt-32 pb-24">
        <div className="fog-layer" />
        <div className="relative mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-[11px] tracking-[0.5em] uppercase text-crimson mb-3">Public Preview</p>
            <h1 className="font-display text-6xl md:text-8xl tracking-wide text-chrome leading-none">Explore the Drop</h1>
          </div>
          <p className="text-sm text-muted-foreground max-w-xs">
            Look freely. Purchasing is reserved for approved members of The Vault.
          </p>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-32"><Loader2 className="h-6 w-6 animate-spin text-gold" /></div>
        ) : (
          <div className="relative"><ProductGrid products={data ?? []} showDescription /></div>
        )}
      </section>
      <Footer />
    </div>
  );
}
