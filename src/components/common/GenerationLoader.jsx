
import React, { useState, useEffect } from "react";

const phaseTexts = {
  analyzing: [
    "מפענח את הקוד הוויראלי...",
    "לומד מה גורם למיליוני צפיות...",
    "מזקק את נוסחת ההצלחה...",
    "מוצא את נקודות התורפה של האלגוריתם..."
  ],
  generating: [
    "רוקם פיקסלים ליצירת מופת...",
    "מזמן את מוזת הקריאייטיב...",
    "הופך רעיון למציאות ויראלית...",
    "מצייר עם בינה מלאכותית..."
  ],
};

export default function GenerationLoader({ phase }) {
  const [progress, setProgress] = useState(0);
  const [dynamicSubtext, setDynamicSubtext] = useState("");

  const phases = {
    analyzing: {
      label: "מנתח אסטרטגיה ויראלית...",
      subtext: "ה-AI בודק מה גורם לאנשים להקליק ומתאים את זה לסרטון שלך",
      targetProgress: 65
    },
    generating: {
      label: "ה-AI יוצר את התמונה שלך...",
      subtext: "זה יכול לקחת בין 30 ל-60 שניות. הקסם קורה עכשיו!",
      targetProgress: 90
    },
  };

  const current = phases[phase] || phases.generating;
  const texts = phaseTexts[phase] || phaseTexts.generating;

  useEffect(() => {
    setDynamicSubtext(texts[0]);
    let index = 0;
    const textInterval = setInterval(() => {
      index = (index + 1) % texts.length;
      setDynamicSubtext(texts[index]);
    }, 2500);

    return () => clearInterval(textInterval);
  }, [phase, texts]);

  useEffect(() => {
    let animationFrameId;
    let lastUpdate = 0;
    const updateInterval = 100; // ms

    const animateProgress = (timestamp) => {
      if (timestamp - lastUpdate > updateInterval) {
        lastUpdate = timestamp;
        setProgress(prev => {
          if (prev >= 99) {
            cancelAnimationFrame(animationFrameId);
            return 99;
          }

          let increment;
          if (prev < current.targetProgress) {
            const remaining = current.targetProgress - prev;
            // Slower, less erratic progress towards the target
            increment = Math.max(0.5, remaining * 0.05 + Math.random());
          } else {
            const remaining = 99 - prev;
            // Slower, consistent crawl towards 99
            increment = Math.max(0.1, remaining * 0.02);
          }
          // Ensure progress is always increasing and doesn't exceed 99
          return Math.min(99, prev + increment);
        });
      }
      animationFrameId = requestAnimationFrame(animateProgress);
    };

    animationFrameId = requestAnimationFrame(animateProgress);

    return () => cancelAnimationFrame(animationFrameId);
  }, [current.targetProgress]);

  return (
    <div className="flex flex-col items-center justify-center gap-8 text-center p-8">
      {/* Custom Creative Loader with Progress */}
      <div className="relative w-32 h-32">
        {/* Outer rotating ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-500 via-teal-400 to-purple-600 p-1 animate-spin" style={{ animationDuration: "3s" }}>
          <div className="w-full h-full rounded-full bg-black/60" />
        </div>
        
        {/* Progress circle */}
        <div className="absolute inset-1 rounded-full">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="52"
              stroke="rgba(148, 163, 184, 0.2)"
              strokeWidth="3"
              fill="none"
            />
            <circle
              cx="60"
              cy="60"
              r="52"
              stroke="url(#progressGradient)"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 52}`}
              strokeDashoffset={`${2 * Math.PI * 52 * (1 - progress / 100)}`}
              className="transition-all duration-300 ease-linear"
            />
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#14B8A6" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        
        {/* Progress number in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-white drop-shadow-lg hebrew-font tabular-nums">
            {Math.floor(progress)}%
          </span>
        </div>
        
        {/* Middle pulsing circle */}
        <div className="absolute inset-4 rounded-full bg-gradient-to-br from-teal-400/30 to-purple-500/30 animate-pulse shadow-2xl" style={{ animationDuration: "2s" }} />
        
        {/* Inner spinning dots */}
        <div className="absolute inset-8 flex items-center justify-center">
          <div className="relative w-16 h-16">
            <div className="absolute top-0 left-1/2 w-2 h-2 -translate-x-1/2 rounded-full bg-white/60 animate-spin" style={{ animationDuration: "1.5s", transformOrigin: "50% 32px" }} />
            <div className="absolute top-0 left-1/2 w-1.5 h-1.5 -translate-x-1/2 rounded-full bg-purple-200/80 animate-spin" style={{ animationDuration: "2s", transformOrigin: "50% 32px", animationDelay: "0.5s" }} />
            <div className="absolute top-0 left-1/2 w-1.5 h-1.5 -translate-x-1/2 rounded-full bg-teal-200/80 animate-spin" style={{ animationDuration: "2.5s", transformOrigin: "50% 32px", animationDelay: "1s" }} />
          </div>
        </div>
        
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-500/30 to-teal-400/30 blur-xl animate-pulse" style={{ animationDuration: "3s" }} />
      </div>

      {/* Progress bar */}
      <div className="w-80 max-w-sm">
        <div className="h-2 bg-gray-800/50 rounded-full overflow-hidden backdrop-blur-sm">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-teal-400 rounded-full shadow-lg transition-all duration-300 ease-linear" 
            style={{ width: `${progress}%` }} 
          />
        </div>
      </div>

      {/* Single dynamic text line */}
      <div className="max-w-md">
        <p className="text-xl font-semibold text-white hebrew-font leading-relaxed drop-shadow-md transition-all duration-500">
          {dynamicSubtext}
        </p>
        
        {/* Status indicator */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "0s" }} />
          <div className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: "0.2s" }} />
          <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "0.4s" }} />
        </div>
      </div>
    </div>
  );
}
