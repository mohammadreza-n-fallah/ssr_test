import { create } from "zustand";
import type { Cart } from "@/types";
import api from "@/lib/api";

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addToCart: (variantId: number, quantity?: number) => Promise<void>;
  updateItem: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const useCartStore = create<CartState>((set) => ({
  cart: null,
  isLoading: false,

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get("/cart/");
      set({ cart: data });
    } catch {
      set({ cart: null });
    } finally {
      set({ isLoading: false });
    }
  },

  addToCart: async (variantId, quantity = 1) => {
    const { data } = await api.post("/cart/add/", { variant_id: variantId, quantity });
    set({ cart: data });
  },

  updateItem: async (itemId, quantity) => {
    const { data } = await api.patch(`/cart/items/${itemId}/`, { quantity });
    set({ cart: data });
  },

  removeItem: async (itemId) => {
    const { data } = await api.delete(`/cart/items/${itemId}/remove/`);
    set({ cart: data });
  },

  clearCart: async () => {
    await api.delete("/cart/clear/");
    set({ cart: null });
  },
}));
