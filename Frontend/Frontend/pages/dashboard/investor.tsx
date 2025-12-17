// pages/dashboard/investor.tsx
import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import FilterPanel from "../../components/FilterPanel";
import MatchCard from "../../components/MatchCard";
import Skeleton from "../../components/Skeleton";
import { api } from "../../lib/api";
import StatCard from "../../components/StatCard";

export default function InvestorDashboard() {
  const [feed, setFeed] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ domain: "", stage: "" });
  const [saved, setSaved] = useState<any[]>([]);

  async function loadFeed() {
    setLoading(true);
    try {
      // call backend with query params if supported
      const q = new URLSearchParams();
      if (filters.domain) q.set("domain", filters.domain);
      if (filters.stage) q.set("stage", filters.stage);

      const res = await api.get(`/match/founders?${q.toString()}`);
      setFeed(res.data || []);
    } catch (e) {
      console.warn("feed error", e);
      setFeed([
        { id: "f1", name: "Shiv Raj", headline: "SaaS - Pre-seed", image: "/images/sample1.png", summary: "20k MRR" },
        { id: "f2", name: "Asha Patel", headline: "Healthcare - Seed", image: "/images/sample2.png", summary: "Pilot with hospital" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFeed();
  }, [filters]);

  const handleLike = async (id: string) => {
    try {
       api.post("/match/swipe", { target_id: id, liked: true });
      // optional: remove from feed locally
      setFeed((prev) => prev?.filter((p) => p.id !== id) ?? prev);
      setSaved((s) => [{ id, savedAt: Date.now() }, ...s]);
    } catch (e) {
      console.error("like failed", e);
    }
  };

  return (
    <Layout>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Investor dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Discover founders matching your interests.</p>
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <a href="/projects" className="px-4 py-2 border rounded">Browse Projects</a>
          <a href="/match" className="px-4 py-2 bg-blue-600 text-white rounded">Open Matching</a>
        </div>
      </div>

      <div className="mt-6 lg:grid lg:grid-cols-[320px_1fr] gap-6">
        <aside>
          <FilterPanel
            domain={filters.domain}
            stage={filters.stage}
            onChange={(patch) => setFilters((f) => ({ ...f, ...(patch as any) }))}
          />

          <div className="mt-6 space-y-3">
            <div className="text-sm font-semibold">Saved</div>
            {saved.length === 0 ? (
              <div className="text-xs text-gray-500">No saved founders yet</div>
            ) : (
              saved.map((s) => <div key={s.id} className="text-sm">{s.id}</div>)
            )}
          </div>
        </aside>

        <main>
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm text-gray-500">Results</div>
            <div className="text-sm text-gray-500">{feed ? `${feed.length} results` : "…"}</div>
          </div>

          {loading && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Skeleton className="h-56" />
              <Skeleton className="h-56" />
              <Skeleton className="h-56" />
            </div>
          )}

          {!loading && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {feed && feed.length === 0 ? (
                <div className="bg-white p-6 rounded-2xl shadow-soft">No founders found</div>
              ) : (
                feed?.map((f) => (
                  <MatchCard
                    key={f.id}
                    id={f.id}
                    name={f.name}
                    headline={f.headline}
                    image={f.image}
                    summary={f.summary}
                    onLike={handleLike}
                  />
                ))
              )}
            </div>
          )}
        </main>
      </div>
    </Layout>
  );
}

