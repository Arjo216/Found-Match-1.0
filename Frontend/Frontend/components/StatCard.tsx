// components/StatCard.tsx
import React from "react";

type Props = {
  title: string;
  value: string | number;
  delta?: string; // e.g. "+12%"
  hint?: string;
  className?: string;
};

export default function StatCard({ title, value, delta, hint, className = "" }: Props) {
  return (
    <div className={`bg-white rounded-2xl p-4 shadow-soft ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-gray-500">{title}</div>
          <div className="text-2xl font-extrabold mt-1">{value}</div>
        </div>
        {delta && (
          <div className="text-sm text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">
            {delta}
          </div>
        )}
      </div>
      {hint && <div className="text-xs text-gray-400 mt-2">{hint}</div>}
    </div>
  );
}
