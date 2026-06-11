import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { FavoriteCard } from "@/types";
import { knowledgeCards } from "@/data/knowledgeCards";
import { generateId, getAgeMonths } from "@/utils/date";

interface KnowledgeState {
  favorites: FavoriteCard[];

  toggleFavorite: (babyId: string, cardId: string) => void;
  isFavorite: (babyId: string, cardId: string) => boolean;
  getFavoriteCards: (babyId: string) => typeof knowledgeCards;
  getCardsForAge: (babyId: string, birthday: string) => typeof knowledgeCards;
  getFavorites: (babyId: string) => FavoriteCard[];
}

export const useKnowledgeStore = create<KnowledgeState>()(
  persist(
    (set, get) => ({
      favorites: [],

      toggleFavorite: (babyId, cardId) =>
        set((state) => {
          const exists = state.favorites.find((f) => f.babyId === babyId && f.cardId === cardId);
          if (exists) {
            return {
              favorites: state.favorites.filter((f) => !(f.babyId === babyId && f.cardId === cardId)),
            };
          }
          return {
            favorites: [...state.favorites, { id: generateId(), babyId, cardId, addedAt: Date.now() }],
          };
        }),

      isFavorite: (babyId, cardId) =>
        get().favorites.some((f) => f.babyId === babyId && f.cardId === cardId),

      getFavoriteCards: (babyId) => {
        const favIds = get()
          .favorites.filter((f) => f.babyId === babyId)
          .map((f) => f.cardId);
        return knowledgeCards.filter((c) => favIds.includes(c.id));
      },

      getCardsForAge: (_babyId, birthday) => {
        const age = getAgeMonths(birthday);
        return knowledgeCards.filter((c) => age >= c.minAgeMonths && age <= c.maxAgeMonths);
      },

      getFavorites: (babyId) => get().favorites.filter((f) => f.babyId === babyId),
    }),
    { name: "knowledge-store" }
  )
);
