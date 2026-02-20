/**
 * Difficulty Engine Tests
 * Ensures skill rating → difficulty tier mapping works correctly
 */

import { describe, it, expect } from "vitest";
import {
  getDifficulty,
  getDifficultyConfig,
  getNumberRange,
  getSkillBoundaries,
} from "../difficultyEngine";
import { DifficultyTier } from "../../types/math";

describe("Difficulty Engine", () => {
  describe("getDifficulty", () => {
    it("should return VeryEasy for skill < 900", () => {
      expect(getDifficulty(0)).toBe(DifficultyTier.VeryEasy);
      expect(getDifficulty(500)).toBe(DifficultyTier.VeryEasy);
      expect(getDifficulty(899)).toBe(DifficultyTier.VeryEasy);
    });

    it("should return Easy for skill 900-1100", () => {
      expect(getDifficulty(900)).toBe(DifficultyTier.Easy);
      expect(getDifficulty(1000)).toBe(DifficultyTier.Easy);
      expect(getDifficulty(1099)).toBe(DifficultyTier.Easy);
    });

    it("should return Medium for skill 1100-1300", () => {
      expect(getDifficulty(1100)).toBe(DifficultyTier.Medium);
      expect(getDifficulty(1200)).toBe(DifficultyTier.Medium);
      expect(getDifficulty(1299)).toBe(DifficultyTier.Medium);
    });

    it("should return Hard for skill >= 1300", () => {
      expect(getDifficulty(1300)).toBe(DifficultyTier.Hard);
      expect(getDifficulty(2000)).toBe(DifficultyTier.Hard);
    });
  });

  describe("getNumberRange", () => {
    it("should return correct range for VeryEasy", () => {
      const range = getNumberRange(DifficultyTier.VeryEasy);
      expect(range.min).toBe(1);
      expect(range.max).toBe(10);
    });

    it("should return correct range for Easy", () => {
      const range = getNumberRange(DifficultyTier.Easy);
      expect(range.min).toBe(1);
      expect(range.max).toBe(20);
    });

    it("should return correct range for Medium", () => {
      const range = getNumberRange(DifficultyTier.Medium);
      expect(range.min).toBe(1);
      expect(range.max).toBe(50);
    });

    it("should return correct range for Hard", () => {
      const range = getNumberRange(DifficultyTier.Hard);
      expect(range.min).toBe(1);
      expect(range.max).toBe(100);
    });
  });

  describe("getSkillBoundaries", () => {
    it("should return correct boundaries for each tier", () => {
      const veryEasy = getSkillBoundaries(DifficultyTier.VeryEasy);
      expect(veryEasy.min).toBe(0);
      expect(veryEasy.max).toBe(900);

      const easy = getSkillBoundaries(DifficultyTier.Easy);
      expect(easy.min).toBe(900);
      expect(easy.max).toBe(1100);

      const medium = getSkillBoundaries(DifficultyTier.Medium);
      expect(medium.min).toBe(1100);
      expect(medium.max).toBe(1300);

      const hard = getSkillBoundaries(DifficultyTier.Hard);
      expect(hard.min).toBe(1300);
      expect(hard.max).toBe(Infinity);
    });
  });

  describe("getDifficultyConfig", () => {
    it("should return full config with number range and boundaries", () => {
      const config = getDifficultyConfig(DifficultyTier.Easy);
      expect(config.tier).toBe(DifficultyTier.Easy);
      expect(config.minSkill).toBe(900);
      expect(config.maxSkill).toBe(1100);
      expect(config.numberRange.min).toBe(1);
      expect(config.numberRange.max).toBe(20);
    });
  });
});
