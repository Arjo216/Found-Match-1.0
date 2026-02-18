// components/MatchCard.tsx
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { UserPlus, ArrowRight, Sparkles } from "lucide-react";

type Props = {
  id: string;
  name: string;
  headline?: string;
  image?: string;
  summary?: string;
  onLike?: (id: string) => void;
  onPreview?: (id: string) => void;
  className?: string;
};

export default function MatchCard({ id, name, headline, image, summary, onLike, onPreview, className = "" }: Props) {
  return (
    <motion.div 
      whileHover={{ y: -6, scale: 1.01 }}
      className={`glass bg-slate-900/40 rounded-2xl overflow-hidden border border-white/5 hover:border-cyan-500/30 transition-all duration-300 shadow-[0_10px_40px_rgba(0,0,0,0.5)] group flex flex-col h-full ${className}`}
    >
      {/* Top Banner / Avatar Area */}
      <div className="w-full h-32 relative overflow-hidden bg-slate-800">
        {/* Subtle overlay gradient to blend the image into the dark theme */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent z-10" />
        
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        ) : (
          /* Premium Fallback for missing images */
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/20 rounded-full blur-[40px]"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/20 rounded-full blur-[40px]"></div>
            <span className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-slate-400 to-slate-600 z-10">
              {name?.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-5 flex flex-col flex-1 relative z-20 -mt-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white leading-snug tracking-tight group-hover:text-cyan-400 transition-colors drop-shadow-md">
              {name}
            </h3>
            <div className="text-sm font-medium text-cyan-400/90 mt-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              {headline || "Domain Expert"}
            </div>
          </div>
        </div>

        {/* Summary */}
        <p className="text-sm text-slate-300 mt-4 line-clamp-2 flex-1 leading-relaxed">
          {summary || "No summary provided for this profile yet."}
        </p>

        {/* Action Buttons */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
          <button
            onClick={() => onLike?.(id)}
            className="flex-1 flex justify-center items-center gap-2 px-4 py-2.5 bg-cyan-600/90 hover:bg-cyan-500 text-white font-semibold rounded-xl shadow-[0_0_15px_rgba(8,145,178,0.3)] transition-all hover:scale-105"
          >
            <UserPlus className="w-4 h-4" />
            Connect
          </button>

          <Link 
            href={`/profile/view?id=${id}`} 
            className="flex-1 flex justify-center items-center gap-1.5 px-4 py-2.5 border border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold rounded-xl transition-all"
          >
            View <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}