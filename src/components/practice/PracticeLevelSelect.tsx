import React from "react";
import { LEVEL_DEFINITIONS } from "../../engine/levelConfig";

interface PracticeLevelSelectProps {
  unlockedLevels: number;
  onSelectLevel: (levelId: number) => void;
  onBack: () => void;
}

export const PracticeLevelSelect: React.FC<PracticeLevelSelectProps> = ({
  unlockedLevels,
  onSelectLevel,
  onBack,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-100 to-cyan-200 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-lg bg-white/80 hover:bg-white text-black font-semibold"
          >
            ← Back
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-black">Practice Mode</h1>
          <div className="w-20" />
        </div>

        <div className="bg-white/85 rounded-xl p-4 sm:p-6">
          <p className="text-black font-medium mb-4">
            No timer. Number-entry only. Pick any unlocked level to practice.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {LEVEL_DEFINITIONS.map((definition) => {
              const locked = definition.levelNumber > unlockedLevels;
              return (
                <button
                  key={definition.id}
                  onClick={() => !locked && onSelectLevel(definition.levelNumber)}
                  disabled={locked}
                  className={`rounded-xl p-3 text-left border-2 transition ${
                    locked
                      ? "bg-gray-200 border-gray-300 opacity-60 cursor-not-allowed"
                      : "bg-white border-teal-300 hover:border-teal-500"
                  }`}
                >
                  <div className="text-lg font-bold text-black">Level {definition.levelNumber}</div>
                  <div className="text-sm text-black/80">{definition.requiredCorrectAnswers} correct</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeLevelSelect;
