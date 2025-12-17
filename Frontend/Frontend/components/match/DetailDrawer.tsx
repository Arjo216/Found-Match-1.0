// components/match/DetailDrawer.tsx
import React, { useEffect, useState } from "react";
import { api } from "../../lib/api";

export default function DetailDrawer({ profileId, open, onClose, initialProfile }: { profileId: string | null; open: boolean; onClose: ()=>void; initialProfile?: any }) {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(initialProfile || null);

  useEffect(() => {
    async function load() {
      if (!profileId) return;
      setLoading(true);
      try {
        const r = await api.get(`/match/${profileId}`);
        setProfile(r.data);
      } catch (e) {
        console.error("Failed load profile", e);
      } finally {
        setLoading(false);
      }
    }
    if (open && profileId) load();
  }, [open, profileId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1" onClick={onClose} aria-hidden />
      <aside className="w-full max-w-md bg-white shadow-xl p-6 overflow-auto">
        <div className="flex items-start justify-between">
          <h2 className="text-xl font-semibold">{profile?.full_name || "Profile"}</h2>
          <button onClick={onClose} className="text-gray-500">Close</button>
        </div>

        {loading && <div className="mt-4 text-sm text-gray-500">Loading…</div>}

        {!loading && profile && (
          <>
            <div className="mt-4 text-sm text-gray-700">{profile.bio}</div>

            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-600">Projects</h4>
              <ul className="mt-2 space-y-2">
                {(profile.projects || []).map((p: any) => (
                  <li key={p.id} className="p-2 border rounded">
                    <div className="font-semibold">{p.title}</div>
                    <div className="text-xs text-gray-500">{p.description}</div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 flex gap-2">
              <button className="px-3 py-2 bg-indigo-600 text-white rounded">Message</button>
              <button className="px-3 py-2 border rounded">Request intro</button>
              <button className="px-3 py-2 border rounded">Save</button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
