// components/match/DetailDrawer.tsx
import React, { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, MessageSquare, Link as LinkIcon, Bookmark, Building2, UserCircle } from "lucide-react";

export default function DetailDrawer({ profileId, open, onClose, initialProfile }: { profileId: string | null; open: boolean; onClose: ()=>void; initialProfile?: any }) {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(initialProfile || null);

  useEffect(() => {
    async function load() {
      if (!profileId) return;
      setLoading(true);
      try {
        const r = await api.get(`/match/${profileId}`);
        setProfile(r.data);
      } catch (e) {
        console.error("Failed to load profile", e);
      } finally {
        setLoading(false);
      }
    }
    if (open && profileId) load();
  }, [open, profileId]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          
          {/* Dimmed Background Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" 
            onClick={onClose} 
            aria-hidden="true" 
          />

          {/* Sliding Glass Drawer */}
          <motion.aside 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-md bg-slate-900 border-l border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col h-full overflow-hidden"
          >
            {/* Top Gradient Highlight */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-purple-500"></div>

            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-slate-900/50 backdrop-blur-md z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <UserCircle className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    {profile?.full_name || "Loading Profile..."}
                  </h2>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                    {profile?.role || "User Details"}
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-40 space-y-4">
                  <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
                  <span className="text-sm text-slate-400 font-medium animate-pulse">Retrieving Data...</span>
                </div>
              ) : profile ? (
                <div className="space-y-8 fade-in">
                  
                  {/* Bio Section */}
                  <section>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
                      <UserCircle className="w-4 h-4" /> About
                    </h4>
                    <p className="text-sm text-slate-300 leading-relaxed bg-slate-800/30 p-4 rounded-xl border border-white/5">
                      {profile.bio || profile.snippet || "No biography provided."}
                    </p>
                  </section>

                  {/* Projects Section */}
                  <section>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
                      <Building2 className="w-4 h-4" /> Portfolio / Projects
                    </h4>
                    {profile.projects && profile.projects.length > 0 ? (
                      <ul className="space-y-3">
                        {profile.projects.map((p: any) => (
                          <li key={p.id} className="glass p-4 rounded-xl border border-white/5 hover:border-cyan-500/30 transition-colors group">
                            <div className="flex justify-between items-start">
                              <div className="font-semibold text-white text-base group-hover:text-cyan-400 transition-colors">
                                {p.title}
                              </div>
                            </div>
                            <div className="mt-2 text-sm text-slate-400 leading-relaxed">
                              {p.description}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-sm text-slate-500 italic p-4 text-center border border-dashed border-slate-700 rounded-xl">
                        No projects listed yet.
                      </div>
                    )}
                  </section>
                </div>
              ) : (
                <div className="text-sm text-red-400 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                  Failed to load profile data. Please try again.
                </div>
              )}
            </div>

            {/* Sticky Action Footer */}
            {!loading && profile && (
              <div className="p-6 border-t border-white/5 bg-slate-900/80 backdrop-blur-md flex gap-3">
                <button className="flex-1 flex justify-center items-center gap-2 px-4 py-3 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold rounded-xl shadow-[0_0_15px_rgba(8,145,178,0.3)] transition-all">
                  <MessageSquare className="w-4 h-4" /> Message
                </button>
                <button className="flex-1 flex justify-center items-center gap-2 px-4 py-3 border border-slate-700 hover:bg-slate-800 text-slate-300 text-sm font-semibold rounded-xl transition-all">
                  <LinkIcon className="w-4 h-4" /> Intro
                </button>
                <button className="flex justify-center items-center p-3 border border-slate-700 hover:bg-slate-800 text-slate-300 rounded-xl transition-all tooltip" title="Save Profile">
                  <Bookmark className="w-5 h-5" />
                </button>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}