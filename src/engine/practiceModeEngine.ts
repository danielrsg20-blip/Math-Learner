import {
  DifficultyTier,
  type GradeTag,
  type MathQuestion,
  type Operation,
} from "../types/math";
import type { LevelDefinition } from "../types/levels";
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

export interface PracticeStats {
  score: number;
  accuracy: number;
  correctAnswers: number;
  totalAnswered: number;
}

export class PracticeModeSession {
  private level: LevelDefinition;
  private currentQuestion: MathQuestion | null = null;
  private seenQuestionKeys: Set<string> = new Set();
  private score: number = 0;
  private correctAnswers: number = 0;
  private totalAnswered: number = 0;
  private completed: boolean = false;

  constructor(level: LevelDefinition) {
    this.level = level;
  }

  public initialize(): void {
    if (this.currentQuestion) {
      throw new Error("Practice session already initialized");
    }
    this.generateNextQuestion();
  }

  public getCurrentQuestion(): MathQuestion | null {
    return this.currentQuestion;
  }

  public isCompleted(): boolean {
    return this.completed;
  }

  public getStats(): PracticeStats {
    return {
      score: this.score,
      accuracy: calculateAccuracy(this.correctAnswers, this.totalAnswered),
      correctAnswers: this.correctAnswers,
      totalAnswered: this.totalAnswered,
    };
  }

  public submitAnswer(userAnswer: number): {
    isCorrect: boolean;
    completed: boolean;
    stats: PracticeStats;
  } {
    if (this.completed) {
      throw new Error("Practice session is already completed");
    }

    if (!this.currentQuestion) {
      throw new Error("No active question");
    }

    const isCorrect = userAnswer === this.currentQuestion.correctAnswer;

    this.totalAnswered += 1;
    if (isCorrect) {
      this.correctAnswers += 1;
      this.score += SCORE_PER_CORRECT;
    }

    this.completed = this.correctAnswers >= this.level.requiredCorrectAnswers;

    if (!this.completed) {
      this.generateNextQuestion();
    }

    return {
      isCorrect,
      completed: this.completed,
      stats: this.getStats(),
    };
  }

  public generateNextQuestion(): MathQuestion {
    for (let attempt = 0; attempt < MAX_UNIQUE_ATTEMPTS; attempt++) {
      const gradeTag = randomPick(this.level.gradeTags);
      const operation: Operation = randomPick(this.level.allowedOperations);
      const difficulty = gradeToDifficulty(gradeTag);

      const candidate = generateQuestion(operation, difficulty, false, { gradeTag });
      const key = questionKey(candidate);

      if (!this.seenQuestionKeys.has(key)) {
        this.seenQuestionKeys.add(key);
        this.currentQuestion = candidate;
        return candidate;
      }
    }

    throw new Error("Unable to generate unique practice question");
  }
}
