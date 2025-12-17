// pages/profile/view.tsx
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import { api } from "../../lib/api";
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
  // optional match history field shapes
  match_score_history?: { date?: string; score?: number }[] | any;
};

export default function ProfileViewPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [matchSeries, setMatchSeries] = useState<any[]>([]);
  const [interestData, setInterestData] = useState<{ name: string; value: number }[]>([]);
  const COLORS = ["#4f46e5", "#06b6d4", "#f97316", "#10b981", "#ef4444", "#8b5cf6", "#f43f5e"];

  // normalize interests into string[]
  const parseInterests = (raw: any): string[] => {
    try {
      if (!raw) return [];
      if (Array.isArray(raw)) return raw.map((x) => (typeof x === "string" ? x : JSON.stringify(x)));
      if (typeof raw === "string") {
        // common formats: "a, b, c" or "a; b; c"
        return raw
          .split(/[,;]+/)
          .map((s) => s.trim())
          .filter(Boolean);
      }
      // If object/map, return stringified values
      if (typeof raw === "object") {
        // if it's an array of objects like [{name:"x"}]
        if (Array.isArray(raw)) return raw.map((it) => (it?.name ? String(it.name) : JSON.stringify(it)));
        return Object.values(raw).map((v) => String(v));
      }
    } catch (e) {
      return [];
    }
    return [];
  };

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        const res = await api.get("/profile/me");
        const data: Profile = res?.data || {};

        // interests normalization
        const interestsArr = parseInterests((data as any).interests);
        const pie = interestsArr.map((name) => ({ name, value: 1 }));
        if (mounted) setInterestData(pie);

        // match series: try dedicated endpoint fallback to profile field(s)
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
    return () => {
      mounted = false;
    };
  }, []);

  // Handler examples (stubs) — replace with real implementations
  const onShare = () => {
    // Example: copy profile URL to clipboard
    const url = `${typeof window !== "undefined" ? window.location.href : ""}`;
    navigator.clipboard?.writeText(url).then(() => alert("Profile URL copied to clipboard"));
  };

  const onExportPDF = async () => {
    // fallback: quick print view (you can replace with server-generated PDF)
    window.print();
  };

  const goToProjects = () => {
    // client-side navigate and pass profile id for prefilter
    router.push({
      pathname: "/projects",
      query: profile?.id ? { fromProfile: String(profile.id) } : {},
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-8 text-center text-gray-600">Loading profile…</div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="p-8 text-center text-gray-600">No profile found.</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="col-span-2 bg-white p-6 rounded-2xl shadow-soft">
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-3xl font-bold text-gray-600">
                {(profile.full_name || "U").split(" ").map((s) => s[0]).slice(0, 2).join("")}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-extrabold">{profile.full_name || "Unnamed"}</h1>
                    <div className="text-sm text-gray-500">{profile.headline}</div>
                    <div className="mt-2 text-sm">
                      <span className="inline-block mr-2 px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs">
                        {profile.role || "—"}
                      </span>
                      <span className="text-gray-500 ml-2">
                        {profile.location ? profile.location : "Location not set"}
                        {profile.domain ? ` • ${profile.domain}` : ""}
                      </span>
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-2">
                    <button className="px-3 py-2 bg-blue-600 text-white rounded shadow" onClick={() => alert("Messaging not implemented")}>
                      Message
                    </button>
                    <Link href="/profile/setup" className="px-3 py-2 border rounded">
                      Edit
                    </Link>

                    {/* View projects (passes profile id via query param) */}
                    <button onClick={goToProjects} className="ml-2 px-3 py-2 bg-indigo-600 text-white rounded">
                      View projects
                    </button>
                  </div>
                </div>

                <div className="mt-4 text-gray-700 whitespace-pre-line">{profile.bio}</div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {interestData.length > 0 ? (
                    interestData.map((it) => (
                      <span key={it.name} className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                        {it.name}
                      </span>
                    ))
                  ) : (
                    <div className="text-sm text-gray-400">No interests provided</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-soft">
            <div className="text-xs text-gray-500">Profile completeness</div>
            <div className="mt-2">
              <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-indigo-600 to-teal-400"
                  style={{ width: `${profile.profile_complete_score || 0}%` }}
                />
              </div>
              <div className="text-sm text-gray-600 mt-2">{profile.profile_complete_score || 0}% complete</div>
            </div>

            <div className="mt-6">
              <div className="text-xs text-gray-500">Match score</div>
              <div className="text-3xl font-bold mt-1">{Math.round((profile.match_score_avg || 0) * 10) / 10}</div>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <button onClick={onShare} className="px-3 py-2 bg-indigo-600 text-white rounded">
                Share profile
              </button>
              <button onClick={onExportPDF} className="px-3 py-2 border rounded">
                Export PDF
              </button>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="col-span-2 bg-white p-6 rounded-2xl shadow-soft">
            <h3 className="font-semibold mb-4">Match History</h3>
            <div className="h-56">
              {Array.isArray(matchSeries) && matchSeries.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={matchSeries}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">No match history yet</div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-soft">
            <h3 className="font-semibold mb-4">Interests distribution</h3>
            <div className="h-56">
              {interestData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={interestData} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70} paddingAngle={3}>
                      {interestData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">No interests to show</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

