"use client";

import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";

interface Props {
  label: string;
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  max?: number;
}

export default function TagInput({ label, value, onChange, placeholder = "Ekle ve Enter'a bas", max = 20 }: Props) {
  const [input, setInput] = useState("");

  function add() {
    const tag = input.trim();
    if (!tag || value.includes(tag) || value.length >= max) return;
    onChange([...value, tag]);
    setInput("");
  }

  function remove(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add();
    } else if (e.key === "Backspace" && !input && value.length > 0) {
      remove(value[value.length - 1]);
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="border border-gray-200 rounded-xl p-2 min-h-[44px] flex flex-wrap gap-1.5 focus-within:ring-2 focus-within:ring-blue-400 bg-white">
        {value.map((tag) => (
          <span key={tag} className="flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-lg px-2 py-1">
            {tag}
            <button type="button" onClick={() => remove(tag)} className="text-blue-500 hover:text-blue-700">
              <X size={11} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          onBlur={add}
          placeholder={value.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] text-sm outline-none bg-transparent px-1 py-0.5"
        />
      </div>
      <p className="text-xs text-gray-400 mt-1">{value.length}/{max} — Enter veya virgül ile ekleyin</p>
    </div>
  );
}
