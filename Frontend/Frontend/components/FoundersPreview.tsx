// components/FoundersPreview.tsx
import React from "react";
import Link from "next/link";

const sample = [
  { id: "f-1", name: "Anaya Patel", domain: "SaaS", stage: "Pre-seed", tagline: "1k MRR, growth" },
  { id: "f-2", name: "Vikram Iyer", domain: "Fintech", stage: "Seed", tagline: "Pilot in two banks" },
  { id: "f-3", name: "Sara Khan", domain: "Healthcare", stage: "Pre-seed", tagline: "Clinical partners secured" },
];

export default function FoundersPreview() {
  return (
    <section className="bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Founder profiles</h3>
            <p className="text-slate-600 mt-1">Showcase your idea, traction and raise smarter.</p>
          </div>

          <Link href="/projects" className="text-sm text-indigo-600">View all projects →</Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sample.map((s) => (
            <div key={s.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm text-gray-500">{s.domain} • {s.stage}</div>
                  <div className="mt-2 font-semibold">{s.name}</div>
                  <div className="text-sm text-gray-600 mt-1">{s.tagline}</div>
                </div>

                <div className="ml-4">
                  <Link href={`/profile/view?id=${s.id}`} className="text-sm text-indigo-600">View</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
