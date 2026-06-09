"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, X } from "lucide-react";

const CATEGORIES = [
  "Turizm & Otelcilik", "İnşaat & Yapı", "Bahçe & Peyzaj", "Sağlık",
  "Teknoloji", "Tarım", "Lojistik & Taşıma", "Temizlik & Hizmet",
  "Güvenlik", "Gıda & Restoran", "Tekstil", "Üretim",
];

const JOB_TYPES = [
  { value: "full_time", label: "Tam Zamanlı" },
  { value: "part_time", label: "Yarı Zamanlı" },
  { value: "seasonal", label: "Mevsimlik" },
  { value: "contract", label: "Sözleşmeli" },
  { value: "remote", label: "Uzaktan" },
];

interface Props {
  locale: string;
  currentFilters: { q?: string; category?: string; job_type?: string; panel?: string };
  basePath?: string;
}

export default function JobFilters({ locale, currentFilters, basePath }: Props) {
  const router = useRouter();
  const base = basePath ?? "nitelikli-isciler";
  const [q, setQ] = useState(currentFilters.q ?? "");
  const [category, setCategory] = useState(currentFilters.category ?? "");
  const [jobType, setJobType] = useState(currentFilters.job_type ?? "");
  const [panel, setPanel] = useState(currentFilters.panel ?? "skilled");

  function apply() {
    const sp = new URLSearchParams();
    if (panel) sp.set("panel", panel);
    if (q.trim()) sp.set("q", q.trim());
    if (category) sp.set("category", category);
    if (jobType) sp.set("job_type", jobType);
    router.push(`/${locale}/${base}?${sp.toString()}`);
  }

  function reset() {
    setQ("");
    setCategory("");
    setJobType("");
    setPanel(base === "normal-isciler" ? "regular" : "skilled");
    router.push(`/${locale}/${base}`);
  }

  const isDirty = q || category || jobType || (base === "normal-isciler" ? panel !== "regular" : panel !== "skilled");

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      {/* Search bar */}
      <div className="relative mb-3">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && apply()}
          placeholder="İlanda ara... (pozisyon, şirket, konum)"
          className="w-full pl-9 pr-9 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        {q && (
          <button onClick={() => setQ("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X size={14} />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-3 items-end">
        {/* Panel toggle */}
        <div className="flex rounded-xl border border-gray-200 overflow-hidden text-sm font-medium">
          {[{ v: "skilled", l: "Nitelikli" }, { v: "regular", l: "Normal" }].map(({ v, l }) => (
            <button
              key={v}
              onClick={() => setPanel(v)}
              className={`px-4 py-2 transition-colors ${panel === v ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Category */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Tüm Sektörler</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>

        {/* Job type */}
        <select
          value={jobType}
          onChange={(e) => setJobType(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Tüm Türler</option>
          {JOB_TYPES.map((jt) => <option key={jt.value} value={jt.value}>{jt.label}</option>)}
        </select>

        <button
          onClick={apply}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl transition-colors text-sm"
        >
          <Search size={14} /> Filtrele
        </button>

        {isDirty && (
          <button
            onClick={reset}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Sıfırla
          </button>
        )}
      </div>
    </div>
  );
}
