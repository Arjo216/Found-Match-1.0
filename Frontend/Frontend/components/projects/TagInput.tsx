// components/projects/TagInput.tsx
import React, { useState } from "react";
import { X } from "lucide-react";

type Props = {
  value: string[]; // controlled tags
  onChange: (v: string[]) => void;
  placeholder?: string;
};

export default function TagInput({ value, onChange, placeholder }: Props) {
  const [input, setInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const addTag = (t: string) => {
    // Basic sanitization: lowercase and remove extra spaces
    const tag = t.trim().toLowerCase();
    if (!tag) return;
    if (!value.includes(tag)) {
      onChange([...value, tag]);
    }
    setInput("");
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && !input && value.length) {
      // Remove the last tag if the input is empty and the user presses backspace
      e.preventDefault();
      onChange(value.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((t) => t !== tagToRemove));
  };

  return (
    <div 
      className={`w-full bg-slate-900/50 border rounded-xl p-2.5 transition-all duration-200 ${
        isFocused ? "border-cyan-500/50 ring-2 ring-cyan-500/20" : "border-slate-700/50"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        {/* Rendered Tags */}
        {value.map((t) => (
          <span
            key={t}
            className="flex items-center gap-1.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-2.5 py-1 rounded-md text-sm font-medium tracking-wide group"
          >
            {t}
            <button
              onClick={() => removeTag(t)}
              type="button"
              className="text-cyan-500/50 hover:text-cyan-300 hover:bg-cyan-500/20 rounded p-0.5 transition-colors focus:outline-none"
              aria-label={`Remove ${t} tag`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        {/* Input Field */}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKey}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            // Optionally auto-add the tag when the user clicks away
            if (input.trim()) addTag(input); 
          }}
          placeholder={value.length === 0 ? (placeholder || "Type tag and press Enter...") : ""}
          className="flex-1 min-w-[120px] bg-transparent outline-none text-white placeholder-slate-500 text-sm py-1"
        />
      </div>
    </div>
  );
}