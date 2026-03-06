// pages/dashboard/founder.tsx
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Layout from "../../components/Layout";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { Eye, Heart, MessageSquare, TrendingUp, Activity, Star, ArrowRight, UserPlus, Loader2 } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function FounderDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>({
    views: 0, likes: 0, active_conversations: 0, chart_data: [], top_matches: []
  });

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
          <p className="font-bold tracking-widest uppercase text-sm">Compiling Live Telemetry...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-cyan-500/30 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 relative z-10 space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <h1 className="text-4xl font-black text-white tracking-tight">Founder Dashboard</h1>
              <p className="text-slate-400 mt-2 font-medium">Welcome back — finish your profile to unlock higher-tier matches.</p>
            </div>
            <Link href="/profile/setup" className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-xl border border-slate-700 transition-all shadow-lg w-fit">
              Optimize Profile
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-700/50 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-[30px] group-hover:bg-cyan-500/20 transition-all"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-cyan-950/50 border border-cyan-800/50 flex items-center justify-center text-cyan-400"><Eye className="w-6 h-6" /></div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +12%</span>
              </div>
              <div className="relative z-10">
                <h3 className="text-4xl font-black text-white">{metrics.views}</h3>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Profile Views (30d)</p>
              </div>
            </div>

            <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-700/50 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-[30px] group-hover:bg-purple-500/20 transition-all"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-purple-950/50 border border-purple-800/50 flex items-center justify-center text-purple-400"><Heart className="w-6 h-6" /></div>
              </div>
              <div className="relative z-10">
                <h3 className="text-4xl font-black text-white">{metrics.likes}</h3>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Investors Liked</p>
              </div>
            </div>

            <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-700/50 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-[30px] group-hover:bg-emerald-500/20 transition-all"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-emerald-950/50 border border-emerald-800/50 flex items-center justify-center text-emerald-400"><MessageSquare className="w-6 h-6" /></div>
              </div>
              <div className="relative z-10">
                <h3 className="text-4xl font-black text-white">{metrics.active_conversations}</h3>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Active Conversations</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="col-span-1 lg:col-span-2 bg-slate-900/80 p-8 rounded-3xl border border-slate-700/50 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-white uppercase tracking-widest text-sm flex items-center gap-2"><Activity className="w-4 h-4 text-cyan-400" /> Match History</h3>
                <span className="text-xs font-bold text-slate-500 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">Last 30 Days</span>
              </div>
              <div className="h-72 w-full">
                {metrics.chart_data.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metrics.chart_data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                      <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(15,23,42,0.95)', border: '1px solid rgba(6,182,212,0.3)', borderRadius: '12px', color: '#fff' }} />
                      <Line type="monotone" dataKey="score" stroke="#06b6d4" strokeWidth={4} dot={{ fill: '#0f172a', stroke: '#06b6d4', strokeWidth: 3, r: 5 }} activeDot={{ r: 8, fill: '#c084fc', stroke: 'none' }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500 font-medium">Accumulating initial data...</div>
                )}
              </div>
            </div>

            <div className="col-span-1 bg-slate-900/80 p-6 sm:p-8 rounded-3xl border border-slate-700/50 shadow-2xl flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-white uppercase tracking-widest text-sm flex items-center gap-2"><Star className="w-4 h-4 text-purple-400" /> Top Matches</h3>
                <Link href="/match" className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors">Explore</Link>
              </div>
              
              <div className="flex flex-col gap-4 flex-1">
                {metrics.top_matches.length > 0 ? metrics.top_matches.map((inv: any) => (
                  <div key={inv.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 hover:border-slate-600 transition-colors group relative overflow-hidden">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-cyan-400 border border-slate-700">{inv.name.charAt(0)}</div>
                        <div>
                          <h4 className="font-bold text-white text-sm group-hover:text-cyan-400 transition-colors">{inv.name}</h4>
                          <p className="text-xs text-slate-500">{inv.type}</p>
                        </div>
                      </div>
                      <span className="text-xs font-black text-emerald-400 bg-emerald-900/30 px-2 py-1 rounded-md border border-emerald-800/50">{inv.match}%</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-3 font-medium truncate">Focus: {inv.focus}</p>
                    
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <button className="flex items-center justify-center gap-1.5 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold text-white transition-colors">
                        <UserPlus className="w-3.5 h-3.5" /> Connect
                      </button>
                      <Link href={`/profile/view?id=${inv.id}`} className="flex items-center justify-center gap-1.5 py-2 bg-cyan-900/30 hover:bg-cyan-900/50 border border-cyan-800/50 rounded-lg text-xs font-bold text-cyan-400 transition-colors">
                        View <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                )) : (
                  <div className="text-sm text-slate-500 flex flex-col h-full items-center justify-center border border-dashed border-slate-700 rounded-xl">No pending matches</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}