import React from "react";
import { CrystalPopGame } from "../components/miniGames/CrystalPop";

/**
 * CrystalPopPage Component
 * Wrapper page for the Crystal Pop mini-game
 */
export const CrystalPopPage: React.FC<{ onExit?: () => void }> = ({
  onExit,
}) => {
  return <CrystalPopGame onExit={onExit} />;
};

export default CrystalPopPage;
