/** StockBadge.tsx — the In Stock / Sold Out badge on product cards. */
export function StockBadge({ available, total }: { available: number; total: number }) {
  if (available === 0) {
    return (
      <span className="px-2.5 py-1 text-[10px] tracking-[0.3em] uppercase bg-crimson text-foreground font-semibold">
        Sold Out
      </span>
    );
  }
  const low = available < total;
  return (
    <span className="glass px-2.5 py-1 text-[10px] tracking-[0.3em] uppercase flex items-center gap-1.5">
      <span className={`h-1.5 w-1.5 rounded-full ${low ? "bg-gold" : "bg-chrome"} animate-pulse`} />
      {low ? "Limited sizes" : "In stock"}
    </span>
  );
}
