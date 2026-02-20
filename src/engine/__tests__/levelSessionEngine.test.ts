import { describe, expect, it, vi } from "vitest";
import { LevelSession } from "../levelSessionEngine";
import { getLevelDefinition } from "../levelConfig";

describe("LevelSession", () => {
  it("passes when required correct answers are reached before timeout", () => {
    const level = { ...getLevelDefinition(1), requiredCorrectAnswers: 2, timeLimitSeconds: 30 };
    const session = new LevelSession(level);
    session.initialize();

    const q1 = session.getCurrentQuestion();
    expect(q1).toBeTruthy();
    session.submitAnswer(q1!.correctAnswer);

    const q2 = session.getCurrentQuestion();
    expect(q2).toBeTruthy();
    const second = session.submitAnswer(q2!.correctAnswer);

    expect(second.passed).toBe(true);
    const result = session.endSession();
    expect(result.passed).toBe(true);
    expect(result.correctAnswers).toBe(2);
  });

  it("fails when time expires before completion", () => {
    vi.useFakeTimers();

    const level = { ...getLevelDefinition(1), requiredCorrectAnswers: 10, timeLimitSeconds: 1 };
    const session = new LevelSession(level);
    session.initialize();

    vi.advanceTimersByTime(1500);

    const result = session.endSession();
    expect(result.passed).toBe(false);
    expect(result.timedOut).toBe(true);

    vi.useRealTimers();
  });

  it("generates non-repeating questions in short sequence", () => {
    const level = { ...getLevelDefinition(2), requiredCorrectAnswers: 5, timeLimitSeconds: 60 };
    const session = new LevelSession(level);
    session.initialize();

    const seen = new Set<string>();

    for (let i = 0; i < 5; i++) {
      const question = session.getCurrentQuestion();
      expect(question).toBeTruthy();
      const key = `${question!.gradeTag}-${question!.operation}-${question!.operand1}-${question!.operand2}-${question!.correctAnswer}`;
      expect(seen.has(key)).toBe(false);
      seen.add(key);
      session.submitAnswer(question!.correctAnswer);
      if (i < 4 && !session.hasPassed()) {
        session.generateNextQuestion();
      }
    }
  });
});
