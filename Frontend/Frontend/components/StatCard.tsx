// components/StatCard.tsx
import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion } from "framer-motion";

type Props = {
  title: string;
  value: string | number;
  delta?: string; // e.g. "+12%" or "-5%"
  hint?: string;
  className?: string;
};

export default function StatCard({ title, value, delta, hint, className = "" }: Props) {
  // Determine if the delta is positive, negative, or neutral for color coding
  const isPositive = delta?.startsWith("+");
  const isNegative = delta?.startsWith("-");
  
  const deltaColorClass = isPositive 
    ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" 
    : isNegative 
    ? "text-rose-400 bg-rose-500/10 border-rose-500/20" 
    : "text-slate-400 bg-slate-500/10 border-slate-500/20";

  return (
    <motion.div 
      whileHover={{ y: -4, scale: 1.02 }}
      className={`glass bg-slate-900/40 rounded-2xl p-6 border border-white/5 hover:border-cyan-500/30 transition-all duration-300 shadow-[0_10px_40px_rgba(0,0,0,0.3)] relative overflow-hidden group ${className}`}
    >
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-[40px] pointer-events-none -z-10 group-hover:bg-cyan-500/20 transition-colors duration-500"></div>

      <div className="flex items-start justify-between relative z-10">
        <div className="flex flex-col">
          <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">
            {title}
          </h4>
          <div className="text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
            {value}
          </div>
        </div>
        
        {delta && (
          <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md border backdrop-blur-sm ${deltaColorClass}`}>
            {isPositive && <TrendingUp className="w-3.5 h-3.5" />}
            {isNegative && <TrendingDown className="w-3.5 h-3.5" />}
            {!isPositive && !isNegative && <Minus className="w-3.5 h-3.5" />}
            <span>{delta}</span>
          </div>
        )}
      </div>

      {hint && (
        <div className="text-xs text-slate-500 mt-4 border-t border-white/5 pt-3 relative z-10">
          {hint}
        </div>
      )}
    </motion.div>
  );
}