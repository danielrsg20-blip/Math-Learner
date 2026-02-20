/**
 * Levels progression store
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { LEVEL_DEFINITIONS } from "../engine/levelConfig";
import type { LevelAttemptResult, LevelProgress } from "../types/levels";
import type { AnswerMode } from "../types/math";

const ANSWER_MODES: AnswerMode[] = ["multipleChoice", "numberEntry"];

interface LevelsStore {
  selectedLevelNumber: number | null;
  progressByLevel: Record<number, LevelProgress>;
  attempts: LevelAttemptResult[];
  selectLevel: (levelNumber: number) => void;
  isLevelUnlocked: (levelNumber: number) => boolean;
  getLevelProgress: (levelNumber: number) => LevelProgress;
  recordAttempt: (result: LevelAttemptResult) => void;
  recordPracticeCompletion: (levelNumber: number, completedAt: number) => void;
  resetLevels: () => void;
}

function createInitialProgress(): Record<number, LevelProgress> {
  return LEVEL_DEFINITIONS.reduce<Record<number, LevelProgress>>((acc, level) => {
    const emptyByMode = ANSWER_MODES.reduce<LevelProgress["bestByMode"]>((modeAcc, mode) => {
      modeAcc[mode] = {
        bestScore: 0,
        bestAccuracy: 0,
        bestCompletionTimeMs: null,
      };
      return modeAcc;
    }, {
      multipleChoice: {
        bestScore: 0,
        bestAccuracy: 0,
        bestCompletionTimeMs: null,
      },
      numberEntry: {
        bestScore: 0,
        bestAccuracy: 0,
        bestCompletionTimeMs: null,
      },
    });

    acc[level.levelNumber] = {
      levelId: level.id,
      levelNumber: level.levelNumber,
      status: level.levelNumber === 1 ? "unlocked" : "locked",
      attemptsCount: 0,
      bestScore: 0,
      bestAccuracy: 0,
      bestCompletionTimeMs: null,
      bestByMode: emptyByMode,
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

function isBetterModeAttempt(
  candidate: LevelAttemptResult,
  current: LevelProgress,
  mode: AnswerMode
): boolean {
  const currentByMode = current.bestByMode[mode];

  if (candidate.score > currentByMode.bestScore) {
    return true;
  }
  if (candidate.score < currentByMode.bestScore) {
    return false;
  }

  const currentTime = currentByMode.bestCompletionTimeMs;
  if (currentTime === null) {
    return true;
  }

  if (candidate.completionTimeMs < currentTime) {
    return true;
  }

  if (candidate.completionTimeMs > currentTime) {
    return false;
  }

  return candidate.accuracy > currentByMode.bestAccuracy;
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

            if (isBetterModeAttempt(result, current, result.answerMode)) {
              next.bestByMode = {
                ...next.bestByMode,
                [result.answerMode]: {
                  bestScore: result.score,
                  bestAccuracy: result.accuracy,
                  bestCompletionTimeMs: result.completionTimeMs,
                },
              };
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

      recordPracticeCompletion: (levelNumber: number, completedAt: number) => {
        set((state) => {
          const current = state.progressByLevel[levelNumber];
          if (!current) {
            return state;
          }

          const updatedCurrent: LevelProgress = {
            ...current,
            status: "completed",
            attemptsCount: current.attemptsCount + 1,
            completedAt,
          };

          const updatedProgress = {
            ...state.progressByLevel,
            [levelNumber]: updatedCurrent,
          };

          const nextLevel = levelNumber + 1;
          const nextLevelProgress = updatedProgress[nextLevel];
          if (nextLevelProgress && nextLevelProgress.status === "locked") {
            updatedProgress[nextLevel] = {
              ...nextLevelProgress,
              status: "unlocked",
            };
          }

          return {
            progressByLevel: updatedProgress,
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
      version: 2,
      migrate: (persistedState: unknown) => {
        const state = persistedState as Partial<LevelsStore> | undefined;
        if (!state) {
          return {
            selectedLevelNumber: 1,
            progressByLevel: createInitialProgress(),
            attempts: [],
          };
        }

        const nextProgress = createInitialProgress();

        if (state.progressByLevel) {
          for (const [levelNumberString, progress] of Object.entries(
            state.progressByLevel
          )) {
            const levelNumber = Number(levelNumberString);
            if (!nextProgress[levelNumber] || !progress) {
              continue;
            }

            const safeProgress = progress as LevelProgress;
            nextProgress[levelNumber] = {
              ...nextProgress[levelNumber],
              ...safeProgress,
              bestByMode: {
                multipleChoice: {
                  bestScore:
                    safeProgress.bestByMode?.multipleChoice?.bestScore ??
                    safeProgress.bestScore ??
                    0,
                  bestAccuracy:
                    safeProgress.bestByMode?.multipleChoice?.bestAccuracy ??
                    safeProgress.bestAccuracy ??
                    0,
                  bestCompletionTimeMs:
                    safeProgress.bestByMode?.multipleChoice?.bestCompletionTimeMs ??
                    safeProgress.bestCompletionTimeMs ??
                    null,
                },
                numberEntry: {
                  bestScore:
                    safeProgress.bestByMode?.numberEntry?.bestScore ?? 0,
                  bestAccuracy:
                    safeProgress.bestByMode?.numberEntry?.bestAccuracy ?? 0,
                  bestCompletionTimeMs:
                    safeProgress.bestByMode?.numberEntry?.bestCompletionTimeMs ??
                    null,
                },
              },
            };
          }
        }

        const attempts = (state.attempts ?? []).map((attempt) => ({
          ...attempt,
          answerMode:
            attempt.answerMode === "numberEntry"
              ? "numberEntry"
              : "multipleChoice",
        }));

        return {
          selectedLevelNumber: state.selectedLevelNumber ?? 1,
          progressByLevel: nextProgress,
          attempts,
        };
      },
    }
  )
);
