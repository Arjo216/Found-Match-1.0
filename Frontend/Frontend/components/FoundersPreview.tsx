// components/FoundersPreview.tsx
import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const sample = [
  { id: "f-1", name: "Anaya Patel", domain: "SaaS", stage: "Pre-seed", tagline: "1k MRR, scaling rapidly", match: "94%" },
  { id: "f-2", name: "Vikram Iyer", domain: "FinTech", stage: "Seed", tagline: "Pilot secured in two major banks", match: "88%" },
  { id: "f-3", name: "Sara Khan", domain: "HealthTech", stage: "Pre-seed", tagline: "Key clinical partners secured", match: "91%" },
];

export default function FoundersPreview() {
  return (
    <div className="py-12">
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-4">
        <div>
          <h3 className="text-3xl font-black text-white tracking-tight">Founder Profiles</h3>
          <p className="text-slate-400 mt-2 text-lg">Showcase your traction and raise capital smarter.</p>
        </div>
        <Link href="/projects" className="text-sm font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 group no-underline bg-cyan-500/10 px-6 py-3 rounded-full border border-cyan-500/20 transition-all">
          View all projects <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {sample.map((s) => (
          <div key={s.id} className="glass rounded-3xl p-8 border border-white/5 hover:border-cyan-500/40 transition-all relative overflow-hidden group bg-slate-900/40 backdrop-blur-md">
            <div className="flex justify-between items-start mb-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{s.domain} • {s.stage}</span>
              <span className="text-[10px] font-black bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-3 py-1 rounded-full">{s.match} Match</span>
            </div>
            
            <div className="text-2xl font-black text-white mb-2">{s.name}</div>
            <div className="text-sm text-slate-400 mb-8 h-10 leading-relaxed font-medium">{s.tagline}</div>
            
            <Link href={`/profile/view?id=${s.id}`} className="inline-flex w-full justify-center items-center py-4 rounded-xl bg-slate-800 text-cyan-400 text-sm font-bold hover:bg-slate-700 transition-all border border-white/10 hover:border-cyan-500/30 no-underline shadow-lg">
              View Pitch Deck
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}