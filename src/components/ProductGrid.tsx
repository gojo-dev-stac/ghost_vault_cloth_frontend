/** ProductGrid.tsx — responsive grid of ProductCards. */
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/lib/products";

export function ProductGrid({
  products,
  showDescription = false,
  variant = "default",
}: {
  products: Product[];
  showDescription?: boolean;
  variant?: "default" | "editorial";
}) {
  if (products.length === 0) {
    return (
      <div className="text-center py-32">
        <p className="font-display text-5xl text-muted-foreground/40 tracking-wider">
          No products found
        </p>
        <p className="mt-4 text-sm text-muted-foreground tracking-wide">New drops coming soon.</p>
      </div>
    );
  }
  return (
    <div
      className={
        variant === "editorial"
          ? "campaign-product-grid"
          : "grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3"
      }
    >
      {products.map((product, i) => (
        <ProductCard
          key={product.id}
          product={product}
          index={i}
          showDescription={showDescription}
          variant={variant}
        />
      ))}
    </div>
  );
}
