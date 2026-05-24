"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

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
}

export default function JobFilters({ locale, currentFilters }: Props) {
  const router = useRouter();
  const [category, setCategory] = useState(currentFilters.category ?? "");
  const [jobType, setJobType] = useState(currentFilters.job_type ?? "");
  const [panel, setPanel] = useState(currentFilters.panel ?? "skilled");

  function apply() {
    const sp = new URLSearchParams();
    if (panel) sp.set("panel", panel);
    if (category) sp.set("category", category);
    if (jobType) sp.set("job_type", jobType);
    router.push(`/${locale}/nitelikli-isciler?${sp.toString()}`);
  }

  function reset() {
    setCategory("");
    setJobType("");
    setPanel("skilled");
    router.push(`/${locale}/nitelikli-isciler`);
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
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

        {(category || jobType || panel !== "skilled") && (
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
