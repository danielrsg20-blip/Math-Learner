/**
 * Scoring System Tests
 * Ensures skill rating, combo, and scoring calculations are correct
 */

import { describe, it, expect } from "vitest";
import {
  updateSkillRating,
  updateCombo,
  calculateAnswerScore,
  calculateAccuracy,
  calculateGemsEarned,
  SCORING,
} from "../scoringSystem";

describe("Scoring System", () => {
  describe("updateSkillRating", () => {
    it("should add 10 points for correct answer", () => {
      const newSkill = updateSkillRating(1000, true, 20);
      expect(newSkill).toBe(1015); // 10 base + 5 speed bonus
    });

    it("should subtract 5 points for incorrect answer", () => {
      const newSkill = updateSkillRating(1000, false, 20);
      expect(newSkill).toBe(995);
    });

    it("should add speed bonus (+5) only for correct answer within 30 seconds", () => {
      const fast = updateSkillRating(1000, true, 20);
      expect(fast).toBe(1015); // 10 + 5 speed bonus

      const slow = updateSkillRating(1000, true, 35);
      expect(slow).toBe(1010); // just 10, no speed bonus

      const incorrectFast = updateSkillRating(1000, false, 20);
      expect(incorrectFast).toBe(995); // -5, no speed bonus applies
    });

    it("should never go below 0", () => {
      const veryLow = updateSkillRating(3, false, 20);
      expect(veryLow).toBe(0);
    });

    it("should handle boundary cases", () => {
      // Exactly at speed threshold
      expect(updateSkillRating(1000, true, 30)).toBe(1015);
      // Just over speed threshold
      expect(updateSkillRating(1000, true, 31)).toBe(1010);
    });
  });

  describe("updateCombo", () => {
    it("should increment combo on correct answer", () => {
      expect(updateCombo(1, true)).toBe(2);
      expect(updateCombo(5, true)).toBe(6);
    });

    it("should reset combo to 1 on incorrect answer", () => {
      expect(updateCombo(5, false)).toBe(1);
      expect(updateCombo(100, false)).toBe(1);
    });
  });

  describe("calculateAnswerScore", () => {
    it("should return 0 for incorrect answer", () => {
      expect(calculateAnswerScore(10, 5, false)).toBe(0);
    });

    it("should apply combo multiplier to correct answers", () => {
      expect(calculateAnswerScore(10, 1, true)).toBe(10);
      expect(calculateAnswerScore(10, 2, true)).toBe(20);
      expect(calculateAnswerScore(10, 5, true)).toBe(50);
    });

    it("should handle different base scores", () => {
      expect(calculateAnswerScore(5, 3, true)).toBe(15);
      expect(calculateAnswerScore(20, 2, true)).toBe(40);
    });
  });

  describe("calculateAccuracy", () => {
    it("should return 0 for no answers", () => {
      expect(calculateAccuracy(0, 0)).toBe(0);
    });

    it("should calculate percentage correctly", () => {
      expect(calculateAccuracy(5, 10)).toBe(50);
      expect(calculateAccuracy(9, 10)).toBe(90);
      expect(calculateAccuracy(10, 10)).toBe(100);
      expect(calculateAccuracy(1, 10)).toBe(10);
    });

    it("should round to nearest integer", () => {
      expect(calculateAccuracy(1, 3)).toBe(33); // 33.333...
      expect(calculateAccuracy(2, 3)).toBe(67); // 66.666...
    });
  });

  describe("calculateGemsEarned", () => {
    it("should award base gems for questions answered", () => {
      // 1 gem per 5 questions
      expect(calculateGemsEarned(50, 5)).toBe(1);
      expect(calculateGemsEarned(50, 10)).toBe(2);
      expect(calculateGemsEarned(50, 20)).toBe(4);
    });

    it("should add accuracy bonuses", () => {
      // Perfect accuracy (90+): +5 gems
      const gems90 = calculateGemsEarned(90, 10);
      const baseGems = calculateGemsEarned(50, 10);
      expect(gems90).toBe(baseGems + 5);

      // Good accuracy (80-90): +3 gems
      const gems80 = calculateGemsEarned(80, 10);
      expect(gems80).toBe(baseGems + 3);

      // Average accuracy (70-80): +1 gem
      const gems70 = calculateGemsEarned(70, 10);
      expect(gems70).toBe(baseGems + 1);

      // Below 70: no bonus
      const gems60 = calculateGemsEarned(60, 10);
      expect(gems60).toBe(baseGems);
    });

    it("should never return negative gems", () => {
      expect(calculateGemsEarned(50, 0)).toBe(0);
      expect(calculateGemsEarned(50, 1)).toBe(0);
    });

    it("should handle realistic game sessions", () => {
      // 20 questions with 90% accuracy
      const result = calculateGemsEarned(90, 20);
      expect(result).toBeGreaterThan(0);
    });
  });

  describe("Scoring constants", () => {
    it("should have correct constants defined", () => {
      expect(SCORING.CORRECT_ANSWER).toBe(10);
      expect(SCORING.INCORRECT_ANSWER).toBe(-5);
      expect(SCORING.SPEED_BONUS).toBe(5);
      expect(SCORING.SPEED_THRESHOLD_SECONDS).toBe(30);
      expect(SCORING.MIN_SKILL_RATING).toBe(0);
    });
  });
});
