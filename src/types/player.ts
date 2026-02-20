/**
 * Player and Game State Type Definitions
 */

import type { DifficultyTier } from "./math";
import type { AnswerMode } from "./math";

/**
 * Persistent player statistics
 */
export interface PlayerStats {
  skillRating: number;
  gems: number;
  stars: number;
  answerMode: AnswerMode;
  unlockedItems: string[];
  totalQuestionsAnswered: number;
  totalCorrectAnswers: number;
  successRate: number;
  lastGameTime: number;
}

/**
 * Active game session state - resets on page reload
 */
export interface GameSessionState {
  currentQuestionId: string | null;
  score: number;
  comboMultiplier: number;
  questionsAnsweredThisSession: number;
  correctAnswersThisSession: number;
  accuracy: number;
  sessionStartTime: number;
  sessionDuration: number;
}

/**
 * Mini-game specific session data
 */
export interface MiniGameSession extends GameSessionState {
  miniGameName: string;
  timerSeconds?: number;
  gemsEarned: number;
}

/**
 * Crystal Pop session result after game ends
 */
export interface CrystalPopSessionResult {
  sessionId: string;
  difficulty: DifficultyTier;
  finalScore: number;
  questionsAnswered: number;
  correctAnswers: number;
  accuracy: number; // percentage 0-100
  gemsEarned: number;
  maxCombo: number;
  duration: number; // milliseconds
}
