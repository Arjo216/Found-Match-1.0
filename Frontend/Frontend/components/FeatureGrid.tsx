// components/FeatureGrid.tsx
import React from "react";

const features = [
  { title: "Curated Discovery", desc: "Find partners by industry, stage and interests." },
  { title: "Smart Matching", desc: "ML-assisted scoring with human review options." },
  { title: "Secure Messaging", desc: "Private in-app chat and calendar integration." },
  { title: "Profile Analytics", desc: "Track views, likes and match-rate over time." },
];

export default function FeatureGrid() {
  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-slate-900">Why founders & investors love Found Match</h2>
        <p className="mt-3 text-slate-600 max-w-2xl">We focus on signal — not noise. Curated matches, clear insights and secure communication.</p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="p-6 border rounded-2xl hover:shadow-lg transition">
              <div className="text-base font-semibold text-slate-800">{f.title}</div>
              <div className="mt-2 text-sm text-slate-500">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
