import type { Baby, FeedingRecord, DiaperRecord, SleepRecord, TodoItem, GrowthRecord, VaccineItem } from "@/types";

export interface SharePayload {
  baby: Baby;
  date: string;
  feedings: FeedingRecord[];
  diapers: DiaperRecord[];
  sleeps: SleepRecord[];
  totalSleepMin: number;
  todos: TodoItem[];
  latestGrowth: GrowthRecord | null;
  vaccines: VaccineItem[];
}

export function encodeShareData(payload: SharePayload): string {
  const json = JSON.stringify(payload);
  return btoa(unescape(encodeURIComponent(json)));
}

export function decodeShareData(encoded: string): SharePayload | null {
  try {
    const json = decodeURIComponent(escape(atob(encoded)));
    return JSON.parse(json) as SharePayload;
  } catch {
    return null;
  }
}
