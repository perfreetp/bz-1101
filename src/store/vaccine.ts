import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { VaccineItem } from "@/types";
import { generateId } from "@/utils/date";

interface VaccineState {
  vaccines: VaccineItem[];

  addVaccine: (item: Omit<VaccineItem, "id">) => void;
  completeVaccine: (id: string) => void;
  deleteVaccine: (id: string) => void;
  getBabyVaccines: (babyId: string) => VaccineItem[];
  getUpcoming: (babyId: string, daysAhead?: number) => VaccineItem[];
}

export const useVaccineStore = create<VaccineState>()(
  persist(
    (set, get) => ({
      vaccines: [
        {
          id: "sample-v1",
          babyId: "default",
          name: "乙肝疫苗第三针",
          plannedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          completedDate: null,
          type: "vaccine",
          note: "记得带疫苗本",
        },
      ],

      addVaccine: (item) =>
        set((state) => ({
          vaccines: [...state.vaccines, { ...item, id: generateId() }],
        })),

      completeVaccine: (id) =>
        set((state) => ({
          vaccines: state.vaccines.map((v) =>
            v.id === id ? { ...v, completedDate: new Date().toISOString().split("T")[0] } : v
          ),
        })),

      deleteVaccine: (id) =>
        set((state) => ({
          vaccines: state.vaccines.filter((v) => v.id !== id),
        })),

      getBabyVaccines: (babyId) =>
        get()
          .vaccines.filter((v) => v.babyId === babyId)
          .sort((a, b) => new Date(a.plannedDate).getTime() - new Date(b.plannedDate).getTime()),

      getUpcoming: (babyId, daysAhead = 14) => {
        const now = new Date();
        const future = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
        return get()
          .getBabyVaccines(babyId)
          .filter(
            (v) => !v.completedDate && new Date(v.plannedDate) <= future && new Date(v.plannedDate) >= now
          );
      },
    }),
    { name: "vaccine-store" }
  )
);
