// pages/match/index.tsx
import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Layout from "../../components/Layout";
import { api } from "../../lib/api";
import MatchCard from "../../components/match/MatchCard";
import FilterBar from "../../components/match/FilterBar";
import DetailDrawer from "../../components/match/DetailDrawer";
import ChatWindow from "../../components/ChatWindow"; 
import { useAuth } from "../../context/AuthContext"; // <-- 1. IMPORT REAL AUTH

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

  // --- CHAT STATE ---
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatUser, setActiveChatUser] = useState<ProfileItem | null>(null);
  const [chatPrefill, setChatPrefill] = useState<string>(""); 
  
  // <-- 2. GET THE REAL LOGGED-IN USER ID DYNAMICALLY
  const { user } = useAuth();
  const currentUserId = user?.user_id || user?.id || "";

  const loadMatches = useCallback(async (params: Record<string, any> = {}) => {
    setLoading(true);
    setError(null);
    try {
      // This hits your FastAPI backend and pulls the PyTorch/GNN scored profiles!
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
          setItems([]);
          return;
        }
      }
      setItems(list);
    } catch (e: any) {
      console.error("Failed to load match feed", e);
      const status = e?.response?.status;
      if (status === 401) setError("Authentication required — please login and create your profile.");
      else if (status === 404) setError("Matches endpoint not found on backend (404). Confirm routing /match/.");
      else if (status === 422) setError("Validation failed when requesting matches.");
      else setError("Failed to load feed: " + (e?.message || String(e)));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMatches(filters);
  }, [loadMatches, filters]);

  const ensurePredictionFor = useCallback(async (profile: ProfileItem) => {
    const targetId = profile.profile_id || profile.id || profile.user_id;
    if (!targetId) return null;
    if (typeof profile.match_score === "number" || typeof profile.score === "number") {
      return profile.match_score ?? profile.score;
    }

    try {
      const res = await api.post("/ml/predict", { profile_id: targetId });
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
        const idStr = String(targetId);
        setItems((prev) => prev.map((it) => (String(it.id) === idStr || String(it.profile_id) === idStr ? { ...it, match_score: ms, recommendation: rec } : it)));
        setSelected((s) => (s && (String(s.id) === idStr || String(s.profile_id) === idStr) ? { ...s, match_score: ms, recommendation: rec } : s));
        return ms;
      }
      return null;
    } catch (err) {
      console.warn("Prediction request failed for", targetId, err);
      return null;
    }
  }, []);

  const onApplyFilters = (next: Record<string, any>) => {
    setFilters(next);
    loadMatches(next);
  };

  const openProfileDetail = useCallback(
    async (p: ProfileItem) => {
      await ensurePredictionFor(p);
      setSelected(p);
    },
    [ensurePredictionFor]
  );

  const handleOpenChat = (profile: ProfileItem) => {
    if (!currentUserId) {
      alert("Please log in to initiate secure messaging.");
      return;
    }
    setActiveChatUser(profile);
    setIsChatOpen(true);
  };

  const handleInteraction = async (targetId: string | number, isConnect: boolean) => {
    try {
      await api.post("/match/swipe", {
        target_id: String(targetId),
        liked: isConnect,
        type: isConnect ? "connect" : "skip" 
      });

      if (!isConnect) {
        setItems((prev) => prev.filter((m) => String(m.id) !== String(targetId) && String(m.profile_id) !== String(targetId)));
      }
    } catch (err) {
      console.error("Failed to record interaction:", err);
      throw err; 
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-12 relative">
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
                <Link href="/login" className="px-3 py-1 border rounded text-slate-800">
                  Login
                </Link>
                <Link href="/profile/setup" className="px-3 py-1 border rounded text-slate-800">
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
              {items.map((p, index) => {
                const realId = p.profile_id || p.id || p.user_id || index;
                const normalizedProfile = { ...p, id: realId, profile_id: realId };

                return (
                  <MatchCard
                    key={String(realId)}
                    profile={normalizedProfile}
                    onView={() => openProfileDetail(normalizedProfile)}
                    fetchPrediction={() => ensurePredictionFor(normalizedProfile)}
                    onMessage={() => handleOpenChat(normalizedProfile)} 
                    onInteract={handleInteraction}
                  />
                );
              })}
            </div>
          )}
        </div>

        <DetailDrawer
          profileId={selected ? String(selected.profile_id || selected.id) : null}
          open={!!selected}
          onClose={() => setSelected(null)}
          initialProfile={selected ?? undefined}
          onMessage={(prefillMsg) => {
            if (selected) {
              setChatPrefill(prefillMsg || ""); 
              handleOpenChat(selected);
              setSelected(null);        
            }
          }}
        />

        {/* --- SECURE CHAT WINDOW INJECTION --- */}
        {isChatOpen && activeChatUser && (
          <ChatWindow
            currentUserId={String(currentUserId)} // <-- 3. INJECT THE REAL ID
            receiverId={String(activeChatUser.user_id || activeChatUser.id)}
            receiverName={activeChatUser.full_name || "Unknown User"}
            receiverRole={activeChatUser.domain || "Partner"}
            initialMessage={chatPrefill}
            onClose={() => {
              setIsChatOpen(false);
              setActiveChatUser(null);
              setChatPrefill("");
            }}
          />
        )}
      </div>
    </Layout>
  );
}