/**
 * Game Session Store
 * Zustand store for active gameplay session state
 * Resets on page reload (not persisted)
 */

import { create } from "zustand";
import type { GameSessionState, MiniGameSession } from "../types/player";
import type { MathQuestion, DifficultyTier, Operation } from "../types/math";
import {
  generateQuestion,
} from "../engine/mathGenerator";
import {
  updateSkillRating,
  updateCombo,
  calculateAnswerScore,
  calculateAccuracy,
} from "../engine/scoringSystem";

interface GameStore extends MiniGameSession {
  currentQuestion: MathQuestion | null;
  getMathQuestion: (operation: Operation, difficulty: DifficultyTier) => void;
  recordAnswer: (userAnswer: number, isCorrect: boolean, responseTime: number) => void;
  startNewSession: (miniGameName: string) => void;
  endSession: () => void;
  getComboDisplay: () => string;
  getSessionStats: () => {
    questionsAnswered: number;
    correctAnswers: number;
    accuracy: number;
    currentScore: number;
    currentCombo: string;
  };
}

const INITIAL_SESSION: MiniGameSession = {
  miniGameName: "",
  currentQuestionId: null,
  score: 0,
  comboMultiplier: 1,
  questionsAnsweredThisSession: 0,
  correctAnswersThisSession: 0,
  accuracy: 0,
  sessionStartTime: 0,
  sessionDuration: 0,
  gemsEarned: 0,
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...INITIAL_SESSION,
  currentQuestion: null,

  getMathQuestion: (operation: Operation, difficulty: DifficultyTier) => {
    const question = generateQuestion(operation, difficulty, false);
    set({
      currentQuestion: question,
      currentQuestionId: question.id,
    });
  },

  recordAnswer: (userAnswer: number, isCorrect: boolean, responseTime: number) => {
    const state = get();

    // Update question stats
    const newQuestionsAnswered = state.questionsAnsweredThisSession + 1;
    const newCorrectAnswers = isCorrect
      ? state.correctAnswersThisSession + 1
      : state.correctAnswersThisSession;

    // Update combo multiplier
    const newComboMultiplier = updateCombo(state.comboMultiplier, isCorrect);

    // Calculate points earned this turn
    const pointsEarned = calculateAnswerScore(
      10,
      state.comboMultiplier,
      isCorrect
    );

    // Calculate new accuracy
    const newAccuracy = calculateAccuracy(newCorrectAnswers, newQuestionsAnswered);

    set({
      questionsAnsweredThisSession: newQuestionsAnswered,
      correctAnswersThisSession: newCorrectAnswers,
      comboMultiplier: newComboMultiplier,
      accuracy: newAccuracy,
      score: state.score + pointsEarned,
    });
  },

  startNewSession: (miniGameName: string) => {
    set({
      ...INITIAL_SESSION,
      miniGameName,
      sessionStartTime: Date.now(),
    });
  },

  endSession: () => {
    const state = get();
    set({
      sessionDuration: Date.now() - state.sessionStartTime,
    });
  },

  getComboDisplay: () => {
    const { comboMultiplier } = get();
    if (comboMultiplier === 1) {
      return "1x";
    }
    return `${comboMultiplier}x`;
  },

  getSessionStats: () => {
    const {
      questionsAnsweredThisSession,
      correctAnswersThisSession,
      accuracy,
      score,
      comboMultiplier,
    } = get();

    return {
      questionsAnswered: questionsAnsweredThisSession,
      correctAnswers: correctAnswersThisSession,
      accuracy,
      currentScore: score,
      currentCombo: `${comboMultiplier}x`,
    };
  },
}));
