// pages/dashboard/founder.tsx
import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { api } from "../../lib/api";
import StatCard from "../../components/StatCard";
import MatchCard from "../../components/MatchCard";
import Skeleton from "../../components/Skeleton";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

type Profile = { id?: string; name?: string; role?: string; headline?: string };

export default function FounderDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [matches, setMatches] = useState<any[] | null>(null);
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const [meRes, matchesRes, statsRes] = await Promise.allSettled([
          api.get("/users/me"),
          api.get("/match/matches"),
          api.get("/profile/stats"),
        ]);

        if (meRes.status === "fulfilled" && mounted) setProfile(meRes.value.data);
        if (matchesRes.status === "fulfilled" && mounted) setMatches(matchesRes.value.data || []);
        if (statsRes.status === "fulfilled" && mounted) setStats(statsRes.value.data || null);

        // fallback mocks
        if (matchesRes.status === "rejected" && mounted) {
          setMatches([
            { id: "i1", name: "Investor A", headline: "Seed investor", image: "/images/sample1.png", summary: "Focus: SaaS, 50-200k" },
            { id: "i2", name: "Investor B", headline: "Angel", image: "/images/sample2.png", summary: "Focus: DeepTech" },
          ]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <Layout>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Founder dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">{profile?.name || "Welcome — finish your profile to get better matches."}</p>
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <a href="/profile/setup" className="px-4 py-2 border rounded">Edit profile</a>
          <a href="/projects" className="px-4 py-2 bg-indigo-600 text-white rounded">Add Project</a>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-4">
          <StatCard title="Views" value={stats?.views ?? 123} delta="+12%" hint="Profile views last 30d" />
          <StatCard title="Likes" value={stats?.likes ?? 12} delta="+3%" hint="Investors who liked your profile" />
          <StatCard title="Matches" value={matches?.length ?? 0} hint="Active conversations" />
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-soft">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Match history</h3>
              <div className="text-sm text-gray-500">Last 30 days</div>
            </div>

            <div className="mt-4 h-56">
              {loading && <Skeleton className="h-full" />}

              {!loading && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats?.match_score_history ?? [{ date: "1", score: 40 }, { date: "2", score: 60 }]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-soft">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Top matched investors</h3>
              <a href="/match" className="text-sm text-indigo-600">Explore more</a>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {matches === null ? (
                <>
                  <Skeleton className="h-28 w-full" />
                  <Skeleton className="h-28 w-full" />
                </>
              ) : matches.length === 0 ? (
                <div className="text-gray-500">No matches yet — update your profile to improve matches.</div>
              ) : (
                matches.map((m) => (
                  <MatchCard key={m.id} id={m.id} name={m.name} headline={m.headline} image={m.image} summary={m.summary} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
