// components/match/DetailDrawer.tsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageSquare, Link as LinkIcon, Bookmark, User, Briefcase, Sparkles, Loader2, Bot } from "lucide-react";
import { api } from "../../lib/api";

type DetailDrawerProps = {
  profileId: string | null;
  open: boolean;
  onClose: () => void;
  initialProfile?: any;
  onMessage?: (prefillMessage?: string) => void; 
};

export default function DetailDrawer({ profileId, open, onClose, initialProfile, onMessage }: DetailDrawerProps) {
  const [profile, setProfile] = useState<any>(initialProfile || null);
  const [loading, setLoading] = useState(false);
  
  const [screeningId, setScreeningId] = useState<number | string | null>(null);
  const [aiQuestions, setAiQuestions] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open || !profileId || profileId === "undefined" || profileId === "null") return;

    async function load() {
      setLoading(true);
      try {
        const r = await api.get(`/profile/${profileId}`);
        setProfile(r.data);
      } catch (e) {
        if (initialProfile) setProfile(initialProfile);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [profileId, open]); 

  const handleAIScreening = async (projectId: number | string) => {
    setScreeningId(projectId);
    try {
      const res = await api.post("/agent/generate-question", { project_id: projectId });
      setAiQuestions(prev => ({ ...prev, [projectId]: res.data.agent_question }));
    } catch (error) {
      console.error("AI screening failed", error);
      setAiQuestions(prev => ({ ...prev, [projectId]: "Error: Failed to connect to AI Agent." }));
    } finally {
      setScreeningId(null);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* BULLETPROOF BACKDROP */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(2, 6, 23, 0.8)', backdropFilter: 'blur(4px)', zIndex: 99997 }}
          />

          {/* BULLETPROOF SIDEBAR */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            style={{ position: 'fixed', top: 0, right: 0, height: '100vh', width: '100%', maxWidth: '500px', backgroundColor: 'rgba(2, 6, 23, 1)', borderLeft: '1px solid rgba(255,255,255,0.1)', boxShadow: '-20px 0 50px rgba(0,0,0,0.8)', zIndex: 99998, display: 'flex', flexDirection: 'column' }}
          >
            {/* HEADER */}
            <div style={{ flexShrink: 0, padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(15, 23, 42, 0.5)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#1e293b', border: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '900', color: '#22d3ee' }}>
                  {(profile?.full_name || "U").charAt(0)}
                </div>
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: '900', color: 'white', margin: 0 }}>{profile?.full_name || "Loading..."}</h2>
                  <span style={{ display: 'inline-block', marginTop: '4px', padding: '2px 10px', borderRadius: '9999px', backgroundColor: 'rgba(168, 85, 247, 0.2)', color: '#d8b4fe', border: '1px solid rgba(168, 85, 247, 0.3)', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {profile?.role || profile?.domain || "User"}
                  </span>
                </div>
              </div>
              <button onClick={onClose} style={{ padding: '8px', backgroundColor: '#1e293b', color: '#94a3b8', borderRadius: '50%', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* BODY CONTENT */}
            <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {loading ? (
                <div style={{ color: '#64748b', fontSize: '14px', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>Fetching latest details...</div>
              ) : (
                <>
                  <section>
                    <h3 style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', color: '#64748b', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <User size={16} /> About
                    </h3>
                    <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.6', backgroundColor: 'rgba(15, 23, 42, 0.4)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', margin: 0 }}>
                      {profile?.bio || profile?.snippet || "No biography provided."}
                    </p>
                  </section>

                  <section>
                    <h3 style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', color: '#64748b', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Briefcase size={16} /> Portfolio / Projects
                    </h3>
                    
                    {profile?.projects && profile.projects.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {profile.projects.map((proj: any, idx: number) => {
                          const currentProjId = proj.id || `temp-proj-${idx}`;

                          return (
                            <div key={idx} style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                <h4 style={{ color: 'white', fontWeight: 'bold', fontSize: '18px', margin: 0 }}>{proj.title}</h4>
                                <span style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', color: '#34d399', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '2px 8px', borderRadius: '9999px' }}>
                                  {proj.stage || "Active"}
                                </span>
                              </div>
                              
                              <p style={{ fontSize: '14px', color: '#d8b4fe', fontWeight: 500, marginBottom: '12px', marginTop: 0 }}>{proj.domain}</p>
                              <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6', marginBottom: '16px', marginTop: 0 }}>{proj.description}</p>
                              
                              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(51, 65, 85, 0.5)' }}>
                                {!aiQuestions[currentProjId] ? (
                                  <button
                                    onClick={() => handleAIScreening(currentProjId)}
                                    disabled={screeningId === currentProjId}
                                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', backgroundColor: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.3)', color: '#c084fc', fontSize: '14px', fontWeight: 'bold', borderRadius: '8px', cursor: screeningId === currentProjId ? 'not-allowed' : 'pointer', opacity: screeningId === currentProjId ? 0.5 : 1 }}
                                  >
                                    {screeningId === currentProjId ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                                    {screeningId === currentProjId ? "Analyzing alignment..." : "Run AI Diligence"}
                                  </button>
                                ) : (
                                  <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    style={{ backgroundColor: 'rgba(59, 7, 100, 0.3)', border: '1px solid rgba(168, 85, 247, 0.2)', padding: '16px', borderRadius: '12px', position: 'relative' }}
                                  >
                                    <div style={{ position: 'absolute', top: '-12px', left: '-8px', backgroundColor: '#0f172a', border: '1px solid rgba(168, 85, 247, 0.3)', padding: '6px', borderRadius: '50%', boxShadow: '0 4px 6px rgba(0,0,0,0.5)' }}>
                                      <Bot size={16} color="#c084fc" />
                                    </div>
                                    <p style={{ fontSize: '14px', color: '#e9d5ff', lineHeight: '1.6', paddingLeft: '8px', fontWeight: 500, fontStyle: 'italic', margin: 0 }}>
                                      "{aiQuestions[currentProjId]}"
                                    </p>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                                      <button 
                                        onClick={() => onMessage?.(aiQuestions[currentProjId])}
                                        style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold', backgroundColor: '#9333ea', color: 'white', padding: '6px 12px', borderRadius: '4px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}
                                      >
                                        Send in Chat
                                      </button>
                                    </div>
                                  </motion.div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div style={{ color: '#94a3b8', fontSize: '14px', backgroundColor: 'rgba(15, 23, 42, 0.4)', padding: '16px', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)', textAlign: 'center' }}>
                        No projects listed yet.
                      </div>
                    )}
                  </section>
                </>
              )}
            </div>

            {/* FOOTER ACTIONS */}
            <div style={{ flexShrink: 0, padding: '24px', borderTop: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(12px)', display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => onMessage?.()} 
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: '#0891b2', color: 'white', padding: '12px', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', border: 'none', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(8, 145, 178, 0.3)' }}
              >
                <MessageSquare size={16} /> Message
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}