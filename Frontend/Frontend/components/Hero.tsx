// components/Hero.tsx
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-slate-950">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column: Text Content */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center px-4 py-2 mb-8 rounded-full glass border border-cyan-500/30 text-cyan-400 text-xs font-bold tracking-widest uppercase bg-slate-900/40">
              <Sparkles className="w-4 h-4 mr-2 animate-pulse text-cyan-400" />
              AI-Powered Matchmaking Engine
            </div>
            
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tighter text-white mb-8">
              Deploy Capital <br/>
              <span className="relative inline-block mt-2">
                <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 blur-2xl opacity-50 select-none pointer-events-none" aria-hidden="true">
                  Intelligently
                </span>
                <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                  Intelligently
                </span>
              </span>
            </h1>
            
            <p className="text-xl text-slate-400 max-w-xl mb-12 leading-relaxed font-medium">
              Utilizing <span className="text-white">Sentence-BERT</span> and <span className="text-white">LightGCN</span> to connect visionaries with investors perfectly aligned to their thesis[cite: 118, 123].
            </p>

            {/* Restored Dual Button Layout */}
            <div className="flex flex-col sm:flex-row gap-5">
              <Link href="/signup" className="group relative inline-flex items-center justify-center px-10 py-5 bg-cyan-600 text-white font-bold rounded-2xl shadow-[0_0_30px_rgba(8,145,178,0.4)] transition-all hover:scale-105 hover:bg-cyan-500 border border-cyan-400/50">
                Get started
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link href="/login" className="inline-flex items-center justify-center px-10 py-5 border border-slate-700 rounded-2xl text-slate-300 font-bold bg-slate-900/50 backdrop-blur-xl hover:bg-slate-800 hover:text-white transition-all">
                Partner Login
              </Link>
            </div>
          </motion.div>

          {/* Right Column: Matched Display */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            {/* CENTRAL SUCCESS BADGE */}
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.2, type: "spring", stiffness: 260, damping: 20 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40"
            >
              <div className="glass bg-emerald-500/10 border border-emerald-500/40 px-6 py-3 rounded-2xl backdrop-blur-2xl shadow-[0_0_40px_rgba(16,185,129,0.3)] flex items-center gap-3 whitespace-nowrap">
                <div className="bg-emerald-500 rounded-full p-1 shadow-[0_0_15px_rgba(16,185,129,0.6)]">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-black text-emerald-400 tracking-tighter uppercase italic">
                  Perfect Match Found
                </span>
              </div>
            </motion.div>

            {/* Founder Card */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="glass rounded-3xl p-8 relative z-20 w-4/5 ml-auto border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-slate-900/80 backdrop-blur-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 px-3 py-1 bg-purple-500/10 rounded-full border border-purple-500/20">Founder Profile</span>
                <span className="text-xs font-bold text-slate-500">#F-2214</span>
              </div>
              <div className="text-2xl font-black text-white mb-1">Anaya Patel</div>
              <div className="text-sm font-semibold text-cyan-400/80 mb-4">SaaS • Pre-seed</div>
              <p className="text-slate-400 text-sm italic">"Deploying GNN architectures for autonomous defense."</p>
            </motion.div>

            {/* Investor Card */}
            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="glass rounded-3xl p-8 relative z-10 w-4/5 -mt-12 -ml-8 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-slate-800/60 backdrop-blur-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 px-3 py-1 bg-cyan-500/10 rounded-full border border-cyan-500/20">Investor Thesis</span>
                <div className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
              </div>
              <div className="text-2xl font-black text-white mb-1">Rohit Sharma VC</div>
              <div className="text-sm font-semibold text-purple-400/80 mb-4">Focus: AI, Cybersecurity</div>
              <p className="text-slate-400 text-sm italic">"Thesis: Pre-seed investments in autonomous software."</p>
            </motion.div>

            {/* Connecting Line Effect */}
            <svg className="absolute top-[40%] left-[20%] w-[60%] h-[30%] -z-10 opacity-30" viewBox="0 0 100 100">
              <motion.path 
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, delay: 0.5 }}
                d="M 10 10 Q 50 90 90 10" 
                fill="none" 
                stroke="url(#line-grad)" 
                strokeWidth="2" 
                strokeDasharray="5,5"
              />
              <defs>
                <linearGradient id="line-grad" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor="#c084fc" />
                  <stop offset="100%" stopColor="#22d3ee" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>
        </div>
      </div>
    </section>
  );
}