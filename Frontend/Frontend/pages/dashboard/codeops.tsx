// pages/dashboard/codeops.tsx
import React, { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Terminal, 
  FolderTree, 
  FileCode2, 
  ShieldCheck, 
  ShieldAlert, 
  Cpu, 
  Play, 
  ArrowLeft,
  Server,
  Layers,
  Code2,
  Sparkles,
  Command,
  Activity,
  Database
} from "lucide-react";

// --- TYPESCRIPT INTERFACES ---
interface CodeOpsResponse {
  project_name: string;
  architecture: {
    tech_stack: string[];
    folder_structure: string[];
    system_design_notes: string;
  };
  source_code: Record<string, string>;
  security_audit: string;
  deployment_ready: boolean;
}

export default function CodeOpsDashboard() {
  const router = useRouter();
  
  //const projectName = (router.query.project as string) || "TitanOPS AIR";
  //const projectPitch = (router.query.pitch as string) || "Autonomous drone interception grid using real-time computer vision (YOLOv8) and edge-computing. Needs a robust FastAPI backend and Dockerized environment.";
  const projectName = (router.query.project as string) || "QuantumGrid PLUS";
  const projectPitch = (router.query.pitch as string) || "A quantum-resistant blockchain and AI-governed ledger utilizing lattice-based cryptography. Needs a high-performance Rust backend, NIST-compliant Post-Quantum cryptography libraries, and a Dockerized environment.";

  const [appState, setAppState] = useState<"IDLE" | "ORCHESTRATING" | "COMPLETE" | "ERROR">("IDLE");
  const [data, setData] = useState<CodeOpsResponse | null>(null);
  const [activeFile, setActiveFile] = useState<string | null>(null);

  const triggerCodeOpsSwarm = async () => {
    setAppState("ORCHESTRATING");
    
    try {
      const response = await fetch("http://localhost:8000/swarm/codeops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_name: projectName, startup_pitch: projectPitch })
      });

      if (!response.ok) throw new Error("CodeOps Swarm failed to execute.");

      const result: CodeOpsResponse = await response.json();
      setData(result);
      
      const generatedFiles = Object.keys(result.source_code);
      if (generatedFiles.length > 0) setActiveFile(generatedFiles[0]);
      
      setAppState("COMPLETE");
    } catch (error) {
      console.error("Swarm Orchestration Error:", error);
      setAppState("ERROR");
    }
  };

  return (
    <>
      <Head>
        <title>CodeOps Executive | FoundMatch</title>
      </Head>
      
      {/* 🌌 NEBULA EXECUTIVE BACKGROUND 🌌 */}
      <div className="flex flex-col h-screen bg-[#050314] text-slate-100 font-sans overflow-hidden relative selection:bg-[#d946ef]/30">
        
        {/* Dynamic Glowing Orbs - Rich Violets, Magentas, and Cyans */}
        <div className="absolute top-[10%] left-[-10%] w-[50vw] h-[50vw] bg-[#6D28D9]/15 rounded-full blur-[150px] mix-blend-screen pointer-events-none animate-[pulse_10s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[40vw] h-[50vw] bg-[#D946EF]/10 rounded-full blur-[150px] mix-blend-screen pointer-events-none animate-[pulse_12s_ease-in-out_infinite_reverse]"></div>
        <div className="absolute top-[40%] left-[30%] w-[30vw] h-[30vw] bg-[#0284C7]/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none animate-[pulse_8s_ease-in-out_infinite]"></div>

        {/* Subtle Grid Overlay */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none z-0"></div>

        {/* --- EXECUTIVE HEADER BAR --- */}
        <header className="h-16 bg-[#0b0c1b]/80 backdrop-blur-2xl border-b border-[#2a2150] flex items-center justify-between px-6 shrink-0 z-20 shadow-lg">
          <div className="flex items-center gap-5">
            <Link href="/dashboard/negotiation" className="text-slate-400 hover:text-white transition-all flex items-center justify-center w-10 h-10 rounded-xl hover:bg-[#1e1b4b] border border-transparent hover:border-[#3b2d70]">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#1e1b4b] border border-[#3b2d70] rounded-xl shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                <Command className="w-4 h-4 text-[#c084fc]" />
              </div>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-[#a5b4fc] font-black tracking-widest uppercase text-sm">
                CodeOps Executive
              </span>
            </div>
            <div className="h-6 w-px bg-[#2a2150]"></div>
            <span className="text-[#c4b5fd] font-medium tracking-wide flex items-center gap-2 text-sm bg-[#1e1b4b]/50 px-3 py-1 rounded-lg border border-[#2a2150]">
              <Database className="w-4 h-4 text-[#8b5cf6]" /> {projectName}
            </span>
          </div>
          
          <div className="flex items-center gap-2 px-4 py-1.5 bg-[#059669]/10 border border-[#059669]/30 rounded-full text-[11px] font-black text-[#34d399] tracking-wider uppercase shadow-[0_0_15px_rgba(5,150,105,0.1)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34d399] animate-pulse"></span>
            System Online
          </div>
        </header>

        {/* --- MAIN CONTENT AREA --- */}
        <main className="flex-grow flex relative z-10 p-6 overflow-hidden">
          <AnimatePresence mode="wait">
            
            {/* STATE: IDLE */}
            {appState === "IDLE" && (
              <motion.div 
                key="idle"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 flex flex-col items-center justify-center"
              >
                <div className="max-w-xl text-center z-10 relative">
                  <div className="absolute -inset-10 bg-gradient-to-r from-[#06b6d4] via-[#8b5cf6] to-[#ec4899] rounded-full blur-[100px] opacity-20"></div>
                  
                  <div className="w-28 h-28 bg-[#111229]/90 border border-[#3b2d70] backdrop-blur-xl rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-[0_20px_50px_rgba(139,92,246,0.3)] relative group overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/20 to-[#d946ef]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <Cpu className="w-12 h-12 text-[#c084fc] relative z-10" />
                  </div>
                  
                  <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-[#e2e8f0] to-[#94a3b8] tracking-tight mb-6 drop-shadow-sm w-full">
                    Executive Orchestration
                  </h1>
                  
                  <p className="text-[#a5b4fc] mb-12 leading-relaxed text-lg font-light max-w-lg mx-auto">
                    The legal framework is sealed. Authorize the CodeOps-ULTRA Swarm to autonomously synthesize the cloud architecture, generate boilerplate, and audit vulnerabilities.
                  </p>
                  
                  <button 
                    onClick={triggerCodeOpsSwarm}
                    className="group relative px-12 py-5 bg-gradient-to-r from-[#7c3aed] to-[#db2777] hover:from-[#6d28d9] hover:to-[#be185d] text-white font-bold uppercase tracking-widest rounded-2xl transition-all shadow-[0_0_40px_rgba(217,70,239,0.4)] flex items-center gap-3 mx-auto overflow-hidden hover:scale-105 hover:shadow-[0_0_60px_rgba(217,70,239,0.6)]"
                  >
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[scan_1.5s_ease-in-out_infinite]"></div>
                    <Activity className="w-5 h-5 relative z-10" /> 
                    <span className="relative z-10">Authorize Deployment</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* STATE: ORCHESTRATING */}
            {appState === "ORCHESTRATING" && (
              <motion.div 
                key="orchestrating"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center z-10"
              >
                <div className="w-full max-w-2xl bg-[#0b0c1b]/95 backdrop-blur-3xl border border-[#2a2150] rounded-3xl p-8 font-mono text-sm shadow-[0_20px_80px_rgba(139,92,246,0.3)]">
                  <div className="flex items-center gap-3 border-b border-[#2a2150] pb-5 mb-5">
                    <div className="flex gap-2">
                      <span className="w-3.5 h-3.5 rounded-full bg-[#f43f5e] shadow-[0_0_10px_rgba(244,63,94,0.5)]"></span>
                      <span className="w-3.5 h-3.5 rounded-full bg-[#f59e0b] shadow-[0_0_10px_rgba(245,158,11,0.5)]"></span>
                      <span className="w-3.5 h-3.5 rounded-full bg-[#10b981] shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                    </div>
                    <span className="ml-4 text-[#94a3b8] font-medium tracking-wide">system_orchestrator@codeops:~#</span>
                  </div>
                  <div className="space-y-5 text-[15px] text-[#e2e8f0]">
                    <p className="text-[#2dd4bf] flex items-center gap-3 font-semibold"><Cpu className="w-5 h-5 animate-spin"/> Booting LangGraph Core...</p>
                    <p className="animate-pulse flex items-center gap-3"><Terminal className="w-4 h-4 text-[#8b5cf6]" /> Architect Agent mapping cloud topology...</p>
                    <p className="animate-pulse flex items-center gap-3" style={{ animationDelay: '1s' }}><Code2 className="w-4 h-4 text-[#d946ef]" /> Developer Agent synthesizing repositories...</p>
                    <p className="animate-pulse flex items-center gap-3" style={{ animationDelay: '2s' }}><ShieldCheck className="w-4 h-4 text-[#34d399]" /> DevSecOps scanning for vulnerabilities...</p>
                  </div>
                  <div className="mt-8 h-1 w-full bg-[#1e1b4b] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#06b6d4] via-[#8b5cf6] to-[#ec4899] w-full animate-[loading_3s_ease-in-out_infinite] origin-left"></div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STATE: COMPLETE (THE EXECUTIVE IDE) */}
            {appState === "COMPLETE" && data && (
              <motion.div 
                key="complete"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="flex w-full h-full gap-6"
              >
                {/* --- LEFT PANE: FLOATING EXPLORER --- */}
                <aside className="w-80 bg-[#0b0c1b]/90 backdrop-blur-2xl border border-[#2a2150] rounded-3xl flex flex-col shrink-0 shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden">
                  
                  {/* Workspace Tree */}
                  <div className="flex-grow overflow-y-auto pt-4">
                    <div className="uppercase text-[11px] tracking-[0.25em] text-[#64748b] font-black px-6 py-4 flex items-center gap-2">
                      <FolderTree className="w-4 h-4 text-[#8b5cf6]" /> Active Workspace
                    </div>
                    <ul className="px-4 space-y-2 pb-4">
                      {Object.keys(data.source_code).map((filename) => (
                        <li key={filename}>
                          <button 
                            onClick={() => setActiveFile(filename)}
                            className={`w-full text-left px-4 py-3.5 text-[13px] flex items-center gap-3 rounded-xl transition-all duration-300 font-medium border ${
                              activeFile === filename 
                                ? "bg-[#1e1b4b] border-[#8b5cf6]/50 text-white shadow-[0_0_20px_rgba(139,92,246,0.15)]" 
                                : "bg-transparent border-transparent text-[#94a3b8] hover:bg-[#111229] hover:border-[#2a2150] hover:text-white"
                            }`}
                          >
                            <FileCode2 className={`w-4 h-4 shrink-0 ${activeFile === filename ? "text-[#c084fc]" : "text-[#64748b]"}`} />
                            <span className="truncate tracking-wide">{filename}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Tech Stack Box */}
                  <div className="p-6 border-t border-[#2a2150] bg-[#070514]/50">
                    <h3 className="text-[11px] font-black text-[#64748b] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#d946ef]" /> System Architecture
                    </h3>
                    <div className="flex flex-wrap gap-2.5">
                      {data.architecture.tech_stack.map((tech, i) => (
                        <span key={i} className="px-3 py-1.5 bg-[#1e1b4b] border border-[#3b2d70] rounded-lg text-xs text-[#c4b5fd] font-semibold shadow-inner cursor-default">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </aside>

                {/* --- CENTER PANE: SPLIT GRID --- */}
                <div className="flex-grow grid grid-rows-[1fr_320px] gap-6 min-w-0 h-full overflow-hidden">
                  
                  {/* TOP: Code Editor Card */}
                  <div className="flex flex-col bg-[#070514]/90 backdrop-blur-2xl border border-[#2a2150] rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.5)] min-h-0 overflow-hidden relative">
                    
                    {/* IDE Tab Bar */}
                    <div className="flex bg-[#0b0c1b] border-b border-[#2a2150] h-14 shrink-0 overflow-x-auto items-end px-4 gap-2 pt-2">
                      {activeFile ? (
                        <div className="flex items-center px-6 py-3 bg-[#070514] border-t border-x border-[#2a2150] rounded-t-xl text-[#e2e8f0] text-[13px] font-semibold gap-3 min-w-max relative z-10">
                          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#06b6d4] to-[#8b5cf6] rounded-t-xl"></div>
                          <Code2 className="w-4 h-4 text-[#2dd4bf]" /> {activeFile}
                        </div>
                      ) : (
                        <div className="flex items-center px-6 py-2 text-[#475569] text-sm italic">No file selected</div>
                      )}
                    </div>
                    
                    {/* Code Area */}
                    <div className="flex-grow overflow-y-auto p-6 bg-[#070514] custom-scrollbar">
                      {activeFile ? (
                        <pre className="text-[14px] text-[#a5b4fc] font-mono leading-loose tracking-wide">
                          <code>{data.source_code[activeFile]}</code>
                        </pre>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-[#475569] gap-4">
                          <Sparkles className="w-12 h-12 text-[#334155]" />
                          <span className="text-lg font-black uppercase tracking-[0.2em]">Awaiting Selection</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* BOTTOM: DevSecOps Terminal Card */}
                  <div className="flex flex-col bg-[#0b0c1b]/95 backdrop-blur-2xl border border-[#2a2150] rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.5)] min-h-0 overflow-hidden">
                    
                    {/* Terminal Header (Mac Style) */}
                    <div className="flex items-center justify-between px-6 py-4 bg-[#111229] border-b border-[#2a2150] shrink-0">
                      <div className="flex items-center gap-4">
                        <div className="flex gap-2">
                          <span className="w-3 h-3 rounded-full bg-[#f43f5e]"></span>
                          <span className="w-3 h-3 rounded-full bg-[#f59e0b]"></span>
                          <span className="w-3 h-3 rounded-full bg-[#10b981]"></span>
                        </div>
                        <div className="h-4 w-px bg-[#2a2150]"></div>
                        <div className="flex items-center gap-2">
                          <Terminal className="w-4 h-4 text-[#d946ef]" />
                          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#94a3b8]">DevSecOps Audit</span>
                        </div>
                      </div>
                      
                      <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-lg ${
                        data.deployment_ready 
                          ? "bg-[#059669]/10 border-[#059669]/30 text-[#34d399]" 
                          : "bg-[#e11d48]/10 border-[#e11d48]/30 text-[#fb7185]"
                      }`}>
                        {data.deployment_ready ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                        {data.deployment_ready ? "Audit Passed" : "Vulnerabilities Detected"}
                      </div>
                    </div>
                    
                    {/* Terminal Output */}
                    <div className="flex-grow p-6 overflow-y-auto bg-gradient-to-b from-[#0b0c1b] to-[#070514]">
                      <div className="text-[14px] text-[#2dd4bf] font-mono whitespace-pre-wrap leading-loose">
                        {data.security_audit}
                      </div>
                      
                      {/* Architect Notes Box */}
                      <div className="mt-8 p-5 bg-[#1e1b4b]/50 border border-[#3b2d70] rounded-2xl text-[13px] text-[#c4b5fd] leading-relaxed font-sans shadow-inner">
                        <span className="text-[#e879f9] font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                           <Layers className="w-4 h-4" /> Architect's Notes:
                        </span> 
                        {data.architecture.system_design_notes}
                      </div>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </>
  );
}