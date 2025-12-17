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
} from "recharts";
import { useRouter } from "next/router";

export default function ProjectsPage() {
  const router = useRouter();

  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(false);

  // holds the project object returned by backend for the last created project
  const [successProject, setSuccessProject] = useState<ProjectItem | null>(null);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const r = await api.get("/projects/");
      setProjects(r.data || []);
    } catch (err) {
      console.error("Failed to load projects", err);
      alert("Failed to load projects. Check console.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Aggregate funding by domain for the chart
  const domainFunding = useMemo(() => {
    const map = new Map<string, number>();
    projects.forEach((p) => {
      const d = (p.domain || "Other").trim();
      map.set(d, (map.get(d) || 0) + (Number(p.funding_goal) || 0));
    });
    return Array.from(map.entries()).map(([domain, total]) => ({ domain, total }));
  }, [projects]);

  // Called by ProjectForm when a project is created successfully.
  // ProjectForm must call `props.onCreated(createdProject)` after the POST returns.
  const handleProjectCreated = (created: ProjectItem) => {
    // 1) Update UI immediately
    setProjects((prev) => [created, ...prev]);

    // 2) Save to success state and show banner with two action buttons
    setSuccessProject(created);
    setShowSuccessBanner(true);
    // do not redirect automatically (per your request)
  };

  const handleViewMatches = () => {
    if (!successProject) return;
    const projectId = (successProject as any).id ?? (successProject as any).project_id;
    if (projectId) {
      router.push({
        pathname: "/match",
        query: { fromProject: String(projectId) },
      });
    } else {
      router.push("/match");
    }
  };

  const handleGoDashboard = () => {
    // Default goes to founder dashboard. If your app stores user role,
    // you can fetch /users/me and route dynamically instead.
    router.push("/dashboard/founder");
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-8 px-4">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-extrabold">Projects</h1>
            <p className="text-gray-600 mt-1">
              Create projects, visualize funding by domain, and manage your pipeline.
            </p>
          </div>

          <div className="text-sm text-gray-500">
            {loading ? "Loading..." : `${projects.length} project${projects.length === 1 ? "" : "s"}`}
          </div>
        </header>

        {/* Success banner (appears after create) */}
        {showSuccessBanner && successProject && (
          <div className="mb-6 bg-green-50 border border-green-100 rounded-lg p-4 flex items-center justify-between gap-4">
            <div>
              <div className="font-medium text-green-800">Project created successfully</div>
              <div className="text-sm text-gray-700 mt-1">
                <strong>{(successProject as any).title || (successProject as any).name || "Untitled"}</strong>
                { (successProject as any).domain ? ` • ${ (successProject as any).domain }` : "" }
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleViewMatches}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                aria-label="View matches for this project"
              >
                View Matches
              </button>

              <button
                onClick={handleGoDashboard}
                className="px-4 py-2 border rounded hover:bg-gray-50"
                aria-label="Go to dashboard"
              >
                Go to Dashboard
              </button>

              <button
                onClick={() => { setShowSuccessBanner(false); setSuccessProject(null); }}
                className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
                aria-label="Dismiss"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left column: create form */}
          <aside className="lg:col-span-1">
            <ProjectForm
              onCreated={(p: ProjectItem) => handleProjectCreated(p)}
            />
          </aside>

          {/* Right column: chart + list */}
          <main className="lg:col-span-2 space-y-6">
            <section className="bg-white p-6 rounded-2xl shadow">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold mb-0">Funding by domain</h3>
                <div className="text-sm text-gray-500">{domainFunding.length} domain{domainFunding.length === 1 ? "" : "s"}</div>
              </div>

              <div style={{ height: 220 }} className="mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={domainFunding}>
                    <XAxis dataKey="domain" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="total" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section>
              <div className="grid gap-4 md:grid-cols-2">
                {projects.length === 0 ? (
                  <div className="bg-white p-6 rounded-2xl shadow text-gray-500">
                    No projects yet. Create one using the form on the left.
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
    </Layout>
  );
}
// pages/api/match/index.tsx
