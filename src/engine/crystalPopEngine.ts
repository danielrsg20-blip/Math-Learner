/**
 * Crystal Pop Engine
 * Manages 90-second arcade session state, question generation, scoring, and combo mechanics
 */

import type {
  DifficultyTier,
  MathQuestion,
  Operation,
  CrystalPopSessionState,
  CrystalPopAnswer,
} from "../types/math";
import type { CrystalPopSessionResult } from "../types/player";
import { generateQuestion } from "./mathGenerator";

/**
 * Constants for Crystal Pop gameplay
 */
export const CRYSTAL_POP = {
  DURATION_SECONDS: 90,
  BASE_POINTS_PER_ANSWER: 10,
  GEMS_PER_CORRECT: 1,
  COMBO_START: 1,
  COMBO_INCREMENT: 1,
  COMBO_RESET: 1,
};

/**
 * Get allowed operations for a difficulty tier
 * @param difficulty - Current difficulty tier
 * @returns Array of allowed operations for that tier
 */
export function getOperationsForDifficulty(
  difficulty: DifficultyTier
): Operation[] {
  const operationMap: Record<DifficultyTier, Operation[]> = {
    veryEasy: ["addition"],
    easy: ["addition", "subtraction"],
    medium: ["addition", "subtraction", "multiplication"],
    hard: ["addition", "subtraction", "multiplication"],
  };

  return operationMap[difficulty];
}

/**
 * Select a random operation from allowed list
 */
function selectRandomOperation(operations: Operation[]): Operation {
  return operations[Math.floor(Math.random() * operations.length)];
}

/**
 * Generate unique session ID
 */
