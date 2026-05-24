"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { uploadFile } from "@/lib/storage";
import { useAuthStore } from "@/stores/authStore";
import FileUpload from "@/components/common/FileUpload";
import { CheckCircle } from "lucide-react";

const SECTORS = [
  "Turizm & Otelcilik", "İnşaat & Yapı", "Bahçe & Peyzaj", "Sağlık",
  "Teknoloji", "Tarım", "Lojistik & Taşıma", "Temizlik & Hizmet",
  "Güvenlik", "Gıda & Restoran", "Tekstil", "Üretim", "Diğer",
];

const COMPANY_SIZES = [
  "1-10", "11-50", "51-200", "201-500", "500+",
];

export default function EmployerCompanyPage() {
  const { user } = useAuthStore();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [sector, setSector] = useState("");
  const [size, setSize] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [currentLogoUrl, setCurrentLogoUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    supabase
      .from("companies")
      .select("*")
      .eq("profile_id", user.id)
      .single()
      .then(({ data }) => {
        if (!data) return;
        const d = data as Record<string, unknown>;
        setName((d.name as string) ?? "");
        setDescription((d.description as string) ?? "");
        setWebsite((d.website as string) ?? "");
        setSector((d.sector as string) ?? "");
        setSize((d.size as string) ?? "");
        setCountry((d.country as string) ?? "");
        setCity((d.city as string) ?? "");
        setCurrentLogoUrl((d.logo_url as string) ?? null);
      });
  }, [user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError("");

    let logoUrl = currentLogoUrl;

    if (logoFile) {
      const { publicUrl, error: uploadErr } = await uploadFile("logos", user.id, logoFile, "logo");
      if (uploadErr) {
        setError(uploadErr);
        setSaving(false);
        return;
      }
      logoUrl = publicUrl;
    }

    const supabase = createClient();
    const payload = {
      profile_id: user.id,
      name,
      description: description || null,
      website: website || null,
      sector: sector || null,
      size: size || null,
      country: country || null,
      city: city || null,
      logo_url: logoUrl,
    };

    const { error: err } = await supabase
      .from("companies")
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Şirket Profili</h1>
        <p className="text-gray-500 text-sm mt-0.5">Şirket bilgilerinizi doldurun. Adaylar bu bilgileri görecek.</p>
      </div>

      {saved && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl p-3 mb-4 text-sm">
          <CheckCircle size={16} /> Şirket profili kaydedildi.
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <FileUpload
          label="Şirket Logosu"
          accept="image/jpeg,image/png,image/webp,image/svg+xml"
          hint="JPG, PNG veya SVG, max 2 MB"
          currentUrl={currentLogoUrl}
          onChange={setLogoFile}
          type="image"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Şirket Adı *</label>
          <input
            required
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="A&D İnşaat A.Ş."
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Şirket Açıklaması</label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Şirketiniz hakkında kısa bir açıklama..."
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sektör</label>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Seçin</option>
              {SECTORS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Çalışan Sayısı</label>
            <select
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Seçin</option>
              {COMPANY_SIZES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ülke</label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="Türkiye"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Şehir</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="İstanbul"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Web Sitesi</label>
          <input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://sirketim.com"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          {saving ? "Kaydediliyor..." : "Şirket Profilini Kaydet"}
        </button>
      </form>
    </div>
  );
}
