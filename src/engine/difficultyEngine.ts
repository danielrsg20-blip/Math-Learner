/**
 * Difficulty Engine
 * Maps player skill rating to difficulty tiers and generates appropriate complexity parameters
 */

import {
  DifficultyTier,
  type DifficultyConfig,
  type NumberRange,
} from "../types/math";

/**
 * Difficulty tier configurations with skill rating boundaries and number ranges
 */
const DIFFICULTY_CONFIGS: Record<DifficultyTier, DifficultyConfig> = {
  [DifficultyTier.VeryEasy]: {
    tier: DifficultyTier.VeryEasy,
    minSkill: 0,
    maxSkill: 900,
    numberRange: { min: 1, max: 10 },
  },
  [DifficultyTier.Easy]: {
    tier: DifficultyTier.Easy,
    minSkill: 900,
    maxSkill: 1100,
    numberRange: { min: 1, max: 20 },
  },
  [DifficultyTier.Medium]: {
    tier: DifficultyTier.Medium,
    minSkill: 1100,
    maxSkill: 1300,
    numberRange: { min: 1, max: 50 },
  },
  [DifficultyTier.Hard]: {
    tier: DifficultyTier.Hard,
    minSkill: 1300,
    maxSkill: Infinity,
    numberRange: { min: 1, max: 100 },
  },
};

/**
 * Get the difficulty tier based on current skill rating
 * @param skillRating - Current player skill rating (starts at 1000)
 * @returns DifficultyTier for the given skill level
 */
export function getDifficulty(skillRating: number): DifficultyTier {
  if (skillRating < 900) {
    return DifficultyTier.VeryEasy;
  }
  if (skillRating < 1100) {
    return DifficultyTier.Easy;
  }
  if (skillRating < 1300) {
    return DifficultyTier.Medium;
  }
  return DifficultyTier.Hard;
}

/**
 * Get the configuration (number range and boundaries) for a difficulty tier
 * @param tier - DifficultyTier to get config for
 * @returns DifficultyConfig with number ranges and skill boundaries
 */
export function getDifficultyConfig(tier: DifficultyTier): DifficultyConfig {
  return DIFFICULTY_CONFIGS[tier];
}

/**
 * Get the number range for a given difficulty tier
 * @param tier - DifficultyTier to get range for
 * @returns NumberRange with min and max operands
 */
export function getNumberRange(tier: DifficultyTier): NumberRange {
  return DIFFICULTY_CONFIGS[tier].numberRange;
}

/**
 * Get all difficulty tiers for reference
 * @returns Array of all DifficultyTier values
 */
export function getAllDifficultyTiers(): DifficultyTier[] {
  return Object.values(DifficultyTier);
}

/**
 * Get skill rating boundaries for a given tier
 * @param tier - DifficultyTier
 * @returns Object with minSkill and maxSkill for the tier
 */
export function getSkillBoundaries(tier: DifficultyTier): {
  min: number;
  max: number;
} {
  const config = DIFFICULTY_CONFIGS[tier];
  return { min: config.minSkill, max: config.maxSkill };
}
