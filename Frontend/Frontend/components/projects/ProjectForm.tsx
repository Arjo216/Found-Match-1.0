// components/projects/ProjectForm.tsx
import React, { useState } from "react";
import { useRouter } from "next/router";
import TagInput from "./TagInput";
import { api } from "../../lib/api";

type Props = {
  onCreated?: (project: any) => void;
  // optional: where to redirect for dashboard action
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

  // success state shows actions (no automatic redirect)
  const [createdProject, setCreatedProject] = useState<any | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const reset = () => {
    setTitle("");
    setDescription("");
    setDomain("");
    setFundingGoal("");
    setStage("");
    setTags([]);
    setCreatedProject(null);
    setSuccessMessage(null);
  };

  const submit = async () => {
    if (!title.trim() || !description.trim() || !domain.trim()) {
      alert("Please enter title, description and domain.");
      return;
    }

    setLoading(true);
    setSuccessMessage(null);
    setCreatedProject(null);

    try {
      // Build payload matching backend ProjectCreate schema:
      const payload: any = {
        title: title.trim(),
        description: description.trim(),
        domain: domain.trim(),
        funding_goal: Number(fundingGoal) || 0,
        stage: stage || undefined,
      };

      // Include tags only if your backend accepts them (remove if not supported)
      if (tags && tags.length) payload.tags = tags;

      // POST to backend
      const res = await api.post("/projects/", payload);
      const created = res.data;

      // show success state and preserve created project
      setCreatedProject(created);
      setSuccessMessage("Project created successfully.");

      // call parent callback so ProjectsPage can insert it into lists
      if (onCreated) onCreated(created);

      // reset the form fields (but keep createdProject to show actions)
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
        alert("You must log in before creating a project.");
      } else if (status === 422) {
        // validation details from backend
        const detail = err?.response?.data || err.message || "Validation failed";
        alert("Validation failed:\n" + JSON.stringify(detail, null, 2));
      } else {
        alert("Failed to create project: " + (err?.message || "unknown error"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow">
      <h2 className="text-xl font-semibold mb-4">Create a new project</h2>

      <label className="block mb-3">
        <div className="text-sm text-gray-600">Title *</div>
        <input
          aria-label="Project title"
          className="mt-1 w-full border rounded px-3 py-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>

      <label className="block mb-3">
        <div className="text-sm text-gray-600">Description *</div>
        <textarea
          aria-label="Project description"
          className="mt-1 w-full border rounded px-3 py-2 h-28"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
        <label className="block">
          <div className="text-sm text-gray-600">Domain *</div>
          <input
            aria-label="Project domain"
            className="mt-1 w-full border rounded px-3 py-2"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
          />
        </label>

        <label className="block">
          <div className="text-sm text-gray-600">Funding Goal (INR)</div>
          <input
            aria-label="Funding goal"
            type="number"
            className="mt-1 w-full border rounded px-3 py-2"
            value={fundingGoal}
            onChange={(e) => setFundingGoal(e.target.value === "" ? "" : Number(e.target.value))}
          />
        </label>

        <label className="block">
          <div className="text-sm text-gray-600">Stage</div>
          <select
            aria-label="Project stage"
            className="mt-1 w-full border rounded px-3 py-2"
            value={stage}
            onChange={(e) => setStage(e.target.value)}
          >
            <option value="">Select</option>
            <option value="pre-seed">Pre-seed</option>
            <option value="seed">Seed</option>
            <option value="growth">Growth</option>
          </select>
        </label>
      </div>

      <label className="block mb-4">
        <div className="text-sm text-gray-600">Tags</div>
        <TagInput value={tags} onChange={setTags} placeholder="e.g. fintech, saas, ai" />
        <div className="text-xs text-gray-400 mt-1">Optional — helps investors find your project.</div>
      </label>

      <div className="flex gap-3 items-center">
        <button
          onClick={submit}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded shadow disabled:opacity-60"
        >
          {loading ? "Creating..." : "Create project"}
        </button>

        <button onClick={reset} type="button" className="px-4 py-2 border rounded">
          Reset
        </button>

        {/* success inline note */}
        {successMessage && (
          <div className="ml-4 text-sm text-green-700 bg-green-50 px-3 py-1 rounded">
            {successMessage}
          </div>
        )}
      </div>

      {/* After create actions: displayed while createdProject exists */}
      {createdProject && (
        <div className="mt-4 bg-gray-50 p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Project created</div>
              <div className="text-xs text-gray-600">ID: {createdProject.id ?? createdProject.title}</div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  // go to matching page so user can find investors for this project
                  router.push("/match");
                }}
                className="px-3 py-2 bg-indigo-600 text-white rounded"
              >
                View Matches
              </button>

              <button
                onClick={() => {
                  // go to user's dashboard (founder default)
                  router.push(dashboardPath);
                }}
                className="px-3 py-2 border rounded"
              >
                Go to Dashboard
              </button>

              <button
                onClick={() => {
                  // optional: navigate to created project detail if exists at /projects/[id]
                  if (createdProject?.id) {
                    router.push(`/projects/${createdProject.id}`);
                  } else {
                    // fallback: simply clear the createdProject item
                    setCreatedProject(null);
                    setSuccessMessage(null);
                  }
                }}
                className="px-3 py-2 bg-white border rounded"
                title="Open project details"
              >
                Open
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

