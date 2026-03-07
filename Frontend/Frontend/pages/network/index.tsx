// pages/network.tsx
import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout"; 
import { motion } from "framer-motion";
import { GripVertical, Target, Users, Search, FileText, CheckCircle2, MoreVertical, Briefcase, MessageSquare } from "lucide-react";
import { api } from "../../lib/api"; 
import KYCModal from "../../components/KYCModal"; // 🛡️ ADDED KYC MODAL
import ChatWindow from "../../components/ChatWindow"; // 🛡️ ADDED CHAT WINDOW
import { useAuth } from "../../context/AuthContext";

const STAGES = [
  { id: "sourced", label: "Sourced", icon: Target, color: "text-slate-400", border: "border-slate-700" },
  { id: "meeting", label: "Initial Meeting", icon: Users, color: "text-blue-400", border: "border-blue-500/30" },
  { id: "diligence", label: "Due Diligence", icon: Search, color: "text-purple-400", border: "border-purple-500/30" },
  { id: "terms", label: "Term Sheet", icon: FileText, color: "text-amber-400", border: "border-amber-500/30" },
  { id: "closed", label: "Closed", icon: CheckCircle2, color: "text-emerald-400", border: "border-emerald-500/30" }
];

// Mock data to render the board immediately
const initialDeals = [
  { id: "1", name: "Asha Patel", entity: "Healthcare AI", stage: "sourced", match: 94 },
  { id: "2", name: "Apex Capital", entity: "Seed Fund", stage: "meeting", match: 88 },
  { id: "3", name: "Quantum Security", entity: "Cybersecurity", stage: "diligence", match: 97 },
];

