/**
 * Static level configuration for the Levels feature
 */

import type { LevelDefinition } from "../types/levels";
import type { GradeTag, Operation } from "../types/math";

const DEFAULT_REQUIRED_CORRECT = 10;
const DEFAULT_TIME_LIMIT_SECONDS = 90;
const TIME_INCREMENT_EVERY_TWO_LEVELS_SECONDS = 60;

function getTimeLimitForLevel(levelNumber: number): number {
  const pairIndex = Math.floor((levelNumber - 1) / 2);
  return (
    DEFAULT_TIME_LIMIT_SECONDS +
    pairIndex * TIME_INCREMENT_EVERY_TWO_LEVELS_SECONDS
  );
}

function createLevel(
  levelNumber: number,
  gradeTags: GradeTag[],
  allowedOperations: Operation[]
): LevelDefinition {
  return {
    id: `level-${levelNumber}`,
    levelNumber,
    title: `Level ${levelNumber}`,
    gradeTags,
    allowedOperations,
    requiredCorrectAnswers: DEFAULT_REQUIRED_CORRECT,
    timeLimitSeconds: getTimeLimitForLevel(levelNumber),
  };
}

export const LEVEL_DEFINITIONS: LevelDefinition[] = [
  createLevel(1, ["grade1"], ["addition"]),
  createLevel(2, ["grade1", "grade2"], ["addition", "subtraction"]),
  createLevel(3, ["grade2"], ["addition", "subtraction"]),
  createLevel(4, ["grade2", "grade3"], ["addition", "subtraction", "multiplication"]),
  createLevel(5, ["grade3"], ["addition", "subtraction", "multiplication"]),
  createLevel(6, ["grade3", "grade4"], ["addition", "subtraction", "multiplication"]),
  createLevel(7, ["grade4"], ["addition", "subtraction", "multiplication"]),
  createLevel(8, ["grade4", "grade5"], ["addition", "subtraction", "multiplication"]),
  createLevel(9, ["grade5"], ["addition", "subtraction", "multiplication"]),
  createLevel(10, ["grade5", "grade6"], ["addition", "subtraction", "multiplication"]),
];

export function getLevelDefinition(levelNumber: number): LevelDefinition {
  const level = LEVEL_DEFINITIONS.find((entry) => entry.levelNumber === levelNumber);
  if (!level) {
    throw new Error(`Level ${levelNumber} not found`);
  }
  return level;
}
