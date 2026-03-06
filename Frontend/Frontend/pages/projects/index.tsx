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
      <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-cyan-500/30">
        <div className="max-w-7xl mx-auto py-12 px-6 relative z-10">
          
          <header className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <h1 className="text-4xl font-black text-white tracking-tight">Your Portfolio</h1>
              <p className="text-slate-400 mt-2 font-medium">
                Create projects, visualize funding by domain, and manage your pipeline.
              </p>
            </div>
            <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-full text-sm font-bold text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
              {loading ? "Syncing..." : `${projects.length} Active Project${projects.length === 1 ? "" : "s"}`}
            </div>
          </header>

          {/* Success banner */}
          {showSuccessBanner && successProject && (
            <div className="mb-8 glass bg-emerald-900/20 border border-emerald-500/30 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_0_30px_rgba(16,185,129,0.1)] backdrop-blur-md">
              <div>
                <div className="font-black text-emerald-400 uppercase tracking-wider text-xs">Project Deployed Successfully</div>
                <div className="text-white mt-1 text-lg font-bold">
                  {(successProject as any).title || (successProject as any).name || "Untitled"}
                  { (successProject as any).domain ? <span className="text-slate-400 font-medium text-sm ml-2">• {(successProject as any).domain}</span> : "" }
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={handleViewMatches}
                  className="flex-1 sm:flex-none px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                >
                  Find Matches
                </button>
                <button
                  onClick={() => router.push("/dashboard/founder")}
                  className="flex-1 sm:flex-none px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-xl border border-slate-700 transition-all"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => { setShowSuccessBanner(false); setSuccessProject(null); }}
                  className="px-3 py-2 text-sm font-bold text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left column: create form */}
            <aside className="lg:col-span-1">
              <div className="sticky top-8">
                <ProjectForm onCreated={(p: ProjectItem) => handleProjectCreated(p)} />
              </div>
            </aside>

            {/* Right column: chart + list */}
            <main className="lg:col-span-2 space-y-8">
              <section className="glass bg-slate-900/40 p-8 rounded-3xl border border-white/5 shadow-2xl backdrop-blur-md">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-white uppercase tracking-wider text-sm">Funding Ask by Domain</h3>
                  <div className="text-xs font-bold text-cyan-400 px-3 py-1 bg-cyan-900/30 rounded-full border border-cyan-800/50">
                    {domainFunding.length} Sector{domainFunding.length === 1 ? "" : "s"}
                  </div>
                </div>

                <div style={{ height: 260 }} className="w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={domainFunding} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <XAxis dataKey="domain" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', color: '#fff' }}
                        cursor={{ fill: '#1e293b' }}
                        formatter={(value: number) => [`$${value.toLocaleString()}`, "Funding Goal"]}
                      />
                      <Bar dataKey="total" radius={[6, 6, 0, 0]}>
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
                  <h3 className="font-bold text-white uppercase tracking-wider text-sm">Active Projects</h3>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  {projects.length === 0 ? (
                    <div className="md:col-span-2 glass bg-slate-900/40 p-12 rounded-3xl border border-white/5 border-dashed flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-slate-700">
                        <span className="text-2xl">🚀</span>
                      </div>
                      <h4 className="text-white font-bold text-lg">No projects deployed</h4>
                      <p className="text-slate-400 mt-2 max-w-sm">Use the console on the left to initialize your first project and start matching with investors.</p>
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