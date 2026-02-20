/**
 * Player Store
 * Zustand store for persistent player data and stats
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PlayerStats } from "../types/player";
import { getDifficulty } from "../engine/difficultyEngine";
import type { DifficultyTier } from "../types/math";

interface PlayerStore extends PlayerStats {
  updateSkill: (delta: number) => void;
  addGems: (amount: number) => void;
  addStars: (amount: number) => void;
  unlock: (itemId: string) => void;
  recordAnswer: (correct: boolean) => void;
  getAdaptiveDifficulty: () => DifficultyTier;
  reset: () => void;
}

const INITIAL_STATE: PlayerStats = {
  skillRating: 1000,
  gems: 0,
  stars: 0,
  unlockedItems: [],
  totalQuestionsAnswered: 0,
  totalCorrectAnswers: 0,
  successRate: 0,
  lastGameTime: 0,
};

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      updateSkill: (delta: number) => {
        set((state) => ({
          skillRating: Math.max(0, state.skillRating + delta),
        }));
      },

      addGems: (amount: number) => {
        set((state) => ({
          gems: state.gems + amount,
        }));
      },

      addStars: (amount: number) => {
        set((state) => ({
          stars: state.stars + amount,
        }));
      },

      unlock: (itemId: string) => {
        set((state) => {
          if (!state.unlockedItems.includes(itemId)) {
            return {
              unlockedItems: [...state.unlockedItems, itemId],
            };
          }
          return state;
        });
      },

      recordAnswer: (correct: boolean) => {
        set((state) => {
          const newTotal = state.totalQuestionsAnswered + 1;
          const newCorrect = correct
            ? state.totalCorrectAnswers + 1
            : state.totalCorrectAnswers;
          return {
            totalQuestionsAnswered: newTotal,
            totalCorrectAnswers: newCorrect,
            successRate: Math.round((newCorrect / newTotal) * 100),
            lastGameTime: Date.now(),
          };
        });
      },

      getAdaptiveDifficulty: () => {
        const { skillRating } = get();
        return getDifficulty(skillRating);
      },

      reset: () => {
        set(INITIAL_STATE);
      },
    }),
    {
      name: "player-store", // localStorage key
      version: 1,
    }
  )
);
