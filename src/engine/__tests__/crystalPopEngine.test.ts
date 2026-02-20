/**
 * Crystal Pop Engine Tests
 * Comprehensive test coverage for session logic, scoring, and mechanics
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  CrystalPopSession,
  getOperationsForDifficulty,
  CRYSTAL_POP,
} from "../crystalPopEngine";
import { DifficultyTier } from "../../types/math";

describe("Crystal Pop Engine", () => {
  let session: CrystalPopSession;

  beforeEach(() => {
    session = new CrystalPopSession(DifficultyTier.Easy);
    session.initialize();
  });

  describe("Session Initialization", () => {
    it("should initialize session with correct difficulty", () => {
      const state = session.getSessionState();
      expect(state.difficulty).toBe(DifficultyTier.Easy);
      expect(state.durationSeconds).toBe(CRYSTAL_POP.DURATION_SECONDS);
    });

    it("should generate first question on initialization", () => {
      const question = session.getCurrentQuestion();
      expect(question).toBeDefined();
      expect(question?.id).toBeDefined();
      expect(question?.correctAnswer).toBeDefined();
    });

    it("should start with combo at 1", () => {
      const stats = session.getSessionStats();
      expect(stats.currentCombo).toBe("1x");
    });

    it("should start with score at 0", () => {
      const stats = session.getSessionStats();
      expect(stats.currentScore).toBe(0);
    });

    it("should throw error if initialized twice", () => {
      const newSession = new CrystalPopSession(DifficultyTier.Easy);
      newSession.initialize();
      expect(() => newSession.initialize()).toThrow();
    });
  });

  describe("getOperationsForDifficulty", () => {
    it("should return only addition for VeryEasy", () => {
      const ops = getOperationsForDifficulty(DifficultyTier.VeryEasy);
      expect(ops).toEqual(["addition"]);
    });

    it("should return addition and subtraction for Easy", () => {
      const ops = getOperationsForDifficulty(DifficultyTier.Easy);
      expect(ops).toContain("addition");
      expect(ops).toContain("subtraction");
      expect(ops).not.toContain("multiplication");
    });

    it("should return all operations for Medium and Hard", () => {
      const mediumOps = getOperationsForDifficulty(DifficultyTier.Medium);
      const hardOps = getOperationsForDifficulty(DifficultyTier.Hard);

      [mediumOps, hardOps].forEach((ops) => {
        expect(ops).toContain("addition");
        expect(ops).toContain("subtraction");
        expect(ops).toContain("multiplication");
      });
    });
  });

  describe("Combo Mechanics", () => {
    it("should increment combo on correct answer", () => {
      const question = session.getCurrentQuestion()!;
      const result = session.submitAnswer(question.correctAnswer, 500);

      expect(result.isCorrect).toBe(true);
      expect(result.newCombo).toBe(2);

      const stats = session.getSessionStats();
      expect(stats.currentCombo).toBe("2x");
    });

    it("should reset combo to 1 on incorrect answer", () => {
      const question = session.getCurrentQuestion()!;
      session.submitAnswer(question.correctAnswer, 500); // Correct
      expect(session.getSessionStats().currentCombo).toBe("2x");

      session.generateNextQuestion();
      const nextQuestion = session.getCurrentQuestion()!;
      session.submitAnswer(nextQuestion.correctAnswer + 999, 500); // Incorrect

      expect(session.getSessionStats().currentCombo).toBe("1x");
    });

    it("should track max combo reached", () => {
      // Simulate several correct answers
      // Combo: 1 -> 2 -> 3 -> 4 -> 5 -> 6 (after 5 correct answers)
      for (let i = 0; i < 5; i++) {
        const question = session.getCurrentQuestion()!;
        session.submitAnswer(question.correctAnswer, 500);
        if (i < 4) session.generateNextQuestion();
      }

      const stats = session.getSessionStats();
      expect(stats.maxCombo).toBe(6); // 5 correct answers increment combo to 6
    });

    it("should handle consecutive combos correctly", () => {
      // Answer 3 correct, 1 incorrect, then 2 more correct
      const questions = [
        session.getCurrentQuestion()!,
      ];
      
      session.submitAnswer(questions[0].correctAnswer, 500);
      expect(session.getSessionStats().currentCombo).toBe("2x");

      session.generateNextQuestion();
      questions.push(session.getCurrentQuestion()!);
      session.submitAnswer(questions[1].correctAnswer, 500);
      expect(session.getSessionStats().currentCombo).toBe("3x");

      session.generateNextQuestion();
      questions.push(session.getCurrentQuestion()!);
      session.submitAnswer(questions[2].correctAnswer, 500);
      expect(session.getSessionStats().currentCombo).toBe("4x");

      // Wrong answer
      session.generateNextQuestion();
      questions.push(session.getCurrentQuestion()!);
      session.submitAnswer(999, 500);
      expect(session.getSessionStats().currentCombo).toBe("1x");

      // Correct again
      session.generateNextQuestion();
      questions.push(session.getCurrentQuestion()!);
      session.submitAnswer(questions[4].correctAnswer, 500);
      expect(session.getSessionStats().currentCombo).toBe("2x");
    });
  });

  describe("Scoring", () => {
    it("should award 10 points for first correct answer", () => {
      const question = session.getCurrentQuestion()!;
      const result = session.submitAnswer(question.correctAnswer, 500);

      expect(result.pointsEarned).toBe(10);
      expect(result.isCorrect).toBe(true);
    });

    it("should apply combo multiplier to points", () => {
      const question1 = session.getCurrentQuestion()!;
      session.submitAnswer(question1.correctAnswer, 500); // Combo: 2x

      session.generateNextQuestion();
      const question2 = session.getCurrentQuestion()!;
      const result = session.submitAnswer(question2.correctAnswer, 500); // 10 * 2 = 20

      expect(result.pointsEarned).toBe(20);
      expect(result.newCombo).toBe(3);
    });

    it("should award 0 points for incorrect answer", () => {
      const question = session.getCurrentQuestion()!;
      const result = session.submitAnswer(999, 500);

      expect(result.isCorrect).toBe(false);
      expect(result.pointsEarned).toBe(0);
    });

    it("should track cumulative score", () => {
      const questions = [];
      for (let i = 0; i < 3; i++) {
        questions.push(session.getCurrentQuestion()!);
        session.submitAnswer(questions[i].correctAnswer, 500);
        if (i < 2) session.generateNextQuestion();
      }

      // Expected: 10 (1x) + 20 (2x) + 30 (3x) = 60
      const stats = session.getSessionStats();
      expect(stats.currentScore).toBe(60);
    });
  });

  describe("Gem Awards", () => {
    it("should award 1 gem per correct answer", () => {
      const question = session.getCurrentQuestion()!;
      const result = session.submitAnswer(question.correctAnswer, 500);

      expect(result.gemsAdded).toBe(1);
      expect(session.getSessionStats().gemsEarned).toBe(1);
    });

    it("should award 0 gems for incorrect answer", () => {
      const question = session.getCurrentQuestion()!;
      const result = session.submitAnswer(999, 500);

      expect(result.gemsAdded).toBe(0);
    });

    it("should accumulate gems from multiple correct answers", () => {
      for (let i = 0; i < 5; i++) {
        const question = session.getCurrentQuestion()!;
        session.submitAnswer(question.correctAnswer, 500);
        if (i < 4) session.generateNextQuestion();
      }

      expect(session.getSessionStats().gemsEarned).toBe(5);
    });
  });

  describe("Time Tracking", () => {
    it("should initialize with full duration remaining", () => {
      const timeRemaining = session.getTimeRemainingSeconds();
      expect(timeRemaining).toBe(CRYSTAL_POP.DURATION_SECONDS);
    });

    it("should report decreasing time as session progresses", () => {
      vi.useFakeTimers();
      
      const testSession = new CrystalPopSession(DifficultyTier.Easy);
      testSession.initialize();
      
      const initial = testSession.getTimeRemainingSeconds();
      
      // Wait 10 seconds
      vi.advanceTimersByTime(10000);
      const afterWait = testSession.getTimeRemainingSeconds();
      
      vi.useRealTimers();
      
      expect(initial).toBe(90);
      expect(afterWait).toBeLessThan(initial);
    });

    it("should return 0 when session is expired", () => {
      vi.useFakeTimers();
      
      const testSession = new CrystalPopSession(DifficultyTier.Easy, 1);
      testSession.initialize();
      
      // Advance past duration
      vi.advanceTimersByTime(2000);
      
      expect(testSession.isExpired()).toBe(true);
      expect(testSession.getTimeRemainingSeconds()).toBe(0);
      
      vi.useRealTimers();
    });

    it("should prevent answers after expiration", () => {
      vi.useFakeTimers();
      
      const testSession = new CrystalPopSession(DifficultyTier.Easy, 1);
      testSession.initialize();
      
      vi.advanceTimersByTime(2000);
      
      const question = testSession.getCurrentQuestion()!;
      expect(() =>
        testSession.submitAnswer(question.correctAnswer, 500)
      ).toThrow("Session has expired");
      
      vi.useRealTimers();
    });
  });

  describe("Accuracy Calculation", () => {
    it("should calculate 0% accuracy initially", () => {
      expect(session.getSessionStats().accuracy).toBe(0);
    });

    it("should calculate 100% accuracy with all correct", () => {
      for (let i = 0; i < 5; i++) {
        const question = session.getCurrentQuestion()!;
        session.submitAnswer(question.correctAnswer, 500);
        if (i < 4) session.generateNextQuestion();
      }

      expect(session.getSessionStats().accuracy).toBe(100);
    });

    it("should calculate 50% accuracy with half correct", () => {
      const question1 = session.getCurrentQuestion()!;
      session.submitAnswer(question1.correctAnswer, 500); // Correct

      session.generateNextQuestion();
      session.submitAnswer(999, 500); // Incorrect

      expect(session.getSessionStats().accuracy).toBe(50);
    });

    it("should round accuracy to nearest integer", () => {
      for (let i = 0; i < 3; i++) {
        const question = session.getCurrentQuestion()!;
        session.submitAnswer(question.correctAnswer, 500); // All correct
        if (i < 2) session.generateNextQuestion();
      }

      // 3/3 = 100%
      expect(session.getSessionStats().accuracy).toBe(100);

      session.generateNextQuestion();
      session.submitAnswer(999, 500); // 3/4 = 75%

      expect(session.getSessionStats().accuracy).toBe(75);
    });
  });

  describe("Question Generation", () => {
    it("should generate new unique questions", () => {
      const q1 = session.getCurrentQuestion()!;
      session.generateNextQuestion();
      const q2 = session.getCurrentQuestion()!;

      expect(q1.id).not.toBe(q2.id);
    });

    it("should generate questions with multiple choice for arcade style", () => {
      const question = session.getCurrentQuestion()!;
      expect(question.multipleChoiceOptions).toBeDefined();
      expect(question.multipleChoiceOptions?.length).toBe(4);
    });

    it("should respect difficulty tier operations", () => {
      const easySession = new CrystalPopSession(DifficultyTier.Easy);
      easySession.initialize();

      // Generate 20 questions and check operations are from allowed set
      const allowedOps = getOperationsForDifficulty(DifficultyTier.Easy);
      for (let i = 0; i < 20; i++) {
        const question = easySession.getCurrentQuestion()!;
        expect(allowedOps).toContain(question.operation);
        easySession.generateNextQuestion();
      }
    });
  });

  describe("Session Finalization", () => {
    it("should finalize session and return result", () => {
      session.submitAnswer(999, 500); // 1 wrong
      session.generateNextQuestion();
      session.submitAnswer(session.getCurrentQuestion()!.correctAnswer, 500); // 1 correct

      const result = session.endSession();

      expect(result.sessionId).toBeDefined();
      expect(result.difficulty).toBe(DifficultyTier.Easy);
      expect(result.questionsAnswered).toBe(2);
      expect(result.correctAnswers).toBe(1);
      expect(result.accuracy).toBe(50);
    });

    it("should prevent answers after session ends", () => {
      session.endSession();

      const question = session.getCurrentQuestion()!;
      expect(() => session.submitAnswer(question.correctAnswer, 500)).toThrow(
        "Session has ended"
      );
    });

    it("should allow multiple calls to endSession after finalization", () => {
      const result1 = session.endSession();
      const result2 = session.endSession();

      expect(result1).toEqual(result2);
    });

    it("should calculate session duration in milliseconds", () => {
      vi.useFakeTimers();
      const testSession = new CrystalPopSession(DifficultyTier.Easy, 90);
      testSession.initialize();

      vi.advanceTimersByTime(5000);

      const result = testSession.endSession();
      expect(result.duration).toBeGreaterThanOrEqual(5000);
      expect(result.duration).toBeLessThan(6000);

      vi.useRealTimers();
    });
  });

  describe("Session State", () => {
    it("should return complete session state", () => {
      session.submitAnswer(999, 500);
      session.generateNextQuestion();
      session.submitAnswer(session.getCurrentQuestion()!.correctAnswer, 500);

      const state = session.getSessionState();

      expect(state.sessionId).toBeDefined();
      expect(state.difficulty).toBe(DifficultyTier.Easy);
      expect(state.currentScore).toBeGreaterThan(0);
      expect(state.currentCombo).toBe(2);
      expect(state.questionsAttempted).toBe(2);
      expect(state.correctAnswers).toBe(1);
      expect(state.accuracy).toBe(50);
      expect(state.answers.length).toBe(2);
    });

    it("should include all answers in session state", () => {
      const q1 = session.getCurrentQuestion()!;
      session.submitAnswer(q1.correctAnswer, 500);

      session.generateNextQuestion();
      const q2 = session.getCurrentQuestion()!;
      session.submitAnswer(999, 500);

      const state = session.getSessionState();
      expect(state.answers).toHaveLength(2);
      expect(state.answers[0].isCorrect).toBe(true);
      expect(state.answers[1].isCorrect).toBe(false);
    });
  });

  describe("Display Stats", () => {
    it("should provide formatted stats for UI display", () => {
      const question = session.getCurrentQuestion()!;
      session.submitAnswer(question.correctAnswer, 500);

      const displayStats = session.getDisplayStats();

      expect(displayStats.score).toBe(10);
      expect(displayStats.combo).toBe("2x");
      expect(displayStats.questionsAnswered).toBe(1);
      expect(displayStats.timeRemainingSec).toBeGreaterThan(0);
    });
  });

  describe("Answer Modes", () => {
    it("supports number-entry mode question generation", () => {
      const numberEntrySession = new CrystalPopSession(
        DifficultyTier.Easy,
        "numberEntry"
      );
      numberEntrySession.initialize();

      const question = numberEntrySession.getCurrentQuestion();
      expect(question).toBeDefined();
      expect(question?.multipleChoiceOptions).toBeUndefined();
      expect(numberEntrySession.getAnswerMode()).toBe("numberEntry");
    });
  });
});
