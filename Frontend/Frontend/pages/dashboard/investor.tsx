// pages/dashboard/investor.tsx
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Layout from "../../components/Layout";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { Filter, Bookmark, Search, Activity, Target, Building2, ChevronDown, UserPlus, ArrowRight, Loader2 } from "lucide-react";

export default function InvestorDashboard() {
  const { user } = useAuth();
  const [domainFocus, setDomainFocus] = useState("");
  const [fundingStage, setFundingStage] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>({ top_matches: [], saved: 0 });

  useEffect(() => {
    async function fetchLiveMetrics() {
      if (!user) return;
      try {
        const currentUserId = user.user_id || user.id;
        const res = await api.get(`/dashboard/metrics?user_id=${currentUserId}`);
        setMetrics(res.data);
      } catch (error) {
        console.error("Failed to load live metrics:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchLiveMetrics();
  }, [user]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-cyan-400 gap-4">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="font-bold tracking-widest uppercase text-sm">Compiling Active Deal Flow...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-cyan-500/30 pb-20">
        
        <div className="bg-slate-900/50 border-b border-white/5 pt-10 pb-8 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black text-white tracking-tight">Investor Command Center</h1>
              <p className="text-slate-400 mt-2 font-medium">Discover, filter, and connect with high-potential founders.</p>
            </div>
            
            <div className="flex gap-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl px-5 py-3 flex items-center gap-4 shadow-inner">
                <Bookmark className="w-5 h-5 text-purple-400" />
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Saved Deals</div>
                  <div className="text-xl font-black text-white leading-none mt-1">{metrics.likes || 0}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 relative z-10 grid grid-cols-1 xl:grid-cols-4 gap-8 items-start">
          
          <div className="xl:col-span-1 bg-slate-900/80 p-6 rounded-3xl border border-slate-700/50 shadow-2xl sticky top-24">
            <h3 className="font-bold text-white mb-6 uppercase tracking-widest text-sm flex items-center gap-2">
              <Filter className="w-4 h-4 text-cyan-400" /> Refine Search
            </h3>
            
            <div className="space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2"><Target className="w-3.5 h-3.5" /> Domain Focus</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                  <input type="text" placeholder="e.g. FinTech, SaaS" value={domainFocus} onChange={(e) => setDomainFocus(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2"><Activity className="w-3.5 h-3.5" /> Funding Stage</label>
                <div className="relative">
                  <select value={fundingStage} onChange={(e) => setFundingStage(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white appearance-none focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer">
                    <option value="">Any Stage</option>
                    <option value="pre-seed">Pre-Seed</option>
                    <option value="seed">Seed</option>
                    <option value="series-a">Series A</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>
              </div>

              <button className="w-full mt-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3.5 rounded-xl shadow-[0_0_15px_rgba(8,145,178,0.3)] transition-all">Apply Filters</button>
              <button className="w-full mt-2 bg-transparent hover:bg-slate-800 text-slate-400 hover:text-white font-bold py-3 rounded-xl border border-transparent hover:border-slate-700 transition-all">Reset</button>
            </div>
          </div>

          <div className="xl:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-400" /> Active Deal Flow
              </h2>
              <span className="bg-slate-900 border border-slate-700 px-3 py-1 rounded-full text-xs font-bold text-slate-400">
                {metrics.top_matches.length} Results
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {metrics.top_matches.map((founder: any) => (
                <div key={founder.id} className="bg-slate-900/60 rounded-3xl border border-slate-700/50 shadow-xl overflow-hidden hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-900/20 transition-all group flex flex-col h-full">
                  
                  <div className="p-6 pb-4 border-b border-white/5 relative">
                    <div className="absolute top-0 right-0 p-4">
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-black px-2.5 py-1 rounded-md">{founder.match}% Match</span>
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center text-xl font-black text-cyan-400 shadow-inner group-hover:scale-105 transition-transform">
                        {founder.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors truncate pr-16">{founder.name}</h3>
                        <p className="text-sm font-medium text-purple-400 mt-0.5 truncate">{founder.type}</p>
                      </div>
                    </div>
                    <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-800/50">
                      <p className="text-sm text-slate-300 font-medium truncate">Highlight: <span className="text-white">{founder.detail}</span></p>
                    </div>
                  </div>

                  <div className="p-4 mt-auto flex items-center gap-3 bg-slate-900/30">
                    <button className="flex-1 flex justify-center items-center gap-2 py-3 bg-slate-800 hover:bg-cyan-600 text-white text-sm font-bold rounded-xl transition-colors">
                      <UserPlus className="w-4 h-4" /> Connect
                    </button>
                    <Link href={`/profile/view?id=${founder.id}`} className="flex-1 flex justify-center items-center gap-2 py-3 bg-transparent border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white text-sm font-bold rounded-xl transition-all">
                      View Profile <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            {metrics.top_matches.length === 0 && (
               <div className="w-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-3xl">
                 <p className="text-slate-500 font-medium">No live deals match your current criteria.</p>
               </div>
            )}
          </div>

        </div>
      </div>
    </Layout>
  );
}