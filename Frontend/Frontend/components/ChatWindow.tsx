// components/ChatWindow.tsx
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Loader2, CheckCircle2, Sparkles, BrainCircuit, ShieldCheck, Paperclip, FileText, Download, Maximize2, Minimize2, Printer } from "lucide-react";
import { api } from "../lib/api";
import { encryptMessage, decryptMessage, importPublicKey, importPrivateKey, encryptFile, decryptFile } from "../lib/crypto";

type Message = { sender_id: string; content: string; timestamp: string; is_file?: boolean; file_meta?: any; };
type ChatWindowProps = { currentUserId: string; receiverId: string; receiverName: string; receiverRole: string; initialMessage?: string; onClose: () => void; };

const formatTime = (isoString: string) => {
  if (!isoString) return "Just now";
  const date = new Date(isoString);
  const now = new Date();
  const diffMins = Math.round((now.getTime() - date.getTime()) / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  if (isToday) return `Today at ${timeString}`;
  return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${timeString}`;
};

export default function ChatWindow({ currentUserId, receiverId, receiverName, receiverRole, initialMessage = "", onClose }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState(initialMessage);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  
  const [isMaximized, setIsMaximized] = useState(false);
  const [stagedFile, setStagedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [receiverPublicKey, setReceiverPublicKey] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchKeyAndHistory() {
      try {
        const keyRes = await api.get(`/profile/keys/${receiverId}`);
        setReceiverPublicKey(keyRes.data.public_key);
      } catch (e) { console.warn("Recipient has not initialized E2EE keys yet."); }

      try {
        const histRes = await api.get(`/chat/history/${currentUserId}/${receiverId}`);
        const rawHistory = histRes.data.messages || [];
        const myPrivKeyStr = localStorage.getItem(`fm_priv_key_${currentUserId}`);
        let privKey: CryptoKey | null = null;
        if (myPrivKeyStr) privKey = await importPrivateKey(myPrivKeyStr);

        const decryptedHistory: Message[] = [];
        for (const m of rawHistory) {
          let text = m.content;
          if (privKey && !text.startsWith("[UNENCRYPTED]")) {
            text = await decryptMessage(privKey, text); 
          }
          decryptedHistory.push(parseMessageContent(text, m.sender_id, m.timestamp));
        }
        setMessages(decryptedHistory);
      } catch (e) {
        console.error("Failed to load history.");
      } finally {
        setIsLoadingHistory(false);
      }
    }
    if (receiverId && currentUserId) fetchKeyAndHistory();
  }, [receiverId, currentUserId]);

  const parseMessageContent = (rawText: string, sender: string, timestamp?: string): Message => {
    const msg: Message = { sender_id: sender, content: rawText, timestamp: timestamp || new Date().toISOString() };
    try {
      if (rawText.startsWith("VAULT_META::")) {
        msg.is_file = true;
        msg.file_meta = JSON.parse(rawText.replace("VAULT_META::", ""));
      }
    } catch (e) {}
    return msg;
  };

  useEffect(() => {
    const wsUrl = `ws://localhost:8000/ws/chat/${currentUserId}`;
    const ws = new WebSocket(wsUrl);
    ws.onopen = () => setIsConnected(true);
    
    ws.onmessage = async (event) => {
      const incomingMessage = JSON.parse(event.data);
      if (String(incomingMessage.sender_id) === String(currentUserId)) return;

      let decryptedText = incomingMessage.content;
      try {
        const myPrivKeyStr = localStorage.getItem(`fm_priv_key_${currentUserId}`);
        if (myPrivKeyStr && !incomingMessage.content.startsWith("[UNENCRYPTED]")) {
          const privKey = await importPrivateKey(myPrivKeyStr);
          decryptedText = await decryptMessage(privKey, incomingMessage.content);
        }
      } catch (e) { decryptedText = "🔒 [Decryption Failed]"; }

      const parsedMsg = parseMessageContent(decryptedText, incomingMessage.sender_id, incomingMessage.timestamp);
      setMessages((prev) => [...prev, parsedMsg]);
    };
    
    ws.onclose = () => setIsConnected(false);
    wsRef.current = ws;
    return () => ws.close();
  }, [currentUserId]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, suggestions, stagedFile]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) setStagedFile(file); };

  const pushToWebSocket = async (plaintext: string) => {
    let payloadContent = plaintext;
    if (receiverPublicKey) {
      try {
        const pubKey = await importPublicKey(receiverPublicKey);
        payloadContent = await encryptMessage(pubKey, plaintext);
      } catch (err) { return; }
    } else {
      payloadContent = `[UNENCRYPTED] ${plaintext}`;
    }
    wsRef.current?.send(JSON.stringify({ receiver_id: String(receiverId), content: payloadContent }));
    const parsedMsg = parseMessageContent(plaintext, String(currentUserId), new Date().toISOString());
    setMessages((prev) => [...prev, parsedMsg]);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!wsRef.current || !isConnected) return;
    if (!inputText.trim() && !stagedFile) return;

    setIsUploading(true);
    try {
      if (stagedFile && receiverPublicKey) {
        const pubKey = await importPublicKey(receiverPublicKey);
        const arrayBuffer = await stagedFile.arrayBuffer();
        const { encryptedBlob, k, i } = await encryptFile(pubKey, arrayBuffer);

        const formData = new FormData();
        formData.append("file", encryptedBlob, "encrypted.bin");
        const uploadRes = await api.post("/vault/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
        
        await pushToWebSocket(`VAULT_META::${JSON.stringify({ id: uploadRes.data.file_id, name: stagedFile.name, size: stagedFile.size, k, i })}`);
      }
      if (inputText.trim()) await pushToWebSocket(inputText);
    } catch (err) { alert("Transfer failed."); } 
    finally { setInputText(""); setStagedFile(null); setSuggestions([]); setIsUploading(false); if (fileInputRef.current) fileInputRef.current.value = ""; }
  };

  const handleFileDownload = async (meta: any) => {
    setDownloadingId(meta.id);
    try {
      const res = await api.get(`/vault/download/${meta.id}`, { responseType: 'arraybuffer' });
      const myPrivKeyStr = localStorage.getItem(`fm_priv_key_${currentUserId}`);
      if (!myPrivKeyStr) throw new Error("Private key missing");
      const privKey = await importPrivateKey(myPrivKeyStr);
      const decryptedBlob = await decryptFile(privKey, res.data, meta.k, meta.i);
      const url = window.URL.createObjectURL(decryptedBlob);
      const a = document.createElement("a"); a.href = url; a.download = meta.name; document.body.appendChild(a); a.click(); window.URL.revokeObjectURL(url);
    } catch (err) { alert("Failed to decrypt asset."); } 
    finally { setDownloadingId(null); }
  };

  // 100% RESTORED OLD AI LOGIC
  const fetchAISuggestions = async () => {
    setIsGenerating(true);
    try {
      const historyPayload = messages.slice(-5).map(m => ({
        role: String(m.sender_id) === String(currentUserId) ? "user" : "assistant",
        content: m.is_file ? "[Sent an encrypted document]" : m.content
      }));

      const res = await api.post("/agent/chat-assist", {
        sender_id: String(currentUserId),
        receiver_id: String(receiverId),
        history: historyPayload
      });
      
      if (res.data && res.data.suggestions) {
        setSuggestions(res.data.suggestions);
      }
    } catch (error) {
      console.error("Failed to generate suggestions", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const html = `<html><head><title>Deal Room Dossier</title><style>body{font-family:sans-serif;padding:40px;line-height:1.6}.message{margin-bottom:20px;padding:15px;background:#f9f9f9;border-left:4px solid #ddd}.message.me{border-left-color:#0891b2;background:#f0fdfa}.msg-header{font-size:11px;color:#888;margin-bottom:8px;font-weight:bold}</style></head><body><h2>Deal Room Transcript: ${receiverName}</h2>${messages.map(m => `<div class="message ${String(m.sender_id) === String(currentUserId) ? 'me' : ''}"><div class="msg-header">${String(m.sender_id) === String(currentUserId) ? 'You' : receiverName} • ${new Date(m.timestamp).toLocaleString()}</div><div>${m.is_file ? '📎 SECURE ASSET: ' + m.file_meta?.name : m.content}</div></div>`).join('')}<script>setTimeout(()=>window.print(),500);</script></body></html>`;
    printWindow.document.write(html); printWindow.document.close();
  };

  return (
    <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, left: 0, zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", padding: isMaximized ? "0px" : "24px" }}>
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} onClick={onClose} />
      
      <motion.div layout initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0, width: isMaximized ? "100vw" : "100%", maxWidth: isMaximized ? "100vw" : "800px", height: isMaximized ? "100vh" : "85vh", maxHeight: isMaximized ? "100vh" : "900px", borderRadius: isMaximized ? "0px" : "16px" }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: 0.3 }} style={{ position: "relative", display: "flex", flexDirection: "column", backgroundColor: "rgba(2, 6, 23, 1)", border: isMaximized ? "none" : "1px solid rgba(147, 51, 234, 0.4)", boxShadow: "0 30px 80px rgba(0,0,0,0.9)" }} className="overflow-hidden">
        
        <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.1)", backgroundColor: "rgba(15, 23, 42, 1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ position: "relative" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "#1e293b", border: "1px solid #334155", display: "flex", alignItems: "center", justifyContent: "center", color: "#22d3ee", fontWeight: "bold", fontSize: "18px" }}>{receiverName.charAt(0)}</div>
              <div style={{ position: "absolute", bottom: 0, right: 0, width: "14px", height: "14px", borderRadius: "50%", border: "2px solid #0f172a", backgroundColor: isConnected ? "#10b981" : "#f43f5e" }}></div>
            </div>
            <div>
              <h3 style={{ color: "white", fontWeight: "bold", fontSize: "18px", display: "flex", alignItems: "center", gap: "6px", margin: 0 }}>{receiverName} <CheckCircle2 size={18} color="#22d3ee" /></h3>
              <p style={{ color: "#94a3b8", fontSize: "14px", fontWeight: 500, margin: "2px 0 0 0" }}>{receiverRole}</p>
            </div>
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button onClick={handleExportPDF} style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} className="hover:text-emerald-400 transition-colors" title="Export Offline Dossier"><Printer size={20} /></button>
            <button onClick={() => setIsMaximized(!isMaximized)} style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} className="hover:text-white transition-colors" title="Maximize">{isMaximized ? <Minimize2 size={20} /> : <Maximize2 size={20} />}</button>
            <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} className="hover:text-rose-400 transition-colors" title="Close"><X size={24} /></button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }} className="custom-scrollbar">
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "32px" }}>
            <span style={{ fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", padding: "6px 16px", borderRadius: "9999px", display: "flex", alignItems: "center", gap: "8px", color: receiverPublicKey ? "#34d399" : "#fbbf24", backgroundColor: receiverPublicKey ? "rgba(6, 78, 59, 0.3)" : "rgba(120, 53, 15, 0.3)", border: `1px solid ${receiverPublicKey ? "rgba(16, 185, 129, 0.3)" : "rgba(245, 158, 11, 0.3)"}` }}>
               <ShieldCheck size={14} /> {receiverPublicKey ? "Hybrid AES-256 + RSA Data Vault" : "Waiting for Recipient Keys"}
            </span>
          </div>

          {isLoadingHistory && <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}><Loader2 className="animate-spin text-cyan-500" size={24} /></div>}

          <AnimatePresence>
            {messages.map((msg, idx) => {
              const isMe = String(msg.sender_id) === String(currentUserId);
              return (
                <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start", marginBottom: "16px" }}>
                  {msg.is_file ? (
                    <div style={{ maxWidth: "320px", padding: "16px", borderRadius: "16px", borderTopRightRadius: isMe ? "4px" : "16px", borderTopLeftRadius: !isMe ? "4px" : "16px", backgroundColor: isMe ? "rgba(14, 116, 144, 0.2)" : "rgba(30, 41, 59, 0.8)", border: `1px solid ${isMe ? "rgba(6, 182, 212, 0.4)" : "#475569"}`, display: "flex", flexDirection: "column", gap: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: "40px", height: "40px", borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: isMe ? "#67e8f9" : "#cbd5e1" }}><FileText size={20} /></div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ color: "white", fontSize: "14px", fontWeight: "bold", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{msg.file_meta.name}</p>
                        </div>
                      </div>
                      <button onClick={() => handleFileDownload(msg.file_meta)} disabled={downloadingId === msg.file_meta.id} style={{ width: "100%", padding: "10px", borderRadius: "8px", backgroundColor: isMe ? "#0891b2" : "#334155", border: "none", color: "white", fontSize: "12px", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", cursor: downloadingId === msg.file_meta.id ? "not-allowed" : "pointer" }}>
                        {downloadingId === msg.file_meta.id ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} Decrypt Asset
                      </button>
                    </div>
                  ) : (
                    <div style={{ maxWidth: "75%", padding: "16px 20px", fontSize: "15px", lineHeight: "1.6", borderRadius: "16px", borderTopRightRadius: isMe ? "4px" : "16px", borderTopLeftRadius: !isMe ? "4px" : "16px", backgroundColor: isMe ? "#0e7490" : "#1e293b", color: isMe ? "white" : "#e2e8f0", border: `1px solid ${isMe ? "rgba(6, 182, 212, 0.5)" : "#475569"}`, wordBreak: "break-word", whiteSpace: "pre-wrap" }}>
                      {msg.content}
                    </div>
                  )}
                  <span style={{ fontSize: "11px", color: "#64748b", marginTop: "6px", fontWeight: 600, padding: "0 4px" }}>{formatTime(msg.timestamp)}</span>
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        <AnimatePresence>
          {stagedFile && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} style={{ padding: "0 24px 12px", backgroundColor: "rgba(15, 23, 42, 1)" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "rgba(14, 116, 144, 0.2)", border: "1px solid rgba(6, 182, 212, 0.4)", padding: "8px 12px", borderRadius: "8px" }}>
                <FileText size={16} color="#67e8f9" />
                <span style={{ fontSize: "13px", color: "white", fontWeight: "bold", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{stagedFile.name}</span>
                <button onClick={() => setStagedFile(null)} style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", display: "flex" }}><X size={16} className="hover:text-rose-400" /></button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {suggestions.length > 0 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ padding: "16px 24px", backgroundColor: "#0a0f1c", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: "bold", color: "#c084fc", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>
                <Sparkles size={16} /> Recommended Approaches
                <button onClick={() => setSuggestions([])} style={{ marginLeft: "auto", background: "transparent", border: "none", color: "#64748b", cursor: "pointer" }}><X size={16} /></button>
              </div>
              {suggestions.map((suggestion, idx) => (
                <button key={idx} onClick={() => { setInputText(suggestion); setSuggestions([]); }} style={{ textAlign: "left", fontSize: "14px", lineHeight: "1.6", color: "#f3e8ff", backgroundColor: "rgba(88, 28, 135, 0.4)", border: "1px solid rgba(168, 85, 247, 0.6)", padding: "14px", borderRadius: "12px", cursor: "pointer", transition: "all 0.2s" }}>
                  "{suggestion}"
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 100% RESTORED OLD BUTTON LAYOUT */}
        <form onSubmit={handleSendMessage} style={{ flexShrink: 0, padding: "20px 24px", borderTop: "1px solid rgba(255,255,255,0.1)", backgroundColor: "rgba(15, 23, 42, 1)", display: "flex", gap: "12px", alignItems: "center" }}>
          <input type="file" ref={fileInputRef} onChange={handleFileSelect} style={{ display: "none" }} />
          <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading || !isConnected || !receiverPublicKey} title={!receiverPublicKey ? "Recipient needs to log in to enable Vault" : "Attach secure document"} style={{ width: "48px", height: "48px", flexShrink: 0, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", cursor: (isUploading || !isConnected || !receiverPublicKey) ? "not-allowed" : "pointer", opacity: (isUploading || !isConnected || !receiverPublicKey) ? 0.5 : 1 }}>
            {isUploading ? <Loader2 size={20} className="animate-spin text-cyan-400" /> : <Paperclip size={20} />}
          </button>
          <button type="button" onClick={fetchAISuggestions} disabled={isGenerating || !isConnected} style={{ width: "48px", height: "48px", flexShrink: 0, borderRadius: "50%", backgroundColor: "rgba(147, 51, 234, 0.2)", border: "1px solid rgba(168, 85, 247, 0.5)", display: "flex", alignItems: "center", justifyContent: "center", color: "#c084fc", cursor: "pointer" }}>
            {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <BrainCircuit size={24} />}
          </button>
          <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder={isConnected ? "Draft encrypted message..." : "Connecting..."} disabled={!isConnected || isUploading} style={{ flex: 1, backgroundColor: "#020617", border: "1px solid #475569", borderRadius: "9999px", padding: "14px 20px", fontSize: "16px", color: "white", outline: "none" }} />
          <button type="submit" disabled={(!inputText.trim() && !stagedFile) || !isConnected || isUploading} style={{ width: "48px", height: "48px", flexShrink: 0, borderRadius: "50%", backgroundColor: "#0891b2", display: "flex", alignItems: "center", justifyContent: "center", color: "white", border: "none", cursor: (!inputText.trim() && !stagedFile) || !isConnected || isUploading ? "not-allowed" : "pointer", opacity: (!inputText.trim() && !stagedFile) || !isConnected || isUploading ? 0.5 : 1 }}>
            <Send size={20} style={{ marginLeft: "4px" }} />
          </button>
        </form>
      </motion.div>
    </div>
  );
}