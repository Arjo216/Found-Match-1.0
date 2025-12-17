// components/FilterPanel.tsx
import React from "react";

type Props = {
  domain?: string;
  stage?: string;
  onChange: (patch: Partial<{ domain: string; stage: string; search: string }>) => void;
  className?: string;
};

export default function FilterPanel({ domain = "", stage = "", onChange, className = "" }: Props) {
  return (
    <div className={`bg-white rounded-2xl p-4 shadow-soft ${className}`}>
      <div className="text-sm font-semibold mb-3">Filters</div>

      <label className="block text-sm mb-2">
        <div className="text-xs text-gray-500">Domain</div>
        <input value={domain} onChange={(e)=>onChange({ domain: e.target.value })} placeholder="e.g. SaaS, Healthcare" className="mt-1 w-full border rounded px-3 py-2" />
      </label>

      <label className="block text-sm mb-2">
        <div className="text-xs text-gray-500">Stage</div>
        <select value={stage} onChange={(e)=>onChange({ stage: e.target.value })} className="mt-1 w-full border rounded px-3 py-2">
          <option value="">Any</option>
          <option value="pre-seed">Pre-seed</option>
          <option value="seed">Seed</option>
          <option value="growth">Growth</option>
        </select>
      </label>

      <div className="mt-3 flex gap-2">
        <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={()=>onChange({})}>Apply</button>
        <button className="px-3 py-2 border rounded" onClick={()=>onChange({ domain: "", stage: "" })}>Reset</button>
      </div>
    </div>
  );
}
