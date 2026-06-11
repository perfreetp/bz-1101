import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SupplyItem } from "@/types";
import { generateId } from "@/utils/date";

interface SupplyState {
  supplies: SupplyItem[];

  addSupply: (item: Omit<SupplyItem, "id">) => void;
  updateSupply: (id: string, data: Partial<Omit<SupplyItem, "id" | "babyId">>) => void;
  deleteSupply: (id: string) => void;
  adjustStock: (id: string, delta: number) => void;
  getBabySupplies: (babyId: string) => SupplyItem[];
  getLowStockItems: (babyId: string) => SupplyItem[];
  generateShoppingList: (babyId: string) => { name: string; needed: number; unit: string }[];
}

export const useSupplyStore = create<SupplyState>()(
  persist(
    (set, get) => ({
      supplies: [
        {
          id: "sample-s1",
          babyId: "default",
          name: "婴儿奶粉",
          category: "formula",
          currentStock: 2,
          warningLevel: 1,
          unit: "罐",
        },
        {
          id: "sample-s2",
          babyId: "default",
          name: "纸尿裤 M码",
          category: "diaper",
          currentStock: 35,
          warningLevel: 20,
          unit: "片",
        },
      ],

      addSupply: (item) =>
        set((state) => ({
          supplies: [...state.supplies, { ...item, id: generateId() }],
        })),

      updateSupply: (id, data) =>
        set((state) => ({
          supplies: state.supplies.map((s) => (s.id === id ? { ...s, ...data } : s)),
        })),

      deleteSupply: (id) =>
        set((state) => ({
          supplies: state.supplies.filter((s) => s.id !== id),
        })),

      adjustStock: (id, delta) =>
        set((state) => ({
          supplies: state.supplies.map((s) =>
            s.id === id ? { ...s, currentStock: Math.max(0, s.currentStock + delta) } : s
          ),
        })),

      getBabySupplies: (babyId) => get().supplies.filter((s) => s.babyId === babyId),

      getLowStockItems: (babyId) =>
        get().supplies.filter((s) => s.babyId === babyId && s.currentStock <= s.warningLevel),

      generateShoppingList: (babyId) =>
        get()
          .getLowStockItems(babyId)
          .map((s) => ({
            name: s.name,
            needed: s.warningLevel * 2 - s.currentStock,
            unit: s.unit,
          })),
    }),
    { name: "supply-store" }
  )
);
