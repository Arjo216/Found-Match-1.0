// Frontend/components/match/FilterBar.tsx
import React, { useState, useEffect } from "react";
import { Search, SlidersHorizontal, X, Filter } from "lucide-react";
import { motion } from "framer-motion";

type Props = {
  onApply: (filters: Record<string, any>) => void;
  initialFilters?: Record<string, any>;
};

export default function FilterBar({ onApply, initialFilters = {} }: Props) {
  const [search, setSearch] = useState(initialFilters.search || "");
  const [domain, setDomain] = useState(initialFilters.domain || "");
  const [stage, setStage] = useState(initialFilters.stage || "");
  const [role, setRole] = useState(initialFilters.role || "");
  const [location, setLocation] = useState(initialFilters.location || "");

  // Optional: Add an "expanded" state for mobile so filters don't clutter the screen
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setSearch(initialFilters.search || "");
    setDomain(initialFilters.domain || "");
    setStage(initialFilters.stage || "");
    setRole(initialFilters.role || "");
    setLocation(initialFilters.location || "");
  }, [initialFilters]);

  const apply = () => {
    onApply({
      search,
      domain,
      stage,
      role,
      location,
    });
  };

  const clear = () => {
    setSearch("");
    setDomain("");
    setStage("");
    setRole("");
    setLocation("");
    onApply({});
  };

  return (
    <div className="glass rounded-2xl p-4 md:p-6 shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-white/5 relative overflow-hidden group">
      {/* Subtle ambient glow behind the filter bar */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-transparent pointer-events-none" />

      {/* Top Header / Search Bar Row */}
      <div className="flex flex-col md:flex-row gap-4 items-center w-full relative z-10">
        
        {/* Main Search Input */}
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-cyan-400 opacity-70" />
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && apply()}
            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all backdrop-blur-sm"
            placeholder="Search founders, investors, or keywords (e.g., 'SaaS', 'AI')..."
          />
        </div>

        {/* Mobile Toggle Button */}
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="md:hidden flex items-center gap-2 px-4 py-3.5 border border-slate-700/50 bg-slate-800/50 rounded-xl text-slate-300 w-full justify-center"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {isExpanded ? "Hide Filters" : "Show Filters"}
        </button>
      </div>

      {/* Expandable Filters Section */}
      <motion.div 
        initial={false}
        animate={{ height: isExpanded ? "auto" : "auto", opacity: 1 }}
        className={`mt-4 flex flex-col md:flex-row gap-4 items-end w-full relative z-10 ${!isExpanded ? 'hidden md:flex' : 'flex'}`}
      >
        {/* Domain Input */}
        <div className="w-full md:w-56">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">Domain Focus</label>
          <input 
            value={domain} 
            onChange={(e)=>setDomain(e.target.value)} 
            onKeyDown={(e) => e.key === "Enter" && apply()}
            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all" 
            placeholder="e.g., FinTech, Web3" 
          />
        </div>

        {/* Stage Select */}
        <div className="w-full md:w-48">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">Funding Stage</label>
          <div className="relative">
            <select 
              value={stage} 
              onChange={(e)=>setStage(e.target.value)} 
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-slate-200 appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all cursor-pointer"
            >
              <option value="" className="bg-slate-900">Any Stage</option>
              <option value="pre-seed" className="bg-slate-900">Pre-seed</option>
              <option value="seed" className="bg-slate-900">Seed</option>
              <option value="series-a" className="bg-slate-900">Series A</option>
              <option value="growth" className="bg-slate-900">Growth / Late Stage</option>
            </select>
            {/* Custom chevron to replace default select arrow */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
        </div>

        {/* Role Select */}
        <div className="w-full md:w-40">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">User Role</label>
          <div className="relative">
            <select 
              value={role} 
              onChange={(e)=>setRole(e.target.value)} 
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-slate-200 appearance-none focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all cursor-pointer"
            >
              <option value="" className="bg-slate-900">All Roles</option>
              <option value="founder" className="bg-slate-900">Founders Only</option>
              <option value="investor" className="bg-slate-900">Investors Only</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 w-full md:w-auto md:ml-auto mt-4 md:mt-0">
          <button 
            onClick={clear} 
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 border border-slate-700/50 hover:border-slate-500/50 bg-slate-800/30 hover:bg-slate-700/50 rounded-xl text-slate-300 transition-all duration-300"
            title="Clear Filters"
          >
            <X className="w-4 h-4" />
            <span className="md:hidden">Clear</span>
          </button>
          
          <button 
            onClick={apply} 
            className="flex-[2] md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl shadow-[0_0_15px_rgba(8,145,178,0.3)] hover:shadow-[0_0_20px_rgba(8,145,178,0.5)] border border-cyan-400/30 transition-all duration-300 hover:scale-105"
          >
            <Filter className="w-4 h-4" />
            Apply Filters
          </button>
        </div>
      </motion.div>
    </div>
  );
}