// pages/index.tsx
import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import Layout from "../components/Layout";
import { 
  Network, 
  ArrowRight, 
  Terminal, 
  Lock, 
  Cpu, 
  ShieldCheck, 
  Globe2, 
  Sparkles,
  Fingerprint,
  Code2,
  Workflow,
  Maximize2,
  X,
  Printer
} from "lucide-react";

export default function InstitutionalLanding() {
  // Simulated Terminal Typing Effect for the Teaser
  const [terminalText, setTerminalText] = useState("");
  const fullText = `> INITIALIZING FOUNDMATCH PROTOCOL...
> ESTABLISHING ZERO-KNOWLEDGE E2E TUNNEL...
> WAKING LANGGRAPH MULTI-AGENT SWARM...
> [1/3] DUE DILIGENCE AGENT: ONLINE
> [2/3] NEGOTIATION AGENT: ONLINE
> [3/3] CODEOPS-ULTRA: ARMED
> SYSTEM READY FOR INSTITUTIONAL COMMAND.`;

  useEffect(() => {
    let i = 0;
    const typingInterval = setInterval(() => {
      setTerminalText(fullText.substring(0, i));
      i++;
      if (i > fullText.length) clearInterval(typingInterval);
    }, 35);
    return () => clearInterval(typingInterval);
  }, []);

  return (
    <Layout>
      <Head>
        <title>FoundMatch | Autonomous Venture Capital</title>
        <meta name="description" content="The world's first AI-orchestrated venture capital ecosystem." />
      </Head>

      {/* 🌌 VIBRANT NEBULA EXECUTIVE BACKGROUND 🌌 */}
      <main className="min-h-screen bg-[#050314] text-slate-100 font-sans relative overflow-hidden selection:bg-fuchsia-500/30">
        
        {/* Dynamic Glowing Orbs - Rich Violets, Magentas, and Cyans */}
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#6D28D9]/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none animate-[pulse_8s_ease-in-out_infinite]"></div>
        <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[50vw] bg-[#D946EF]/15 rounded-full blur-[150px] mix-blend-screen pointer-events-none animate-[pulse_10s_ease-in-out_infinite_reverse]"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[60vw] h-[60vw] bg-[#0284C7]/15 rounded-full blur-[150px] mix-blend-screen pointer-events-none animate-[pulse_12s_ease-in-out_infinite]"></div>

        {/* Subtle Grid Overlay for Technical Feel */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.05] pointer-events-none z-0"></div>

        {/* --- NAVIGATION BAR --- */}
        <nav className="relative z-20 flex items-center justify-between px-6 lg:px-12 py-6 max-w-[1400px] mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#8B5CF6] via-[#D946EF] to-[#06B6D4] flex items-center justify-center shadow-[0_0_30px_rgba(217,70,239,0.4)]">
              <Network className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-white to-[#A5B4FC]">FoundMatch</span>
          </div>
          
          <div className="flex items-center gap-6">
            <span className="hidden md:flex items-center gap-2 text-xs font-bold text-[#F0ABFC] uppercase tracking-widest bg-[#D946EF]/10 px-4 py-2 rounded-full border border-[#D946EF]/30 shadow-[inset_0_0_15px_rgba(217,70,239,0.1)]">
              <Lock className="w-3.5 h-3.5" /> Institutional Access
            </span>
            <Link 
              href="/login" 
              className="px-8 py-3 bg-[#1E1B4B]/60 hover:bg-[#2E2865]/80 border border-[#4C1D95]/50 rounded-full text-sm font-bold tracking-widest uppercase text-white transition-all backdrop-blur-xl shadow-lg hover:shadow-[#8B5CF6]/30 hover:scale-105"
            >
              Client Login
            </Link>
          </div>
        </nav>

        {/* --- HERO SECTION --- */}
        <section className="relative z-10 flex flex-col items-center justify-center pt-20 pb-32 px-6 text-center max-w-6xl mx-auto">
          
          {/* Version Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1e1a3a]/80 border border-[#3b2d70] text-[#c4b5fd] text-xs font-black uppercase tracking-widest mb-10 backdrop-blur-md shadow-2xl relative overflow-hidden group"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-[#8b5cf6]/20 to-transparent -translate-x-full group-hover:animate-[scan_2s_ease-in-out_infinite]"></div>
            <Sparkles className="w-4 h-4 text-[#22d3ee]" /> Version 3.0: LangGraph Swarm Active
          </motion.div>

          {/* Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-6xl md:text-8xl font-extrabold tracking-tighter mb-8 leading-[1.1] drop-shadow-2xl"
          >
            Deploy Capital with <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22d3ee] via-[#a855f7] to-[#ec4899]">
              Autonomous Intelligence.
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-2xl text-[#a5b4fc] mb-14 max-w-4xl leading-relaxed font-light"
          >
            FoundMatch replaces legacy VC deal flow with a localized multi-agent swarm. We semantically match founders, autonomously negotiate term sheets, and instantly engineer Day-1 cloud infrastructure.
          </motion.p>

          {/* CTAs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-6 w-full justify-center"
          >
            <Link 
              href="/signup" 
              className="group w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-[#7c3aed] to-[#db2777] hover:from-[#6d28d9] hover:to-[#be185d] text-white font-bold uppercase tracking-widest rounded-2xl transition-all shadow-[0_0_50px_rgba(217,70,239,0.4)] flex items-center justify-center gap-3 hover:scale-105 hover:shadow-[0_0_80px_rgba(217,70,239,0.6)]"
            >
              Apply for Access <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="#features" 
              className="w-full sm:w-auto px-10 py-5 bg-[#171330]/80 hover:bg-[#241e4a] border border-[#3b2d70] text-white font-bold uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-3 backdrop-blur-xl shadow-xl hover:border-[#6d28d9]"
            >
              <Globe2 className="w-5 h-5 text-[#22d3ee]" /> Explore the Platform
            </Link>
          </motion.div>

          {/* --- EXECUTIVE CO-PILOT TERMINAL TEASER --- */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="w-full max-w-4xl mt-24 text-left relative"
          >
            {/* Ambient glow behind terminal */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#06b6d4] via-[#8b5cf6] to-[#ec4899] rounded-3xl blur-2xl opacity-40"></div>
            
            <div className="relative bg-[#0b0c1b]/95 backdrop-blur-3xl border border-[#2a2150] rounded-3xl shadow-2xl overflow-hidden">
              {/* Co-Pilot Header */}
              <div className="flex items-center justify-between px-6 py-4 bg-[#111229] border-b border-[#2a2150]">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#1f1b40] border border-[#3b2d70] flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                    <Cpu className="w-5 h-5 text-[#c084fc]" />
                  </div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-white font-bold text-lg">System Orchestrator</h3>
                    <span className="px-2 py-0.5 bg-[#059669]/20 border border-[#059669]/50 text-[#34d399] text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#34d399] animate-pulse"></span> Online
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-[#6b7280]">
                  <Printer className="w-5 h-5 hover:text-white transition-colors cursor-pointer" />
                  <Maximize2 className="w-5 h-5 hover:text-white transition-colors cursor-pointer" />
                  <X className="w-6 h-6 hover:text-rose-400 transition-colors cursor-pointer" />
                </div>
              </div>
              
              {/* Terminal Body */}
              <div className="p-8 h-72 overflow-y-auto bg-gradient-to-b from-[#0b0c1b] to-[#070514]">
                <div className="bg-[#151632] border border-[#2a2150] rounded-xl p-5 mb-6 shadow-inner">
                  <div className="flex gap-3">
                    <Terminal className="w-5 h-5 text-[#c084fc] shrink-0 mt-0.5" />
                    <p className="text-[#e2e8f0] text-sm leading-relaxed">
                      I am the Autonomous Command Protocol. I will orchestrate your LangGraph agents, verify institutional capital signatures, and engineer system deployment. Boot sequence initiated.
                    </p>
                  </div>
                </div>
                <pre className="text-[15px] font-mono text-[#2dd4bf] leading-loose whitespace-pre-wrap px-2">
                  {terminalText}
                  <span className="animate-pulse inline-block w-2 h-5 bg-[#2dd4bf] align-middle ml-1"></span>
                </pre>
              </div>
              
              {/* Fake Input Area */}
              <div className="p-4 bg-[#0b0c1b] border-t border-[#2a2150]">
                <div className="flex items-center gap-3 bg-[#111229] border border-[#2a2150] rounded-full p-2">
                  <div className="w-10 h-10 rounded-full bg-[#1e1b4b] flex items-center justify-center">
                    <Lock className="w-4 h-4 text-[#8b5cf6]" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Terminal locked. Awaiting Authentication..." 
                    disabled 
                    className="flex-grow bg-transparent text-slate-400 text-sm outline-none placeholder:text-[#4c4b63]"
                  />
                  <div className="w-10 h-10 rounded-full bg-[#7c3aed] flex items-center justify-center shadow-[0_0_15px_rgba(124,58,237,0.4)]">
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* --- FEATURE ARSENAL SECTION --- */}
        <section id="features" className="relative z-10 py-32 border-t border-[#2a2150] bg-[#070514]/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-6">
                The Institutional <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d946ef] to-[#f97316]">Arsenal</span>
              </h2>
              <p className="text-[#a5b4fc] max-w-2xl mx-auto text-lg">
                Three proprietary engines designed to mathematically guarantee deal flow, secure data, and execute engineering.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Feature 1: Deal Galaxy */}
              <motion.div whileHover={{ y: -10 }} className="flex flex-col bg-[#0f0c24] border border-[#2a2150] rounded-[2rem] p-8 backdrop-blur-md shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#0ea5e9]/20 blur-[50px] rounded-full group-hover:bg-[#0ea5e9]/40 transition-colors duration-500"></div>
                <div className="w-16 h-16 bg-[#0ea5e9]/10 border border-[#0ea5e9]/30 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(14,165,233,0.2)]">
                  <Fingerprint className="w-8 h-8 text-[#38bdf8]" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Deal Galaxy Vector Engine</h3>
                <p className="text-[#94a3b8] leading-relaxed flex-grow">
                  Stop reading pitch decks. Our 384-dimensional pgvector Graph Neural Network maps investor thesis directly to founder reality in milliseconds, rendered in a 3D orbital UI.
                </p>
                
                {/* 🚨 THE NEW DEAL GALAXY ROUTE BUTTON 🚨 */}
                <div className="mt-8 pt-6 border-t border-[#2a2150]/50">
                  <Link 
                    href="/dashboard/deal-galaxy"
                    className="inline-flex items-center justify-center w-full py-3.5 bg-gradient-to-r from-[#0ea5e9]/10 to-[#38bdf8]/10 hover:from-[#0ea5e9] hover:to-[#38bdf8] border border-[#0ea5e9]/30 hover:border-transparent text-[#e0f2fe] hover:text-[#082f49] text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 shadow-[0_0_15px_rgba(14,165,233,0.1)] hover:shadow-[0_0_30px_rgba(14,165,233,0.4)] group/btn"
                  >
                    Enter the Galaxy <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>

              {/* Feature 2: Autonomous Swarms */}
              <motion.div whileHover={{ y: -10 }} className="flex flex-col bg-[#0f0c24] border border-[#2a2150] rounded-[2rem] p-8 backdrop-blur-md shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#d946ef]/20 blur-[50px] rounded-full group-hover:bg-[#d946ef]/40 transition-colors duration-500"></div>
                <div className="w-16 h-16 bg-[#d946ef]/10 border border-[#d946ef]/30 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(217,70,239,0.2)]">
                  <Workflow className="w-8 h-8 text-[#e879f9]" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Autonomous Swarms</h3>
                <p className="text-[#94a3b8] leading-relaxed flex-grow">
                  Powered by LangGraph. Assign AI proxies to conduct brutal financial due diligence, negotiate term sheets over encrypted WebSockets, and mint legal agreements autonomously.
                </p>
              </motion.div>

              {/* Feature 3: CodeOps-ULTRA */}
              <motion.div whileHover={{ y: -10 }} className="flex flex-col bg-[#0f0c24] border border-[#2a2150] rounded-[2rem] p-8 backdrop-blur-md shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#10b981]/20 blur-[50px] rounded-full group-hover:bg-[#10b981]/40 transition-colors duration-500"></div>
                <div className="w-16 h-16 bg-[#10b981]/10 border border-[#10b981]/30 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                  <Code2 className="w-8 h-8 text-[#34d399]" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">CodeOps-ULTRA</h3>
                <p className="text-[#94a3b8] leading-relaxed flex-grow">
                  Post-funding execution. Our DevSecOps swarm instantly engineers the startup's cloud architecture, writes Day-1 boilerplate code, and executes security audits directly in the browser.
                </p>
              </motion.div>

            </div>
          </div>
        </section>

        {/* --- FINAL CTA --- */}
        <section className="relative z-10 py-32 bg-[#050314]">
          <div className="max-w-5xl mx-auto px-6 lg:px-8 text-center">
            <div className="bg-gradient-to-b from-[#130f2e] to-[#0a081a] border border-[#3b2d70] rounded-[3rem] p-16 md:p-24 shadow-[0_0_100px_rgba(139,92,246,0.2)] relative overflow-hidden backdrop-blur-3xl">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#d946ef] to-transparent"></div>
              <h3 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-8">
                Ready to find your{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22d3ee] to-[#d946ef]">Match?</span>
              </h3>
              <p className="text-xl text-[#a5b4fc] mt-6 max-w-2xl mx-auto leading-relaxed font-light mb-12">
                Join the exclusive network of founders and capital allocators leveraging AI to eliminate friction in venture capital.
              </p>
              <Link 
                href="/signup" 
                className="inline-flex items-center justify-center px-14 py-6 bg-white text-[#0f0c24] font-black text-lg uppercase tracking-widest rounded-2xl transition-all duration-300 hover:scale-105 hover:bg-[#e2e8f0] shadow-[0_10px_50px_rgba(255,255,255,0.2)]"
              >
                Apply for Institutional Access
              </Link>
            </div>
          </div>
        </section>

      </main>
    </Layout>
  );
}