// components/ChatWindow.tsx
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Loader2, CheckCircle2, Sparkles, BrainCircuit, ShieldCheck, Paperclip, FileText, Download, Maximize2, Minimize2 } from "lucide-react";
import { api } from "../lib/api";
import { encryptMessage, decryptMessage, importPublicKey, importPrivateKey, encryptFile, decryptFile } from "../lib/crypto";

type Message = {
  sender_id: string;
  content: string;
  timestamp: string;
  is_file?: boolean;
  file_meta?: any;
};

type ChatWindowProps = {
  currentUserId: string;
  receiverId: string;
  receiverName: string;
  receiverRole: string;
  initialMessage?: string;
  onClose: () => void;
};

export default function ChatWindow({ currentUserId, receiverId, receiverName, receiverRole, initialMessage = "", onClose }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState(initialMessage);
  const [isConnected, setIsConnected] = useState(false);
  
  // Window State
  const [isMaximized, setIsMaximized] = useState(false);
  
  // Vault State
  const [stagedFile, setStagedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  
  // AI State
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [receiverPublicKey, setReceiverPublicKey] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchKey() {
      try {
        const res = await api.get(`/profile/keys/${receiverId}`);
        setReceiverPublicKey(res.data.public_key);
      } catch (e) {
        console.warn("Recipient has not initialized E2EE keys yet.");
      }
    }
    if (receiverId) fetchKey();
  }, [receiverId]);

  const parseMessageContent = (rawText: string, sender: string): Message => {
    const msg: Message = { sender_id: sender, content: rawText, timestamp: "Just now" };
    try {
      if (rawText.startsWith("VAULT_META::")) {
        const jsonMeta = JSON.parse(rawText.replace("VAULT_META::", ""));
        msg.is_file = true;
        msg.file_meta = jsonMeta;
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
      } catch (e) {
        decryptedText = "🔒 [Decryption Failed]";
      }

      const parsedMsg = parseMessageContent(decryptedText, incomingMessage.sender_id);
      setMessages((prev) => [...prev, parsedMsg]);
    };
    
    ws.onclose = () => setIsConnected(false);
    wsRef.current = ws;
    return () => ws.close();
  }, [currentUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, suggestions, stagedFile]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setStagedFile(file);
  };

  const pushToWebSocket = async (plaintext: string) => {
    let payloadContent = plaintext;
    if (receiverPublicKey) {
      try {
        const pubKey = await importPublicKey(receiverPublicKey);
        payloadContent = await encryptMessage(pubKey, plaintext);
      } catch (err) {
        console.error("Encryption failed", err);
        return; 
      }
    } else {
      payloadContent = `[UNENCRYPTED] ${plaintext}`;
    }

    wsRef.current?.send(JSON.stringify({
      receiver_id: String(receiverId),
      content: payloadContent, 
    }));

    const parsedMsg = parseMessageContent(plaintext, String(currentUserId));
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
        
        const fileId = uploadRes.data.file_id;
        const metaPayload = `VAULT_META::${JSON.stringify({ id: fileId, name: stagedFile.name, size: stagedFile.size, k, i })}`;
        
        await pushToWebSocket(metaPayload);
      } else if (stagedFile && !receiverPublicKey) {
        alert("Cannot send file: Recipient has no E2EE keys established.");
        setIsUploading(false);
        return;
      }

      if (inputText.trim()) {
        await pushToWebSocket(inputText);
      }

    } catch (err) {
      console.error("Vault transfer failed:", err);
      alert("Encryption or transfer failed.");
    } finally {
      setInputText("");
      setStagedFile(null);
      setSuggestions([]); 
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileDownload = async (meta: any) => {
    setDownloadingId(meta.id);
    try {
      const res = await api.get(`/vault/download/${meta.id}`, { responseType: 'arraybuffer' });
      const myPrivKeyStr = localStorage.getItem(`fm_priv_key_${currentUserId}`);
      if (!myPrivKeyStr) throw new Error("Private key missing in LocalStorage.");
      
      const privKey = await importPrivateKey(myPrivKeyStr);
      const decryptedBlob = await decryptFile(privKey, res.data, meta.k, meta.i);

      const url = window.URL.createObjectURL(decryptedBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = meta.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Vault extraction failed:", err);
      alert("Failed to decrypt institutional asset.");
    } finally {
      setDownloadingId(null);
    }
  };

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

  return (
    <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, left: 0, zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", padding: isMaximized ? "0px" : "24px" }}>
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} onClick={onClose} />
      
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
        style={{ position: "relative", display: "flex", flexDirection: "column", backgroundColor: "rgba(2, 6, 23, 1)", border: isMaximized ? "none" : "1px solid rgba(147, 51, 234, 0.4)", boxShadow: "0 30px 80px rgba(0,0,0,0.9)" }} 
        className="overflow-hidden"
      >
        
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
            <button onClick={() => setIsMaximized(!isMaximized)} style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} className="hover:text-white transition-colors" title={isMaximized ? "Restore Window" : "Maximize"}>
              {isMaximized ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
            <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} className="hover:text-rose-400 transition-colors" title="Close">
              <X size={24} />
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }} className="custom-scrollbar">
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "32px" }}>
            <span style={{ fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", padding: "6px 16px", borderRadius: "9999px", display: "flex", alignItems: "center", gap: "8px", color: receiverPublicKey ? "#34d399" : "#fbbf24", backgroundColor: receiverPublicKey ? "rgba(6, 78, 59, 0.3)" : "rgba(120, 53, 15, 0.3)", border: `1px solid ${receiverPublicKey ? "rgba(16, 185, 129, 0.3)" : "rgba(245, 158, 11, 0.3)"}` }}>
               <ShieldCheck size={14} /> {receiverPublicKey ? "Hybrid AES-256 + RSA Data Vault" : "Waiting for Recipient Keys"}
            </span>
          </div>

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
                          <p style={{ color: "#94a3b8", fontSize: "12px", margin: "2px 0 0 0" }}>{(msg.file_meta.size / 1024 / 1024).toFixed(2)} MB • Secure Vault</p>
                        </div>
                      </div>
                      <button onClick={() => handleFileDownload(msg.file_meta)} disabled={downloadingId === msg.file_meta.id} style={{ width: "100%", padding: "10px", borderRadius: "8px", backgroundColor: isMe ? "#0891b2" : "#334155", border: "none", color: "white", fontSize: "12px", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", cursor: downloadingId === msg.file_meta.id ? "not-allowed" : "pointer" }}>
                        {downloadingId === msg.file_meta.id ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                        {downloadingId === msg.file_meta.id ? "Decrypting..." : "Decrypt & Download"}
                      </button>
                    </div>
                  ) : (
                    <div style={{ maxWidth: "75%", padding: "16px 20px", fontSize: "16px", lineHeight: "1.6", borderRadius: "16px", borderTopRightRadius: isMe ? "4px" : "16px", borderTopLeftRadius: !isMe ? "4px" : "16px", backgroundColor: isMe ? "#0e7490" : "#1e293b", color: isMe ? "white" : "#e2e8f0", border: `1px solid ${isMe ? "rgba(6, 182, 212, 0.5)" : "#475569"}`, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)", wordBreak: "break-word" }}>
                      {msg.content}
                    </div>
                  )}
                  <span style={{ fontSize: "12px", color: "#64748b", marginTop: "6px", fontWeight: 500, padding: "0 4px" }}>{msg.timestamp}</span>
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
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ padding: "16px 24px", backgroundColor: "#0a0f1c", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", gap: "12px", boxShadow: "inset 0 10px 20px rgba(0,0,0,0.5)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: "bold", color: "#c084fc", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>
                <Sparkles size={16} /> Recommended Approaches
                <button onClick={() => setSuggestions([])} style={{ marginLeft: "auto", background: "transparent", border: "none", color: "#64748b", cursor: "pointer" }}><X size={16} /></button>
              </div>
              {suggestions.map((suggestion, idx) => (
                <button key={idx} onClick={() => { setInputText(suggestion); setSuggestions([]); }} style={{ textAlign: "left", fontSize: "14px", lineHeight: "1.6", color: "#f3e8ff", backgroundColor: "rgba(88, 28, 135, 0.4)", border: "1px solid rgba(168, 85, 247, 0.6)", padding: "14px", borderRadius: "12px", cursor: "pointer", transition: "all 0.2s", boxShadow: "0 4px 15px rgba(168,85,247,0.1)" }}>
                  "{suggestion}"
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

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