// components/match/MatchCard.tsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Bookmark, Eye, Sparkles, CheckCircle2 } from "lucide-react";

type Profile = {
  id: number | string;
  full_name?: string;
  headline?: string;
  domain?: string;
  stage?: string;
  location?: string;
  avatar?: string;
  snippet?: string;
  match_score?: number | null;
  recommendation?: string | null;
  [k: string]: any;
};

type Props = {
  profile: Profile;
  onView?: () => void;
  onMessage?: () => void;
  onSave?: () => void;
  fetchPrediction?: () => Promise<any>;
};

function ScoreRing({ value }: { value?: number | null }) {
  const v = typeof value === "number" ? Math.max(0, Math.min(100, Math.round(value))) : null;
  const stroke = 8;
  const size = 68;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = v != null ? circumference - (v / 100) * circumference : circumference;

  return (
    <div className="relative inline-flex items-center justify-center w-[68px] h-[68px]">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
        <defs>
          <linearGradient id="score-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255, 255, 255, 0.05)" strokeWidth={stroke} fill="none" />
        <motion.circle
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          cx={size / 2} cy={size / 2} r={radius} stroke="url(#score-gradient)" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${circumference}`} fill="none"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold text-white">{v != null ? `${v}%` : "--"}</span>
      </div>
    </div>
  );
}

export default function MatchCard({ profile, onView, onMessage, onSave, fetchPrediction }: Props) {
  const score = profile.match_score ?? profile.score ?? null;
  const rec = profile.recommendation ?? null;
  const isPerfectMatch = score && score >= 90;

  return (
    <motion.article 
      whileHover={{ y: -5 }}
      className={`glass rounded-2xl p-6 flex flex-col h-full border transition-all duration-300 relative overflow-hidden group shadow-2xl ${
        isPerfectMatch ? "border-emerald-500/40 bg-slate-900/60" : "border-white/5 bg-slate-900/40"
      }`}
    >
      {/* PERFECT MATCH BADGE */}
      <AnimatePresence>
        {isPerfectMatch && (
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute top-0 right-0 z-30"
          >
            <div className="bg-emerald-500 text-white px-4 py-1.5 rounded-bl-2xl flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="text-[10px] font-black uppercase tracking-tighter italic">Perfect Match</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-start gap-4">
        <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-white/10 shrink-0">
          <img src={profile.avatar || `https://ui-avatars.com/api/?name=${profile.full_name || "FM"}&background=0f172a&color=06b6d4`} alt={profile.full_name} className="w-full h-full object-cover" />
        </div>

        <div className="flex-1 min-w-0 pt-1">
          <h3 className="text-lg font-bold text-white truncate">{profile.full_name || "Unnamed"}</h3>
          <div className="text-sm text-slate-400 truncate">{profile.headline}</div>
        </div>

        <div className="flex flex-col items-center gap-2 shrink-0">
          <ScoreRing value={score} />
        </div>
      </div>

      <p className="text-sm text-slate-400 mt-5 line-clamp-3 flex-1 leading-relaxed">
        {profile.snippet || "No additional details provided."}
      </p>

      <div className="mt-6 flex gap-3">
        <button onClick={onView} className="flex-1 flex justify-center items-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold rounded-lg transition-colors">
          <Eye className="w-4 h-4" /> View Profile
        </button>
        <button onClick={onMessage} className="p-2.5 border border-white/10 bg-slate-800/50 rounded-lg text-slate-300 hover:text-white transition-colors">
          <MessageSquare className="w-4 h-4" />
        </button>
        <button onClick={onSave} className="p-2.5 border border-white/10 bg-slate-800/50 rounded-lg text-slate-300 hover:text-white transition-colors">
          <Bookmark className="w-4 h-4" />
        </button>
      </div>
    </motion.article>
  );
}