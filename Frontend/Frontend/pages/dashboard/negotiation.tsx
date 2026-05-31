// pages/dashboard/negotiation.tsx
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { Send, Bot, ShieldCheck, Cpu, ArrowLeft, Lock, FileSignature, CheckCircle2 } from "lucide-react";

interface ChatMessage {
  id: string;
  sender_id: string;
  content: string;
  timestamp: string;
  isSystem?: boolean;
}

export default function NegotiationRoom() {
  const router = useRouter();
  const { user } = useAuth();
  
  const targetId = (router.query.target as string) || "investor_demo_1"; 
  const targetName = (router.query.name as string) || "Apex Capital Partners";

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [wsStatus, setWsStatus] = useState<"CONNECTING" | "CONNECTED" | "DISCONNECTED">("CONNECTING");
  const [isAutopilot, setIsAutopilot] = useState(false);
  
  // 🚨 NEW STATE: The Term Sheet
  const [termSheet, setTermSheet] = useState<string | null>(null);
  
  const ws = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => scrollToBottom(), [messages]);

  useEffect(() => {
    if (!user?.id) return;

    const socket = new WebSocket(`ws://localhost:8000/ws/chat/${user.id}`);
    
    socket.onopen = () => {
      setWsStatus("CONNECTED");
      setMessages(prev => [...prev, {
        id: 'sys-1',
        sender_id: 'SYSTEM',
        content: `End-to-End Kyber Encryption Established. Connected to ${targetName}.`,
        timestamp: new Date().toISOString(),
        isSystem: true
      }]);
    };

    socket.onmessage = (event) => {
      try {
        const incomingData = JSON.parse(event.data);
        
        // 🚨 NEW INTERCEPTOR: Catch the Term Sheet
        if (incomingData.command === "DEAL_SEALED") {
          setTermSheet(incomingData.term_sheet);
          return;
        }

        setMessages(prev => [...prev, {
          id: Math.random().toString(36).substr(2, 9),
          sender_id: incomingData.sender_id,
          content: incomingData.content,
          timestamp: incomingData.timestamp || new Date().toISOString(),
        }]);
      } catch (e) {
        console.error("Failed to parse incoming WS message", e);
      }
    };

    socket.onclose = () => setWsStatus("DISCONNECTED");
    socket.onerror = () => setWsStatus("DISCONNECTED");

    ws.current = socket;

    return () => {
      socket.close();
    };
  }, [user?.id, targetName]);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || wsStatus !== "CONNECTED" || isAutopilot) return;

    ws.current?.send(JSON.stringify({
      receiver_id: targetId,
      content: inputText
    }));

    setMessages(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      sender_id: String(user?.id),
      content: inputText,
      timestamp: new Date().toISOString(),
    }]);

    setInputText("");
  };

  const toggleAutopilot = () => {
    const newState = !isAutopilot;
    setIsAutopilot(newState);

    if (newState) {
      setMessages(prev => [...prev, {
        id: Math.random().toString(36).substr(2, 9),
        sender_id: 'SYSTEM',
        content: `[WARNING] Human input locked. LangGraph Swarm is now controlling this channel.`,
        timestamp: new Date().toISOString(),
        isSystem: true
      }]);
      
      ws.current?.send(JSON.stringify({
        receiver_id: "SYSTEM_ROUTER",
        command: "ENABLE_AUTOPILOT"
      }));
    } else {
      setMessages(prev => [...prev, {
        id: Math.random().toString(36).substr(2, 9),
        sender_id: 'SYSTEM',
        content: `[INFO] Autopilot disengaged. Manual control restored.`,
        timestamp: new Date().toISOString(),
        isSystem: true
      }]);
      
      ws.current?.send(JSON.stringify({
        receiver_id: "SYSTEM_ROUTER",
        command: "DISABLE_AUTOPILOT"
      }));
    }
  };

  // 🚨 NEW UI: If the deal is sealed, override the chat room with the Term Sheet
  if (termSheet) {
    return (
      <div className="fixed inset-0 z-50 bg-[#020617] flex flex-col items-center justify-center p-8 overflow-y-auto font-mono">
        <div className="flex flex-col items-center animate-in fade-in zoom-in duration-700">
          <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-emerald-400 text-4xl md:text-5xl font-black uppercase mb-4 tracking-widest drop-shadow-[0_0_15px_rgba(16,185,129,0.5)] text-center">
            Agreement Sealed
          </h1>
          <p className="text-slate-400 mb-10 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" /> QuantumGrid PLUS Ledger Updated. Signatures Verified.
          </p>
          
          <div className="max-w-2xl w-full bg-black/60 border border-emerald-500/30 rounded-2xl p-8 text-emerald-50 shadow-2xl backdrop-blur-xl font-mono whitespace-pre-wrap leading-relaxed relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-cyan-500"></div>
            <div className="flex items-center gap-2 mb-6 border-b border-emerald-500/20 pb-4 text-emerald-400 uppercase tracking-widest text-xs font-bold">
              <FileSignature className="w-4 h-4" /> Official Term Sheet
            </div>
            {termSheet}
          </div>

          {/* 👇 EXACT UPDATE: Added a flex container and the Return to Deal Galaxy button 👇 */}
          <div className="flex flex-wrap justify-center gap-4 mt-10">
            <button 
              className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-lg border border-slate-700"
              onClick={() => router.push('/dashboard/deal-galaxy')}
            >
              Return to Deal Galaxy
            </button>

            <button 
              className="px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)]"
              onClick={() => router.push('/dashboard/codeops')}
            >
              Initialize CodeOps-ULTRA Development
            </button>
          </div>
        </div>
      </div>
    );
  }

  // STANDARD CHAT UI (Only renders if termSheet is null)
  return (
    <>
      <Head>
        <title>Negotiation Room | FoundMatch</title>
      </Head>
      
      <div className="flex h-screen bg-[#020617] text-slate-200 font-mono overflow-hidden">
        
        {/* LEFT SIDEBAR: Deal Info & Controls */}
        <div className="w-1/3 max-w-sm border-r border-white/5 bg-slate-900/30 flex flex-col z-10 shadow-2xl relative">
          <div className="absolute top-0 left-0 w-full h-full bg-cyan-900/10 blur-[100px] pointer-events-none"></div>

          <div className="p-6 border-b border-white/5 backdrop-blur-md">
            <Link href="/dashboard/deal-galaxy" className="inline-flex items-center gap-2 text-slate-500 hover:text-cyan-400 transition-colors text-xs font-bold uppercase tracking-widest mb-6">
              <ArrowLeft className="w-4 h-4" /> Exit Room
            </Link>
            <h1 className="text-2xl font-black text-white tracking-wide uppercase">{targetName}</h1>
            <p className="text-slate-500 text-xs mt-1">ID: {targetId}</p>
          </div>

          <div className="p-6 flex-grow flex flex-col gap-6">
            <div className="bg-black/40 border border-white/10 rounded-xl p-4">
              <h3 className="text-xs text-slate-500 uppercase tracking-widest mb-3 font-bold">Network Status</h3>
              <div className="flex items-center gap-3">
                <div className="relative flex h-3 w-3">
                  {wsStatus === "CONNECTED" && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                  <span className={`relative inline-flex rounded-full h-3 w-3 ${wsStatus === "CONNECTED" ? "bg-emerald-500" : "bg-rose-500"}`}></span>
                </div>
                <span className={`text-sm font-bold ${wsStatus === "CONNECTED" ? "text-emerald-400" : "text-rose-400"}`}>
                  {wsStatus === "CONNECTED" ? "Secure Link Active" : "Link Severed"}
                </span>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-500/70" />
                Zero-Knowledge Proof Verified
              </div>
            </div>

            <div className={`border rounded-xl p-5 transition-all duration-300 ${isAutopilot ? "bg-cyan-950/40 border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.15)]" : "bg-black/40 border-white/10"}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Cpu className={`w-5 h-5 ${isAutopilot ? "text-cyan-400 animate-pulse" : "text-slate-500"}`} />
                  <h3 className="text-xs text-slate-400 uppercase tracking-widest font-bold">AI Autopilot</h3>
                </div>
                <button 
                  onClick={toggleAutopilot}
                  style={{ width: '48px', height: '24px', borderRadius: '9999px', position: 'relative', transition: 'background-color 0.3s', backgroundColor: isAutopilot ? '#06b6d4' : '#334155', border: 'none', cursor: 'pointer' }}
                >
                  <div style={{ position: 'absolute', top: '4px', left: '4px', backgroundColor: 'white', width: '16px', height: '16px', borderRadius: '50%', transition: 'transform 0.3s', transform: isAutopilot ? 'translateX(24px)' : 'translateX(0)' }}></div>
                </button>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                {isAutopilot 
                  ? "LangGraph agents are currently negotiating on your behalf based on your Deal Galaxy risk parameters." 
                  : "Enable to let the Swarm negotiate valuation and draft the term sheet autonomously."}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR: Chat Interface */}
        <div className="flex-grow flex flex-col bg-[url('/images/radar-bg.png')] bg-cover bg-center bg-blend-overlay bg-slate-950/90 relative">
          
          <div className="flex-grow overflow-y-auto p-8 space-y-6">
            {messages.map((msg) => {
              const isMe = msg.sender_id === String(user?.id);
              
              if (msg.isSystem) {
                return (
                  <div key={msg.id} className="flex justify-center my-4 animate-in fade-in zoom-in-95">
                    <div className="bg-black/60 border border-slate-700/50 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2 text-xs text-slate-400">
                      <Lock className="w-3 h-3 text-cyan-500" />
                      {msg.content}
                    </div>
                  </div>
                );
              }

              return (
                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2`}>
                  <div className={`max-w-[70%] rounded-2xl px-5 py-4 ${
                    isMe 
                      ? "bg-emerald-600/20 border border-emerald-500/30 text-emerald-50 rounded-br-none shadow-[0_0_20px_rgba(16,185,129,0.1)]" 
                      : "bg-slate-800/60 border border-white/10 text-slate-200 rounded-bl-none"
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] uppercase tracking-widest font-black ${isMe ? "text-emerald-400" : "text-slate-400"}`}>
                        {isMe ? "You" : targetName}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-6 border-t border-white/5 bg-slate-950/80 backdrop-blur-xl z-20">
            {isAutopilot ? (
              <div className="w-full flex items-center justify-center gap-3 bg-cyan-950/30 border border-cyan-500/30 rounded-xl px-6 py-4 text-cyan-400 shadow-[inset_0_0_20px_rgba(6,182,212,0.1)]">
                <Bot className="w-5 h-5 animate-bounce" />
                <span className="font-bold tracking-widest uppercase text-sm">AI Autopilot Engaged • Human Input Locked</span>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="flex gap-4">
                <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Draft your offer or type [ACCEPT] to seal the deal..."
                  className="flex-grow bg-black/50 border border-slate-700 focus:border-emerald-500 rounded-xl px-6 py-4 text-white outline-none transition-all focus:shadow-[0_0_20px_rgba(16,185,129,0.15)] placeholder:text-slate-600"
                  disabled={wsStatus !== "CONNECTED"}
                />
                <button 
                  type="submit"
                  disabled={!inputText.trim() || wsStatus !== "CONNECTED"}
                  className="bg-white text-black hover:bg-emerald-400 hover:text-black px-6 py-4 rounded-xl font-black uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  Transmit <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </>
  );
}