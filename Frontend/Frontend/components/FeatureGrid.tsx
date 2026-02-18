// components/FeatureGrid.tsx
import React from "react";
import { Zap, Shield, LineChart, Users } from "lucide-react";

const features = [
  { title: "Curated Discovery", desc: "Find partners by industry, stage and interests.", icon: <Users className="w-6 h-6 text-cyan-400" /> },
  { title: "Smart Matching", desc: "ML-assisted scoring with human review options.", icon: <Zap className="w-6 h-6 text-purple-400" /> },
  { title: "Secure Messaging", desc: "Private in-app chat and calendar integration.", icon: <Shield className="w-6 h-6 text-emerald-400" /> },
  { title: "Profile Analytics", desc: "Track views, likes and match-rate over time.", icon: <LineChart className="w-6 h-6 text-blue-400" /> },
];

export default function FeatureGrid() {
  return (
    <div className="py-12">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why Top Tiers Love Found Match</h2>
        <p className="text-slate-400 max-w-2xl mx-auto">We focus on signal — not noise. Curated matches, clear insights, and secure, encrypted communication.</p>
      </div>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => (
          <div key={f.title} className="glass p-6 rounded-2xl hover:-translate-y-2 transition-transform duration-300 border border-white/5 group">
            <div className="w-12 h-12 rounded-lg bg-slate-800/80 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
              {f.icon}
            </div>
            <div className="text-xl font-semibold text-white mb-2">{f.title}</div>
            <div className="text-sm text-slate-400 leading-relaxed">{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}