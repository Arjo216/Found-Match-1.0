// components/projects/ProjectCard.tsx
import React from "react";
import { motion } from "framer-motion";
import { Briefcase, Target, TrendingUp } from "lucide-react";

export type ProjectItem = {
  id?: number | string;
  title: string;
  description?: string;
  domain?: string;
  funding_goal?: number;
  stage?: string;
  tags?: string[];
  user_id?: string;
};

// Utility function to format large numbers cleanly (FinTech style)
const formatCurrency = (value?: number) => {
  if (value === undefined || value === null) return "Undisclosed";
  
  // Format for Indian numbering system (Crores/Lakhs) or standard depending on preference.
  // Using Intl.NumberFormat for clean comma separation:
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
};

export default function ProjectCard({ project }: { project: ProjectItem }) {
  return (
    <motion.article 
      whileHover={{ y: -4, scale: 1.01 }}
      className="glass rounded-2xl p-6 border border-white/5 hover:border-cyan-500/30 transition-all duration-300 shadow-[0_10px_40px_rgba(0,0,0,0.4)] relative overflow-hidden group flex flex-col h-full"
    >
      {/* Subtle background glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 via-purple-500/0 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Header Section */}
      <div className="flex items-start justify-between gap-4 relative z-10">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <Briefcase className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xl font-bold text-white truncate leading-snug tracking-tight">
              {project.title}
            </h3>
          </div>
          <div className="text-sm font-medium text-purple-400 flex items-center gap-1.5">
            {project.domain || "Cross-Domain"}
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">{project.stage || "Stage TBA"}</span>
          </div>
        </div>

        {/* Funding Goal Box */}
        <div className="text-right shrink-0 bg-slate-900/50 border border-slate-700/50 rounded-xl p-3 backdrop-blur-sm">
          <div className="flex items-center justify-end gap-1.5 text-xs text-slate-400 mb-1 uppercase tracking-wider font-semibold">
            <Target className="w-3 h-3 text-emerald-400" />
            Raise Goal
          </div>
          <div className="font-bold text-emerald-400">
            {formatCurrency(project.funding_goal)}
          </div>
        </div>
      </div>

      {/* Pitch Description */}
      <div className="mt-5 flex-1 relative z-10">
        <p className="text-slate-300 text-sm leading-relaxed line-clamp-3">
          {project.description || "Detailed project description pending upload."}
        </p>
      </div>

      {/* Footer / Tags */}
      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between relative z-10">
        <div className="flex gap-2 flex-wrap">
          {(project.tags || []).length > 0 ? (
            (project.tags || []).slice(0, 4).map((t) => (
              <span 
                key={t} 
                className="text-[10px] font-bold uppercase tracking-wider bg-slate-800/80 border border-slate-600/50 text-slate-300 px-2.5 py-1 rounded-md"
              >
                {t}
              </span>
            ))
          ) : (
             <span className="text-xs text-slate-500 italic">No tags provided</span>
          )}
          
          {/* Tag overflow indicator */}
          {(project.tags || []).length > 4 && (
             <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-800/30 border border-slate-700/50 text-slate-400 px-2 py-1 rounded-md">
               +{project.tags!.length - 4}
             </span>
          )}
        </div>

        {/* Dynamic Stage Indicator */}
        {project.stage && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-full">
            <TrendingUp className="w-3 h-3" />
            {project.stage}
          </div>
        )}
      </div>
    </motion.article>
  );
}