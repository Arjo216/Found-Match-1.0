// pages/profile/view.tsx
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import { api } from "../../lib/api";
import ChatWindow from "../../components/ChatWindow"; 
import { useAuth } from "../../context/AuthContext"; 
import { MessageSquare, Edit3, FolderKanban, Share2, Download, MapPin, Briefcase, Award, Zap, X } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

type Profile = {
  id?: string;
  full_name?: string;
  headline?: string;
  bio?: string;
  domain?: string;
  stage?: string;
  website?: string;
  location?: string;
  interests?: string[] | string | null | any;
  role?: string;
  profile_complete_score?: number;
  match_score_avg?: number;
  match_score_history?: { date?: string; score?: number }[] | any;
  user_id?: string;
};

export default function ProfileViewPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [matchSeries, setMatchSeries] = useState<any[]>([]);
  const [interestData, setInterestData] = useState<{ name: string; value: number }[]>([]);
  const COLORS = ["#4f46e5", "#06b6d4", "#f97316", "#10b981", "#ef4444", "#8b5cf6", "#f43f5e"];

  const [isChatOpen, setIsChatOpen] = useState(false);
  const { user } = useAuth();
  const currentUserId = user?.user_id || user?.id || "";

  const parseInterests = (raw: any): string[] => {
    try {
      if (!raw) return [];
      if (Array.isArray(raw)) return raw.map((x) => (typeof x === "string" ? x : JSON.stringify(x)));
      if (typeof raw === "string") return raw.split(/[,;]+/).map((s) => s.trim()).filter(Boolean);
      if (typeof raw === "object") {
        if (Array.isArray(raw)) return raw.map((it) => (it?.name ? String(it.name) : JSON.stringify(it)));
        return Object.values(raw).map((v) => String(v));
      }
    } catch (e) { return []; }
    return [];
  };

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const res = await api.get("/profile/me");
        const data: Profile = res?.data || {};

        const interestsArr = parseInterests((data as any).interests);
        const pie = interestsArr.map((name) => ({ name, value: 1 }));
        if (mounted) setInterestData(pie);

        try {
          const stats = await api.get("/profile/stats");
          const series = stats?.data?.match_score_history || stats?.data?.history || [];
          if (mounted) setMatchSeries(Array.isArray(series) ? series : []);
        } catch (statsErr) {
          const fallback = (data as any).match_score_history || (data as any).match_history || [];
          if (mounted) setMatchSeries(Array.isArray(fallback) ? fallback : []);
        }

        if (mounted) setProfile(data);
      } catch (err) {
        console.error("Failed loading profile:", err);
        if (mounted) setProfile(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const onShare = () => {
    const url = `${typeof window !== "undefined" ? window.location.href : ""}`;
    navigator.clipboard?.writeText(url).then(() => alert("Profile URL copied to clipboard"));
  };

  const onExportPDF = async () => { window.print(); };

  const goToProjects = () => {
    router.push({
      pathname: "/projects",
      query: profile?.id ? { fromProfile: String(profile.id) } : {},
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-cyan-400 font-bold tracking-widest uppercase animate-pulse">
          Decrypting Institutional Profile...
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center border border-white/10 mb-4">
            <X className="text-slate-500 w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white">Profile Not Found</h2>
          <p className="text-slate-400 mt-2">The requested institutional asset does not exist or requires authorization.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-cyan-500/30 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 relative z-10 space-y-8">
          
          {/* TOP GRID: Profile Hero & Core Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* HERO CARD (Spans 2 columns) */}
            <div className="col-span-1 lg:col-span-2 bg-slate-900/80 rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden flex flex-col">
              
              {/* Cover Banner */}
              <div className="h-32 w-full bg-gradient-to-r from-cyan-900/60 to-purple-900/60 relative">
                <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')" }}></div>
                <div className="absolute top-4 right-4 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg z-10">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Identity Verified
                </div>
              </div>

              {/* Main Content Area */}
              <div className="px-6 sm:px-8 pb-8 relative flex flex-col sm:flex-row gap-6 sm:items-start">
                
                {/* Floating Avatar - Adjusted negative margin to prevent clipping */}
                <div className="w-28 h-28 bg-slate-950 border-4 border-slate-800 rounded-2xl flex items-center justify-center text-4xl font-black text-cyan-400 shadow-xl shrink-0 relative -mt-14 z-10">
                  {(profile.full_name || "U").split(" ").map((s) => s[0]).slice(0, 2).join("")}
                </div>

                <div className="flex-1 w-full pt-4 sm:pt-2">
                  <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6">
                    
                    {/* Name & Badges */}
                    <div className="space-y-3">
                      <div>
                        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-none break-words">
                          {profile.full_name || "Unnamed Entity"}
                        </h1>
                        <div className="text-base text-cyan-400 mt-2 font-semibold flex items-center gap-2">
                          <Award className="w-4 h-4 shrink-0" /> <span className="line-clamp-1">{profile.headline || "Institutional Participant"}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2.5">
                        <span className="px-3 py-1.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                          <Briefcase className="w-3.5 h-3.5" /> {profile.role || "Unspecified Role"}
                        </span>
                        {(profile.location || profile.domain) && (
                          <span className="px-3 py-1.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5">
                            {profile.location && <><MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {profile.location}</>}
                            {profile.location && profile.domain && <span className="text-slate-600">|</span>}
                            {profile.domain}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Primary Action Buttons */}
                    <div className="flex flex-wrap items-center gap-3 shrink-0 mt-2 xl:mt-0">
                      <button onClick={() => setIsChatOpen(true)} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold rounded-xl shadow-lg transition-all group">
                        <MessageSquare className="w-4 h-4 group-hover:scale-110 transition-transform" /> Message
                      </button>
                      <button onClick={goToProjects} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded-xl shadow-lg transition-all group">
                        <FolderKanban className="w-4 h-4 group-hover:scale-110 transition-transform" /> Projects
                      </button>
                      <Link href="/profile/setup" className="flex items-center justify-center p-2.5 bg-slate-800 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white rounded-xl transition-all" title="Edit Profile">
                        <Edit3 className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                  {/* Bio Block */}
                  <div className="mt-8 text-slate-300 leading-relaxed font-medium bg-slate-950/50 p-5 rounded-2xl border border-slate-800 shadow-inner">
                    {profile.bio ? (
                      <p className="whitespace-pre-wrap">{profile.bio}</p>
                    ) : (
                      <p className="text-slate-500 italic">No professional biography provided yet.</p>
                    )}
                  </div>

                  {/* Focus / Interests Tags */}
                  <div className="mt-6">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5" /> Core Competencies
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {interestData.length > 0 ? (
                        interestData.map((it) => (
                          <span key={it.name} className="text-xs px-4 py-2 rounded-lg bg-slate-800/80 text-cyan-300 border border-cyan-500/20 font-semibold hover:border-cyan-500/50 transition-colors cursor-default">
                            {it.name}
                          </span>
                        ))
                      ) : (
                        <div className="text-sm text-slate-500 bg-slate-900/50 px-4 py-2 rounded-lg border border-dashed border-slate-700">No competencies mapped</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* QUICK STATS SIDEBAR */}
            <div className="col-span-1 flex flex-col gap-6">
              
              {/* Score Card */}
              <div className="bg-slate-900/80 p-8 rounded-3xl border border-slate-700/50 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-[40px] group-hover:bg-cyan-500/20 transition-all"></div>
                
                <div className="relative z-10">
                  <div className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-2">
                    Global Match Index
                  </div>
                  <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-purple-500 drop-shadow-sm">
                    {Math.round((profile.match_score_avg || 0) * 10) / 10}
                  </div>
                  <p className="text-sm text-slate-400 mt-2 font-medium">Average alignment across entire network</p>
                </div>

                <div className="mt-8 relative z-10">
                  <div className="flex justify-between items-end mb-2">
                    <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Profile Strength</div>
                    <div className="text-sm font-bold text-cyan-400">{profile.profile_complete_score || 0}%</div>
                  </div>
                  <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800 shadow-inner">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-600 via-cyan-500 to-cyan-400"
                      style={{ width: `${profile.profile_complete_score || 0}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Utility Actions */}
              <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-700/50 shadow-xl flex flex-col gap-3">
                <button onClick={onShare} className="flex items-center justify-center gap-3 px-4 py-3.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-xl border border-slate-600 transition-all w-full">
                  <Share2 className="w-4 h-4 text-cyan-400" /> Share Profile Link
                </button>
                <button onClick={onExportPDF} className="flex items-center justify-center gap-3 px-4 py-3.5 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white text-sm font-bold rounded-xl border border-slate-800 transition-all w-full">
                  <Download className="w-4 h-4 text-purple-400" /> Export Dossier
                </button>
              </div>

            </div>
          </div>

          {/* BOTTOM GRID: Analytics Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-2">
            
            {/* Line Chart */}
            <div className="col-span-1 lg:col-span-2 bg-slate-900/80 p-8 rounded-3xl border border-slate-700/50 shadow-xl">
              <h3 className="font-bold text-white mb-6 uppercase tracking-widest text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" /> Match Trajectory (30 Days)
              </h3>
              <div className="h-72 w-full">
                {Array.isArray(matchSeries) && matchSeries.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={matchSeries}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                      <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(15,23,42,0.95)', border: '1px solid rgba(6,182,212,0.3)', borderRadius: '12px', color: '#fff' }} />
                      <Line type="monotone" dataKey="score" stroke="#06b6d4" strokeWidth={4} dot={{ fill: '#0f172a', stroke: '#06b6d4', strokeWidth: 3, r: 5 }} activeDot={{ r: 8, fill: '#c084fc', stroke: 'none' }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500 font-medium bg-slate-950/50 rounded-xl border border-dashed border-slate-800">Insufficient historical data</div>
                )}
              </div>
            </div>

            {/* Pie Chart */}
            <div className="col-span-1 bg-slate-900/80 p-8 rounded-3xl border border-slate-700/50 shadow-xl">
              <h3 className="font-bold text-white mb-6 uppercase tracking-widest text-sm flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-purple-400" /> Focus Distribution
              </h3>
              <div className="h-72 w-full">
                {interestData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={interestData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} stroke="none" paddingAngle={8} cornerRadius={4}>
                        {interestData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(15,23,42,0.95)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: '12px', color: '#fff' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500 font-medium bg-slate-950/50 rounded-xl border border-dashed border-slate-800">No distribution mapped</div>
                )}
              </div>
            </div>

          </div>
          
          {/* --- SECURE CHAT WINDOW COMPONENT --- */}
          {isChatOpen && profile && (
            <ChatWindow
              currentUserId={String(currentUserId)}
              receiverId={String(profile.user_id || profile.id)} 
              receiverName={profile.full_name || "Self Chat Test"}
              receiverRole={profile.role || "Testing Mode"}
              onClose={() => setIsChatOpen(false)}
            />
          )}

        </div>
      </div>
    </Layout>
  );
}

// Helper icons
function PieChartIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
      <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
    </svg>
  );
}

function Activity(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
    </svg>
  );
}