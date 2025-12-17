// pages/profile/setup.tsx
import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { api } from "../../lib/api";
// near top of file
import { useRouter } from "next/router";
type FormState = {
  full_name: string;
  headline: string;
  bio: string;
  domain: string;
  stage: string;
  website: string;
  location: string;
  interestsText: string; // comma-separated text in UI
  role: "founder" | "investor" | "";
};

export default function ProfileSetup() {
  const [form, setForm] = useState<FormState>({
    full_name: "",
    headline: "",
    bio: "",
    domain: "",
    stage: "",
    website: "",
    location: "",
    interestsText: "",
    role: "",
  });
  const [loading, setLoading] = useState(false);
  const [exists, setExists] = useState<boolean | null>(null);
  const router = useRouter();
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/profile/me");
        const p = res.data || {};
        setForm({
          full_name: p.full_name || p.name || "",
          headline: p.headline || "",
          bio: p.bio || "",
          domain: p.domain || "",
          stage: p.stage || "",
          website: p.website || "",
          location: p.location || "",
          interestsText: Array.isArray(p.interests) ? p.interests.join(", ") : (p.interests || ""),
          role: (p.role as "founder" | "investor") || "",
        });
        setExists(true);
      } catch (e: any) {
        // 404 -> profile doesn't exist; other statuses may mean not logged in
        const status = e?.response?.status;
        if (status === 404) setExists(false);
        else {
          console.info("No profile or failed to fetch (ok for new users):", status);
          setExists(false);
        }
      }
    };
    load();
  }, []);

  const prettyErrors = (err: any) => {
    try {
      const r = err?.response?.data;
      if (!r) return String(err?.message || err);
      if (r.detail && Array.isArray(r.detail)) {
        return r.detail.map((d: any) => {
          const loc = Array.isArray(d.loc) ? d.loc.join(" > ") : d.loc;
          const msg = d.msg || d.message || JSON.stringify(d);
          return `${loc}: ${msg}`;
        }).join("\n");
      }
      return JSON.stringify(r, null, 2);
    } catch (ex) {
      return String(err);
    }
  };

  const submit = async () => {
    setLoading(true);
    try {
      //const interestsArray = form.interestsText
        //.split(",")
        //.map((s) => s.trim())
        //.filter(Boolean);

      const payload = {
        full_name: form.full_name,
        headline: form.headline || null,
        bio: form.bio || null,
        domain: form.domain || null,
        stage: form.stage || null,
        website: form.website || null,
        location: form.location || null,
        //interests: interestsArray, // send as array (matches schemas)
        interests: form.interestsText, // send as text (if backend expects string)
        role: form.role || "founder",
      };

      let res;
      if (exists) {
        res = api.put("/profile/", payload);
      } else {
        res = api.post("/profile/", payload);
      }

      alert("Profile saved successfully.");
      router.push("/profile/view");
      setExists(true);
      // redirect to projects or dashboard
      //router.push("/projects");
      //router.replace("/projects");
      // or: router.replace("/dashboard/founder");
      if (res?.data) {
        const p = res.data;
        setForm((f) => ({ ...f, interestsText: Array.isArray(p.interests) ? p.interests.join(", ") : (p.interests || "") }));
        setExists(true);
      }
    } catch (err: any) {
      console.error("Failed saving profile:", err);
      const msg = prettyErrors(err);
      alert("Failed to save profile\n\n" + msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <h1 className="text-3xl font-extrabold mb-6">Profile Setup</h1>

      <div className="max-w-3xl bg-white p-6 rounded-lg shadow">
        <div className="grid gap-4 lg:grid-cols-2">
          <label className="block lg:col-span-2">
            <div className="text-sm text-gray-600">Full name</div>
            <input
              className="mt-1 w-full border rounded px-3 py-2"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              placeholder="Your full name"
            />
          </label>

          <label>
            <div className="text-sm text-gray-600">Headline</div>
            <input
              className="mt-1 w-full border rounded px-3 py-2"
              value={form.headline}
              onChange={(e) => setForm({ ...form, headline: e.target.value })}
            />
          </label>

          <label>
            <div className="text-sm text-gray-600">Domain / Industry</div>
            <input
              className="mt-1 w-full border rounded px-3 py-2"
              value={form.domain}
              onChange={(e) => setForm({ ...form, domain: e.target.value })}
            />
          </label>

          <label className="lg:col-span-2">
            <div className="text-sm text-gray-600">Bio</div>
            <textarea
              className="mt-1 w-full border rounded px-3 py-2 h-28"
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />
          </label>

          <label>
            <div className="text-sm text-gray-600">Location</div>
            <input
              className="mt-1 w-full border rounded px-3 py-2"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </label>

          <label>
            <div className="text-sm text-gray-600">Interests (comma separated)</div>
            <input
              className="mt-1 w-full border rounded px-3 py-2"
              value={form.interestsText}
              onChange={(e) => setForm({ ...form, interestsText: e.target.value })}
              placeholder="SaaS, AI, Healthcare"
            />
          </label>

          <label>
            <div className="text-sm text-gray-600">Stage</div>
            <select
              className="mt-1 w-full border rounded px-3 py-2"
              value={form.stage}
              onChange={(e) => setForm({ ...form, stage: e.target.value })}
            >
              <option value="">Select</option>
              <option value="pre-seed">Pre-seed</option>
              <option value="seed">Seed</option>
              <option value="growth">Growth</option>
            </select>
          </label>

          <label>
            <div className="text-sm text-gray-600">Role</div>
            <select
              className="mt-1 w-full border rounded px-3 py-2"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as any })}
            >
              <option value="">Select role</option>
              <option value="founder">Founder</option>
              <option value="investor">Investor</option>
            </select>
          </label>

          <label className="lg:col-span-2">
            <div className="text-sm text-gray-600">Website</div>
            <input
              className="mt-1 w-full border rounded px-3 py-2"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
            />
          </label>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={submit}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
          >
            {loading ? "Saving..." : exists ? "Save profile" : "Create profile"}
          </button>
        </div>
      </div>
    </Layout>
  );
}