function generateSessionId(): string {
  return `cp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Calculate score for a single answer
 */
function calculateAnswerScore(
  basePoints: number,
  comboMultiplier: number,
  isCorrect: boolean
): number {
  if (!isCorrect) {
    return 0;
  }
  return basePoints * comboMultiplier;
}

/**
 * Update combo multiplier based on answer correctness
 */
function updateCombo(
  isCorrect: boolean,
  currentCombo: number
): number {
  if (isCorrect) {
    return currentCombo + CRYSTAL_POP.COMBO_INCREMENT;
  }
  return CRYSTAL_POP.COMBO_RESET;
}

/**
 * Calculate accuracy percentage
 */
function calculateAccuracy(
  correctAnswers: number,
  totalAnswers: number
): number {
  if (totalAnswers === 0) {
    return 0;
  }
  return Math.round((correctAnswers / totalAnswers) * 100);
}

/**
 * Crystal Pop Session Manager
 * Handles 90-second gameplay session state and logic
 */
export class CrystalPopSession {
  private sessionId: string;
  private difficulty: DifficultyTier;
  private durationSeconds: number;
  private startTime: number = 0;
  private endTime: number | null = null;
  private currentScore: number = 0;
  private currentCombo: number = CRYSTAL_POP.COMBO_START;
  private maxComboReached: number = CRYSTAL_POP.COMBO_START;
  private questionsAttempted: number = 0;
  private correctAnswers: number = 0;
  private gemsEarned: number = 0;
  private answers: CrystalPopAnswer[] = [];
  private currentQuestion: MathQuestion | null = null;
  private isFinalized: boolean = false;

  /**
   * Initialize a new Crystal Pop session
   * @param difficulty - Starting difficulty tier
   * @param durationSeconds - Session duration in seconds (default 90)
   */
  constructor(
    difficulty: DifficultyTier,
    durationSeconds: number = CRYSTAL_POP.DURATION_SECONDS
  ) {
    this.sessionId = generateSessionId();
    this.difficulty = difficulty;
    this.durationSeconds = durationSeconds;
  }

  /**
   * Initialize session and generate first question
   */
  public initialize(): void {
    if (this.startTime !== 0) {
      throw new Error("Session already initialized");
    }
    this.startTime = Date.now();
    this.generateNextQuestion();
  }

  /**
   * Generate next question based on difficulty tier
   */
  public generateNextQuestion(): MathQuestion {
    const allowedOps = getOperationsForDifficulty(this.difficulty);
    const selectedOp = selectRandomOperation(allowedOps);

    // Generate question with multiple choice (for arcade-style tap gameplay)
    this.currentQuestion = generateQuestion(
      selectedOp,
      this.difficulty,
      true // include multiple choice
    );

    return this.currentQuestion;
  }

  /**
   * Get current question being displayed
   */
  public getCurrentQuestion(): MathQuestion | null {
    return this.currentQuestion;
  }

  /**
   * Submit an answer and process results
   * @param userAnswer - Player's answer
   * @param responseTimeMs - Time taken to answer in milliseconds
   * @returns Object with correctness, points earned, new combo
   */
  public submitAnswer(
    userAnswer: number,
    responseTimeMs: number
  ): {
    isCorrect: boolean;
    pointsEarned: number;
    newCombo: number;
    gemsAdded: number;
  } {
    if (this.isFinalized) {
      throw new Error("Session has ended");
    }

    if (!this.currentQuestion) {
      throw new Error("No question is currently active");
    }

    if (this.isExpired()) {
      throw new Error("Session has expired");
    }

    const isCorrect = userAnswer === this.currentQuestion.correctAnswer;

    // Update stats
    this.questionsAttempted += 1;

    if (isCorrect) {
      this.correctAnswers += 1;
    }

    // Update combo
    const newCombo = updateCombo(isCorrect, this.currentCombo);
    this.currentCombo = newCombo;

    if (this.currentCombo > this.maxComboReached) {
      this.maxComboReached = this.currentCombo;
    }

    // Calculate points
    const pointsEarned = calculateAnswerScore(
      CRYSTAL_POP.BASE_POINTS_PER_ANSWER,
      isCorrect ? this.currentCombo - CRYSTAL_POP.COMBO_INCREMENT : 1, // Use combo from before increment
      isCorrect
    );

    this.currentScore += pointsEarned;

    // Award gems
    const gemsAdded = isCorrect ? CRYSTAL_POP.GEMS_PER_CORRECT : 0;
    this.gemsEarned += gemsAdded;

    // Record answer
    const answer: CrystalPopAnswer = {
      questionId: this.currentQuestion.id,
      userAnswer,
      responseTimeMs,
      isCorrect,
      pointsEarned,
      comboAtTime: this.currentCombo - (isCorrect ? CRYSTAL_POP.COMBO_INCREMENT : 0),
      timestamp: Date.now(),
    };

    this.answers.push(answer);

    return {
      isCorrect,
      pointsEarned,
      newCombo: this.currentCombo,
      gemsAdded,
    };
  }

  /**
   * Get milliseconds remaining in session
   */
  public getTimeRemaining(): number {
    if (this.startTime === 0) {
      return this.durationSeconds * 1000;
    }

    const elapsed = Date.now() - this.startTime;
    const remaining = this.durationSeconds * 1000 - elapsed;

    return Math.max(0, remaining);
  }

  /**
   * Get seconds remaining in session
   */
  public getTimeRemainingSeconds(): number {
    return Math.ceil(this.getTimeRemaining() / 1000);
  }

  /**
   * Check if session has expired
   */
  public isExpired(): boolean {
    return this.getTimeRemaining() <= 0;
  }

  /**
   * Get current session state
   */
  public getSessionState(): CrystalPopSessionState {
    return {
      sessionId: this.sessionId,
      difficulty: this.difficulty,
      durationSeconds: this.durationSeconds,
      startTime: this.startTime,
      endTime: this.endTime,
      currentScore: this.currentScore,
      currentCombo: this.currentCombo,
      maxComboReached: this.maxComboReached,
      questionsAttempted: this.questionsAttempted,
      correctAnswers: this.correctAnswers,
      accuracy: calculateAccuracy(this.correctAnswers, this.questionsAttempted),
      gemsEarned: this.gemsEarned,
      answers: this.answers,
      isExpired: this.isExpired(),
    };
  }

  /**
   * Get formatted display stats during gameplay
   */
  public getDisplayStats(): {
    score: number;
    combo: string;
    questionsAnswered: number;
    accuracy: number;
    timeRemainingSec: number;
  } {
    return {
      score: this.currentScore,
      combo: `${this.currentCombo}x`,
      questionsAnswered: this.questionsAttempted,
      accuracy: calculateAccuracy(this.correctAnswers, this.questionsAttempted),
      timeRemainingSec: this.getTimeRemainingSeconds(),
    };
  }

  /**
   * End session and finalize stats
   * @returns Serializable session result
   */
  public endSession(): CrystalPopSessionResult {
    if (this.isFinalized) {
      return this.getFinalResult();
    }

    this.endTime = Date.now();
    this.isFinalized = true;

    return this.getFinalResult();
  }

  /**
   * Get final result (only available after endSession)
   */
  private getFinalResult(): CrystalPopSessionResult {
    if (!this.isFinalized) {
      throw new Error("Session has not been finalized");
    }

    return {
      sessionId: this.sessionId,
      difficulty: this.difficulty,
      finalScore: this.currentScore,
      questionsAnswered: this.questionsAttempted,
      correctAnswers: this.correctAnswers,
      accuracy: calculateAccuracy(this.correctAnswers, this.questionsAttempted),
      gemsEarned: this.gemsEarned,
      maxCombo: this.maxComboReached,
      duration: this.endTime! - this.startTime,
    };
  }

  /**
   * Get session stats (convenience method)
   */
  public getSessionStats() {
    return {
      questionsAnswered: this.questionsAttempted,
      correctAnswers: this.correctAnswers,
      accuracy: calculateAccuracy(this.correctAnswers, this.questionsAttempted),
      currentScore: this.currentScore,
      currentCombo: `${this.currentCombo}x`,
      maxCombo: this.maxComboReached,
      gemsEarned: this.gemsEarned,
    };
  }
}