/**
 * Math Question Generator
 * Generates contextually appropriate math questions based on difficulty tier
 */

import {
  DifficultyTier,
  type GradeTag,
  type MathQuestion,
  type Operation,
} from "../types/math";
import { getNumberRange } from "./difficultyEngine";

interface GenerateQuestionOptions {
  gradeTag?: GradeTag;
}

/**
 * Generate a unique ID for a question
 */
function generateId(): string {
  return `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate a random integer between min (inclusive) and max (inclusive)
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate 3 plausible distractor options for multiple choice
 * Distractors are intentionally close to the correct answer for educational value
 */
function generateDistractors(
  correctAnswer: number,
  count: number = 3
): number[] {
  const distractors: Set<number> = new Set();

  // Generate distractors within a reasonable range of the correct answer
  const range = Math.max(5, Math.abs(correctAnswer) * 0.5);
  const minDistractor = Math.max(0, correctAnswer - range);
  const maxDistractor = correctAnswer + range;

  while (distractors.size < count) {
    // Avoid the correct answer and negative numbers
    let distractor = randomInt(
      Math.ceil(minDistractor),
      Math.ceil(maxDistractor)
    );
    if (distractor !== correctAnswer && distractor >= 0) {
      distractors.add(distractor);
    }
  }

  return Array.from(distractors);
}

/**
 * Format a math question as a readable prompt
 */
function formatPrompt(
  operation: Operation,
  operand1: number,
  operand2: number
): string {
  const symbols: Record<Operation, string> = {
    addition: "+",
    subtraction: "−", // Unicode minus for clarity
    multiplication: "×",
  };

  return `${operand1} ${symbols[operation]} ${operand2} = ?`;
}

function getDefaultGradeFromDifficulty(difficulty: DifficultyTier): GradeTag {
  if (difficulty === DifficultyTier.VeryEasy) {
    return "grade1";
  }
  if (difficulty === DifficultyTier.Easy) {
    return "grade2";
  }
  if (difficulty === DifficultyTier.Medium) {
    return "grade3";
  }
  return "grade4";
}

/**
 * Generate a math question for the given operation and difficulty
 * @param operation - Type of math operation (addition, subtraction, multiplication)
 * @param difficulty - Current difficulty tier
 * @param includeMultipleChoice - If true, include 4 multiple choice options
 * @returns Generated MathQuestion with prompt and answer options
 */
export function generateQuestion(
  operation: Operation,
  difficulty: DifficultyTier,
  includeMultipleChoice: boolean = false,
  options: GenerateQuestionOptions = {}
): MathQuestion {
  const numberRange = getNumberRange(difficulty);
  const { min, max } = numberRange;
  const gradeTag = options.gradeTag ?? getDefaultGradeFromDifficulty(difficulty);

  let operand1: number;
  let operand2: number;
  let correctAnswer: number;

  // Generate operands based on operation type
  if (operation === "addition") {
    operand1 = randomInt(min, max);
    operand2 = randomInt(min, max);
    correctAnswer = operand1 + operand2;
  } else if (operation === "subtraction") {
    // Ensure non-negative result: operand1 >= operand2
    operand1 = randomInt(min, max);
    operand2 = randomInt(min, operand1); // operand2 <= operand1
    correctAnswer = operand1 - operand2;
  } else if (operation === "multiplication") {
    // For multiplication, keep result reasonable
    // Adjust max for operand2 to prevent huge numbers
    const operand2Max = difficulty === DifficultyTier.Hard ? 12 : max;
    operand1 = randomInt(min, max);
    operand2 = randomInt(min, Math.min(operand2Max, max));
    correctAnswer = operand1 * operand2;
  } else {
    throw new Error(`Unknown operation: ${operation}`);
  }

  const prompt = formatPrompt(operation, operand1, operand2);

  // Generate multiple choice options if requested
  let multipleChoiceOptions: number[] | undefined;
  if (includeMultipleChoice) {
    const distractors = generateDistractors(correctAnswer, 3);
    multipleChoiceOptions = [
      correctAnswer,
      ...distractors,
    ].sort(() => Math.random() - 0.5); // Shuffle
  }

  return {
    id: generateId(),
    operation,
    gradeTag,
    operand1,
    operand2,
    correctAnswer,
    prompt,
    multipleChoiceOptions,
    difficulty,
  };
}

/**
 * Generate multiple questions at once
 * @param operation - Type of operation
 * @param difficulty - Difficulty tier
 * @param count - Number of questions to generate
 * @param includeMultipleChoice - Whether to include multiple choice options
 * @returns Array of generated MathQuestions
 */
export function generateQuestions(
  operation: Operation,
  difficulty: DifficultyTier,
  count: number = 1,
  includeMultipleChoice: boolean = false
): MathQuestion[] {
  const questions: MathQuestion[] = [];
  for (let i = 0; i < count; i++) {
    questions.push(generateQuestion(operation, difficulty, includeMultipleChoice));
  }
  return questions;
}
