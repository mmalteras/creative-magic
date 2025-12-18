import React from "react";

export default function LoadingDots({ size = 2, color = "bg-purple-500" }) {
  const dotStyle = `inline-block ${color} rounded-full`;
  const sz = `w-${size} h-${size}`;
  return (
    <div className="flex items-center justify-center gap-1">
      <span className={`${dotStyle} ${sz} animate-bounce`} style={{ animationDelay: "0ms" }} />
      <span className={`${dotStyle} ${sz} animate-bounce`} style={{ animationDelay: "150ms" }} />
      <span className={`${dotStyle} ${sz} animate-bounce`} style={{ animationDelay: "300ms" }} />
    </div>
  );
}