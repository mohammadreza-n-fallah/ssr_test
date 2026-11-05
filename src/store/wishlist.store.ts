import { create } from "zustand";
import api from "@/lib/api";

interface WishlistState {
  ids: number[];
  fetchIds: () => Promise<void>;
  toggle: (productId: number) => Promise<boolean>;
  has: (productId: number) => boolean;
  reset: () => void;
}

// Lightweight client mirror of the user's wishlisted product IDs, used to mark
// the heart toggle across product cards/pages. The full wishlist (with price
// drops) is fetched separately on the wishlist page.
export const useWishlistStore = create<WishlistState>((set, get) => ({
  ids: [],

  fetchIds: async () => {
    try {
      const { data } = await api.get("/wishlist/ids/");
      set({ ids: data.product_ids ?? [] });
    } catch {
      set({ ids: [] });
    }
  },

  toggle: async (productId) => {
    const { data } = await api.post("/wishlist/toggle/", { product_id: productId });
    const inWishlist = !!data.in_wishlist;
    set((state) => ({
      ids: inWishlist
        ? [...state.ids.filter((id) => id !== productId), productId]
        : state.ids.filter((id) => id !== productId),
    }));
    return inWishlist;
  },

  has: (productId) => get().ids.includes(productId),

  reset: () => set({ ids: [] }),
}));
