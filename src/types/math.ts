/**
 * Math Engine Type Definitions
 * Core types used throughout the adaptive difficulty and question generation system
 */

export type Operation = "addition" | "subtraction" | "multiplication";

export type GradeTag =
  | "grade1"
  | "grade2"
  | "grade3"
  | "grade4"
  | "grade5"
  | "grade6";

export enum DifficultyTier {
  VeryEasy = "veryEasy",
  Easy = "easy",
  Medium = "medium",
  Hard = "hard",
}

export type AnswerFormat = "freeform" | "multipleChoice";

export type AnswerMode = "multipleChoice" | "numberEntry";

/**
 * Represents a single math question with operands and answer options
 */
export interface MathQuestion {
  id: string;
  operation: Operation;
  gradeTag: GradeTag;
  operand1: number;
  operand2: number;
  correctAnswer: number;
  prompt: string;
  multipleChoiceOptions?: number[];
  difficulty: DifficultyTier;
}

/**
 * Represents a player's answer to a question with timing information
 */
export interface Answer {
  questionId: string;
  userAnswer: number;
  isCorrect: boolean;
  responseTimeSeconds: number;
  timestamp: number;
}

/**
 * Number range configuration for a given difficulty tier
 */
export interface NumberRange {
  min: number;
  max: number;
}

/**
 * Difficulty tier configuration with skill rating boundaries
 */
export interface DifficultyConfig {
  tier: DifficultyTier;
  minSkill: number;
  maxSkill: number;
  numberRange: NumberRange;
}

/**
 * Crystal Pop specific answer tracking during a session
 */
export interface CrystalPopAnswer {
  questionId: string;
  userAnswer: number;
  responseTimeMs: number;
  isCorrect: boolean;
  pointsEarned: number;
  comboAtTime: number;
  timestamp: number;
}

/**
 * Crystal Pop session configuration
 */
export interface SessionConfig {
  difficulty: DifficultyTier;
  durationSeconds: number;
}

/**
 * Crystal Pop session state during active gameplay
 */
export interface CrystalPopSessionState {
  sessionId: string;
  difficulty: DifficultyTier;
  durationSeconds: number;
  startTime: number;
  endTime: number | null;
  currentScore: number;
  currentCombo: number;
  maxComboReached: number;
  questionsAttempted: number;
  correctAnswers: number;
  accuracy: number;
  gemsEarned: number;
  answers: CrystalPopAnswer[];
  isExpired: boolean;
}
