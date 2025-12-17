// components/projects/TagInput.tsx
import React, { useState } from "react";

type Props = {
  value: string[]; // controlled tags
  onChange: (v: string[]) => void;
  placeholder?: string;
};

export default function TagInput({ value, onChange, placeholder }: Props) {
  const [input, setInput] = useState("");

  const addTag = (t: string) => {
    const tag = t.trim();
    if (!tag) return;
    if (!value.includes(tag)) onChange([...value, tag]);
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
      setInput("");
    } else if (e.key === "Backspace" && !input && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div className="border rounded p-2">
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((t) => (
          <span
            key={t}
            className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm inline-flex items-center gap-2"
          >
            {t}
            <button
              onClick={() => onChange(value.filter((x) => x !== t))}
              type="button"
              className="ml-1 text-blue-600 hover:text-blue-900"
            >
              ×
            </button>
          </span>
        ))}
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKey}
        placeholder={placeholder || "Type tag and press Enter"}
        className="w-full outline-none"
      />
    </div>
  );
}
