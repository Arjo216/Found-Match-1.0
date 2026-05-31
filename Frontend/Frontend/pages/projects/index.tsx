// pages/projects/index.tsx
import React, { useEffect, useMemo, useState } from "react";
import Layout from "../../components/Layout";
import ProjectForm from "../../components/projects/ProjectForm";
import ProjectCard, { ProjectItem } from "../../components/projects/ProjectCard";
import { api } from "../../lib/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useRouter } from "next/router";
import { User, ArrowRight, FolderKanban } from "lucide-react"; // 🚨 NEW IMPORTS

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [successProject, setSuccessProject] = useState<ProjectItem | null>(null);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const r = await api.get("/projects/");
      setProjects(r.data || []);
    } catch (err) {
      console.error("Failed to load projects", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const domainFunding = useMemo(() => {
    const map = new Map<string, number>();
    projects.forEach((p) => {
      const d = (p.domain || "Other").trim();
      map.set(d, (map.get(d) || 0) + (Number(p.funding_goal) || 0));
    });
    return Array.from(map.entries()).map(([domain, total]) => ({ domain, total }));
  }, [projects]);

  const handleProjectCreated = (created: ProjectItem) => {
    setProjects((prev) => [created, ...prev]);
    setSuccessProject(created);
    setShowSuccessBanner(true);
  };

  const handleViewMatches = () => {
    if (!successProject) return;
    const projectId = (successProject as any).id ?? (successProject as any).project_id;
    if (projectId) {
      router.push({ pathname: "/match", query: { fromProject: String(projectId) } });
    } else {
      router.push("/match");
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-fuchsia-500/30 relative overflow-hidden pb-20">
        
        {/* 🌌 Nebula Executive Background Orbs (Synced Aesthetics) */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-violet-700/15 rounded-full blur-[120px] mix-blend-screen pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-700/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none animate-pulse delay-1000"></div>

        <div className="max-w-7xl mx-auto py-12 px-6 relative z-10">
          
          <header className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-950/50 border border-indigo-900 text-indigo-300 text-xs font-black uppercase tracking-widest mb-4 shadow-lg">
                <FolderKanban className="w-3.5 h-3.5 text-fuchsia-400" /> Project Deployment
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-md">Your Portfolio</h1>
              <p className="text-slate-400 mt-2 font-medium max-w-xl">
                Create projects, visualize funding by domain, and manage your pipeline.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              {/* 🚨 NEW: Header "View Profile" Button */}
              <button 
                onClick={() => router.push('/profile/view')}
                className="group px-5 py-2.5 bg-slate-900 hover:bg-indigo-950 border border-slate-800 hover:border-violet-500/50 text-slate-300 hover:text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg hover:shadow-[0_0_20px_rgba(139,92,246,0.2)]"
              >
                <User className="w-4 h-4 text-violet-400 group-hover:scale-110 transition-transform" />
                Return to Profile
              </button>

              <div className="px-5 py-2.5 bg-cyan-950/30 border border-cyan-900/50 rounded-xl text-sm font-bold text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                {loading ? "Syncing..." : `${projects.length} Active Project${projects.length === 1 ? "" : "s"}`}
              </div>
            </div>
          </header>

          {/* Success banner */}
          {showSuccessBanner && successProject && (
            <div className="mb-10 bg-emerald-950/40 border border-emerald-500/30 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-[0_0_40px_rgba(16,185,129,0.15)] backdrop-blur-xl">
              <div>
                <div className="font-black text-emerald-400 uppercase tracking-widest text-xs flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Project Deployed Successfully
                </div>
                <div className="text-white mt-1 text-2xl font-bold tracking-tight">
                  {(successProject as any).title || (successProject as any).name || "Untitled"}
                  { (successProject as any).domain ? <span className="text-slate-400 font-medium text-lg ml-3 border-l border-slate-700 pl-3">{(successProject as any).domain}</span> : "" }
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <button
                  onClick={handleViewMatches}
                  className="flex-1 md:flex-none px-6 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-sm rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:scale-105"
                >
                  Find Matches
                </button>
                <button
                  onClick={() => router.push("/dashboard/founder")}
                  className="flex-1 md:flex-none px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl border border-slate-700 transition-all shadow-lg"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => { setShowSuccessBanner(false); setSuccessProject(null); }}
                  className="px-4 py-3 text-sm font-bold text-slate-500 hover:text-white transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          <div className="grid gap-8 lg:grid-cols-3">
            
            {/* Left column: create form & Profile Link */}
            <aside className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                <ProjectForm onCreated={(p: ProjectItem) => handleProjectCreated(p)} />
                
                {/* 🚨 NEW: INDEPENDENT PROFILE REDIRECT CARD */}
                <div className="p-8 bg-slate-900/60 border border-indigo-900/50 rounded-3xl backdrop-blur-xl flex flex-col items-center text-center shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-[40px] group-hover:bg-violet-500/20 transition-all"></div>
                  
                  <div className="w-14 h-14 bg-indigo-950 border border-indigo-800 rounded-2xl flex items-center justify-center mb-5 shadow-inner relative z-10">
                    <User className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h4 className="text-white font-bold text-lg mb-2 relative z-10">Manage Identity</h4>
                  <p className="text-sm text-slate-400 mb-6 leading-relaxed relative z-10">
                    Not ready to deploy a project yet? Return to your main institutional dossier to review your credentials.
                  </p>
                  
                  <button 
                    onClick={() => router.push('/profile/view')} 
                    className="w-full py-4 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-violet-500/50 text-white text-sm font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg relative z-10"
                  >
                    View Profile <ArrowRight className="w-4 h-4 text-violet-400" />
                  </button>
                </div>
              </div>
            </aside>

            {/* Right column: chart + list */}
            <main className="lg:col-span-2 space-y-8">
              <section className="bg-slate-900/80 p-8 rounded-3xl border border-indigo-900/50 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
                  <h3 className="font-bold text-white uppercase tracking-widest text-sm">Funding Ask by Domain</h3>
                  <div className="text-xs font-bold text-cyan-400 px-3 py-1.5 bg-cyan-950/30 rounded-full border border-cyan-900/50">
                    {domainFunding.length} Sector{domainFunding.length === 1 ? "" : "s"}
                  </div>
                </div>

                <div style={{ height: 280 }} className="w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={domainFunding} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <XAxis dataKey="domain" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                      <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val/1000}k`} dx={-10} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(15,23,42,0.95)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '16px', color: '#fff' }}
                        cursor={{ fill: 'rgba(30,41,59,0.5)' }}
                        formatter={(value: number) => [`$${value.toLocaleString()}`, "Funding Goal"]}
                      />
                      <Bar dataKey="total" radius={[8, 8, 0, 0]}>
                        {domainFunding.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#06b6d4" : "#8b5cf6"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>

              <section>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-white uppercase tracking-widest text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Active Projects
                  </h3>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  {projects.length === 0 ? (
                    <div className="md:col-span-2 bg-slate-900/40 p-14 rounded-3xl border border-indigo-900/30 border-dashed flex flex-col items-center justify-center text-center backdrop-blur-sm">
                      <div className="w-20 h-20 bg-slate-950 rounded-full flex items-center justify-center mb-6 border border-slate-800 shadow-inner">
                        <span className="text-3xl">🚀</span>
                      </div>
                      <h4 className="text-white font-black text-xl mb-2">No deployments found</h4>
                      <p className="text-slate-400 max-w-md leading-relaxed">Use the console on the left to initialize your first project and start mapping the Deal Galaxy for capital matches.</p>
                    </div>
                  ) : (
                    projects.map((p) => (
                      <ProjectCard key={p.id ?? p.title} project={p} />
                    ))
                  )}
                </div>
              </section>
            </main>
          </div>
        </div>
      </div>
    </Layout>
  );
}