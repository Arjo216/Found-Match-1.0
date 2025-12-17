// components/match/FilterBar.tsx
import React, { useState, useEffect } from "react";

type Props = {
  onApply: (filters: Record<string, any>) => void;
  initialFilters?: Record<string, any>;
};

export default function FilterBar({ onApply, initialFilters = {} }: Props) {
  const [search, setSearch] = useState(initialFilters.search || "");
  const [domain, setDomain] = useState(initialFilters.domain || "");
  const [stage, setStage] = useState(initialFilters.stage || "");
  const [role, setRole] = useState(initialFilters.role || "");
  const [location, setLocation] = useState(initialFilters.location || "");

  useEffect(() => {
    // update local state if parent changes initialFilters
    setSearch(initialFilters.search || "");
    setDomain(initialFilters.domain || "");
    setStage(initialFilters.stage || "");
    setRole(initialFilters.role || "");
    setLocation(initialFilters.location || "");
  }, [initialFilters]);

  const apply = () => {
    onApply({
      search,
      domain,
      stage,
      role,
      location,
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col md:flex-row gap-3 items-start md:items-end">
      <div className="flex-1">
        <label className="block text-sm text-gray-600">Search</label>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && apply()}
          className="mt-1 w-full border rounded px-3 py-2"
          placeholder="Search name, headline, interests..."
        />
      </div>

      <div className="w-48">
        <label className="block text-sm text-gray-600">Domain</label>
        <input value={domain} onChange={(e)=>setDomain(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" placeholder="Finance, SaaS..." />
      </div>

      <div className="w-40">
        <label className="block text-sm text-gray-600">Stage</label>
        <select value={stage} onChange={(e)=>setStage(e.target.value)} className="mt-1 w-full border rounded px-3 py-2">
          <option value="">Any</option>
          <option value="pre-seed">Pre-seed</option>
          <option value="seed">Seed</option>
          <option value="growth">Growth</option>
        </select>
      </div>

      <div className="w-40">
        <label className="block text-sm text-gray-600">Role</label>
        <select value={role} onChange={(e)=>setRole(e.target.value)} className="mt-1 w-full border rounded px-3 py-2">
          <option value="">Any</option>
          <option value="founder">Founder</option>
          <option value="investor">Investor</option>
        </select>
      </div>

      <div className="flex gap-2">
        <button onClick={apply} className="px-4 py-2 bg-blue-600 text-white rounded">Apply</button>
        <button onClick={() => { setSearch(""); setDomain(""); setStage(""); setRole(""); setLocation(""); onApply({}); }} className="px-4 py-2 border rounded">Clear</button>
      </div>
    </div>
  );
}
