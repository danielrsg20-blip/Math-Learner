import { useState } from "react";
import { CrystalPopGame } from "./components/miniGames/CrystalPop";
import { LevelGameContainer, LevelSelectGrid } from "./components/levels";

/**
 * Main App Component
 * Entry point for the Math Island Rescue application
 */
function App() {
  const [currentPage, setCurrentPage] = useState<
    "home" | "crystal-pop" | "levels" | "level-play"
  >("home");
  const [selectedLevel, setSelectedLevel] = useState(1);

  return (
    <div className="w-full h-screen">
      {currentPage === "crystal-pop" && (
        <CrystalPopGame
          onExit={() => {
            setCurrentPage("home");
          }}
        />
      )}

      {currentPage === "levels" && (
        <div className="w-full h-screen bg-gradient-to-b from-purple-700 to-blue-800 overflow-y-auto">
          <div className="min-h-full flex flex-col items-center p-6 gap-6">
            <h1 className="text-4xl font-bold text-white">Select a Level</h1>
            <LevelSelectGrid
              onStartLevel={(levelNumber) => {
                setSelectedLevel(levelNumber);
                setCurrentPage("level-play");
              }}
            />
            <button
              onClick={() => setCurrentPage("home")}
              className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-3 px-6 rounded-lg"
            >
              Back Home
            </button>
          </div>
        </div>
      )}

      {currentPage === "level-play" && (
        <LevelGameContainer
          levelNumber={selectedLevel}
          onBack={() => setCurrentPage("levels")}
        />
      )}

      {currentPage === "home" && (
        <div className="w-full h-screen bg-gradient-to-b from-purple-600 to-blue-600 flex flex-col items-center justify-center gap-8">
          <h1 className="text-5xl font-bold text-white">
            🏝️ Math Island Rescue
          </h1>
          <button
            onClick={() => setCurrentPage("levels")}
            className="bg-green-500 hover:bg-green-600 text-black font-bold py-4 px-8 rounded-lg text-2xl transition-colors"
          >
            Play Levels
          </button>
          <button
            onClick={() => setCurrentPage("crystal-pop")}
            className="bg-blue-500 hover:bg-blue-600 text-black font-bold py-4 px-8 rounded-lg text-2xl transition-colors"
          >
            Play Crystal Pop
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
