import React from "react";
import { LEVEL_DEFINITIONS } from "../../engine/levelConfig";
import { useLevelsStore } from "../../store/useLevelsStore";

interface LevelSelectGridProps {
  onStartLevel: (levelNumber: number) => void;
}

export const LevelSelectGrid: React.FC<LevelSelectGridProps> = ({
  onStartLevel,
}) => {
  const { progressByLevel, isLevelUnlocked } = useLevelsStore();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-5xl">
      {LEVEL_DEFINITIONS.map((level) => {
        const progress = progressByLevel[level.levelNumber];
        const locked = !isLevelUnlocked(level.levelNumber);
        const completed = progress?.status === "completed";

        return (
          <div
            key={level.id}
            className={`rounded-xl p-4 border-2 shadow-md ${
              locked
                ? "bg-gray-700/70 border-gray-500"
                : completed
                ? "bg-green-600/20 border-green-400"
                : "bg-blue-600/20 border-blue-400"
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-xl font-bold text-white">Level {level.levelNumber}</h3>
              {locked && <span className="text-sm text-gray-200">🔒 Locked</span>}
              {completed && <span className="text-sm text-green-300">✅ Complete</span>}
            </div>

            <div className="text-sm text-gray-100 mb-1">
              Grades: {level.gradeTags.join(" + ")}
            </div>
            <div className="text-sm text-gray-100 mb-1">
              Goal: {level.requiredCorrectAnswers} correct
            </div>
            <div className="text-sm text-gray-100 mb-3">
              Time: {level.timeLimitSeconds}s
            </div>

            {completed && (
              <div className="bg-black/20 rounded p-2 mb-3 text-sm text-white">
                <div>High Score: {progress.bestScore}</div>
                <div>Best Accuracy: {progress.bestAccuracy}%</div>
                <div>
                  Best Time: {progress.bestCompletionTimeMs ? `${Math.ceil(progress.bestCompletionTimeMs / 1000)}s` : "--"}
                </div>
              </div>
            )}

            <button
              className={`w-full font-bold py-2 rounded-lg transition-colors ${
                locked
                  ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
              disabled={locked}
              onClick={() => onStartLevel(level.levelNumber)}
            >
              {completed ? "Replay" : "Start"}
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default LevelSelectGrid;
