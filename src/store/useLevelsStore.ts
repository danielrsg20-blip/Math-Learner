/**
 * Levels progression store
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { LEVEL_DEFINITIONS } from "../engine/levelConfig";
import type { LevelAttemptResult, LevelProgress } from "../types/levels";

interface LevelsStore {
  selectedLevelNumber: number | null;
  progressByLevel: Record<number, LevelProgress>;
  attempts: LevelAttemptResult[];
  selectLevel: (levelNumber: number) => void;
  isLevelUnlocked: (levelNumber: number) => boolean;
  getLevelProgress: (levelNumber: number) => LevelProgress;
  recordAttempt: (result: LevelAttemptResult) => void;
  resetLevels: () => void;
}

function createInitialProgress(): Record<number, LevelProgress> {
  return LEVEL_DEFINITIONS.reduce<Record<number, LevelProgress>>((acc, level) => {
    acc[level.levelNumber] = {
      levelId: level.id,
      levelNumber: level.levelNumber,
      status: level.levelNumber === 1 ? "unlocked" : "locked",
      attemptsCount: 0,
      bestScore: 0,
      bestAccuracy: 0,
      bestCompletionTimeMs: null,
      completedAt: null,
    };
    return acc;
  }, {});
}

function isBetterAttempt(candidate: LevelAttemptResult, current: LevelProgress): boolean {
  if (candidate.score > current.bestScore) {
    return true;
  }
  if (candidate.score < current.bestScore) {
    return false;
  }

  const currentTime = current.bestCompletionTimeMs;
  if (currentTime === null) {
    return true;
  }

  if (candidate.completionTimeMs < currentTime) {
    return true;
  }

  if (candidate.completionTimeMs > currentTime) {
    return false;
  }

  return candidate.accuracy > current.bestAccuracy;
}

const INITIAL_PROGRESS = createInitialProgress();

export const useLevelsStore = create<LevelsStore>()(
  persist(
    (set, get) => ({
      selectedLevelNumber: 1,
      progressByLevel: INITIAL_PROGRESS,
      attempts: [],

      selectLevel: (levelNumber: number) => {
        if (!get().isLevelUnlocked(levelNumber)) {
          return;
        }
        set({ selectedLevelNumber: levelNumber });
      },

      isLevelUnlocked: (levelNumber: number) => {
        const progress = get().progressByLevel[levelNumber];
        return progress?.status !== "locked";
      },

      getLevelProgress: (levelNumber: number) => {
        const progress = get().progressByLevel[levelNumber];
        if (!progress) {
          throw new Error(`Missing progress for level ${levelNumber}`);
        }
        return progress;
      },

      recordAttempt: (result: LevelAttemptResult) => {
        set((state) => {
          const current = state.progressByLevel[result.levelNumber];
          if (!current) {
            return state;
          }

          const next = { ...current };
          next.attemptsCount += 1;

          if (result.passed) {
            next.status = "completed";
            next.completedAt = result.endedAt;

            if (isBetterAttempt(result, current)) {
              next.bestScore = result.score;
              next.bestAccuracy = result.accuracy;
              next.bestCompletionTimeMs = result.completionTimeMs;
            }
          }

          const updatedProgress = {
            ...state.progressByLevel,
            [result.levelNumber]: next,
          };

          if (result.passed) {
            const nextLevel = result.levelNumber + 1;
            const nextLevelProgress = updatedProgress[nextLevel];
            if (nextLevelProgress && nextLevelProgress.status === "locked") {
              updatedProgress[nextLevel] = {
                ...nextLevelProgress,
                status: "unlocked",
              };
            }
          }

          return {
            progressByLevel: updatedProgress,
            attempts: [...state.attempts, result],
          };
        });
      },

      resetLevels: () => {
        set({
          selectedLevelNumber: 1,
          progressByLevel: createInitialProgress(),
          attempts: [],
        });
      },
    }),
    {
      name: "levels-store",
      version: 1,
    }
  )
);
