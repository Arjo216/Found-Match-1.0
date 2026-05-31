// pages/profile/view.tsx
import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import { api } from "../../lib/api";
import ChatWindow from "../../components/ChatWindow"; 
import KYCModal from "../../components/KYCModal";
import { useAuth } from "../../context/AuthContext"; 
import { MessageSquare, Edit3, FolderKanban, Share2, Download, MapPin, Briefcase, Award, Zap, X, Sparkles, Activity as ActivityIcon } from "lucide-react";
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
  const COLORS = ["#8b5cf6", "#06b6d4", "#d946ef", "#10b981", "#f43f5e", "#f59e0b", "#3b82f6"];

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showKycModal, setShowKycModal] = useState(false);
  const [isKycVerified, setIsKycVerified] = useState(false);
  
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

        try {
          const kycRes = await api.get("/kyc/status");
          if (mounted) setIsKycVerified(kycRes.data.kyc_verified);
        } catch (kycErr) {
          console.warn("Could not fetch KYC status");
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

  const handleOpenDealRoom = () => {
    if (isKycVerified) setIsChatOpen(true);
    else setShowKycModal(true);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-violet-400 font-bold tracking-widest uppercase animate-pulse">
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
          <p className="text-slate-400 mt-2 mb-6">The requested institutional asset does not exist or requires authorization.</p>
          <Link href="/profile/setup" className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl transition-colors">
            Initialize Profile
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-fuchsia-500/30 pb-20 relative overflow-hidden">
        
        {/* Nebula Background Glows */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 relative z-10 space-y-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* HERO CARD */}
            <div className="col-span-1 lg:col-span-2 bg-slate-900/80 rounded-3xl border border-indigo-900/50 shadow-2xl overflow-hidden flex flex-col backdrop-blur-xl">
              
              <div className="h-32 w-full bg-gradient-to-r from-indigo-900 via-violet-900 to-fuchsia-900 relative">
                <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')" }}></div>
                <div className={`absolute top-4 right-4 border text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg z-10 ${isKycVerified ? 'bg-emerald-950/80 border-emerald-900/50 text-emerald-400' : 'bg-amber-950/80 border-amber-900/50 text-amber-400'}`}>
                  {isKycVerified ? (
                    <><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Identity Verified</>
                  ) : (
                    <><span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span> Unverified Participant</>
                  )}
                </div>
              </div>

              <div className="px-6 sm:px-8 pb-8 relative flex flex-col sm:flex-row gap-6 sm:items-start">
                <div className="w-28 h-28 bg-slate-950 border-4 border-slate-900 rounded-2xl flex items-center justify-center text-4xl font-black text-cyan-400 shadow-xl shrink-0 relative -mt-14 z-10">
                  {(profile.full_name || "U").split(" ").map((s) => s[0]).slice(0, 2).join("")}
                </div>

                <div className="flex-1 w-full pt-4 sm:pt-2">
                  <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6">
                    
                    <div className="space-y-3">
                      <div>
                        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-none break-words">
                          {profile.full_name || "Unnamed Entity"}
                        </h1>
                        <div className="text-base text-violet-400 mt-2 font-semibold flex items-center gap-2">
                          <Award className="w-4 h-4 shrink-0" /> <span className="line-clamp-1">{profile.headline || "Institutional Participant"}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2.5">
                        <span className="px-3 py-1.5 rounded-md bg-fuchsia-950/50 text-fuchsia-300 border border-fuchsia-900/50 text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                          <Briefcase className="w-3.5 h-3.5" /> {profile.role || "Unspecified Role"}
                        </span>
                        {(profile.location || profile.domain) && (
                          <span className="px-3 py-1.5 rounded-md bg-slate-950 border border-slate-800 text-slate-300 text-xs font-medium flex items-center gap-1.5">
                            {profile.location && <><MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {profile.location}</>}
                            {profile.location && profile.domain && <span className="text-slate-600">|</span>}
                            {profile.domain}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* --- 🚨 UPGRADED ACTION BUTTONS --- */}
                    <div className="flex flex-wrap items-center gap-3 shrink-0 mt-2 xl:mt-0">
                      
                      <button onClick={handleOpenDealRoom} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-xl border border-slate-700 transition-all group">
                        <MessageSquare className="w-4 h-4 group-hover:scale-110 transition-transform" /> Message
                      </button>
                      
                      <button onClick={() => router.push('/projects')} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl shadow-lg transition-all group">
                        <FolderKanban className="w-4 h-4 group-hover:scale-110 transition-transform" /> Projects
                      </button>

                      {/* NEW BUTTON: Find Matches */}
                      <button onClick={() => router.push('/match')} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-sm font-bold rounded-xl shadow-lg transition-all group">
                        <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" /> Find Matches
                      </button>

                      <Link href="/profile/setup" className="flex items-center justify-center p-2.5 bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white rounded-xl transition-all" title="Edit Profile">
                        <Edit3 className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                  <div className="mt-8 text-slate-300 leading-relaxed font-medium bg-slate-950/80 p-5 rounded-2xl border border-indigo-950 shadow-inner">
                    {profile.bio ? (
                      <p className="whitespace-pre-wrap">{profile.bio}</p>
                    ) : (
                      <p className="text-slate-500 italic">No professional biography provided yet.</p>
                    )}
                  </div>

                  <div className="mt-6">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-amber-400" /> Core Competencies
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {interestData.length > 0 ? (
                        interestData.map((it) => (
                          <span key={it.name} className="text-xs px-4 py-2 rounded-lg bg-indigo-950/30 text-indigo-300 border border-indigo-900/50 font-semibold hover:border-indigo-500/50 transition-colors cursor-default">
                            {it.name}
                          </span>
                        ))
                      ) : (
                        <div className="text-sm text-slate-500 bg-slate-950 px-4 py-2 rounded-lg border border-dashed border-slate-800">No competencies mapped</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* QUICK STATS SIDEBAR */}
            <div className="col-span-1 flex flex-col gap-6">
              
              <div className="bg-slate-900/80 p-8 rounded-3xl border border-indigo-900/50 shadow-xl relative overflow-hidden group backdrop-blur-xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-[40px] group-hover:bg-cyan-500/20 transition-all"></div>
                
                <div className="relative z-10">
                  <div className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-2">
                    Global Match Index
                  </div>
                  <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-violet-500 drop-shadow-sm">
                    {Math.round((profile.match_score_avg || 0) * 10) / 10}
                  </div>
                  <p className="text-sm text-slate-400 mt-2 font-medium">Average alignment across network</p>
                </div>

                <div className="mt-8 relative z-10">
                  <div className="flex justify-between items-end mb-2">
                    <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Profile Strength</div>
                    <div className="text-sm font-bold text-violet-400">{profile.profile_complete_score || 0}%</div>
                  </div>
                  <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800 shadow-inner">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-violet-500"
                      style={{ width: `${profile.profile_complete_score || 0}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/80 p-6 rounded-3xl border border-indigo-900/50 shadow-xl flex flex-col gap-3 backdrop-blur-xl">
                <button onClick={onShare} className="flex items-center justify-center gap-3 px-4 py-3.5 bg-slate-950 hover:bg-slate-800 text-white text-sm font-bold rounded-xl border border-slate-800 transition-all w-full">
                  <Share2 className="w-4 h-4 text-cyan-400" /> Share Profile Link
                </button>
                <button onClick={onExportPDF} className="flex items-center justify-center gap-3 px-4 py-3.5 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white text-sm font-bold rounded-xl border border-slate-800 transition-all w-full">
                  <Download className="w-4 h-4 text-fuchsia-400" /> Export Dossier
                </button>
              </div>

            </div>
          </div>

          {/* BOTTOM GRID: Analytics Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-2">
            <div className="col-span-1 lg:col-span-2 bg-slate-900/80 p-8 rounded-3xl border border-indigo-900/50 shadow-xl backdrop-blur-xl">
              <h3 className="font-bold text-white mb-6 uppercase tracking-widest text-sm flex items-center gap-2">
                <ActivityIcon className="w-4 h-4 text-cyan-400" /> Match Trajectory
              </h3>
              <div className="h-72 w-full">
                {Array.isArray(matchSeries) && matchSeries.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={matchSeries}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                      <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(15,23,42,0.95)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '12px', color: '#fff' }} />
                      <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={4} dot={{ fill: '#0f172a', stroke: '#8b5cf6', strokeWidth: 3, r: 5 }} activeDot={{ r: 8, fill: '#06b6d4', stroke: 'none' }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500 font-medium bg-slate-950 rounded-xl border border-dashed border-slate-800">Insufficient historical data</div>
                )}
              </div>
            </div>

            <div className="col-span-1 bg-slate-900/80 p-8 rounded-3xl border border-indigo-900/50 shadow-xl backdrop-blur-xl">
              <h3 className="font-bold text-white mb-6 uppercase tracking-widest text-sm flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-fuchsia-400" /> Focus Distribution
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
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(15,23,42,0.95)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '12px', color: '#fff' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500 font-medium bg-slate-950 rounded-xl border border-dashed border-slate-800">No distribution mapped</div>
                )}
              </div>
            </div>
          </div>
          
          <KYCModal isOpen={showKycModal} onClose={() => setShowKycModal(false)} onSuccess={() => { setShowKycModal(false); setIsKycVerified(true); setIsChatOpen(true); }} />

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

function PieChartIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
      <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
    </svg>
  );
}