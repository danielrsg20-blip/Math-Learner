/**
 * Math Generator Tests
 * Ensures questions match expected difficulty ranges and correctness
 */

import { describe, it, expect } from "vitest";
import { generateQuestion, generateQuestions } from "../mathGenerator";
import { DifficultyTier } from "../../types/math";

describe("Math Generator", () => {
  describe("generateQuestion", () => {
    it("should generate a question with correct ID and structure", () => {
      const q = generateQuestion("addition", DifficultyTier.Easy, false);
      expect(q.id).toBeDefined();
      expect(q.operation).toBe("addition");
      expect(q.operand1).toBeDefined();
      expect(q.operand2).toBeDefined();
      expect(q.correctAnswer).toBeDefined();
      expect(q.prompt).toBeDefined();
      expect(q.difficulty).toBe(DifficultyTier.Easy);
    });

    describe("addition", () => {
      it("should generate questions with operands in correct range", () => {
        const q = generateQuestion("addition", DifficultyTier.Easy, false);
        expect(q.operand1).toBeGreaterThanOrEqual(1);
        expect(q.operand1).toBeLessThanOrEqual(20);
        expect(q.operand2).toBeGreaterThanOrEqual(1);
        expect(q.operand2).toBeLessThanOrEqual(20);
      });

      it("should calculate correct answer correctly", () => {
        const q = generateQuestion("addition", DifficultyTier.VeryEasy, false);
        expect(q.correctAnswer).toBe(q.operand1 + q.operand2);
      });

      it("should respect difficulty tier ranges", () => {
        const veryEasy = generateQuestion("addition", DifficultyTier.VeryEasy, false);
        expect(veryEasy.operand1).toBeLessThanOrEqual(10);
        expect(veryEasy.operand2).toBeLessThanOrEqual(10);

        const hard = generateQuestion("addition", DifficultyTier.Hard, false);
        expect(hard.operand1).toBeLessThanOrEqual(100);
        expect(hard.operand2).toBeLessThanOrEqual(100);
      });
    });

    describe("subtraction", () => {
      it("should ensure non-negative results (operand1 >= operand2)", () => {
        for (let i = 0; i < 20; i++) {
          const q = generateQuestion("subtraction", DifficultyTier.Medium, false);
          expect(q.operand1).toBeGreaterThanOrEqual(q.operand2);
          expect(q.correctAnswer).toBeGreaterThanOrEqual(0);
        }
      });

      it("should calculate correct answer correctly", () => {
        const q = generateQuestion("subtraction", DifficultyTier.Easy, false);
        expect(q.correctAnswer).toBe(q.operand1 - q.operand2);
      });
    });

    describe("multiplication", () => {
      it("should generate questions with reasonable products", () => {
        const q = generateQuestion("multiplication", DifficultyTier.Hard, false);
        expect(q.correctAnswer).toBe(q.operand1 * q.operand2);
        expect(q.operand1).toBeLessThanOrEqual(100);
        expect(q.operand2).toBeLessThanOrEqual(12); // Cap second operand
      });
    });

    describe("multiple choice", () => {
      it("should include 4 unique options when requested", () => {
        const q = generateQuestion("addition", DifficultyTier.Easy, true);
        expect(q.multipleChoiceOptions).toBeDefined();
        expect(q.multipleChoiceOptions?.length).toBe(4);
        const unique = new Set(q.multipleChoiceOptions);
        expect(unique.size).toBe(4);
      });

      it("should include the correct answer in options", () => {
        const q = generateQuestion("addition", DifficultyTier.Easy, true);
        expect(q.multipleChoiceOptions).toContain(q.correctAnswer);
      });

      it("should not include multiple choice options when not requested", () => {
        const q = generateQuestion("addition", DifficultyTier.Easy, false);
        expect(q.multipleChoiceOptions).toBeUndefined();
      });
    });

    describe("prompt formatting", () => {
      it("should generate readable prompts", () => {
        const q = generateQuestion("addition", DifficultyTier.Easy, false);
        expect(q.prompt).toMatch(/\d+\s*\+\s*\d+\s*=\s*\?/);

        const q2 = generateQuestion("subtraction", DifficultyTier.Easy, false);
        expect(q2.prompt).toMatch(/\d+\s*−\s*\d+\s*=\s*\?/);

        const q3 = generateQuestion("multiplication", DifficultyTier.Easy, false);
        expect(q3.prompt).toMatch(/\d+\s*×\s*\d+\s*=\s*\?/);
      });
    });
  });

  describe("generateQuestions", () => {
    it("should generate multiple questions", () => {
      const questions = generateQuestions("addition", DifficultyTier.Easy, 5);
      expect(questions.length).toBe(5);
    });

    it("should generate unique IDs for each question", () => {
      const questions = generateQuestions("addition", DifficultyTier.Easy, 10);
      const ids = questions.map((q) => q.id);
      const unique = new Set(ids);
      expect(unique.size).toBe(10);
    });

    it("should pass through multiple choice option", () => {
      const questions = generateQuestions(
        "addition",
        DifficultyTier.Easy,
        5,
        true
      );
      questions.forEach((q) => {
        expect(q.multipleChoiceOptions?.length).toBe(4);
      });
    });
  });
});
