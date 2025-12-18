
import React, { useState, useEffect } from "react";

const loadingMessages = [
  "מכין את הקסם...",
  "מרכיב את הכלים...",
  "רק עוד רגע קט...",
  "טוען את העתיד...",
  "מלטש את הפיקסלים...",
];

export default function SoothingLoader({ label = "טוען...", showProgress = true }) {
  const [progress, setProgress] = useState(0);
  const [currentLabel, setCurrentLabel] = useState(label);

  useEffect(() => {
    let animationFrameId;
    let lastUpdate = 0;
    const updateInterval = 100; // ms

    const animateProgress = (timestamp) => {
        if (timestamp - lastUpdate > updateInterval) {
            lastUpdate = timestamp;
            setProgress(prev => {
                if (prev >= 99) {
                    // If progress reaches 99, cancel the next animation frame request
                    cancelAnimationFrame(animationFrameId);
                    return 99; // Cap at 99
                }
                const remaining = 99 - prev;
                // Calculate increment to slow down as it gets closer to 99, with a random factor
                const increment = Math.max(0.1, remaining * 0.05 + Math.random() * 0.5);
                return Math.min(99, prev + increment); // Ensure it doesn't exceed 99
            });
        }
        // Request the next animation frame
        animationFrameId = requestAnimationFrame(animateProgress);
    };

    // Start the animation loop
    animationFrameId = requestAnimationFrame(animateProgress);

    // Cleanup: Cancel the animation frame request when the component unmounts
    return () => cancelAnimationFrame(animationFrameId);
  }, []); // Empty dependency array ensures this effect runs once on mount and cleans up on unmount

  useEffect(() => {
    setCurrentLabel(label); // Use initial label from props
    let index = 0;
    const textInterval = setInterval(() => {
      index = (index + 1) % loadingMessages.length;
      setCurrentLabel(loadingMessages[index]);
    }, 2500);

    return () => clearInterval(textInterval);
  }, [label]);


  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <div className="relative w-20 h-20">
        {/* Outer rotating ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-500 via-teal-400 to-purple-600 p-1 animate-spin" style={{ animationDuration: "2.5s" }}>
          <div className="w-full h-full rounded-full bg-white" />
        </div>
        
        {/* Progress circle (if enabled) */}
        {showProgress && (
          <div className="absolute inset-0.5 rounded-full">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 76 76">
              <circle
                cx="38"
                cy="38"
                r="34"
                stroke="rgba(148, 163, 184, 0.2)"
                strokeWidth="2"
                fill="none"
              />
              <circle
                cx="38"
                cy="38"
                r="34"
                stroke="url(#miniProgressGradient)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 34}`}
                strokeDashoffset={`${2 * Math.PI * 34 * (1 - progress / 100)}`}
                className="transition-stroke-dashoffset duration-300 ease-linear"
              />
              <defs>
                <linearGradient id="miniProgressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#14B8A6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        )}
        
        {/* Progress number in center (if enabled) */}
        {showProgress && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold text-gray-700 hebrew-font tabular-nums">
              {Math.floor(progress)}%
            </span>
          </div>
        )}
        
        {/* Inner spinning dots */}
        <div className="absolute inset-6 flex items-center justify-center">
          <div className="relative w-8 h-8">
            <div className="absolute top-0 left-1/2 w-1.5 h-1.5 -translate-x-1/2 rounded-full bg-purple-500 animate-spin" style={{ animationDuration: "1.2s", transformOrigin: "50% 16px" }} />
            <div className="absolute top-0 left-1/2 w-1 h-1 -translate-x-1/2 rounded-full bg-teal-500 animate-spin" style={{ animationDuration: "1.8s", transformOrigin: "50% 16px", animationDelay: "0.3s" }} />
          </div>
        </div>
        
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-500/20 to-teal-400/20 blur-lg animate-pulse" style={{ animationDuration: "2s" }} />
      </div>
      
      <p className="text-gray-600 hebrew-font text-base font-semibold transition-all duration-500">{currentLabel}</p>
    </div>
  );
}
