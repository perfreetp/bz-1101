import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Baby } from "@/types";
import { generateId } from "@/utils/date";

const defaultBaby: Baby = {
  id: "default",
  name: "小宝贝",
  gender: "unknown",
  birthday: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  avatar: "👶",
  createdAt: Date.now(),
};

interface BabyState {
  babies: Baby[];
  currentBabyId: string;
  addBaby: (baby: Omit<Baby, "id" | "createdAt">) => void;
  updateBaby: (id: string, data: Partial<Omit<Baby, "id" | "createdAt">>) => void;
  deleteBaby: (id: string) => void;
  setCurrentBaby: (id: string) => void;
  getCurrentBaby: () => Baby | undefined;
}

export const useBabyStore = create<BabyState>()(
  persist(
    (set, get) => ({
      babies: [defaultBaby],
      currentBabyId: "default",

      addBaby: (baby) =>
        set((state) => {
          const newBaby: Baby = { ...baby, id: generateId(), createdAt: Date.now() };
          return {
            babies: [...state.babies, newBaby],
            currentBabyId: newBaby.id,
          };
        }),

      updateBaby: (id, data) =>
        set((state) => ({
          babies: state.babies.map((b) => (b.id === id ? { ...b, ...data } : b)),
        })),

      deleteBaby: (id) =>
        set((state) => {
          const babies = state.babies.filter((b) => b.id !== id);
          const currentBabyId = babies.length > 0 ? babies[0].id : "";
          return { babies, currentBabyId };
        }),

      setCurrentBaby: (id) => set({ currentBabyId: id }),

      getCurrentBaby: () => {
        const state = get();
        return state.babies.find((b) => b.id === state.currentBabyId);
      },
    }),
    { name: "baby-store" }
  )
);
