import React, { useEffect, useState } from "react";

interface ConfettiExplosionProps {
  trigger: boolean;
  particleCount?: number;
  radiusDistance?: number;
  fontSizeRem?: number;
  durationMs?: number;
  originX?: string;
  originY?: string;
}

interface CandyParticle {
  id: number;
  emoji: string;
  endX: number;
  endY: number;
  delay: number;
}

/**
 * ConfettiExplosion Component
 * Displays candy emoji particles radiating from center when triggered
 */
export const ConfettiExplosion: React.FC<ConfettiExplosionProps> = ({
  trigger,
  particleCount = 20,
  radiusDistance = 320,
  fontSizeRem = 3,
  durationMs = 1680,
  originX = "50%",
  originY = "50%",
}) => {
  const [candyParticles, setCandyParticles] = useState<CandyParticle[]>([]);
  const candyEmojis = ["🍬", "🍭", "🍫", "🍩", "🧁", "🍰", "🎈"];

  useEffect(() => {
    if (!trigger) return;

    // Create candy emoji particles radiating from center
    const particles: CandyParticle[] = [];
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (360 / particleCount) * i;
      const radian = (angle * Math.PI) / 180;
      const endX = Math.cos(radian) * radiusDistance;
      const endY = Math.sin(radian) * radiusDistance;
      
      particles.push({
        id: i,
        emoji: candyEmojis[Math.floor(Math.random() * candyEmojis.length)],
        endX,
        endY,
        delay: Math.random() * 0.05,
      });
    }
    setCandyParticles(particles);

    // Clear candies after animation completes
    const timer = setTimeout(() => {
      setCandyParticles([]);
    }, durationMs);

    return () => clearTimeout(timer);
  }, [trigger]);

  if (candyParticles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 999 }}>
      {candyParticles.map((particle) => (
        <div
          key={particle.id}
          className="absolute select-none"
          style={{
            left: originX,
            top: originY,
            transform: "translate(-50%, -50%)",
            animation: `burst-out ${durationMs / 1000}s ease-out forwards`,
            animationDelay: `${particle.delay}s`,
            fontSize: `${fontSizeRem}rem`,
            "--tx": `${particle.endX}px`,
            "--ty": `${particle.endY}px`,
          } as React.CSSProperties & { "--tx": string; "--ty": string }}
        >
          {particle.emoji}
        </div>
      ))}

      <style>{`
        @keyframes burst-out {
          from {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          to {
            opacity: 0;
            transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(0.2);
          }
        }
      `}</style>
    </div>
  );
};

export default ConfettiExplosion;
