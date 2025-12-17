// pages/login.tsx
import React, { useState } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import { auth, setAuthToken } from "../lib/api";

type ModalProps = {
  open: boolean;
  title?: string;
  onClose: () => void;
  children?: React.ReactNode;
};

function Modal({ open, title, onClose, children }: ModalProps) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      role="dialog"
      aria-modal="true"
      aria-label={title || "dialog"}
      onClick={onClose}
    >
      <div
        className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6 transform transition-all mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {title && <h3 className="text-lg font-semibold mb-3">{title}</h3>}
        <div>{children}</div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [detectedRole, setDetectedRole] = useState<string | null>(null);

  const goToDashboard = (role?: string | null) => {
    if (role === "investor") router.replace("/dashboard/investor");
    else router.replace("/dashboard/founder");
  };

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      const res = await auth.login({ email, password });

      const token =
        res.data?.access_token ||
        res.data?.accessToken ||
        res.data?.token ||
        res.data?.session?.access_token ||
        null;

      if (token) setAuthToken(token);

      // determine role: prefer login response, otherwise try /auth/me
      let role: string | null = res.data?.role || null;
      if (!role) {
        try {
          const me = await auth.me();
          role = me?.data?.role || (me?.data?.is_investor ? "investor" : "founder") || null;
        } catch (e) {
          // ignore — role remains null
          role = null;
        }
      }

      // show the modal instead of a native confirm — nicer UX
      setDetectedRole(role);
      setModalOpen(true);
    } catch (err: any) {
      console.error("LOGIN FAILED:", err);
      alert(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          err?.message ||
          "Login failed — check console"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow p-8 mt-8">
        <h2 className="text-3xl font-bold text-center">Login</h2>

        <label className="block mt-6">
          <span className="text-sm text-gray-600">Email</span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="you@example.com"
            className="mt-1 block w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
        </label>

        <label className="block mt-4">
          <span className="text-sm text-gray-600">Password</span>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Your password"
            className="mt-1 block w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
        </label>

        <button
          disabled={loading}
          onClick={handleLogin}
          className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-semibold transition disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>

      {/* Modal shown after successful login */}
      <Modal open={modalOpen} title={"Login successful"} onClose={() => setModalOpen(false)}>
        <p className="text-gray-700 mb-4">
          Your account is logged in. Would you like to set up your profile now or go to your dashboard?
        </p>

        <div className="flex gap-3 justify-end">
          <button
            className="px-4 py-2 border rounded bg-white hover:bg-gray-50"
            onClick={() => {
              setModalOpen(false);
              goToDashboard(detectedRole);
            }}
          >
            Go to dashboard
          </button>

          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            onClick={() => {
              setModalOpen(false);
              router.replace("/profile/setup");
            }}
          >
            Set up profile
          </button>
        </div>
      </Modal>
    </Layout>
  );
}
