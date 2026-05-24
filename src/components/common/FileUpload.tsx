"use client";

import { useRef, useState } from "react";
import { Upload, X, FileText, Image } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  accept: string;
  hint?: string;
  currentUrl?: string | null;
  onChange: (file: File | null) => void;
  type?: "file" | "image";
  disabled?: boolean;
}

export default function FileUpload({ label, accept, hint, currentUrl, onChange, type = "file", disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  function handleFile(file: File | null) {
    if (!file) return;
    setFileName(file.name);
    onChange(file);
    if (type === "image") {
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0] ?? null;
    handleFile(file);
  }

  function clear(e: React.MouseEvent) {
    e.stopPropagation();
    setPreview(null);
    setFileName(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors",
          dragging ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-gray-300 bg-gray-50",
          disabled && "opacity-60 cursor-not-allowed"
        )}
      >
        {type === "image" && preview ? (
          <div className="flex items-center justify-center gap-3">
            <img src={preview} alt="preview" className="w-16 h-16 rounded-xl object-cover border border-gray-200" />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-800">{fileName ?? "Mevcut dosya"}</p>
              <button onClick={clear} className="text-xs text-red-500 hover:underline mt-0.5">Kaldır</button>
            </div>
          </div>
        ) : fileName ? (
          <div className="flex items-center justify-center gap-2">
            <FileText size={18} className="text-blue-500" />
            <span className="text-sm text-gray-700">{fileName}</span>
            <button onClick={clear} className="text-gray-400 hover:text-red-500 transition-colors">
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 text-gray-400">
            {type === "image" ? <Image size={22} /> : <Upload size={22} />}
            <span className="text-sm">Dosya seçin veya sürükleyin</span>
            {hint && <span className="text-xs">{hint}</span>}
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          disabled={disabled}
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
      </div>
    </div>
  );
}
