// components/projects/ProjectCard.tsx
import React from "react";

export type ProjectItem = {
  id?: number | string;
  title: string;
  description?: string;
  domain?: string;
  funding_goal?: number;
  stage?: string;
  tags?: string[];
  user_id?: string;
};

export default function ProjectCard({ project }: { project: ProjectItem }) {
  return (
    <article className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-lg transition transform hover:-translate-y-1">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold leading-snug">{project.title}</h3>
          <div className="text-sm text-gray-500 mt-1">{project.domain || "—"}</div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Goal</div>
          <div className="font-semibold">₹{project.funding_goal ?? "—"}</div>
        </div>
      </div>

      <p className="mt-3 text-gray-700 text-sm line-clamp-3">{project.description}</p>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {(project.tags || []).slice(0, 5).map((t) => (
            <span key={t} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded">
              {t}
            </span>
          ))}
        </div>

        <div className="text-xs text-gray-400">{project.stage || ""}</div>
      </div>
    </article>
  );
}
