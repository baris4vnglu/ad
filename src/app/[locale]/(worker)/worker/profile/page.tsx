"use client";

import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { uploadFile } from "@/lib/storage";
import { useAuthStore } from "@/stores/authStore";
import FileUpload from "@/components/common/FileUpload";
import TagInput from "@/components/common/TagInput";
import { CheckCircle } from "lucide-react";

const JOB_TYPES = [
  { value: "full_time", label: "Tam Zamanlı" },
  { value: "part_time", label: "Yarı Zamanlı" },
  { value: "seasonal", label: "Mevsimlik" },
  { value: "contract", label: "Sözleşmeli" },
  { value: "remote", label: "Uzaktan" },
];

export default function WorkerProfilePage() {
  const locale = useLocale();
  const { user, profile } = useAuthStore();

  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [experienceYears, setExperienceYears] = useState(0);
  const [desiredJobType, setDesiredJobType] = useState("");
  const [desiredLocation, setDesiredLocation] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [currentCvUrl, setCurrentCvUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    supabase
      .from("worker_profiles")
      .select("*")
      .eq("profile_id", user.id)
      .single()
      .then(({ data }) => {
        if (!data) return;
        const d = data as Record<string, unknown>;
        setTitle((d.title as string) ?? "");
        setBio((d.bio as string) ?? "");
        setSkills((d.skills as string[]) ?? []);
        setLanguages((d.languages as string[]) ?? []);
        setExperienceYears((d.experience_years as number) ?? 0);
        setDesiredJobType((d.desired_job_type as string) ?? "");
        setDesiredLocation((d.desired_location as string) ?? "");
        setSalaryMin(d.desired_salary_min?.toString() ?? "");
        setSalaryMax(d.desired_salary_max?.toString() ?? "");
        setPortfolioUrl((d.portfolio_url as string) ?? "");
        setIsAvailable((d.is_available as boolean) ?? true);
        setCurrentCvUrl((d.cv_url as string) ?? null);
      });
  }, [user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError("");

    let cvUrl = currentCvUrl;

    if (cvFile) {
      const { publicUrl, error: uploadErr } = await uploadFile("cvs", user.id, cvFile, "cv");
      if (uploadErr) {
        setError(uploadErr);
        setSaving(false);
        return;
      }
      cvUrl = publicUrl;
    }

    const supabase = createClient();
    const payload = {
      profile_id: user.id,
      title,
      bio,
      skills,
      languages,
      experience_years: experienceYears,
      desired_job_type: desiredJobType || null,
      desired_location: desiredLocation || null,
      desired_salary_min: salaryMin ? parseFloat(salaryMin) : null,
      desired_salary_max: salaryMax ? parseFloat(salaryMax) : null,
      portfolio_url: portfolioUrl || null,
      is_available: isAvailable,
      cv_url: cvUrl,
    };

    const { error: err } = await supabase
      .from("worker_profiles")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .upsert(payload as any, { onConflict: "profile_id" });

    if (err) {
      setError(err.message);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profilim</h1>
          <p className="text-gray-500 text-sm mt-0.5">İşverenler profilinizi görecek. Eksiksiz doldurun.</p>
        </div>
        {/* Availability toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="text-sm text-gray-600">İş Arıyorum</span>
          <div
            onClick={() => setIsAvailable(!isAvailable)}
            className={`w-11 h-6 rounded-full transition-colors relative ${isAvailable ? "bg-emerald-500" : "bg-gray-300"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${isAvailable ? "translate-x-5" : ""}`} />
          </div>
        </label>
      </div>

      {saved && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl p-3 mb-4 text-sm">
          <CheckCircle size={16} /> Profiliniz kaydedildi.
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        {/* Basic info */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Unvan / Pozisyon</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Örn: Otel Resepsiyonisti, İnşaat Ustası"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hakkımda</label>
          <textarea
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Kendinizi, deneyimlerinizi ve hedeflerinizi kısaca anlatın..."
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          />
        </div>

        {/* Skills & languages */}
        <TagInput label="Beceriler" value={skills} onChange={setSkills} placeholder="Örn: Aşçılık, Vinç kullanımı" />
        <TagInput label="Konuştuğum Diller" value={languages} onChange={setLanguages} placeholder="Örn: Türkçe, İngilizce" />

        {/* Experience */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Deneyim Yılı — <span className="text-blue-600 font-bold">{experienceYears} yıl</span>
          </label>
          <input
            type="range"
            min={0}
            max={30}
            value={experienceYears}
            onChange={(e) => setExperienceYears(Number(e.target.value))}
            className="w-full accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-0.5">
            <span>0</span><span>15</span><span>30+</span>
          </div>
        </div>

        {/* Job preferences */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tercih Edilen Çalışma Türü</label>
            <select
              value={desiredJobType}
              onChange={(e) => setDesiredJobType(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Seçin</option>
              {JOB_TYPES.map((jt) => (
                <option key={jt.value} value={jt.value}>{jt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tercih Edilen Konum</label>
            <input
              type="text"
              value={desiredLocation}
              onChange={(e) => setDesiredLocation(e.target.value)}
              placeholder="Şehir veya ülke"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min. Maaş Beklentisi (₺)</label>
            <input
              type="number"
              value={salaryMin}
              onChange={(e) => setSalaryMin(e.target.value)}
              placeholder="15000"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max. Maaş Beklentisi (₺)</label>
            <input
              type="number"
              value={salaryMax}
              onChange={(e) => setSalaryMax(e.target.value)}
              placeholder="25000"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio / LinkedIn URL</label>
          <input
            type="url"
            value={portfolioUrl}
            onChange={(e) => setPortfolioUrl(e.target.value)}
            placeholder="https://linkedin.com/in/adınız"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* CV Upload */}
        <FileUpload
          label="CV / Özgeçmiş"
          accept=".pdf,.doc,.docx"
          hint="PDF veya Word, max 10 MB"
          currentUrl={currentCvUrl}
          onChange={setCvFile}
          type="file"
        />

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          {saving ? "Kaydediliyor..." : "Profili Kaydet"}
        </button>
      </form>
    </div>
  );
}
