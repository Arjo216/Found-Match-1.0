// pages/profile/setup.tsx
import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { api } from "../../lib/api";
import { useRouter } from "next/router";
import { 
  User, 
  FolderKanban, 
  Sparkles, 
  ShieldCheck,
  Cpu
} from "lucide-react";

type FormState = {
  full_name: string;
  headline: string;
  bio: string;
  domain: string;
  stage: string;
  website: string;
  location: string;
  interestsText: string;
  role: "founder" | "investor" | "";
};

export default function ProfileSetup() {
  const [form, setForm] = useState<FormState>({
    full_name: "", headline: "", bio: "", domain: "", stage: "",
    website: "", location: "", interestsText: "", role: "",
  });
  const [loading, setLoading] = useState(false);
  const [exists, setExists] = useState<boolean | null>(null);
  
  // Controls the Success Screen
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/profile/me");
        const p = res.data || {};
        setForm({
          full_name: p.full_name || p.name || "",
          headline: p.headline || "",
          bio: p.bio || "",
          domain: p.domain || "",
          stage: p.stage || "",
          website: p.website || "",
          location: p.location || "",
          interestsText: Array.isArray(p.interests) ? p.interests.join(", ") : (p.interests || ""),
          role: (p.role as "founder" | "investor") || "",
        });
        setExists(true);
      } catch (e: any) {
        if (e?.response?.status === 404) setExists(false);
        else setExists(false);
      }
    };
    load();
  }, []);

  const submit = async () => {
    setLoading(true);
    try {
      const payload = {
        full_name: form.full_name, headline: form.headline || null,
        bio: form.bio || null, domain: form.domain || null,
        stage: form.stage || null, website: form.website || null,
        location: form.location || null, interests: form.interestsText, 
        role: form.role || "founder",
      };

      let res;
      if (exists) res = await api.put("/profile/", payload);
      else res = await api.post("/profile/", payload);

      if (res?.data) {
        const p = res.data;
        setForm((f) => ({ ...f, interestsText: Array.isArray(p.interests) ? p.interests.join(", ") : (p.interests || "") }));
        setExists(true);
      }
      
      // TRIGGER THE SUCCESS SCREEN
      setShowSuccessModal(true);

    } catch (err: any) {
      console.error("Failed saving profile:", err);
      alert("Failed to save profile. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans relative overflow-hidden selection:bg-fuchsia-500/30 pb-20">
        
        {/* Dynamic Glowing Orbs */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-violet-700/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-700/15 rounded-full blur-[120px] mix-blend-screen pointer-events-none animate-pulse delay-1000"></div>

        <div className="max-w-5xl mx-auto px-6 py-12 relative z-10">
          
          {/* 🚨 CONDITIONAL RENDERING: IF SUCCESS, SHOW 3 OPTIONS. ELSE, SHOW FORM. */}
          {showSuccessModal ? (
            
            <div className="min-h-[70vh] flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500">
              <div className="w-24 h-24 bg-emerald-950 border border-emerald-800 rounded-full flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                <ShieldCheck className="w-12 h-12 text-emerald-400" />
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-wider mb-4 drop-shadow-lg">Profile Synchronized</h2>
              <p className="text-slate-400 text-lg font-medium mb-12 max-w-xl">
                Your identity matrix has been securely locked into the network. Where would you like to deploy next?
              </p>

              <div className="grid gap-6 md:grid-cols-3 w-full">
                
                {/* OPTION 1: Profile View */}
                <button 
                  onClick={() => router.push('/profile/view')}
                  className="flex flex-col items-center justify-center p-8 bg-slate-900 border border-slate-700 hover:border-violet-500 hover:bg-slate-800 rounded-3xl transition-all group shadow-xl"
                >
                  <User className="w-10 h-10 text-indigo-400 mb-4 group-hover:text-indigo-300 transition-colors group-hover:scale-110" />
                  <span className="text-base font-bold text-white uppercase tracking-widest mb-2">View Profile</span>
                  <span className="text-xs text-slate-500 text-center">Inspect your public dossier</span>
                </button>

                {/* OPTION 2: Projects Setup */}
                <button 
                  onClick={() => router.push('/projects')}
                  className="flex flex-col items-center justify-center p-8 bg-indigo-950/40 border border-indigo-900 hover:border-fuchsia-500 hover:bg-indigo-950 rounded-3xl transition-all group shadow-xl"
                >
                  <FolderKanban className="w-10 h-10 text-fuchsia-400 mb-4 group-hover:text-white transition-colors group-hover:scale-110" />
                  <span className="text-base font-bold text-white uppercase tracking-widest mb-2">Deploy Project</span>
                  <span className="text-xs text-violet-400 text-center">Initialize a new startup</span>
                </button>

                {/* OPTION 3: Deal Galaxy Match (PRIMARY) */}
                <button 
                  onClick={() => router.push('/match')}
                  className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-cyan-900/50 to-violet-900/50 border border-cyan-700 hover:border-cyan-400 rounded-3xl transition-all group shadow-[0_0_30px_rgba(14,165,233,0.2)] hover:shadow-[0_0_40px_rgba(14,165,233,0.4)]"
                >
                  <Sparkles className="w-10 h-10 text-cyan-400 mb-4 group-hover:scale-110 transition-transform" />
                  <span className="text-base font-bold text-white uppercase tracking-widest mb-2">Find Matches</span>
                  <span className="text-xs text-cyan-200 text-center">Enter the Deal Galaxy</span>
                </button>

              </div>
            </div>

          ) : (

            /* --- THE SETUP FORM --- */
            <div className="animate-in fade-in duration-500">
              <div className="mb-10 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-950 border border-indigo-900 text-indigo-300 text-xs font-black uppercase tracking-widest mb-6 shadow-lg">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" /> Identity Management System
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4 drop-shadow-md">
                  Institutional Profile
                </h1>
                <p className="text-slate-400 text-sm font-medium tracking-wide">
                  Configure your operational parameters for the LangGraph Swarm.
                </p>
              </div>

              <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-700 p-8 md:p-10 rounded-[2rem] shadow-2xl max-w-4xl mx-auto">
                <div className="grid gap-6 md:grid-cols-2">
                  
                  {/* FULL NAME - Using !important flags to override global CSS */}
                  <label className="block md:col-span-2">
                    <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Authorized Entity Name</div>
                    <input
                      className="w-full !bg-slate-950 !border !border-slate-700 focus:!border-violet-500 rounded-xl px-4 py-3 !text-white outline-none transition-all shadow-inner placeholder:!text-slate-600"
                      value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                      placeholder="e.g. Apex Capital Partners or John Doe"
                    />
                  </label>

                  <label>
                    <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Operational Headline</div>
                    <input
                      className="w-full !bg-slate-950 !border !border-slate-700 focus:!border-violet-500 rounded-xl px-4 py-3 !text-white outline-none transition-all shadow-inner placeholder:!text-slate-600"
                      value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })}
                      placeholder="e.g. Series A Tech Fund"
                    />
                  </label>

                  <label>
                    <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Target Sector / Domain</div>
                    <input
                      className="w-full !bg-slate-950 !border !border-slate-700 focus:!border-violet-500 rounded-xl px-4 py-3 !text-white outline-none transition-all shadow-inner placeholder:!text-slate-600"
                      value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })}
                      placeholder="e.g. Artificial Intelligence"
                    />
                  </label>

                  <label>
                    <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Network Role</div>
                    <select
                      className="w-full !bg-slate-950 !border !border-slate-700 focus:!border-violet-500 rounded-xl px-4 py-3 !text-white outline-none transition-all shadow-inner appearance-none"
                      value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as any })}
                    >
                      <option value="">Select Designation</option>
                      <option value="founder">Founder / Architect</option>
                      <option value="investor">Capital Allocator</option>
                    </select>
                  </label>

                  <label>
                    <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Investment / Build Stage</div>
                    <select
                      className="w-full !bg-slate-950 !border !border-slate-700 focus:!border-violet-500 rounded-xl px-4 py-3 !text-white outline-none transition-all shadow-inner appearance-none"
                      value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })}
                    >
                      <option value="">Select Stage</option>
                      <option value="pre-seed">Pre-Seed</option>
                      <option value="seed">Seed</option>
                      <option value="growth">Growth / Series A+</option>
                    </select>
                  </label>

                  <label>
                    <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Base of Operations</div>
                    <input
                      className="w-full !bg-slate-950 !border !border-slate-700 focus:!border-violet-500 rounded-xl px-4 py-3 !text-white outline-none transition-all shadow-inner placeholder:!text-slate-600"
                      value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                      placeholder="e.g. San Francisco, CA"
                    />
                  </label>

                  <label>
                    <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Digital Perimeter (URL)</div>
                    <input
                      className="w-full !bg-slate-950 !border !border-slate-700 focus:!border-violet-500 rounded-xl px-4 py-3 !text-white outline-none transition-all shadow-inner placeholder:!text-slate-600"
                      value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })}
                      placeholder="https://"
                    />
                  </label>

                  <label className="md:col-span-2">
                    <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Core Competencies (Comma Separated)</div>
                    <input
                      className="w-full !bg-slate-950 !border !border-slate-700 focus:!border-violet-500 rounded-xl px-4 py-3 !text-white outline-none transition-all shadow-inner placeholder:!text-slate-600"
                      value={form.interestsText} onChange={(e) => setForm({ ...form, interestsText: e.target.value })}
                      placeholder="SaaS, LLMs, Zero-Knowledge Proofs"
                    />
                  </label>

                  <label className="md:col-span-2">
                    <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Executive Summary (Bio)</div>
                    <textarea
                      className="w-full !bg-slate-950 !border !border-slate-700 focus:!border-violet-500 rounded-xl px-4 py-3 !text-white outline-none transition-all shadow-inner placeholder:!text-slate-600 h-32 resize-none"
                      value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
                      placeholder="Detail your operational history..."
                    />
                  </label>
                </div>

                <div className="mt-10 pt-8 border-t border-slate-700 flex justify-end">
                  <button
                    onClick={submit}
                    disabled={loading}
                    className="px-10 py-4 bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-lg disabled:opacity-50 hover:scale-105"
                  >
                    {loading ? "Encrypting Data..." : exists ? "Update Matrix" : "Initialize Identity"}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </Layout>
  );
}