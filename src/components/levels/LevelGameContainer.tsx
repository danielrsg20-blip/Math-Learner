import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LevelSession } from "../../engine/levelSessionEngine";
import { getLevelDefinition } from "../../engine/levelConfig";
import { useLevelsStore } from "../../store/useLevelsStore";
import type { LevelAttemptResult } from "../../types/levels";
import type { AnswerMode } from "../../types/math";
import { ConfettiExplosion } from "../miniGames/CrystalPop/ConfettiExplosion";

interface LevelGameContainerProps {
  levelNumber: number;
  answerMode: AnswerMode;
  onBack: () => void;
}

type Phase = "loading" | "playing" | "finished";

export const LevelGameContainer: React.FC<LevelGameContainerProps> = ({
  levelNumber,
  answerMode,
  onBack,
}) => {
  const level = useMemo(() => getLevelDefinition(levelNumber), [levelNumber]);
  const recordAttempt = useLevelsStore((state) => state.recordAttempt);

  const [phase, setPhase] = useState<Phase>("loading");
  const [session, setSession] = useState<LevelSession | null>(null);
  const [remainingMs, setRemainingMs] = useState(level.timeLimitSeconds * 1000);
  const [result, setResult] = useState<LevelAttemptResult | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [triggerConfetti, setTriggerConfetti] = useState(false);
  const [triggerCompletionConfetti, setTriggerCompletionConfetti] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const confettiTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completionConfettiTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const finalizeSession = useCallback(
    (sessionToEnd: LevelSession) => {
      const finalResult = sessionToEnd.endSession();
      setResult(finalResult);
      recordAttempt(finalResult);

      if (finalResult.passed) {
        setTriggerCompletionConfetti(true);
        if (completionConfettiTimeoutRef.current) {
          clearTimeout(completionConfettiTimeoutRef.current);
        }
        completionConfettiTimeoutRef.current = setTimeout(() => {
          setTriggerCompletionConfetti(false);
        }, 2200);
      }

      setPhase("finished");

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    },
    [recordAttempt]
  );

  useEffect(() => {
    const newSession = new LevelSession(level, answerMode);
    newSession.initialize();
    setSession(newSession);
    setPhase("playing");
    setTypedAnswer("");

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (confettiTimeoutRef.current) {
        clearTimeout(confettiTimeoutRef.current);
      }
      if (completionConfettiTimeoutRef.current) {
        clearTimeout(completionConfettiTimeoutRef.current);
      }
    };
  }, [level, answerMode]);

  useEffect(() => {
    if (!session || phase !== "playing") {
      return;
    }

    intervalRef.current = setInterval(() => {
      const remaining = session.getRemainingMs();
      setRemainingMs(remaining);

      if (remaining <= 0 && !session.hasPassed()) {
        finalizeSession(session);
      }
    }, 100);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [session, phase, finalizeSession]);

  const handleAnswer = useCallback(
    (value: number) => {
      if (!session || phase !== "playing") {
        return;
      }

      const answerResult = session.submitAnswer(value);
      setFeedback(answerResult.isCorrect ? "correct" : "wrong");
      setTypedAnswer("");

      if (answerResult.isCorrect) {
        setTriggerConfetti(true);
        if (confettiTimeoutRef.current) {
          clearTimeout(confettiTimeoutRef.current);
        }
        confettiTimeoutRef.current = setTimeout(() => {
          setTriggerConfetti(false);
        }, 1760);
      }

      setTimeout(() => setFeedback(null), 250);

      if (answerResult.passed) {
        finalizeSession(session);
      }
    },
    [session, phase, finalizeSession]
  );

  const handleNumberSubmit = useCallback(() => {
    if (typedAnswer.trim() === "") {
      return;
    }

    const numericValue = Number(typedAnswer);
    if (!Number.isFinite(numericValue)) {
      return;
    }

    handleAnswer(numericValue);
  }, [typedAnswer, handleAnswer]);

  if (phase === "loading" || !session) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-blue-900 text-white text-2xl font-bold">
        Loading level...
      </div>
    );
  }

  const question = session.getCurrentQuestion();
  const stats = session.getStats();
  const secondsRemaining = Math.ceil(remainingMs / 1000);
  const canUseNumberEntry =
    answerMode === "numberEntry" &&
    typeof question?.correctAnswer === "number" &&
    Number.isFinite(question.correctAnswer);

  return (
    <div className="w-full h-screen bg-gradient-to-b from-blue-700 to-purple-800 p-4 text-white">
      <ConfettiExplosion
        trigger={triggerConfetti}
        originX="50%"
        originY="35%"
      />
      <ConfettiExplosion
        trigger={triggerCompletionConfetti}
        particleCount={48}
        radiusDistance={440}
        fontSizeRem={3.6}
        durationMs={2200}
        originX="50%"
        originY="35%"
      />
      <div className="max-w-4xl mx-auto h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={onBack}
            className="bg-gray-200 hover:bg-gray-300 text-black px-4 py-2 rounded-lg font-semibold"
          >
            Back
          </button>
          <div className="text-xl font-bold">Level {level.levelNumber}</div>
          <div className="text-right">
            <div className="text-sm text-gray-200">Score</div>
            <div className="text-2xl font-bold">{stats.score}</div>
          </div>
        </div>

        <div className="bg-black/20 rounded-xl p-4 mb-4 text-center">
          <div className="text-lg font-semibold">
            {stats.correctAnswers}/{level.requiredCorrectAnswers} correct – {secondsRemaining} seconds remaining
          </div>
          <div className="text-sm text-gray-200 mt-1">Accuracy: {stats.accuracy}%</div>
        </div>

        <div className="bg-white/90 text-gray-900 rounded-xl p-8 text-center mb-4">
          <div className="text-5xl font-bold">{question?.prompt}</div>
        </div>

        {canUseNumberEntry ? (
          <div className="max-w-md mx-auto w-full flex gap-2">
            <input
              type="number"
              inputMode="numeric"
              value={typedAnswer}
              onChange={(event) => setTypedAnswer(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleNumberSubmit();
                }
              }}
              className="flex-1 bg-white text-gray-900 text-2xl font-bold py-4 px-4 rounded-lg"
              placeholder="Type answer"
              disabled={phase !== "playing"}
            />
            <button
              onClick={handleNumberSubmit}
              disabled={phase !== "playing" || typedAnswer.trim() === ""}
              className="bg-blue-500 hover:bg-blue-600 text-black font-bold py-4 px-6 rounded-lg disabled:opacity-50"
            >
              Submit
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 max-w-md mx-auto w-full">
            {question?.multipleChoiceOptions?.map((answer) => (
              <button
                key={`${question.id}-${answer}`}
                onClick={() => handleAnswer(answer)}
                className="bg-white text-gray-900 text-3xl font-bold py-6 rounded-lg hover:bg-blue-100 transition-colors"
              >
                {answer}
              </button>
            ))}
          </div>
        )}

        {feedback && phase === "playing" && (
          <div className={`text-center mt-4 text-lg font-bold ${feedback === "correct" ? "text-green-200" : "text-red-200"}`}>
            {feedback === "correct" ? "Correct!" : "Try the next one!"}
          </div>
        )}

        {phase === "finished" && result && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md space-y-3">
              <h2 className="text-2xl font-bold text-white text-center">
                {result.passed ? "Level Complete!" : "Time Up"}
              </h2>
              <div className="flex justify-center">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                    result.answerMode === "numberEntry"
                      ? "bg-emerald-500/30 text-emerald-200 border-emerald-300/40"
                      : "bg-blue-500/30 text-blue-100 border-blue-300/40"
                  }`}
                >
                  Mode: {result.answerMode === "numberEntry" ? "Number Entry" : "Multiple Choice"}
                </span>
              </div>
              <div className="text-white">
                <div>Score: {result.score}</div>
                <div>Accuracy: {result.accuracy}%</div>
                <div>
                  Progress: {result.correctAnswers}/{level.requiredCorrectAnswers} correct
                </div>
                <div>Completion Time: {Math.ceil(result.completionTimeMs / 1000)}s</div>
              </div>
              <button
                onClick={onBack}
                className="w-full bg-blue-600 hover:bg-blue-700 text-black py-2 rounded-lg font-semibold"
              >
                Back to Levels
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LevelGameContainer;
