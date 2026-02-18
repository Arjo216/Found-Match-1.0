// components/FilterPanel.tsx
import React from "react";
import { Filter, RotateCcw, Layers, TrendingUp } from "lucide-react";

type Props = {
  domain?: string;
  stage?: string;
  onChange: (patch: Partial<{ domain: string; stage: string; search: string }>) => void;
  className?: string;
};

export default function FilterPanel({ domain = "", stage = "", onChange, className = "" }: Props) {
  return (
    <div className={`glass bg-slate-900/50 border border-white/5 rounded-2xl p-5 shadow-[0_10px_40px_rgba(0,0,0,0.5)] relative overflow-hidden ${className}`}>
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-[50px] pointer-events-none -z-10"></div>

      {/* Header */}
      <div className="flex items-center gap-2 mb-5 border-b border-white/10 pb-3">
        <div className="p-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-md">
          <Filter className="w-3.5 h-3.5 text-cyan-400" />
        </div>
        <div className="text-sm font-bold uppercase tracking-widest text-white">Refine Search</div>
      </div>

      <div className="space-y-5">
        {/* Domain Input */}
        <div>
          <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 ml-1">
            <Layers className="w-3 h-3" /> Domain Focus
          </label>
          <input 
            value={domain} 
            onChange={(e) => onChange({ domain: e.target.value })} 
            placeholder="e.g. FinTech, SaaS" 
            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all backdrop-blur-sm" 
          />
        </div>

        {/* Stage Select */}
        <div>
          <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 ml-1">
            <TrendingUp className="w-3 h-3" /> Funding Stage
          </label>
          <div className="relative">
            <select 
              value={stage} 
              onChange={(e) => onChange({ stage: e.target.value })} 
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all cursor-pointer backdrop-blur-sm"
            >
              <option value="" className="bg-slate-900">Any Stage</option>
              <option value="pre-seed" className="bg-slate-900">Pre-seed</option>
              <option value="seed" className="bg-slate-900">Seed</option>
              <option value="series-a" className="bg-slate-900">Series A</option>
              <option value="growth" className="bg-slate-900">Growth</option>
            </select>
            {/* Custom SVG chevron to replace the ugly default browser dropdown arrow */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 pt-4 border-t border-white/5 flex gap-3">
        <button 
          className="flex-1 flex justify-center items-center gap-1.5 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold rounded-xl shadow-[0_0_15px_rgba(8,145,178,0.3)] transition-all hover:scale-105" 
          onClick={() => onChange({})}
        >
          Apply
        </button>
        <button 
          className="flex justify-center items-center px-4 py-2.5 border border-slate-700 hover:bg-slate-800 text-slate-300 rounded-xl transition-all tooltip" 
          onClick={() => onChange({ domain: "", stage: "" })}
          title="Clear Filters"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}