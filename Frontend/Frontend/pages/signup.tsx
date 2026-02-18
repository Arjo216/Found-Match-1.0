// pages/signup.tsx
import React, { useState } from "react";
import { useRouter } from "next/router";
import { auth } from "../lib/api";
import Layout from "../components/Layout";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Lock, ShieldCheck, Loader2 } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "founder" });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSignup = async () => {
    setErrorMsg(null);
    if (!form.name || !form.email || !form.password) {
      setErrorMsg("Please complete all required fields.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        is_investor: form.role === "investor",
      };

      await auth.signup(payload);
      router.replace("/login?signup=success");
      
    } catch (err: any) {
      const backendMsg = err?.response?.data?.detail || err?.response?.data?.message || "Registration failed.";
      setErrorMsg(typeof backendMsg === 'string' ? backendMsg : JSON.stringify(backendMsg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-8 md:py-12 relative">
        
        {/* Background Ambient Orbs - Lowered Z-index to ensure they stay in back */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[400px] md:h-[500px] bg-purple-600/10 rounded-full blur-[80px] md:blur-[120px] pointer-events-none z-0"></div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}
          className="max-w-md w-full glass bg-slate-900/80 rounded-3xl shadow-2xl border border-white/10 p-6 md:p-8 relative z-20 pointer-events-auto overflow-hidden backdrop-blur-xl"
        >
          <div className="flex flex-col items-center mb-6 md:mb-8 text-center">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
              <ShieldCheck className="w-7 h-7 md:w-8 md:h-8 text-purple-400" />
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Join FoundMatch</h2>
            <p className="text-sm text-slate-400 mt-2">Create an account to access curated introductions.</p>
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

          <div className="space-y-4 md:space-y-5">
            {/* Role Selection - Forced Pointer Events and specific Z-index */}
            <div className="relative z-30">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 ml-1">I am registering as a...</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, role: "founder" }))}
                  className={`py-3 px-2 md:px-4 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs md:text-sm transition-all cursor-pointer pointer-events-auto ${
                    form.role === "founder" 
                    ? "bg-purple-500/30 border-purple-500/60 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]" 
                    : "bg-slate-950/40 border-slate-700/50 text-slate-500 hover:border-slate-500"
                  }`}
                >
                  Founder
                </button>
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, role: "investor" }))}
                  className={`py-3 px-2 md:px-4 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs md:text-sm transition-all cursor-pointer pointer-events-auto ${
                    form.role === "investor" 
                    ? "bg-cyan-500/30 border-cyan-500/60 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]" 
                    : "bg-slate-950/40 border-slate-700/50 text-slate-500 hover:border-slate-500"
                  }`}
                >
                  Investor
                </button>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">Full Legal Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Satoshi Nakamoto"
                    className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">Professional Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    type="email"
                    placeholder="name@company.com"
                    className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">Secure Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    type="password"
                    placeholder="Create a strong password"
                    className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                    onKeyDown={(e) => e.key === "Enter" && handleSignup()}
                  />
                </div>
              </div>
            </div>

            <button
              disabled={loading}
              onClick={handleSignup}
              className="mt-4 w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white py-3.5 rounded-xl font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account"} 
            </button>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-400">
              Already a member? <a href="/login" className="text-purple-400 hover:text-purple-300 font-bold transition-colors no-underline">Log in</a>
            </p>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}