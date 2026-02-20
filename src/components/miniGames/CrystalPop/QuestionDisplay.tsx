import React from "react";
import type { MathQuestion } from "../../../types/math";

interface QuestionDisplayProps {
  question: MathQuestion | null;
  isAnswered?: boolean;
}

/**
 * QuestionDisplay Component
 * Shows the current math question with large readable text
 */
export const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  question,
  isAnswered = false,
}) => {
  if (!question) {
    return (
      <div className="text-center text-gray-500">
        Loading question...
      </div>
    );
  }

  return (
    <div className="text-center space-y-4">
      <div className="text-6xl md:text-7xl font-bold text-gray-800 font-mono">
        {question.prompt}
      </div>
      <div className="text-lg md:text-xl text-gray-600">
        {!isAnswered && "Choose the correct answer:"}
      </div>
    </div>
  );
};

export default QuestionDisplay;
