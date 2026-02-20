import React from "react";
import { motion } from "framer-motion";

interface ComboCounterProps {
  combo: number;
  maxCombo: number;
  justIncremented?: boolean;
}

/**
 * ComboCounter Component
 * Displays current combo multiplier with visual feedback
 */
export const ComboCounter: React.FC<ComboCounterProps> = ({
  combo,
  maxCombo,
  justIncremented = false,
}) => {
  return (
    <motion.div
      className="inline-block bg-yellow-400/95 px-6 py-3 rounded-full shadow-lg border-2 border-yellow-600"
      animate={justIncremented ? { scale: [1, 1.2, 1] } : {}}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-2">
        <span className="text-3xl font-bold text-gray-800">{combo}x</span>
        {combo > 1 && <span className="text-2xl">🔥</span>}
      </div>
      {maxCombo > 1 && (
        <div className="text-xs text-gray-800 font-semibold text-center">
          Max: {maxCombo}x
        </div>
      )}
    </motion.div>
  );
};

export default ComboCounter;
