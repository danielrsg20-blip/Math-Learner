import React from "react";
import { motion } from "framer-motion";

interface AnswerButtonProps {
  value: number;
  disabled?: boolean;
  isCorrect?: boolean;
  showResult?: boolean;
  onClick: (value: number) => void;
}

/**
 * AnswerButton Component
 * Interactive button for selecting answers with visual feedback
 */
export const AnswerButton: React.FC<AnswerButtonProps> = ({
  value,
  disabled = false,
  isCorrect,
  showResult = false,
  onClick,
}) => {
  const getBackgroundColor = () => {
    if (showResult) {
      return isCorrect
        ? "bg-green-500 hover:bg-green-600"
        : "bg-red-500 hover:bg-red-600";
    }
    return "bg-gray-700 hover:bg-gray-800";
  };

  const isShaking = showResult && !isCorrect;

  return (
    <motion.button
      className={`
        ${getBackgroundColor()}
        text-black font-bold
        p-8 md:p-10 rounded-lg transition-all
        h-20 md:h-24 w-full flex items-center justify-center
        disabled:opacity-50 disabled:cursor-not-allowed
        shadow-lg active:shadow-md
      `}
      style={{ color: "#000000", fontSize: "4.86rem" }}
      disabled={disabled}
      onClick={() => !disabled && onClick(value)}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      animate={isShaking ? { x: [-5, 5, -5, 5, 0] } : {}}
      transition={
        isShaking
          ? { duration: 0.4, type: "spring" }
          : { type: "spring", stiffness: 300 }
      }
    >
      {value}
      {showResult && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-sm mt-1"
        >
          {isCorrect ? "✓" : "✗"}
        </motion.div>
      )}
    </motion.button>
  );
};

export default AnswerButton;
