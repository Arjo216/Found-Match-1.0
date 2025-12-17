// pages/match/index.tsx
import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Layout from "../../components/Layout";
import { api } from "../../lib/api";
import MatchCard from "../../components/match/MatchCard";
import FilterBar from "../../components/match/FilterBar";
import DetailDrawer from "../../components/match/DetailDrawer";

type ProfileItem = {
  id: string | number;
  full_name?: string;
  headline?: string;
  domain?: string;
  stage?: string;
  location?: string;
  match_score?: number;
  score?: number;
  recommendation?: string | null;
  avatar?: string;
  snippet?: string;
  [k: string]: any;
};

export default function MatchPage() {
  const [items, setItems] = useState<ProfileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [selected, setSelected] = useState<ProfileItem | null>(null);

  const loadMatches = useCallback(async (params: Record<string, any> = {}) => {
    setLoading(true);
    setError(null);
    try {
      // Primary endpoint (your backend router implements GET /match/)
      const r = await api.get("/match/", { params });
      const data = r?.data;
      let list: ProfileItem[] = [];
      if (Array.isArray(data)) list = data;
      else if (Array.isArray(data?.matches)) list = data.matches;
      else if (Array.isArray(data?.results)) list = data.results;
      else if (Array.isArray(data?.items)) list = data.items;
      else {
        const maybe = data?.matches || data?.results || data?.items;
        if (Array.isArray(maybe)) list = maybe;
        else {
          setError("Unexpected /match/ response shape. See console for payload.");
          console.warn("Unexpected /match/ payload:", data);
          setItems([]);
          return;
        }
      }
      setItems(list);
    } catch (e: any) {
      console.error("Failed to load match feed", e);
      const status = e?.response?.status;
      if (status === 401) {
        setError("Authentication required — please login and create your profile.");
      } else if (status === 404) {
        setError("Matches endpoint not found on backend (404). Confirm routing /match/.");
      } else if (status === 422) {
        setError("Validation failed when requesting matches: " + JSON.stringify(e?.response?.data || e?.message));
      } else {
        setError("Failed to load feed: " + (e?.message || String(e)));
      }
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMatches(filters);
  }, [loadMatches, filters]);

  /**
   * Ensure ML prediction exists for a profile.
   * - Calls backend inference endpoint (adjust path if different)
   * - merges results into `items` state and updates `selected` if it's the same profile
   */
  const ensurePredictionFor = useCallback(async (profile: ProfileItem) => {
    if (!profile?.id) return null;
    // if score already present, return it
    if (typeof profile.match_score === "number" || typeof profile.score === "number") {
      return profile.match_score ?? profile.score;
    }

    try {
      // call ML endpoint (adjust path if your backend uses /ml/predict or /match/predict)
      const res = await api.post("/ml/predict", { profile_id: profile.id });
      const out = res?.data || {};
      let ms: number | null = null;
      if (typeof out.match_score === "number") ms = out.match_score;
      else if (typeof out.match_percent === "number") ms = out.match_percent;
      else if (typeof out.score === "number") ms = out.score;
      else if (typeof out.match_score === "string") {
        const p = parseFloat(out.match_score.replace("%", ""));
        if (!Number.isNaN(p)) ms = p;
      }
      const rec = out.recommendation ?? out.label ?? null;

      if (ms !== null) {
        const idStr = String(profile.id);
        setItems((prev) => prev.map((it) => (String(it.id) === idStr ? { ...it, match_score: ms, recommendation: rec } : it)));
        setSelected((s) => (s && String(s.id) === idStr ? { ...s, match_score: ms, recommendation: rec } : s));
        return ms;
      }
      return null;
    } catch (err) {
      console.warn("Prediction request failed for", profile.id, err);
      return null;
    }
  }, []);

  const onApplyFilters = (next: Record<string, any>) => {
    setFilters(next);
    loadMatches(next);
  };

  // open detail drawer: ensure prediction first, then open with freshest item state
  const openProfileDetail = useCallback(
    async (p: ProfileItem) => {
      await ensurePredictionFor(p);
      // use latest item data from items state (in case prediction updated it)
      const fresh = items.find((it) => String(it.id) === String(p.id)) ?? p;
      setSelected(fresh);
    },
    [ensurePredictionFor, items]
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-extrabold mb-6">Find Matches</h1>

        <FilterBar onApply={onApplyFilters} initialFilters={filters} />

        <div className="mt-8">
          {loading && <div className="text-sm text-gray-500">Loading matches…</div>}

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded mb-4">
              <div className="text-red-700 mb-2">{error}</div>
              <div className="flex gap-2">
                <button onClick={() => loadMatches(filters)} className="px-3 py-1 bg-red-600 text-white rounded">
                  Retry
                </button>

                {/* New Link API (no <a> children) */}
                <Link href="/login" className="px-3 py-1 border rounded">
                  Login
                </Link>

                <Link href="/profile/setup" className="px-3 py-1 border rounded">
                  Create profile
                </Link>
              </div>
            </div>
          )}

          {!loading && !error && items.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No matches found. Try adjusting filters or{" "}
              <Link href="/profile/setup" className="text-indigo-600">
                complete your profile
              </Link>
              .
            </div>
          )}

          {!loading && items.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-4">
              {items.map((p) => (
                <MatchCard
                  key={String(p.id)}
                  profile={p}
                  onView={() => openProfileDetail(p)}
                  fetchPrediction={() => ensurePredictionFor(p)}
                />
              ))}
            </div>
          )}
        </div>

        <DetailDrawer
          profileId={selected ? String(selected.id) : null}
          open={!!selected}
          onClose={() => setSelected(null)}
          initialProfile={selected ?? undefined}
        />
      </div>
    </Layout>
  );
}
