import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { MathQuestion } from "../../types/math";
import type { PracticeStats } from "../../engine/practiceModeEngine";
import { PracticeModeSession } from "../../engine/practiceModeEngine";
import { getLevelDefinition } from "../../engine/levelConfig";
import DrawingCanvas from "./DrawingCanvas";

interface PracticeGameProps {
  levelId: number;
  onBack: () => void;
  onComplete: (result: {
    levelId: number;
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    completedAt: string;
  }) => void;
}

export const PracticeGame: React.FC<PracticeGameProps> = ({ levelId, onBack, onComplete }) => {
  const [session] = useState(() => new PracticeModeSession(getLevelDefinition(levelId)));
  const [question, setQuestion] = useState<MathQuestion | null>(null);
  const [answerInput, setAnswerInput] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [stats, setStats] = useState<PracticeStats>({
    score: 0,
    totalAnswered: 0,
    correctAnswers: 0,
    accuracy: 0,
  });
  const [isComplete, setIsComplete] = useState(false);
  const [drawingDirty, setDrawingDirty] = useState(false);

  const refreshState = useCallback(() => {
    setQuestion(session.getCurrentQuestion());
    setStats(session.getStats());
    setIsComplete(session.isCompleted());
  }, [session]);

  useEffect(() => {
    session.initialize();
    refreshState();
  }, [refreshState, session]);

  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (!drawingDirty) {
        return;
      }
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [drawingDirty]);

  const submitAnswer = useCallback(() => {
    if (!question || isComplete) {
      return;
    }

    const numericAnswer = Number(answerInput);
    if (Number.isNaN(numericAnswer)) {
      return;
    }

    const result = session.submitAnswer(numericAnswer);
    setFeedback(result.isCorrect ? "correct" : "incorrect");
    setAnswerInput("");

    refreshState();

    if (result.completed) {
      const latestStats = session.getStats();
      onComplete({
        levelId,
        score: latestStats.score,
        totalQuestions: latestStats.totalAnswered,
        correctAnswers: latestStats.correctAnswers,
        completedAt: new Date().toISOString(),
      });
    }
  }, [answerInput, isComplete, levelId, onComplete, question, refreshState, session]);

  const accuracyText = useMemo(() => `${stats.accuracy.toFixed(1)}%`, [stats.accuracy]);

  if (!question) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-100 to-cyan-200 flex items-center justify-center">
        <div className="text-black text-xl font-bold">Loading practice question…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-100 to-cyan-200 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-lg bg-white/80 hover:bg-white text-black font-semibold"
          >
            ← Exit Practice
          </button>
          <div className="text-black font-bold text-xl">Level {levelId} Practice</div>
          <div className="text-black font-semibold">Accuracy: {accuracyText}</div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-md">
          <div className="flex flex-wrap gap-4 text-black font-semibold mb-4">
            <span>Score: {stats.score}</span>
            <span>Answered: {stats.totalAnswered}</span>
            <span>Correct: {stats.correctAnswers}</span>
          </div>

          <div className="text-3xl font-bold text-black text-center mb-4">{question.prompt}</div>

          <div className="flex gap-2 max-w-md mx-auto mb-3">
            <input
              type="number"
              value={answerInput}
              onChange={(event) => setAnswerInput(event.target.value)}
              className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:border-teal-500 text-black"
              placeholder="Type your answer"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  submitAnswer();
                }
              }}
            />
            <button
              onClick={submitAnswer}
              className="px-5 py-3 rounded-lg bg-teal-500 hover:bg-teal-600 text-black font-bold"
            >
              Check
            </button>
          </div>

          {feedback && (
            <div className={`text-center font-bold mb-2 ${feedback === "correct" ? "text-green-700" : "text-red-700"}`}>
              {feedback === "correct" ? "Correct!" : "Not quite, keep going!"}
            </div>
          )}

          <DrawingCanvas onDirtyChange={setDrawingDirty} />

          <p className="mt-3 text-sm text-black/70 text-center">
            Practice progress is saved by level unlocks and completion accuracy. Drawings are temporary and clear when you leave.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PracticeGame;
