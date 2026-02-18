// components/Skeleton.tsx
import React from "react";

export default function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div 
      className={`bg-slate-800/60 animate-pulse rounded-xl border border-slate-700/50 relative overflow-hidden ${className}`} 
    >
      {/* Optional: Adds a subtle sweeping gradient to make the pulse feel more high-tech */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-700/10 to-transparent" />
    </div>
  );
}