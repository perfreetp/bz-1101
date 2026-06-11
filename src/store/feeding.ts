import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { FeedingRecord, DiaperRecord } from "@/types";
import { generateId, nowStr, isToday } from "@/utils/date";

interface FeedingState {
  feedingRecords: FeedingRecord[];
  diaperRecords: DiaperRecord[];

  addFeeding: (record: Omit<FeedingRecord, "id">) => void;
  deleteFeeding: (id: string) => void;
  getBabyFeedings: (babyId: string) => FeedingRecord[];
  getTodayFeedings: (babyId: string) => FeedingRecord[];

  addDiaper: (record: Omit<DiaperRecord, "id">) => void;
  deleteDiaper: (id: string) => void;
  getBabyDiapers: (babyId: string) => DiaperRecord[];
  getTodayDiapers: (babyId: string) => DiaperRecord[];
}

export const useFeedingStore = create<FeedingState>()(
  persist(
    (set, get) => ({
      feedingRecords: [
        {
          id: "sample-f1",
          babyId: "default",
          type: "milk",
          amount: 120,
          unit: "ml",
          time: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          note: "吃得很香",
        },
      ],
      diaperRecords: [
        {
          id: "sample-d1",
          babyId: "default",
          type: "pee",
          time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          note: "",
        },
      ],

      addFeeding: (record) =>
        set((state) => ({
          feedingRecords: [{ ...record, id: generateId(), time: record.time || nowStr() }, ...state.feedingRecords],
        })),

      deleteFeeding: (id) =>
        set((state) => ({
          feedingRecords: state.feedingRecords.filter((r) => r.id !== id),
        })),

      getBabyFeedings: (babyId) => get().feedingRecords.filter((r) => r.babyId === babyId),

      getTodayFeedings: (babyId) =>
        get()
          .feedingRecords.filter((r) => r.babyId === babyId && isToday(r.time))
          .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()),

      addDiaper: (record) =>
        set((state) => ({
          diaperRecords: [{ ...record, id: generateId(), time: record.time || nowStr() }, ...state.diaperRecords],
        })),

      deleteDiaper: (id) =>
        set((state) => ({
          diaperRecords: state.diaperRecords.filter((r) => r.id !== id),
        })),

      getBabyDiapers: (babyId) => get().diaperRecords.filter((r) => r.babyId === babyId),

      getTodayDiapers: (babyId) =>
        get()
          .diaperRecords.filter((r) => r.babyId === babyId && isToday(r.time))
          .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()),
    }),
    { name: "feeding-store" }
  )
);
