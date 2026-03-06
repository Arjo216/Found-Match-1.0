// components/match/MatchCard.tsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Bookmark, Eye, CheckCircle2, UserPlus, X, Loader2 } from "lucide-react";

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
  onInteract?: (id: string | number, isConnect: boolean) => Promise<void>;
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

export default function MatchCard({ profile, onView, onMessage, onSave, onInteract }: Props) {
  const score = profile.match_score ?? profile.score ?? null;
  const isPerfectMatch = score && score >= 90;
  
  // Local state to manage the button transition seamlessly
  // Local state to manage the button transition seamlessly
  const [connectState, setConnectState] = useState<"idle" | "loading" | "connected">("idle");

  const handleConnect = async () => {
    if (!onInteract) return;
    setConnectState("loading");
    try {
      // FIX: Look for profile_id first, fallback to id
      const targetId = profile.profile_id || profile.id; 
      await onInteract(targetId, true);
      setConnectState("connected");
    } catch {
      setConnectState("idle");
    }
  };

  const handleSkip = () => {
    if (onInteract) {
      // FIX: Look for profile_id first, fallback to id
      const targetId = profile.profile_id || profile.id; 
      onInteract(targetId, false);
    }
  };

  return (
    <motion.article 
      layout
      whileHover={{ y: -5 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`glass rounded-2xl p-6 flex flex-col h-full border transition-all duration-300 relative overflow-hidden group shadow-2xl ${
        isPerfectMatch ? "border-emerald-500/40 bg-slate-900/60" : "border-white/5 bg-slate-900/40"
      }`}
    >
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

      {/* ACTION BUTTONS (LinkedIn / Professional Style) */}
      <div className="mt-6 flex flex-col gap-2.5">
        
        {/* Primary Networking Row */}
        <div className="flex gap-2.5">
          {connectState === "connected" ? (
            <button disabled className="flex-1 flex justify-center items-center gap-2 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold rounded-lg cursor-default transition-all">
              <CheckCircle2 className="w-4 h-4" /> Request Sent
            </button>
          ) : (
            <button 
              onClick={handleConnect} 
              disabled={connectState === "loading"}
              className="flex-1 flex justify-center items-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold rounded-lg transition-all shadow-md shadow-cyan-900/20 disabled:opacity-70"
            >
              {connectState === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              Connect
            </button>
          )}

          <button 
            onClick={handleSkip} 
            title="Skip Profile"
            className="px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-white/5 rounded-lg transition-colors group"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Secondary Analytical Row */}
        <div className="flex gap-2.5">
          <button onClick={onView} className="flex-1 flex justify-center items-center gap-2 px-4 py-2 bg-slate-800/40 hover:bg-slate-800 border border-white/5 text-slate-300 hover:text-white text-sm font-semibold rounded-lg transition-colors">
            <Eye className="w-4 h-4" /> View Profile
          </button>
          <button onClick={onMessage} title="Direct Message" className="p-2 border border-white/5 bg-slate-800/40 rounded-lg text-slate-400 hover:text-white transition-colors">
            <MessageSquare className="w-4 h-4" />
          </button>
          <button onClick={onSave} title="Save to Shortlist" className="p-2 border border-white/5 bg-slate-800/40 rounded-lg text-slate-400 hover:text-white transition-colors">
            <Bookmark className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.article>
  );
}