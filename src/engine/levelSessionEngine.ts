/**
 * Level session engine
 * Handles level pass/fail, timing, no-repeat questions, and attempt results
 */

import {
  type AnswerMode,
  DifficultyTier,
  type GradeTag,
  type MathQuestion,
  type Operation,
} from "../types/math";
import type {
  LevelAnswerRecord,
  LevelAttemptResult,
  LevelDefinition,
  LevelSessionStats,
} from "../types/levels";
import { generateQuestion } from "./mathGenerator";
import { calculateAccuracy } from "./scoringSystem";

const SCORE_PER_CORRECT = 10;
const MAX_UNIQUE_ATTEMPTS = 80;

function gradeToDifficulty(gradeTag: GradeTag): DifficultyTier {
  if (gradeTag === "grade1") {
    return DifficultyTier.VeryEasy;
  }
  if (gradeTag === "grade2") {
    return DifficultyTier.Easy;
  }
  if (gradeTag === "grade3") {
    return DifficultyTier.Medium;
  }
  return DifficultyTier.Hard;
}

function randomPick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function questionKey(question: MathQuestion): string {
  return `${question.gradeTag}|${question.operation}|${question.operand1}|${question.operand2}|${question.correctAnswer}`;
}

export class LevelSession {
  private level: LevelDefinition;
  private answerMode: AnswerMode;
  private startTimeMs: number = 0;
  private endTimeMs: number | null = null;
  private score: number = 0;
  private correctAnswers: number = 0;
  private totalAnswered: number = 0;
  private currentQuestion: MathQuestion | null = null;
  private currentQuestionShownAtMs: number = 0;
  private seenQuestionKeys: Set<string> = new Set();
  private answerLog: LevelAnswerRecord[] = [];
  private ended: boolean = false;

  constructor(level: LevelDefinition, answerMode: AnswerMode = "multipleChoice") {
    this.level = level;
    this.answerMode = answerMode;
  }

  public getAnswerMode(): AnswerMode {
    return this.answerMode;
  }

  public initialize(): void {
    if (this.startTimeMs !== 0) {
      throw new Error("Session already initialized");
    }
    this.startTimeMs = Date.now();
    this.generateNextQuestion();
  }

  public getCurrentQuestion(): MathQuestion | null {
    return this.currentQuestion;
  }

  public getRemainingMs(): number {
    if (this.startTimeMs === 0) {
      return this.level.timeLimitSeconds * 1000;
    }

    const elapsed = Date.now() - this.startTimeMs;
    return Math.max(0, this.level.timeLimitSeconds * 1000 - elapsed);
  }

  public isExpired(): boolean {
    return this.getRemainingMs() <= 0;
  }

  public hasPassed(): boolean {
    return this.correctAnswers >= this.level.requiredCorrectAnswers;
  }

  public getStats(): LevelSessionStats {
    return {
      score: this.score,
      accuracy: calculateAccuracy(this.correctAnswers, this.totalAnswered),
      correctAnswers: this.correctAnswers,
      totalAnswered: this.totalAnswered,
      remainingMs: this.getRemainingMs(),
    };
  }

  public submitAnswer(userAnswer: number): {
    isCorrect: boolean;
    passed: boolean;
    score: number;
  } {
    if (this.ended) {
      throw new Error("Session has ended");
    }
    if (!this.currentQuestion) {
      throw new Error("No active question");
    }
    if (this.isExpired()) {
      throw new Error("Time has expired");
    }

    const now = Date.now();
    const responseTimeMs = Math.max(1, now - this.currentQuestionShownAtMs);
    const isCorrect = userAnswer === this.currentQuestion.correctAnswer;

    this.totalAnswered += 1;

    if (isCorrect) {
      this.correctAnswers += 1;
      this.score += SCORE_PER_CORRECT;
    }

    this.answerLog.push({
      questionId: this.currentQuestion.id,
      questionKey: questionKey(this.currentQuestion),
      question: this.currentQuestion,
      userAnswer,
      isCorrect,
      responseTimeMs,
      timestamp: now,
    });

    const passed = this.hasPassed();
    if (!passed && !this.isExpired()) {
      this.generateNextQuestion();
    }

    return {
      isCorrect,
      passed,
      score: this.score,
    };
  }

  public generateNextQuestion(): MathQuestion {
    if (this.ended) {
      throw new Error("Session has ended");
    }

    for (let attempt = 0; attempt < MAX_UNIQUE_ATTEMPTS; attempt++) {
      const gradeTag = randomPick(this.level.gradeTags);
      const operation: Operation = randomPick(this.level.allowedOperations);
      const difficulty = gradeToDifficulty(gradeTag);

      const candidate = generateQuestion(
        operation,
        difficulty,
        this.answerMode === "multipleChoice",
        { gradeTag }
      );
      const key = questionKey(candidate);

      if (!this.seenQuestionKeys.has(key)) {
        this.seenQuestionKeys.add(key);
        this.currentQuestion = candidate;
        this.currentQuestionShownAtMs = Date.now();
        return candidate;
      }
    }

    throw new Error("Unable to generate a unique question for this session");
  }

  public endSession(): LevelAttemptResult {
    if (this.ended) {
      return this.getResult();
    }

    this.endTimeMs = Date.now();
    this.ended = true;
    return this.getResult();
  }

  public getAnswerLog(): LevelAnswerRecord[] {
    return this.answerLog;
  }

  private getResult(): LevelAttemptResult {
    if (!this.ended || this.endTimeMs === null) {
      throw new Error("Session not finalized");
    }

    const timedOut = this.isExpired() && !this.hasPassed();

    return {
      levelId: this.level.id,
      levelNumber: this.level.levelNumber,
      answerMode: this.answerMode,
      score: this.score,
      accuracy: calculateAccuracy(this.correctAnswers, this.totalAnswered),
      completionTimeMs: Math.max(0, this.endTimeMs - this.startTimeMs),
      correctAnswers: this.correctAnswers,
      totalAnswered: this.totalAnswered,
      passed: this.hasPassed(),
      timedOut,
      endedAt: this.endTimeMs,
    };
  }
}
