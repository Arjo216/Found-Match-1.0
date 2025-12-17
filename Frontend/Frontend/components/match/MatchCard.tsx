// Frontend/components/match/MatchCard.tsx
import React from "react";

type Profile = {
  id: number | string;
  full_name?: string;
  headline?: string;
  domain?: string;
  stage?: string;
  location?: string;
  avatar?: string;
  snippet?: string;
  match_score?: number | null;
  recommendation?: string | null;
  [k: string]: any;
};

type Props = {
  profile: Profile;
  onView?: () => void;
  onMessage?: () => void;
  onSave?: () => void;
  fetchPrediction?: () => Promise<any>;
};

function ScoreRing({ value }: { value?: number | null }) {
  const v = typeof value === "number" ? Math.max(0, Math.min(100, Math.round(value))) : null;
  const stroke = 10;
  const size = 64;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = v != null ? circumference - (v / 100) * circumference : circumference;

  return (
    <div className="inline-block w-16 h-16">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id="g1" x1="0" x2="1">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>

        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#eef2ff"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#g1)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          fill="none"
        />
        <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" fontSize="12" fill="#0f172a">
          {v != null ? `${v}%` : "--"}
        </text>
      </svg>
    </div>
  );
}

export default function MatchCard({ profile, onView, onMessage, onSave, fetchPrediction }: Props) {
  const score = profile.match_score ?? profile.score ?? null;
  const rec = profile.recommendation ?? null;

  return (
    <article className="bg-white rounded-2xl shadow-soft p-5 flex flex-col h-full">
      <div className="flex items-start gap-4">
        <img
          src={profile.avatar || "/images/sample1.png"}
          alt={profile.full_name || "profile"}
          className="w-16 h-16 object-cover rounded-lg"
        />

        <div className="flex-1">
          <h3 className="text-lg font-semibold">{profile.full_name || "Unnamed"}</h3>
          <div className="text-sm text-gray-500">{profile.headline}</div>
          <div className="mt-2 text-xs text-gray-400">{profile.domain} • {profile.stage}</div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <ScoreRing value={score ?? null} />
          {rec ? (
            <div
              className={`px-2 py-1 text-xs rounded-full ${
                rec.toLowerCase().includes("high")
                  ? "bg-green-100 text-green-800"
                  : rec.toLowerCase().includes("low")
                  ? "bg-red-100 text-red-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {rec}
            </div>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (fetchPrediction) fetchPrediction();
              }}
              className="text-xs px-2 py-1 border rounded text-slate-700"
            >
              Predict
            </button>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-600 mt-4 line-clamp-3 flex-1">{profile.snippet || "No introduction provided."}</p>

      <div className="mt-4 flex gap-2">
        <button onClick={onView} className="px-3 py-2 bg-indigo-600 text-white rounded shadow">View</button>
        <button onClick={onMessage} className="px-3 py-2 border rounded">Message</button>
        <button onClick={onSave} className="px-3 py-2 border rounded">Save</button>
      </div>
    </article>
  );
}
