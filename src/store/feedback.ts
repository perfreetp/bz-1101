import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { FamilyFeedback } from "@/types";
import { generateId, nowStr, todayStr } from "@/utils/date";

interface FeedbackState {
  feedbacks: FamilyFeedback[];
  addViewed: (babyId: string, visitorName: string, shareDate: string) => void;
  addNote: (babyId: string, visitorName: string, content: string, shareDate: string) => void;
  getBabyFeedbacks: (babyId: string) => FamilyFeedback[];
  getDateFeedbacks: (babyId: string, date: string) => FamilyFeedback[];
  deleteFeedback: (id: string) => void;
}

export const useFeedbackStore = create<FeedbackState>()(
  persist(
    (set, get) => ({
      feedbacks: [],

      addViewed: (babyId, visitorName, shareDate) =>
        set((state) => ({
          feedbacks: [
            {
              id: generateId(),
              babyId,
              visitorName,
              type: "viewed",
              content: "",
              shareDate,
              createdAt: nowStr(),
            },
            ...state.feedbacks,
          ],
        })),

      addNote: (babyId, visitorName, content, shareDate) =>
        set((state) => ({
          feedbacks: [
            {
              id: generateId(),
              babyId,
              visitorName,
              type: "note",
              content,
              shareDate,
              createdAt: nowStr(),
            },
            ...state.feedbacks,
          ],
        })),

      getBabyFeedbacks: (babyId) =>
        get()
          .feedbacks.filter((f) => f.babyId === babyId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),

      getDateFeedbacks: (babyId, date) =>
        get()
          .feedbacks.filter((f) => f.babyId === babyId && f.shareDate === date)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),

      deleteFeedback: (id) =>
        set((state) => ({
          feedbacks: state.feedbacks.filter((f) => f.id !== id),
        })),
    }),
    { name: "feedback-store" }
  )
);
