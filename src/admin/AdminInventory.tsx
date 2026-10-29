/** AdminInventory.tsx — Inventory & Products tab: add/edit products and per-size stock. */
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { formatPrice, saveProduct, SIZES, type Product, type ProductInput} from "@/lib/products";

const empty: ProductInput = { name: "", description: "", price: 0, image_url: "", sizes: { S: 0, M: 0, L: 0, XL: 0 }, category: "Hoodies" };
const field = "w-full h-11 bg-background/60 border border-border px-3 text-sm focus:outline-none focus:border-gold";

export function AdminInventory({ products }: { products: Product[] }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<{ id?: string; form: ProductInput } | null>(null);

  const m = useMutation({
    mutationFn: (v: { id?: string; form: ProductInput }) => saveProduct({ ...v.form, image_url: v.form.image_url || null }, v.id),
    onSuccess: (_, v) => {
      toast.success(v.id ? "Product updated" : "Product created");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["admin-products"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save product"),
  });

  if (editing) {
    const f = editing.form;
    const set = (patch: Partial<ProductInput>) => setEditing({ ...editing, form: { ...f, ...patch } });
    return (
      <form
        className="p-6 md:p-8 space-y-4 animate-rise"
        onSubmit={(e) => { e.preventDefault(); if (!f.name.trim()) { toast.error("Name is required"); return; } m.mutate(editing); }}
      >
        <div className="flex justify-between items-center">
          <h3 className="font-display text-3xl tracking-wider text-chrome">{editing.id ? "Edit product" : "New product"}</h3>
          <button type="button" onClick={() => setEditing(null)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
        </div>
        <input className={field} placeholder="Name" value={f.name} maxLength={120} onChange={(e) => set({ name: e.target.value })} />
        <textarea className={`${field} h-28 py-2`} placeholder="Description" value={f.description} maxLength={2000} onChange={(e) => set({ description: e.target.value })} />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input className={field} type="number" min={0} step="0.01" placeholder="Price" value={f.price} onChange={(e) => set({ price: Number(e.target.value) })} />
          <input className={field} placeholder="Category" value={f.category} onChange={(e) => set({ category: e.target.value })} />
          <input className={field} placeholder="Image URL" value={f.image_url ?? ""} onChange={(e) => set({ image_url: e.target.value })} />
        </div>
        <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">Stock per size</p>
        <div className="grid grid-cols-4 gap-3">
          {SIZES.map((s) => (
            <label key={s} className="text-xs">
              <span className="block mb-1 text-muted-foreground">{s}</span>
              <input className={field} type="number" min={0} value={f.sizes[s]} onChange={(e) => set({ sizes: { ...f.sizes, [s]: Math.max(0, Number(e.target.value)) } })} />
            </label>
          ))}
        </div>
        <button disabled={m.isPending} className="h-12 px-8 bg-gold-metal text-primary-foreground text-[11px] tracking-[0.3em] uppercase font-semibold flex items-center gap-2">
          {m.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
        </button>
      </form>
    );
  }

  return (
    <div className="p-5 md:p-6">
      <button onClick={() => setEditing({ form: empty })} className="h-10 px-5 mb-6 flex items-center gap-2 bg-gold-metal text-primary-foreground text-[11px] tracking-[0.3em] uppercase font-semibold">
        <Plus className="h-3.5 w-3.5" /> Add product
      </button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {products.map((p) => (
          <div key={p.id} className="flex gap-4 border border-border p-4">
            <div className="w-20 h-24 bg-secondary overflow-hidden flex-shrink-0">
              {p.image_url && <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display text-xl tracking-wider truncate">{p.name}</p>
              <p className="text-sm text-gold">{formatPrice(p.price)}</p>
              <div className="mt-2 flex gap-2 text-[11px]">
                {SIZES.map((s) => (
                  <span key={s} className={`px-2 py-0.5 border ${p.sizes[s] === 0 ? "border-crimson text-crimson" : "border-border"}`}>{s}: {p.sizes[s]}</span>
                ))}
              </div>
            </div>
            <button onClick={() => setEditing({ id: p.id, form: { name: p.name, description: p.description, price: p.price, image_url: p.image_url, sizes: p.sizes, category: p.category } })} className="self-start text-muted-foreground hover:text-gold">
              <Pencil className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
