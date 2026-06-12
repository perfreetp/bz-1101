import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { VaccineItem } from "@/types";
import { generateId } from "@/utils/date";

interface VaccineState {
  vaccines: VaccineItem[];

  addVaccine: (item: Omit<VaccineItem, "id">) => void;
  updateVaccine: (id: string, data: Partial<Omit<VaccineItem, "id" | "babyId">>) => void;
  completeVaccine: (id: string) => void;
  uncompleteVaccine: (id: string) => void;
  deleteVaccine: (id: string) => void;
  getBabyVaccines: (babyId: string) => VaccineItem[];
  getUpcoming: (babyId: string, daysAhead?: number) => VaccineItem[];
  getPending: (babyId: string) => VaccineItem[];
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

      updateVaccine: (id, data) =>
        set((state) => ({
          vaccines: state.vaccines.map((v) => (v.id === id ? { ...v, ...data } : v)),
        })),

      completeVaccine: (id) =>
        set((state) => ({
          vaccines: state.vaccines.map((v) =>
            v.id === id ? { ...v, completedDate: new Date().toISOString().split("T")[0] } : v
          ),
        })),

      uncompleteVaccine: (id) =>
        set((state) => ({
          vaccines: state.vaccines.map((v) => (v.id === id ? { ...v, completedDate: null } : v)),
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
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const future = new Date(todayStart.getTime() + daysAhead * 24 * 60 * 60 * 1000);
        return get()
          .getBabyVaccines(babyId)
          .filter(
            (v) => !v.completedDate && new Date(v.plannedDate) <= future
          );
      },

      getPending: (babyId) =>
        get()
          .getBabyVaccines(babyId)
          .filter((v) => !v.completedDate),
    }),
    { name: "vaccine-store" }
  )
);
