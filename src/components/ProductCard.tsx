/** ProductCard.tsx — a product tile: image, 3D tilt, price, stock, members-only buy area. */
import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/hooks/useCart";
import { formatPrice, SIZES, type Product } from "@/lib/products";
import { Tilt } from "@/components/Tilt";
import { StockBadge } from "@/components/StockBadge";
import { MembersOnlyLink } from "@/components/MembersOnlyLink";
import { useCanBuy } from "@/hooks/useCanBuy";

export function ProductCard({
  product,
  index = 0,
  showDescription = false,
  variant = "default",
}: {
  product: Product;
  index?: number;
  showDescription?: boolean;
  variant?: "default" | "editorial";
}) {
  const addItem = useCartStore((state) => state.addItem);
  const canBuy = useCanBuy();
  const available = SIZES.filter((s) => product.sizes[s] > 0);
  const firstSize = available[0];
  const soldOut = !firstSize;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!firstSize) return;
    addItem({
      productId: product.id,
      name: product.name,
      imageUrl: product.image_url,
      price: product.price,
      size: firstSize,
      quantity: 1,
    });
    toast.success("Added to bag", { description: `${product.name} · ${firstSize}` });
  };

  if (variant === "editorial") {
    return (
      <article
        className="campaign-product-card animate-rise"
        style={{ animationDelay: `${index * 70}ms` }}
      >
        <div className="campaign-product-media">
          <Link
            to="/product/$handle"
            params={{ handle: product.id }}
            className="campaign-product-image-link"
            aria-label={`View ${product.name}`}
          >
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} loading="lazy" decoding="async" />
            ) : (
              <span className="campaign-product-placeholder" aria-hidden="true">
                GHOST
              </span>
            )}
          </Link>
          <span className="campaign-product-edition">G / {String(index + 1).padStart(2, "0")}</span>
          <span className={`campaign-product-availability ${soldOut ? "is-sold-out" : ""}`}>
            {soldOut
              ? "Sold out"
              : available.length < SIZES.length
                ? "Limited sizes"
                : "Available now"}
          </span>
        </div>
        <div className="campaign-product-content">
          <p className="campaign-product-category">
            <span>{product.category || "Collection 01"}</span>
            <span>GHOST / 2026</span>
          </p>
          <Link
            to="/product/$handle"
            params={{ handle: product.id }}
            className="campaign-product-name"
          >
            <h3>{product.name}</h3>
          </Link>
          {showDescription && product.description && (
            <p className="campaign-product-description">{product.description}</p>
          )}
          <div className="campaign-product-details">
            <span className="campaign-product-price">{formatPrice(product.price)}</span>
            <Link to="/product/$handle" params={{ handle: product.id }}>
              View piece <span aria-hidden="true">↗</span>
            </Link>
          </div>
          {!soldOut &&
            (canBuy ? (
              <button className="campaign-product-action" type="button" onClick={handleAddToCart}>
                <Plus size={15} aria-hidden="true" /> Add to bag
              </button>
            ) : (
              <MembersOnlyLink compact className="campaign-product-access" />
            ))}
        </div>
      </article>
    );
  }

  return (
    <div className="animate-rise" style={{ animationDelay: `${index * 90}ms` }}>
      <Tilt className="group">
        <div className="glass p-3">
          <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
            <Link
              to="/product/$handle"
              params={{ handle: product.id }}
              className="block h-full"
              aria-label={`View ${product.name}`}
            >
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  loading="lazy"
                  className={`w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110 ${soldOut ? "grayscale opacity-60" : ""}`}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-display text-6xl text-muted-foreground/20">
                  GHOST
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
              <div className="absolute top-3 left-3">
                <StockBadge available={available.length} total={SIZES.length} />
              </div>
            </Link>
            {!soldOut && canBuy && (
              <button
                onClick={handleAddToCart}
                className="absolute bottom-3 left-3 right-3 bg-gold-metal text-primary-foreground h-11 text-[11px] tracking-[0.3em] uppercase font-semibold md:opacity-0 md:translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 flex items-center justify-center gap-2 [transform:translateZ(40px)]"
              >
                <Plus className="h-3.5 w-3.5" />
                Add to Bag
              </button>
            )}
          </div>
          <Link to="/product/$handle" params={{ handle: product.id }} className="block">
            <div className="mt-4 px-1 pb-1 flex items-start justify-between gap-4">
              <h3 className="font-display text-2xl tracking-wider text-foreground drop-shadow-md leading-none">
                {product.name}
              </h3>
              <p className="font-body font-bold text-sm text-gold flex-shrink-0">
                {formatPrice(product.price)}
              </p>
            </div>
            {showDescription && product.description && (
              <p className="mt-2 px-1 text-xs font-medium text-foreground/80 leading-relaxed line-clamp-3">
                {product.description}
              </p>
            )}
          </Link>
          {!canBuy && <MembersOnlyLink className="mt-3 h-11" />}
        </div>
      </Tilt>
    </div>
  );
}
