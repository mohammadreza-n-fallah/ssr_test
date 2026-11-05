import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserVehicle } from "@/types";
import api from "@/lib/api";
import { toList } from "@/lib/utils";

interface GarageState {
  vehicles: UserVehicle[];
  activeVehicle: UserVehicle | null;
  fetchVehicles: () => Promise<void>;
  addVehicle: (data: Partial<UserVehicle>) => Promise<void>;
  removeVehicle: (id: number) => Promise<void>;
  setActiveVehicle: (vehicle: UserVehicle | null) => void;
  setPrimary: (id: number) => Promise<void>;
}

export const useGarageStore = create<GarageState>()(
  persist(
    (set, get) => ({
      vehicles: [],
      activeVehicle: null,

      fetchVehicles: async () => {
        try {
          const { data } = await api.get("/garage/");
          const list = toList<UserVehicle>(data);
          set({ vehicles: list });
          const primary = list.find((v) => v.is_primary);
          if (primary && !get().activeVehicle) {
            set({ activeVehicle: primary });
          }
        } catch {}
      },

      addVehicle: async (vehicleData) => {
        const { data } = await api.post("/garage/", vehicleData);
        set((state) => ({ vehicles: [...state.vehicles, data] }));
      },

      removeVehicle: async (id) => {
        await api.delete(`/garage/${id}/`);
        set((state) => ({
          vehicles: state.vehicles.filter((v) => v.id !== id),
          activeVehicle: state.activeVehicle?.id === id ? null : state.activeVehicle,
        }));
      },

      setActiveVehicle: (vehicle) => set({ activeVehicle: vehicle }),

      setPrimary: async (id) => {
        await api.post(`/garage/${id}/set-primary/`);
        set((state) => ({
          vehicles: state.vehicles.map((v) => ({ ...v, is_primary: v.id === id })),
        }));
      },
    }),
    {
      name: "garage-store",
      partialize: (state) => ({ activeVehicle: state.activeVehicle }),
    }
  )
);