export default function NetworkBoard() {
  const [deals, setDeals] = useState(initialDeals);
  const [draggedDealId, setDraggedDealId] = useState<string | null>(null);

  // --- KYC & CHAT STATE ---
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showKycModal, setShowKycModal] = useState(false);
  const [isKycVerified, setIsKycVerified] = useState(false);
  const [activeChatUser, setActiveChatUser] = useState<any | null>(null);
  
  const { user } = useAuth();
  const currentUserId = user?.user_id || user?.id || "";

  // 🛡️ Load KYC Status on Mount
  useEffect(() => {
    let mounted = true;
    async function checkKyc() {
      try {
        const kycRes = await api.get("/kyc/status");
        if (mounted) setIsKycVerified(kycRes.data.kyc_verified);
      } catch (e) {
        console.warn("Could not fetch KYC status");
      }
    }
    if (currentUserId) checkKyc();
    return () => { mounted = false; };
  }, [currentUserId]);

  // 🛡️ Trigger Soft Gate
  const handleOpenChat = (deal: any) => {
    if (!currentUserId) {
      alert("Please log in to initiate secure messaging.");
      return;
    }
    setActiveChatUser(deal);
    if (isKycVerified) {
      setIsChatOpen(true);
    } else {
      setShowKycModal(true);
    }
  };

  // --- DRAG AND DROP HANDLERS ---
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedDealId(id);
    e.dataTransfer.effectAllowed = "move";
    setTimeout(() => {
      const el = document.getElementById(`deal-${id}`);
      if (el) el.style.opacity = "0.4";
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent, id: string) => {
    setDraggedDealId(null);
    const el = document.getElementById(`deal-${id}`);
    if (el) el.style.opacity = "1";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); 
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, newStage: string) => {
    e.preventDefault();
    if (!draggedDealId) return;

    setDeals(prev => prev.map(deal => 
      deal.id === draggedDealId ? { ...deal, stage: newStage } : deal
    ));

    try {
      // await api.put(`/deals/${draggedDealId}/stage`, { stage: newStage });
      console.log(`Saved deal ${draggedDealId} to ${newStage}`);
    } catch (error) {
      console.error("Failed to save deal stage");
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-slate-950 text-slate-200 pb-20">
        
        <div className="bg-slate-900/50 border-b border-white/5 pt-10 pb-8 px-6">
          <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
                <Briefcase className="w-8 h-8 text-cyan-400" /> Deal Flow Pipeline
              </h1>
              <p className="text-slate-400 mt-2 font-medium">Track your institutional relationships from sourcing to close.</p>
            </div>
            <div className="bg-slate-950 border border-slate-800 px-4 py-2 rounded-xl text-sm font-bold text-slate-300">
              Total Pipeline Value: <span className="text-emerald-400 ml-2">Confidential</span>
            </div>
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto px-6 py-8 relative z-10 overflow-x-auto">
          <div className="flex gap-6 min-w-max pb-8" style={{ height: 'calc(100vh - 250px)' }}>
            
            {STAGES.map((stage) => (
              <div 
                key={stage.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.id)}
                className={`flex flex-col w-80 shrink-0 bg-slate-900/40 rounded-3xl border border-white/5 shadow-2xl overflow-hidden transition-colors ${draggedDealId ? 'hover:bg-slate-900/80 hover:border-cyan-500/30' : ''}`}
              >
                <div className={`p-4 border-b bg-slate-900/80 flex items-center justify-between ${stage.border}`}>
                  <div className="flex items-center gap-2">
                    <stage.icon className={`w-5 h-5 ${stage.color}`} />
                    <h3 className="font-bold text-white uppercase tracking-wider text-sm">{stage.label}</h3>
                  </div>
                  <span className="w-6 h-6 rounded-full bg-slate-950 flex items-center justify-center text-xs font-bold text-slate-400 border border-slate-800">
                    {deals.filter(d => d.stage === stage.id).length}
                  </span>
                </div>

                <div className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar">
                  {deals.filter(d => d.stage === stage.id).map((deal) => (
                    
                    <div 
                      id={`deal-${deal.id}`}
                      key={deal.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, deal.id)}
                      onDragEnd={(e) => handleDragEnd(e, deal.id)}
                      className="bg-slate-950 border border-slate-700 hover:border-cyan-500/50 rounded-2xl p-4 shadow-lg cursor-grab active:cursor-grabbing group transition-all"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <GripVertical className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                          <span className="text-xs font-black px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {deal.match}% Match
                          </span>
                        </div>
                        {/* 🛡️ ADDED MESSAGE ICON TO TRIGGER SOFT GATE */}
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleOpenChat(deal)} className="text-slate-500 hover:text-cyan-400 transition-colors" title="Open Deal Room">
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <button className="text-slate-600 hover:text-white"><MoreVertical className="w-4 h-4" /></button>
                        </div>
                      </div>
                      
                      <h4 className="font-bold text-white text-lg">{deal.name}</h4>
                      <p className="text-sm font-medium text-slate-400 mt-1">{deal.entity}</p>
                      
                      <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center">
                        <span className="text-xs text-slate-500 font-medium">Updated just now</span>
                        <div className="w-6 h-6 rounded-full bg-cyan-900/50 border border-cyan-800 flex items-center justify-center text-xs text-cyan-400 font-bold">
                          {deal.name.charAt(0)}
                        </div>
                      </div>
                    </div>

                  ))}
                </div>
              </div>
            ))}

          </div>
        </div>

        {/* 🛡️ KYC MODAL */}
        <KYCModal 
          isOpen={showKycModal} 
          onClose={() => {
            setShowKycModal(false);
            setActiveChatUser(null);
          }} 
          onSuccess={() => {
            setShowKycModal(false);
            setIsKycVerified(true);
            setIsChatOpen(true); 
          }} 
        />

        {/* --- SECURE CHAT WINDOW INJECTION --- */}
        {isChatOpen && activeChatUser && (
          <ChatWindow
            currentUserId={String(currentUserId)}
            receiverId={String(activeChatUser.id)}
            receiverName={activeChatUser.name}
            receiverRole={activeChatUser.entity}
            onClose={() => {
              setIsChatOpen(false);
              setActiveChatUser(null);
            }}
          />
        )}

      </div>
    </Layout>
  );
}