import { useEffect, useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { CrystalPopSession } from "../../../engine/crystalPopEngine";
import { usePlayerStore } from "../../../store/usePlayerStore";
import type { AnswerMode, MathQuestion } from "../../../types/math";
import type { CrystalPopSessionResult } from "../../../types/player";
import { ComboCounter } from "./ComboCounter";
import { SessionTimer } from "./SessionTimer";
import { AnswerButton } from "./AnswerButton";
import { QuestionDisplay } from "./QuestionDisplay";
import { ResultsScreen } from "./ResultsScreen";
import { ConfettiExplosion } from "./ConfettiExplosion";

type GameState = "initializing" | "playing" | "finished";

interface DisplayFeedback {
  questionId: string;
  isCorrect: boolean;
  expiresAt: number;
}

/**
 * CrystalPopGame Component
 * Main container for the 90-second Crystal Pop arcade mini-game
 */
export const CrystalPopGame: React.FC<{ onExit?: () => void; answerMode?: AnswerMode }> = ({
  answerMode = "multipleChoice",
  onExit,
}) => {
  const playerStore = usePlayerStore();

  // Game state
  const [gameState, setGameState] = useState<GameState>("initializing");
  const [session, setSession] = useState<CrystalPopSession | null>(null);
  const [result, setResult] = useState<CrystalPopSessionResult | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<MathQuestion | null>(
    null
  );
  const [timeRemaining, setTimeRemaining] = useState(90000);
  const [displayStats, setDisplayStats] = useState({
    score: 0,
    combo: "1x",
    questionsAnswered: 0,
    accuracy: 0,
    timeRemainingSec: 90,
  });

  // Feedback visibility tracking
  const [feedback, setFeedback] = useState<DisplayFeedback | null>(null);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [triggerConfetti, setTriggerConfetti] = useState(false);
  const timerInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const feedbackTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skillDeltaRef = useRef(0);

  // Initialize session on mount
  useEffect(() => {
    const newSession = new CrystalPopSession(
      playerStore.getAdaptiveDifficulty(),
      answerMode
    );
    newSession.initialize();
    setSession(newSession);
    setCurrentQuestion(newSession.getCurrentQuestion());
    setGameState("playing");

    return () => {
      if (timerInterval.current) clearInterval(timerInterval.current);
      if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);
    };
  }, [playerStore, answerMode]);

  // Timer loop - update every 100ms
  useEffect(() => {
    if (gameState !== "playing" || !session) return;

    timerInterval.current = setInterval(() => {
      const remaining = session.getTimeRemaining();
      setTimeRemaining(remaining);
      setDisplayStats(session.getDisplayStats());

      if (remaining <= 0) {
        handleSessionEnd(session);
      }
    }, 100);

    return () => {
      if (timerInterval.current) clearInterval(timerInterval.current);
    };
  }, [gameState, session]);

  /**
   * Handle session expiration
   */
  const handleSessionEnd = useCallback(
    (sessionToEnd: CrystalPopSession) => {
      if (gameState !== "playing") return;

      // Finalize session and get result
      const gameResult = sessionToEnd.endSession();
      setResult(gameResult);

      // Calculate skill delta based on performance
      const accuracy = gameResult.accuracy;
      const questionsCorrect = gameResult.correctAnswers;
      
      // Skill adjustment: +10 per correct, -5 per incorrect
      const skillDelta = questionsCorrect * 10 - 
                        (gameResult.questionsAnswered - questionsCorrect) * 5;
      
      skillDeltaRef.current = skillDelta;

      setGameState("finished");

      // Clear timer
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    },
    [gameState]
  );

  /**
   * Handle answer submission
   */
  const handleAnswerSubmit = useCallback(
    (answer: number) => {
      if (!session || gameState !== "playing" || !currentQuestion) return;

      // Record answer timing
      const startTime = Date.now();
      const responseTime = startTime - (startTime - 100); // Approximate response time
      
      const result = session.submitAnswer(answer, responseTime);

      setTypedAnswer("");

      // Show feedback briefly
      setFeedback({
        questionId: currentQuestion.id,
        isCorrect: result.isCorrect,
        expiresAt: Date.now() + 400, // Show for 400ms
      });

      // Trigger confetti if correct
      if (result.isCorrect) {
        setTriggerConfetti(true);
        setTimeout(() => setTriggerConfetti(false), 1760);
      }

      if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);

      // Generate next question after brief delay
      feedbackTimeout.current = setTimeout(() => {
        if (!session.isExpired()) {
          const nextQuestion = session.generateNextQuestion();
          setCurrentQuestion(nextQuestion);
          setFeedback(null);
        } else {
          handleSessionEnd(session);
        }
      }, 400);

      // Update display stats
      setDisplayStats(session.getDisplayStats());
    },
    [session, gameState, currentQuestion, handleSessionEnd]
  );

  const handleNumberSubmit = useCallback(() => {
    if (typedAnswer.trim() === "") {
      return;
    }

    const parsed = Number(typedAnswer);
    if (!Number.isFinite(parsed)) {
      return;
    }

    handleAnswerSubmit(parsed);
  }, [typedAnswer, handleAnswerSubmit]);

  /**
   * Handle play again - restart game
   */
  const handlePlayAgain = useCallback(() => {
    const newSession = new CrystalPopSession(
      playerStore.getAdaptiveDifficulty(),
      answerMode
    );
    newSession.initialize();
    setSession(newSession);
    setCurrentQuestion(newSession.getCurrentQuestion());
    setResult(null);
    setGameState("playing");
    setTimeRemaining(90000);
    setFeedback(null);
    setTypedAnswer("");
    skillDeltaRef.current = 0;
  }, [playerStore, answerMode]);

  /**
   * Handle return to home
   */
  const handleReturn = useCallback(() => {
    // Update player stats before returning
    if (result) {
      playerStore.updateSkill(skillDeltaRef.current);
      playerStore.addGems(result.gemsEarned);

      // Track questions answered
      for (let i = 0; i < result.questionsAnswered; i++) {
        playerStore.recordAnswer(
          i < result.correctAnswers ? true : false
        );
      }
    }

    onExit?.();
  }, [result, playerStore, onExit]);

  if (gameState === "initializing" || !session) {
    return (
      <div className="w-full h-screen bg-gradient-to-b from-blue-600 to-blue-800 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-4xl font-bold mb-4">Crystal Pop</div>
          <div className="text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="w-full h-screen flex flex-col p-4 md:p-6 relative"
      style={{
        backgroundImage: `url("/candy-shop-bg.png")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="absolute inset-0 bg-white/50 pointer-events-none" />
      <div className="relative z-10 w-full h-full flex flex-col">
        <ConfettiExplosion trigger={triggerConfetti} />
      {/* Header - Score and Combo */}
      <div className="flex justify-between items-center mb-6">
        <motion.div className="text-white bg-white/40 backdrop-blur-sm rounded-lg px-4 py-2">
          <div className="text-3xl font-bold text-gray-800">{displayStats.score}</div>
          <div className="text-sm text-gray-700 font-semibold">Score</div>
        </motion.div>

        <ComboCounter
          combo={parseInt(displayStats.combo.replace("x", ""))}
          maxCombo={parseInt(displayStats.combo.replace("x", "")) + 2}
          justIncremented={
            feedback?.isCorrect && feedback.questionId === currentQuestion?.id
          }
        />

        <motion.div className="text-white text-right bg-white/40 backdrop-blur-sm rounded-lg px-4 py-2">
          <div className="text-3xl font-bold text-gray-800">{displayStats.questionsAnswered}</div>
          <div className="text-sm text-gray-700 font-semibold">Questions</div>
        </motion.div>
      </div>

      {/* Timer */}
      <div className="flex justify-center mb-8">
        <div className="bg-white/85 backdrop-blur-sm rounded-xl px-8 py-4 shadow-lg">
          <SessionTimer
            timeRemainingMs={timeRemaining}
            onExpire={() => handleSessionEnd(session)}
          />
        </div>
      </div>

      {/* Question Display */}
      <div className="flex-1 flex items-center justify-center mb-8">
        <div className="bg-white/85 backdrop-blur-sm rounded-xl px-8 py-6 shadow-lg">
          <QuestionDisplay question={currentQuestion} />
        </div>
      </div>

      {answerMode === "numberEntry" && Number.isFinite(currentQuestion?.correctAnswer ?? NaN) ? (
        <div className="max-w-[420px] mx-auto w-full flex gap-2 mb-6">
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
            className="flex-1 bg-white text-gray-900 text-3xl font-bold py-4 px-4 rounded-lg"
            placeholder="Type answer"
            disabled={gameState !== "playing" || !!feedback}
          />
          <button
            onClick={handleNumberSubmit}
            disabled={gameState !== "playing" || !!feedback || typedAnswer.trim() === ""}
            className="bg-blue-500 hover:bg-blue-600 text-black font-bold py-4 px-6 rounded-lg disabled:opacity-50"
          >
            Submit
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6 max-w-[400px] mx-auto w-full">
          {currentQuestion?.multipleChoiceOptions?.map((answer) => (
            <motion.div
              key={answer}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring" }}
            >
              <AnswerButton
                value={answer}
                disabled={gameState !== "playing" || !!feedback}
                isCorrect={answer === currentQuestion.correctAnswer}
                showResult={
                  feedback?.questionId === currentQuestion.id &&
                  answer === currentQuestion.correctAnswer
                }
                onClick={handleAnswerSubmit}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Results Screen - shown on finish */}
      {gameState === "finished" && result && (
        <ResultsScreen
          result={result}
          answerMode={answerMode}
          skillDelta={skillDeltaRef.current}
          onPlayAgain={handlePlayAgain}
          onReturn={handleReturn}
        />
      )}
      </div>
    </div>
  );
};

export default CrystalPopGame;
