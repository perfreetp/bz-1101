export interface Baby {
  id: string;
  name: string;
  gender: "boy" | "girl" | "unknown";
  birthday: string;
  avatar: string;
  createdAt: number;
}

export type FeedingType = "milk" | "solids";
export type DiaperType = "pee" | "poop" | "both";

export interface FeedingRecord {
  id: string;
  babyId: string;
  type: FeedingType;
  amount: number;
  unit: string;
  time: string;
  note: string;
}

export interface DiaperRecord {
  id: string;
  babyId: string;
  type: DiaperType;
  time: string;
  note: string;
}

export interface SleepRecord {
  id: string;
  babyId: string;
  startTime: string;
  endTime: string | null;
  duration: number;
  quality: "good" | "normal" | "poor";
  note: string;
}

export interface GrowthRecord {
  id: string;
  babyId: string;
  date: string;
  height: number;
  weight: number;
  note: string;
}

export interface TodoItem {
  id: string;
  babyId: string;
  title: string;
  completed: boolean;
  date: string;
  category: "vaccine" | "checkup" | "shopping" | "other";
}

export type VaccineType = "vaccine" | "checkup";

export interface VaccineItem {
  id: string;
  babyId: string;
  name: string;
  plannedDate: string;
  completedDate: string | null;
  type: VaccineType;
  note: string;
}

export type SupplyCategory = "formula" | "diaper" | "other";

export interface SupplyItem {
  id: string;
  babyId: string;
  name: string;
  category: SupplyCategory;
  currentStock: number;
  warningLevel: number;
  unit: string;
}

export interface FavoriteCard {
  id: string;
  babyId: string;
  cardId: string;
  addedAt: number;
}

export interface KnowledgeCard {
  id: string;
  title: string;
  content: string;
  minAgeMonths: number;
  maxAgeMonths: number;
  category: "feeding" | "sleep" | "health" | "development" | "safety";
  emoji: string;
}

export type ActiveTab =
  | "today"
  | "feeding"
  | "sleep"
  | "supply"
  | "knowledge"
  | "share"
  | "summary";

export interface UiState {
  darkMode: boolean;
  activeTab: ActiveTab;
  shareCode: string | null;
}
