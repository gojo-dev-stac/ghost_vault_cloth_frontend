/**
 * useCart.ts — the shopping bag store (Zustand): bag items, add/remove,
 * quantity and totals. Persisted to localStorage so the bag survives reloads.
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Size } from "@/lib/products";

export type CartItem = {
  key: string;
  productId: string;
  name: string;
  imageUrl: string | null;
  price: number;
  size: Size;
  quantity: number;
};

interface CartStore {
  items: CartItem[];
  isLoading: boolean;
  addItem: (item: Omit<CartItem, "key">) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      addItem: (item) => {
        const key = `${item.productId}:${item.size}`;
        const existing = get().items.find((i) => i.key === key);
        set({
          items: existing
            ? get().items.map((i) => (i.key === key ? { ...i, quantity: i.quantity + item.quantity } : i))
            : [...get().items, { ...item, key }],
        });
      },
      updateQuantity: (key, quantity) => {
        if (quantity <= 0) return get().removeItem(key);
        set({ items: get().items.map((i) => (i.key === key ? { ...i, quantity } : i)) });
      },
      removeItem: (key) => set({ items: get().items.filter((i) => i.key !== key) }),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "ghost-bag",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} },
      ),
      partialize: (s) => ({ items: s.items }),
    },
  ),
);

/** Convenience alias matching the hook naming convention. */
export const useCart = useCartStore;
