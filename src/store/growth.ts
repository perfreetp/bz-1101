import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GrowthRecord } from "@/types";
import { generateId, todayStr } from "@/utils/date";

interface GrowthState {
  growthRecords: GrowthRecord[];

  addGrowth: (record: Omit<GrowthRecord, "id">) => void;
  deleteGrowth: (id: string) => void;
  getBabyGrowth: (babyId: string) => GrowthRecord[];
  getLatestGrowth: (babyId: string) => GrowthRecord | null;
}

export const useGrowthStore = create<GrowthState>()(
  persist(
    (set, get) => ({
      growthRecords: [],

      addGrowth: (record) =>
        set((state) => ({
          growthRecords: [
            { ...record, id: generateId(), date: record.date || todayStr() },
            ...state.growthRecords,
          ],
        })),

      deleteGrowth: (id) =>
        set((state) => ({
          growthRecords: state.growthRecords.filter((r) => r.id !== id),
        })),

      getBabyGrowth: (babyId) =>
        get()
          .growthRecords.filter((r) => r.babyId === babyId)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),

      getLatestGrowth: (babyId) => {
        const records = get().getBabyGrowth(babyId);
        return records.length > 0 ? records[records.length - 1] : null;
      },
    }),
    { name: "growth-store" }
  )
);
