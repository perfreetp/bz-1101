import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ActiveTab } from "@/types";

interface UiState {
  darkMode: boolean;
  activeTab: ActiveTab;
  shareCode: string | null;

  toggleDarkMode: () => void;
  setDarkMode: (v: boolean) => void;
  setActiveTab: (tab: ActiveTab) => void;
  generateShareCode: () => string;
}

function generateRandomCode(): string {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      darkMode: false,
      activeTab: "today",
      shareCode: null,

      toggleDarkMode: () => {
        const next = !get().darkMode;
        if (next) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
        set({ darkMode: next });
      },

      setDarkMode: (v) => {
        if (v) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
        set({ darkMode: v });
      },

      setActiveTab: (tab) => set({ activeTab: tab }),

      generateShareCode: () => {
        const code = generateRandomCode();
        set({ shareCode: code });
        return code;
      },
    }),
    {
      name: "ui-store",
      onRehydrateStorage: () => (state) => {
        if (state?.darkMode) {
          document.documentElement.classList.add("dark");
        }
      },
    }
  )
);
