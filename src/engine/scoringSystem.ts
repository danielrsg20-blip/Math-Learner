/**
 * Scoring System
 * Handles skill rating updates, score calculations, and combo mechanics
 */

/**
 * Constants for scoring and skill adjustments
 */
export const SCORING = {
  CORRECT_ANSWER: 10, // Base skill points for correct answer
  INCORRECT_ANSWER: -5, // Skill point penalty for incorrect answer
  SPEED_BONUS: 5, // Bonus skill points for fast response
  SPEED_THRESHOLD_SECONDS: 30, // Must answer within this time for speed bonus
  MIN_SKILL_RATING: 0, // Skill rating floor
};

export const COMBO = {
  INCREMENT: 1, // How much to increase multiplier
  RESET_VALUE: 1,
};

export const MINI_GAME = {
  CRYSTAL_POP_DURATION: 90, // seconds
  BASE_SCORE_PER_ANSWER: 10,
};

/**
 * Update player skill rating based on answer correctness and response time
 * - Correct answer: +10 points
 * - Incorrect answer: -5 points
 * - Speed bonus (within 30s and correct): +5 points
 * @param currentSkill - Current skill rating
 * @param isCorrect - Whether the answer was correct
 * @param responseTimeSeconds - Time taken to answer (in seconds)
 * @returns Updated skill rating (never below 0)
 */
export function updateSkillRating(
  currentSkill: number,
  isCorrect: boolean,
  responseTimeSeconds: number
): number {
  let delta = 0;

  if (isCorrect) {
    delta += SCORING.CORRECT_ANSWER;

    // Add speed bonus only if correct and within threshold
    if (responseTimeSeconds <= SCORING.SPEED_THRESHOLD_SECONDS) {
      delta += SCORING.SPEED_BONUS;
    }
  } else {
    delta += SCORING.INCORRECT_ANSWER;
  }

  const newSkill = currentSkill + delta;
  return Math.max(SCORING.MIN_SKILL_RATING, newSkill);
}

/**
 * Update combo multiplier based on answer correctness
 * @param currentCombo - Current combo multiplier
 * @param isCorrect - Whether the answer was correct
 * @returns New combo multiplier
 */
export function updateCombo(currentCombo: number, isCorrect: boolean): number {
  if (isCorrect) {
    return currentCombo + COMBO.INCREMENT;
  }
  return COMBO.RESET_VALUE;
}

/**
 * Calculate score for a single answer in a mini-game
 * @param baseScore - Base points for this answer (usually 10)
 * @param comboMultiplier - Current combo multiplier (1x, 2x, 3x, etc.)
 * @param isCorrect - Whether the answer was correct
 * @returns Points earned for this answer
 */
export function calculateAnswerScore(
  baseScore: number,
  comboMultiplier: number,
  isCorrect: boolean
): number {
  if (!isCorrect) {
    return 0;
  }
  return baseScore * comboMultiplier;
}

/**
 * Calculate accuracy percentage
 * @param correctAnswers - Number of correct answers
 * @param totalAnswers - Total number of answers attempted
 * @returns Accuracy as a percentage (0-100)
 */
export function calculateAccuracy(
  correctAnswers: number,
  totalAnswers: number
): number {
  if (totalAnswers === 0) {
    return 0;
  }
  return Math.round((correctAnswers / totalAnswers) * 100);
}

/**
 * Award gems based on session performance
 * @param accuracy - Accuracy percentage (0-100)
 * @param questionsAnswered - Total questions answered in session
 * @returns Number of gems to award
 */
export function calculateGemsEarned(
  accuracy: number,
  questionsAnswered: number
): number {
  // Base: 1 gem per 5 questions answered
  let gems = Math.floor(questionsAnswered / 5);

  // Bonus for accuracy
  if (accuracy >= 90) {
    gems += 5; // Perfect play
  } else if (accuracy >= 80) {
    gems += 3; // Good play
  } else if (accuracy >= 70) {
    gems += 1; // Average play
  }

  return Math.max(0, gems);
}
