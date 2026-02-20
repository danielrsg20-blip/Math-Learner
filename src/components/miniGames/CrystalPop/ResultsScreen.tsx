import React from "react";
import { motion } from "framer-motion";
import type { CrystalPopSessionResult } from "../../../types/player";
import type { AnswerMode } from "../../../types/math";

interface ResultsScreenProps {
  result: CrystalPopSessionResult;
  answerMode: AnswerMode;
  skillDelta: number;
  onPlayAgain: () => void;
  onReturn: () => void;
}

/**
 * ResultsScreen Component
 * Displays end-of-session summary with stats and rewards
 */
export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  result,
  answerMode,
  skillDelta,
  onPlayAgain,
  onReturn,
}) => {
  const modeLabel =
    answerMode === "numberEntry" ? "Number Entry" : "Multiple Choice";
  const modeBadgeClass =
    answerMode === "numberEntry"
      ? "bg-emerald-500/30 text-emerald-200 border border-emerald-300/40"
      : "bg-blue-500/30 text-blue-100 border border-blue-300/40";

  const statsVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1 },
    }),
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="bg-gray-800 rounded-2xl p-8 max-w-md w-full space-y-6"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
      >
        {/* Title */}
        <motion.div
          className="text-center"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-4xl font-bold text-white mb-2">
            {result.accuracy >= 80 ? "🎉 Excellent!" : "Good Job!"}
          </h2>
          <p className="text-gray-300">Session Complete</p>
          <div className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${modeBadgeClass}`}>
            Mode: {modeLabel}
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Score", value: result.finalScore.toString(), icon: "⭐" },
            { label: "Accuracy", value: `${result.accuracy}%`, icon: "🎯" },
            { label: "Gems", value: result.gemsEarned.toString(), icon: "💎" },
            { label: "Max Combo", value: `${result.maxCombo}x`, icon: "🔥" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              className="bg-gray-700 rounded-lg p-4 text-center"
              custom={i}
              variants={statsVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Skill Delta */}
        {skillDelta !== 0 && (
          <motion.div
            className={`text-center p-3 rounded-lg ${
              skillDelta > 0
                ? "bg-green-500/20 text-green-300"
                : "bg-red-500/20 text-red-300"
            }`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
          >
            <div className="font-bold">
              Skill Rating {skillDelta > 0 ? "+" : ""}{skillDelta}
            </div>
          </motion.div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <motion.button
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-black font-bold py-3 rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onPlayAgain}
          >
            Play Again
          </motion.button>
          <motion.button
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-black font-bold py-3 rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onReturn}
          >
            Home
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ResultsScreen;
