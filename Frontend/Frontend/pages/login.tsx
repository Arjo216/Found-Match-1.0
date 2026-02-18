// pages/login.tsx
import React, { useState } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Mail, ArrowRight, Loader2, Network } from "lucide-react";
import Layout from "../components/Layout";
import { auth, setAuthToken } from "../lib/api";

type ModalProps = {
  open: boolean;
  title?: string;
  onClose: () => void;
  children?: React.ReactNode;
};

function Modal({ open, title, onClose, children }: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" 
            onClick={onClose} 
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative max-w-md w-full glass bg-slate-900/90 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.15)] border border-white/10 p-8 mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-purple-500"></div>
            {title && <h3 className="text-xl font-bold text-white mb-2">{title}</h3>}
            <div>{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [detectedRole, setDetectedRole] = useState<string | null>(null);

  const goToDashboard = (role?: string | null) => {
    if (role === "investor") router.replace("/dashboard/investor");
    else router.replace("/dashboard/founder");
  };

  const handleLogin = async () => {
    setErrorMsg(null);
    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await auth.login({ email, password });
      const token = res.data?.access_token || res.data?.accessToken || res.data?.token || res.data?.session?.access_token || null;
      if (token) setAuthToken(token);

      let role: string | null = res.data?.role || null;
      if (!role) {
        try {
          const me = await auth.me();
          role = me?.data?.role || (me?.data?.is_investor ? "investor" : "founder") || null;
        } catch (e) {
          role = null;
        }
      }

      setDetectedRole(role);
      setModalOpen(true);
    } catch (err: any) {
      console.error("LOGIN FAILED:", err);
      setErrorMsg(err?.response?.data?.detail || err?.response?.data?.message || err?.message || "Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 relative z-10">
        
        {/* Background Ambient Orbs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[500px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="max-w-md w-full glass bg-slate-900/60 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-white/5 p-8 relative overflow-hidden backdrop-blur-xl"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <Network className="w-8 h-8 text-cyan-400" />
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Welcome Back</h2>
            <p className="text-sm text-slate-400 mt-2 text-center">Enter your credentials to access the AI matching engine.</p>
          </div>

          <AnimatePresence>
            {errorMsg && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-6">
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm font-medium text-center">
                  {errorMsg}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="name@domain.com"
                  className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 ml-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
              </div>
            </div>

            <button
              disabled={loading}
              onClick={handleLogin}
              className="mt-6 w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white py-3.5 rounded-xl font-bold shadow-[0_0_20px_rgba(8,145,178,0.4)] transition-all disabled:opacity-50 disabled:hover:scale-100 hover:scale-[1.02]"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Authenticate"} 
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-400">
              Don't have an account? <a href="/signup" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">Apply here</a>
            </p>
          </div>
        </motion.div>

        {/* Success Modal */}
        <Modal open={modalOpen} title="Authentication Successful" onClose={() => setModalOpen(false)}>
          <p className="text-slate-300 mb-6 text-sm leading-relaxed">
            Secure connection established. Would you like to configure your matchmaking profile or proceed directly to your data dashboard?
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <button
              className="px-5 py-2.5 border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold rounded-xl transition-colors"
              onClick={() => { setModalOpen(false); goToDashboard(detectedRole); }}
            >
              Access Dashboard
            </button>

            <button
              className="px-5 py-2.5 bg-cyan-600 text-white font-semibold rounded-xl hover:bg-cyan-500 shadow-[0_0_15px_rgba(8,145,178,0.4)] transition-colors"
              onClick={() => { setModalOpen(false); router.replace("/profile/setup"); }}
            >
              Configure Profile
            </button>
          </div>
        </Modal>
      </div>
    </Layout>
  );
}
