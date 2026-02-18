// components/projects/ProjectForm.tsx
import React, { useState } from "react";
import { useRouter } from "next/router";
import TagInput from "./TagInput";
import { api } from "../../lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Rocket, Target, Building2, TrendingUp, Tags, Loader2, CheckCircle2, ChevronRight, LayoutDashboard, Search } from "lucide-react";

type Props = {
  onCreated?: (project: any) => void;
  dashboardPath?: string;
};

export default function ProjectForm({ onCreated, dashboardPath = "/dashboard/founder" }: Props) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [domain, setDomain] = useState("");
  const [fundingGoal, setFundingGoal] = useState<number | "">("");
  const [stage, setStage] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const [createdProject, setCreatedProject] = useState<any | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const reset = () => {
    setTitle("");
    setDescription("");
    setDomain("");
    setFundingGoal("");
    setStage("");
    setTags([]);
    setCreatedProject(null);
    setSuccessMessage(null);
    setErrorMsg(null);
  };

  const submit = async () => {
    setErrorMsg(null);
    if (!title.trim() || !description.trim() || !domain.trim()) {
      setErrorMsg("Title, description, and domain are required fields.");
      return;
    }

    setLoading(true);
    setSuccessMessage(null);
    setCreatedProject(null);

    try {
      const payload: any = {
        title: title.trim(),
        description: description.trim(),
        domain: domain.trim(),
        funding_goal: Number(fundingGoal) || 0,
        stage: stage || undefined,
      };

      if (tags && tags.length) payload.tags = tags;

      const res = await api.post("/projects/", payload);
      const created = res.data;

      setCreatedProject(created);
      setSuccessMessage("Project successfully deployed to the matching engine.");

      if (onCreated) onCreated(created);

      // Keep createdProject active for the success UI, but clear inputs
      setTitle("");
      setDescription("");
      setDomain("");
      setFundingGoal("");
      setStage("");
      setTags([]);

    } catch (err: any) {
      console.error("Project creation failed:", err);
      const status = err?.response?.status;

      if (status === 401) {
        setErrorMsg("Authentication required. Please log in.");
      } else if (status === 422) {
        setErrorMsg("Validation failed. Please check your inputs.");
      } else {
        setErrorMsg("Deployment failed: " + (err?.message || "Unknown error"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass rounded-2xl p-6 md:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-white/5 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] -z-10 pointer-events-none"></div>

      <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-4">
        <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
          <Rocket className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Deploy New Project</h2>
          <p className="text-sm text-slate-400">Enter details to feed the AI matching engine.</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {errorMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0 }}
            className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-2"
          >
             <span className="font-bold shrink-0">Error:</span> {errorMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        {/* Title */}
        <div>
          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 ml-1">
            <Building2 className="w-4 h-4" /> Project Title <span className="text-cyan-500">*</span>
          </label>
          <input
            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
            placeholder="e.g., FoundMatch AI"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Description */}
        <div>
          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 ml-1">
            Description <span className="text-cyan-500">*</span>
          </label>
          <textarea
            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all h-32 resize-y"
            placeholder="Describe your vision, traction, and the problem you are solving..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Grid: Domain, Goal, Stage */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 ml-1">
              Domain <span className="text-cyan-500">*</span>
            </label>
            <input
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              placeholder="e.g., FinTech"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 ml-1">
              <Target className="w-4 h-4" /> Goal (INR)
            </label>
            <input
              type="number"
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              placeholder="e.g., 5000000"
              value={fundingGoal}
              onChange={(e) => setFundingGoal(e.target.value === "" ? "" : Number(e.target.value))}
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 ml-1">
              <TrendingUp className="w-4 h-4" /> Stage
            </label>
            <div className="relative">
              <select
                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all cursor-pointer"
                value={stage}
                onChange={(e) => setStage(e.target.value)}
              >
                <option value="" className="bg-slate-900">Select Stage</option>
                <option value="pre-seed" className="bg-slate-900">Pre-seed</option>
                <option value="seed" className="bg-slate-900">Seed</option>
                <option value="growth" className="bg-slate-900">Growth</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="bg-slate-800/30 p-4 rounded-xl border border-white/5">
          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 ml-1">
            <Tags className="w-4 h-4" /> Tech & Market Tags
          </label>
          {/* Note: Ensure your existing TagInput component is styled appropriately for dark mode */}
          <TagInput value={tags} onChange={setTags} placeholder="Press Enter to add tags (e.g., saas, ai)" />
          <p className="text-xs text-slate-500 mt-2 ml-1 italic">Optional, but highly recommended for accurate ML scoring.</p>
        </div>

        {/* Action Buttons */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row gap-4 items-center">
          <button
            onClick={submit}
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(8,145,178,0.4)] transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Deploy Project"}
          </button>

          <button 
            onClick={reset} 
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3.5 border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold rounded-xl transition-all disabled:opacity-50"
          >
            Clear Form
          </button>
        </div>

        {/* Success / Next Steps Panel */}
        <AnimatePresence>
          {createdProject && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-6 overflow-hidden rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 backdrop-blur-sm"
            >
              <div className="flex items-start gap-3 mb-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="text-emerald-400 font-bold text-lg">{successMessage}</h4>
                  <p className="text-sm text-slate-300 mt-1">
                    Project ID: <span className="font-mono text-emerald-200 bg-emerald-900/50 px-2 py-0.5 rounded">{createdProject.id ?? createdProject.title}</span> is now active.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mt-4">
                <button
                  onClick={() => router.push("/match")}
                  className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg shadow-lg transition-colors"
                >
                  <Search className="w-4 h-4" /> Find Matches
                </button>

                <button
                  onClick={() => router.push(dashboardPath)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </button>

                {createdProject?.id && (
                  <button
                    onClick={() => router.push(`/projects/${createdProject.id}`)}
                    className="flex items-center gap-2 px-4 py-2.5 text-emerald-400 hover:text-emerald-300 text-sm font-semibold hover:bg-emerald-500/10 rounded-lg transition-colors ml-auto"
                  >
                    View Listing <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}