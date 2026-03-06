// components/AICoPilot.tsx
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, X, Loader2, Sparkles, BrainCircuit, Activity, ShieldCheck, Paperclip, FileText, Maximize2, Minimize2 } from "lucide-react";
import { api } from "../lib/api";

type Message = { role: "user" | "assistant"; content: string };

export default function AICoPilot({ profileId }: { profileId: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "I am your Executive Co-Pilot. I can analyze market trends, review attached pitch decks, and help you draft institutional materials. How can I assist you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, suggestions]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAttachedFile(file);
  };

  const handleSend = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    
    const userMsg = customText || input.trim();
    if (!userMsg && !attachedFile) return;
    if (isTyping) return;

    setInput("");
    setSuggestions([]); 
    
    const displayMsg = attachedFile ? `📄 [Attached: ${attachedFile.name}]\n\n${userMsg}` : userMsg;
    setMessages(prev => [...prev, { role: "user", content: displayMsg }]);
    
    setIsTyping(true);
    
    const fileToSend = attachedFile;
    setAttachedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    try {
      let replyText = "";

      if (fileToSend) {
        const formData = new FormData();
        formData.append("file", fileToSend);
        formData.append("message", userMsg || "Please analyze this document.");
        formData.append("history", JSON.stringify(messages.slice(-4)));
        formData.append("profile_id", String(profileId));

        const res = await api.post("/agent/analyze-document", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        replyText = res.data.reply;
      } else {
        const res = await api.post("/agent/copilot", {
          profile_id: profileId,
          message: userMsg,
          history: messages.slice(-4) 
        });
        replyText = res.data.reply;
      }

      setMessages(prev => [...prev, { role: "assistant", content: replyText }]);
    } catch (err) {
      console.error("Co-Pilot Error:", err);
      setMessages(prev => [...prev, { role: "assistant", content: "System error. Please reconnect." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const fetchAISuggestions = async () => {
    setIsGenerating(true);
    try {
      const res = await api.post("/agent/copilot-assist", { profile_id: profileId });
      setSuggestions(res.data.suggestions);
    } catch (error) {
      console.error("Failed to generate suggestions", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            style={{ position: 'fixed', bottom: '32px', right: '32px', zIndex: 99990 }}
            className="w-16 h-16 bg-gradient-to-tr from-cyan-600 to-purple-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(8,145,178,0.4)] hover:shadow-[0_0_40px_rgba(168,85,247,0.6)] transition-all group border-2 border-white/30"
          >
            <BrainCircuit className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, left: 0, zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", padding: isMaximized ? "0px" : "24px" }}>
            <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }} onClick={() => setIsOpen(false)} />

            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ 
                opacity: 1, 
                scale: 1, 
                y: 0,
                width: isMaximized ? "100vw" : "100%",
                maxWidth: isMaximized ? "100vw" : "800px",
                height: isMaximized ? "100vh" : "85vh",
                maxHeight: isMaximized ? "100vh" : "900px",
                borderRadius: isMaximized ? "0px" : "16px"
              }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              transition={{ duration: 0.3, ease: "anticipate" }}
              style={{ position: "relative", display: "flex", flexDirection: "column", backgroundColor: "rgba(2, 6, 23, 0.95)", border: isMaximized ? "none" : "1px solid rgba(168, 85, 247, 0.4)", boxShadow: "0 30px 80px rgba(0,0,0,0.9)" }} 
              className="overflow-hidden"
            >
              
              <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.1)", backgroundColor: "rgba(15, 23, 42, 1)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "rgba(168, 85, 247, 0.1)", border: "1px solid rgba(168, 85, 247, 0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#c084fc" }}>
                    <BrainCircuit size={24} />
                  </div>
                  <div>
                    <h3 style={{ color: "white", fontWeight: "bold", fontSize: "18px", display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
                      Executive Co-Pilot
                      <span style={{ fontSize: "10px", backgroundColor: "rgba(16, 185, 129, 0.1)", color: "#34d399", padding: "2px 8px", borderRadius: "9999px", border: "1px solid rgba(16, 185, 129, 0.2)", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Activity size={10} /> ONLINE
                      </span>
                    </h3>
                    <p style={{ color: "#94a3b8", fontSize: "14px", fontWeight: 500, margin: "2px 0 0 0" }}>Institutional Strategy Engine</p>
                  </div>
                </div>
                
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <button onClick={() => setIsMaximized(!isMaximized)} style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} className="hover:text-white transition-colors" title={isMaximized ? "Restore Window" : "Maximize"}>
                    {isMaximized ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                  </button>
                  <button onClick={() => setIsOpen(false)} style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} className="hover:text-rose-400 transition-colors" title="Close">
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div style={{ flex: 1, overflowY: "auto", padding: "24px" }} className="custom-scrollbar">
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "32px" }}>
                  <span style={{ fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", padding: "6px 16px", borderRadius: "9999px", display: "flex", alignItems: "center", gap: "8px", color: "#c084fc", backgroundColor: "rgba(88, 28, 135, 0.3)", border: "1px solid rgba(147, 51, 234, 0.3)" }}>
                     <ShieldCheck size={14} /> Ephemeral Processing Active
                  </span>
                </div>

                <AnimatePresence>
                  {messages.map((msg, idx) => {
                    const isUser = msg.role === "user";
                    return (
                      <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", flexDirection: "column", alignItems: isUser ? "flex-end" : "flex-start", marginBottom: "20px" }}>
                        <div style={{ maxWidth: "80%", padding: "16px 20px", fontSize: "15px", lineHeight: "1.7", borderRadius: "16px", borderTopRightRadius: isUser ? "4px" : "16px", borderTopLeftRadius: !isUser ? "4px" : "16px", backgroundColor: isUser ? "#4c1d95" : "#1e293b", color: isUser ? "white" : "#e2e8f0", border: `1px solid ${isUser ? "#7c3aed" : "#475569"}`, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                          {msg.role === "assistant" && <Bot className="w-4 h-4 mb-2 text-purple-400 inline-block mr-2" />}
                          {msg.content}
                        </div>
                      </motion.div>
                    );
                  })}
                  {isTyping && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", alignItems: "center", gap: "12px", backgroundColor: "#1e293b", padding: "16px 20px", borderRadius: "16px", borderTopLeftRadius: "4px", width: "fit-content", border: "1px solid #475569" }}>
                      <Loader2 size={18} className="animate-spin text-purple-400" />
                      <span className="text-sm text-slate-300 font-medium">Synthesizing intelligence...</span>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              <AnimatePresence>
                {attachedFile && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} style={{ padding: "0 24px 12px", backgroundColor: "rgba(15, 23, 42, 1)" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "rgba(14, 116, 144, 0.2)", border: "1px solid rgba(6, 182, 212, 0.4)", padding: "8px 12px", borderRadius: "8px" }}>
                      <FileText size={16} color="#67e8f9" />
                      <span style={{ fontSize: "13px", color: "white", fontWeight: "bold", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{attachedFile.name}</span>
                      <button onClick={() => setAttachedFile(null)} style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", display: "flex" }}><X size={16} className="hover:text-rose-400" /></button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {suggestions.length > 0 && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ padding: "16px 24px", backgroundColor: "#0a0f1c", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", gap: "12px", boxShadow: "inset 0 10px 20px rgba(0,0,0,0.5)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: "bold", color: "#c084fc", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>
                      <Sparkles size={16} /> Recommended Queries
                      <button onClick={() => setSuggestions([])} style={{ marginLeft: "auto", background: "transparent", border: "none", color: "#64748b", cursor: "pointer" }}><X size={16} /></button>
                    </div>
                    {suggestions.map((suggestion, idx) => (
                      <button key={idx} onClick={() => { setInput(suggestion); setSuggestions([]); }} style={{ textAlign: "left", fontSize: "14px", lineHeight: "1.6", color: "#f3e8ff", backgroundColor: "rgba(88, 28, 135, 0.4)", border: "1px solid rgba(168, 85, 247, 0.6)", padding: "14px", borderRadius: "12px", cursor: "pointer", transition: "all 0.2s", boxShadow: "0 4px 15px rgba(168,85,247,0.1)" }}>
                        "{suggestion}"
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSend} style={{ flexShrink: 0, padding: "20px 24px", borderTop: "1px solid rgba(255,255,255,0.1)", backgroundColor: "rgba(15, 23, 42, 1)", display: "flex", gap: "12px", alignItems: "center" }}>
                <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept=".pdf,.txt,.csv" style={{ display: "none" }} />
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isTyping} title="Upload Document for AI Review" style={{ width: "48px", height: "48px", flexShrink: 0, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", cursor: isTyping ? "not-allowed" : "pointer" }} className="hover:text-cyan-400 hover:border-cyan-500/50 transition-colors">
                  <Paperclip size={20} />
                </button>
                <button type="button" onClick={fetchAISuggestions} disabled={isGenerating || isTyping} style={{ width: "48px", height: "48px", flexShrink: 0, borderRadius: "50%", backgroundColor: "rgba(147, 51, 234, 0.2)", border: "1px solid rgba(168, 85, 247, 0.5)", display: "flex", alignItems: "center", justifyContent: "center", color: "#c084fc", cursor: isGenerating || isTyping ? "not-allowed" : "pointer", opacity: isGenerating || isTyping ? 0.5 : 1 }}>
                  {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <BrainCircuit size={24} />}
                </button>
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask the AI to review a Pitch Deck..." disabled={isTyping} style={{ flex: 1, backgroundColor: "#020617", border: "1px solid #475569", borderRadius: "9999px", padding: "14px 20px", fontSize: "16px", color: "white", outline: "none" }} />
                <button type="submit" disabled={(!input.trim() && !attachedFile) || isTyping} style={{ width: "48px", height: "48px", flexShrink: 0, borderRadius: "50%", backgroundColor: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center", color: "white", border: "none", cursor: (!input.trim() && !attachedFile) || isTyping ? "not-allowed" : "pointer", opacity: (!input.trim() && !attachedFile) || isTyping ? 0.5 : 1 }}>
                  <Send size={20} style={{ marginLeft: "4px" }} />
                </button>
              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}