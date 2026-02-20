/**
 * Levels feature type definitions
 */

import type { GradeTag, MathQuestion, Operation } from "./math";

export interface LevelDefinition {
  id: string;
  levelNumber: number;
  title: string;
  gradeTags: GradeTag[];
  allowedOperations: Operation[];
  requiredCorrectAnswers: number;
  timeLimitSeconds: number;
}

export type LevelStatus = "locked" | "unlocked" | "completed";

export interface LevelProgress {
  levelId: string;
  levelNumber: number;
  status: LevelStatus;
  attemptsCount: number;
  bestScore: number;
  bestAccuracy: number;
  bestCompletionTimeMs: number | null;
  completedAt: number | null;
}

export interface LevelAttemptResult {
  levelId: string;
  levelNumber: number;
  score: number;
  accuracy: number;
  completionTimeMs: number;
  correctAnswers: number;
  totalAnswered: number;
  passed: boolean;
  timedOut: boolean;
  endedAt: number;
}

export interface LevelAnswerRecord {
  questionId: string;
  questionKey: string;
  question: MathQuestion;
  userAnswer: number;
  isCorrect: boolean;
  responseTimeMs: number;
  timestamp: number;
}

export interface LevelSessionStats {
  score: number;
  accuracy: number;
  correctAnswers: number;
  totalAnswered: number;
  remainingMs: number;
}
