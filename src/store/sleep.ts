import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SleepRecord } from "@/types";
import { generateId, nowStr, isToday, calculateDuration, isOverlappingDate, todayStr } from "@/utils/date";

interface SleepState {
  sleepRecords: SleepRecord[];
  activeSleepId: string | null;

  startSleep: (babyId: string) => void;
  endSleep: (id: string, quality?: SleepRecord["quality"], note?: string) => void;
  addSleep: (record: Omit<SleepRecord, "id" | "duration">) => void;
  deleteSleep: (id: string) => void;
  getBabySleeps: (babyId: string) => SleepRecord[];
  getTodaySleeps: (babyId: string) => SleepRecord[];
  getTodayTotalMinutes: (babyId: string) => number;
}

export const useSleepStore = create<SleepState>()(
  persist(
    (set, get) => ({
      sleepRecords: [],
      activeSleepId: null,

      startSleep: (babyId) => {
        const newRecord: SleepRecord = {
          id: generateId(),
          babyId,
          startTime: nowStr(),
          endTime: null,
          duration: 0,
          quality: "normal",
          note: "",
        };
        set((state) => ({
          sleepRecords: [newRecord, ...state.sleepRecords],
          activeSleepId: newRecord.id,
        }));
      },

      endSleep: (id, quality = "normal", note = "") => {
        set((state) => {
          const records = state.sleepRecords.map((r) => {
            if (r.id === id) {
              const endTime = nowStr();
              return {
                ...r,
                endTime,
                duration: calculateDuration(r.startTime, endTime),
                quality,
                note,
              };
            }
            return r;
          });
          return { sleepRecords: records, activeSleepId: null };
        });
      },

      addSleep: (record) => {
        const duration = record.endTime ? calculateDuration(record.startTime, record.endTime) : 0;
        set((state) => ({
          sleepRecords: [{ ...record, id: generateId(), duration }, ...state.sleepRecords],
        }));
      },

      deleteSleep: (id) =>
        set((state) => ({
          sleepRecords: state.sleepRecords.filter((r) => r.id !== id),
        })),

      getBabySleeps: (babyId) => get().sleepRecords.filter((r) => r.babyId === babyId),

      getTodaySleeps: (babyId) =>
        get()
          .sleepRecords.filter(
            (r) => r.babyId === babyId && isOverlappingDate(r.startTime, r.endTime, todayStr())
          )
          .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()),

      getTodayTotalMinutes: (babyId) =>
        get()
          .getTodaySleeps(babyId)
          .reduce((sum, r) => sum + r.duration, 0),
    }),
    { name: "sleep-store" }
  )
);
