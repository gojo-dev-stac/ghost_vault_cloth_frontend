/** ProductDetailPage.tsx — a single product: per-size live stock, Add to Bag / Buy Now, reviews. */
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { productQueryOptions } from "@/hooks/useProducts";
import { ArrowLeft, Loader2, Minus, Plus, Zap } from "lucide-react";
import { toast } from "sonner";
import { Footer } from "@/components/Footer";
import { Tilt } from "@/components/Tilt";
import { MembersOnlyLink } from "@/components/MembersOnlyLink";
import { useCanBuy } from "@/hooks/useCanBuy";
import { ReviewSection } from "@/components/ReviewSection";
import { fetchProduct, formatPrice, SIZES, type Product, type Size} from "@/lib/products";
import { placeOrder} from "@/lib/orders";
import { useAuth } from "@/hooks/useAuth";
import { useCartStore } from "@/hooks/useCart";

export function ProductDetailPage({ handle }: { handle: string }) {
  const { data: product, isLoading } = useQuery(productQueryOptions(handle));

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-gold" /></div>;
  }
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <p className="font-display text-5xl text-muted-foreground/40">Piece not found</p>
          <Link to="/vault" className="mt-6 inline-block text-xs tracking-[0.3em] uppercase text-gold">← Back to the Vault</Link>
        </div>
      </div>
    );
  }
  return <ProductView p={product} />;
}

function ProductView({ p }: { p: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const qc = useQueryClient();
  const { data: member } = useAuth();
  const canBuy = useCanBuy();
  const navigate = useNavigate();
  const firstAvailable = SIZES.find((s) => p.sizes[s] > 0) ?? "M";
  const [size, setSize] = useState<Size>(firstAvailable);
  const [qty, setQty] = useState(1);
  const [buying, setBuying] = useState(false);
  useEffect(() => setSize(firstAvailable), [firstAvailable]);

  const stock = p.sizes[size];
  const inStock = stock > 0;
  const allSoldOut = SIZES.every((s) => p.sizes[s] === 0);
  useEffect(() => setQty((q) => Math.max(1, Math.min(q, stock || 1))), [stock]);

  const guard = () => {
    if (canBuy) return true;
    if (member) navigate({ to: "/me" });
    else navigate({ to: "/auth", search: { mode: "signup" } });
    return false;
  };

  const add = () => {
    if (!inStock || !guard()) return;
    addItem({ productId: p.id, name: p.name, imageUrl: p.image_url, price: p.price, size, quantity: qty });
    toast.success("Added to bag", { description: `${p.name} · ${size} × ${qty}` });
  };

  const buyNow = async () => {
    if (!inStock || !guard()) return;
    setBuying(true);
    try {
      const id = await placeOrder([{ product_id: p.id, size, quantity: qty }], "COD", { email: member?.email ?? "", name: member?.display_name ?? "" });
      toast.success(`Order ${id} placed`, { description: "Cash on delivery · track it in My Vault" });
      qc.invalidateQueries();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not place order");
    } finally {
      setBuying(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="relative max-w-7xl mx-auto px-5 md:px-10 pt-28 pb-20">
        <div className="fog-layer opacity-60" />
        <Link to={canBuy ? "/vault" : "/collection"} className="relative inline-flex items-center gap-2 text-[11px] tracking-[0.3em] uppercase text-muted-foreground hover:text-gold mb-10">
          <ArrowLeft className="h-3.5 w-3.5" /> {canBuy ? "The Vault" : "The Drop"}
        </Link>

        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
          <Tilt max={6}>
            <div className="glass p-3 animate-rise">
              <div className="aspect-[3/4] overflow-hidden bg-secondary">
                {p.image_url && <img src={p.image_url} alt={p.name} className={`w-full h-full object-cover ${allSoldOut ? "grayscale" : ""}`} />}
              </div>
            </div>
          </Tilt>

          <div className="md:pt-8 animate-rise" style={{ animationDelay: "150ms" }}>
            <p className="text-[11px] tracking-[0.5em] uppercase text-crimson mb-4">{p.category} · Members Only</p>
            <h1 className="font-display text-6xl md:text-7xl tracking-wide text-gold-metal leading-none">{p.name}</h1>
            <p className="mt-6 text-3xl font-semibold text-chrome">{formatPrice(p.price)}</p>

            <div className="mt-6 flex items-center gap-2 text-[11px] tracking-[0.3em] uppercase">
              <span className={`h-2 w-2 rounded-full animate-pulse ${inStock ? "bg-gold" : "bg-crimson"}`} />
              <span className={inStock ? "text-gold" : "text-crimson"}>{inStock ? `Size ${size} · ${stock} left` : "Sold Out"}</span>
            </div>

            {p.description && <p className="mt-8 text-sm leading-relaxed text-muted-foreground max-w-md">{p.description}</p>}

            <div className="mt-10">
              <p className="text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-3">Size</p>
              <div className="grid grid-cols-4 gap-2 max-w-sm">
                {SIZES.map((s) => {
                  const ok = p.sizes[s] > 0;
                  const sel = s === size;
                  return (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={`relative h-12 text-sm border transition-all ${sel ? "border-gold text-gold shadow-gold" : "border-border hover:border-gold/50"} ${ok ? "" : "text-muted-foreground/50 line-through"}`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6">
              <p className="text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-3">Quantity</p>
              <div className="flex items-center gap-2">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="h-10 w-10 border border-border flex items-center justify-center hover:border-gold"><Minus className="h-3.5 w-3.5" /></button>
                <span className="w-10 text-center">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(stock || 1, q + 1))} className="h-10 w-10 border border-border flex items-center justify-center hover:border-gold"><Plus className="h-3.5 w-3.5" /></button>
              </div>
            </div>

            {!canBuy && <MembersOnlyLink className="mt-10 h-14 max-w-sm" />}
            {canBuy && <div className="mt-10 grid grid-cols-2 gap-3 max-w-sm">
              <button
                onClick={add}
                disabled={!inStock}
                className={`h-14 text-[11px] font-semibold tracking-[0.3em] uppercase flex items-center justify-center transition ${inStock ? "border border-gold text-gold hover:bg-gold/10" : "bg-secondary text-muted-foreground cursor-not-allowed"}`}
              >
                {inStock ? <><Plus className="h-3.5 w-3.5 mr-2" />Add to Bag</> : "SOLD OUT"}
              </button>
              <button
                onClick={buyNow}
                disabled={!inStock || buying}
                className={`h-14 text-[11px] font-semibold tracking-[0.3em] uppercase flex items-center justify-center transition ${inStock ? "bg-gold-metal text-primary-foreground shadow-gold hover:brightness-110" : "bg-secondary text-muted-foreground cursor-not-allowed"}`}
              >
                {buying ? <Loader2 className="h-4 w-4 animate-spin" /> : inStock ? <><Zap className="h-3.5 w-3.5 mr-2" />Buy Now</> : "SOLD OUT"}
              </button>
            </div>}
            {canBuy && inStock && <p className="mt-3 text-xs text-muted-foreground">Buy Now places a cash-on-delivery order instantly.</p>}
          </div>
        </div>
        <ReviewSection productId={p.id} />
      </div>
      <Footer />
    </div>
  );
}
