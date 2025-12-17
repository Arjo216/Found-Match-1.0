// pages/signup.tsx
import React, { useState } from "react";
import { useRouter } from "next/router";
import { auth } from "../lib/api";
import Layout from "../components/Layout";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "founder" });
  const [loading, setLoading] = useState(false);

  // use this in pages/signup.tsx -> replace current handle function
const handle = async () => {
  setLoading(true);
  try {
    // Map role -> backend expected field if needed (we'll still send name/email/password)
    const payload: any = {
      name: form.name,
      email: form.email,
      password: form.password,
      // if backend expects `is_investor` boolean:
      is_investor: form.role === "investor",
    };

    const res = auth.signup(payload);
    console.log("SIGNUP success", res);
    alert("Signup success. Please login.");
    router.replace("/login");
  } catch (err: any) {
    // show full error info
    console.error("SIGNUP ERROR", err);

    // prefer structured backend message
    const backendMsg =
      err?.response?.data?.detail ||
      err?.response?.data?.message ||
      err?.response?.data ||
      err?.message ||
      JSON.stringify(err);

    alert(backendMsg);
  } finally {
    setLoading(false);
  }
};


  return (
    <Layout>
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold">Create account</h2>

        <label className="block mt-4">
          <span className="text-sm text-gray-600">Full name</span>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-1 block w-full border rounded px-3 py-2"
            placeholder="Your name"
          />
        </label>

        <label className="block mt-4">
          <span className="text-sm text-gray-600">Email</span>
          <input
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="mt-1 block w-full border rounded px-3 py-2"
            placeholder="you@example.com"
            type="email"
          />
        </label>

        <label className="block mt-4">
          <span className="text-sm text-gray-600">Password</span>
          <input
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="mt-1 block w-full border rounded px-3 py-2"
            placeholder="Create a password"
            type="password"
          />
        </label>

        <label className="block mt-4">
          <span className="text-sm text-gray-600">Role</span>
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="mt-1 block w-full border rounded px-3 py-2"
          >
            <option value="founder">Founder</option>
            <option value="investor">Investor</option>
          </select>
        </label>

        <button
          onClick={handle}
          disabled={loading}
          className="mt-6 w-full inline-block bg-green-600 text-white py-2 rounded font-medium disabled:opacity-60"
        >
          {loading ? "Creating..." : "Sign up"}
        </button>
      </div>
    </Layout>
  );
}
