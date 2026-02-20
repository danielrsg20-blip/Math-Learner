import React, { useEffect, useState } from "react";

interface SessionTimerProps {
  timeRemainingMs: number;
  onExpire?: () => void;
}

/**
 * SessionTimer Component
 * Displays countdown timer with color changes based on time remaining
 */
export const SessionTimer: React.FC<SessionTimerProps> = ({
  timeRemainingMs,
  onExpire,
}) => {
  const [displayTime, setDisplayTime] = useState<string>("1:30");
  const [colorClass, setColorClass] = useState<string>("text-green-600");

  useEffect(() => {
    const seconds = Math.ceil(timeRemainingMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const displaySeconds = seconds % 60;

    setDisplayTime(`${minutes}:${displaySeconds.toString().padStart(2, "0")}`);

    // Update color based on time remaining
    if (seconds <= 0) {
      setColorClass("text-red-600");
      onExpire?.();
    } else if (seconds <= 10) {
      setColorClass("text-red-500");
    } else if (seconds <= 30) {
      setColorClass("text-yellow-600");
    } else {
      setColorClass("text-green-600");
    }
  }, [timeRemainingMs, onExpire]);

  const isWarning = timeRemainingMs <= 10000;

  return (
    <div className="text-center">
      <div className={`text-5xl md:text-6xl font-bold font-mono ${colorClass}`}>
        {displayTime}
      </div>
      {isWarning && (
        <div className="text-sm text-red-600 font-semibold mt-2 animate-pulse">
          ⏱️ Time Running Out!
        </div>
      )}
    </div>
  );
};

export default SessionTimer;
