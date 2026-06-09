"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import { CheckCircle, AlertCircle } from "lucide-react";
import { PLANS } from "@/lib/payment-config";

const SECTORS = [
  "Turizm & Otelcilik", "İnşaat & Yapı", "Bahçe & Peyzaj", "Sağlık",
  "Teknoloji", "Tarım", "Lojistik & Taşıma", "Temizlik & Hizmet",
  "Güvenlik", "Gıda & Restoran", "Tekstil", "Üretim", "Diğer",
];

const JOB_TYPES = [
  { value: "full_time", label: "Tam Zamanlı" },
  { value: "part_time", label: "Yarı Zamanlı" },
  { value: "seasonal", label: "Mevsimlik" },
  { value: "contract", label: "Sözleşmeli" },
  { value: "remote", label: "Uzaktan" },
];

const EXPERIENCE_OPTS = [
  { value: 0, label: "Deneyim gerekmez" },
  { value: 1, label: "1+ yıl" },
  { value: 2, label: "2+ yıl" },
  { value: 3, label: "3+ yıl" },
  { value: 5, label: "5+ yıl" },
  { value: 7, label: "7+ yıl" },
];

export default function NewJobPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { user } = useAuthStore();

  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [benefits, setBenefits] = useState("");
  const [category, setCategory] = useState("");
  const [panel, setPanel] = useState("skilled");
  const [jobType, setJobType] = useState("full_time");
  const [location, setLocation] = useState("");
  const [country, setCountry] = useState("TR");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [salaryCurrency, setSalaryCurrency] = useState("TRY");
  const [experienceRequired, setExperienceRequired] = useState(0);
  const [openings, setOpenings] = useState(1);
  const [deadline, setDeadline] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    // Check active subscription
    supabase
      .from("payments")
      .select("status, created_at, metadata")
      .eq("user_id", user.id)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) { setHasSubscription(false); return; }
        const planId = (data as Record<string, unknown> & { metadata?: Record<string, unknown> }).metadata?.plan as string ?? "3m";
        const plan = PLANS.find((p: { id: string; days: number }) => p.id === planId);
        const days = plan?.days ?? 90;
        const expiry = new Date((data as Record<string, unknown>).created_at as string);
        expiry.setDate(expiry.getDate() + days);
        setHasSubscription(expiry > new Date());
      });

    supabase
      .from("companies")
      .select("id, name")
      .eq("profile_id", user.id)
      .single()
      .then(({ data }) => {
        if (!data) return;
        const d = data as Record<string, unknown>;
        setCompanyId(d.id as string);
        setCompanyName(d.name as string);
      });
  }, [user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !companyId) return;
    setSaving(true);
    setError("");

    const supabase = createClient();
    const payload = {
      company_id: companyId,
      employer_id: user.id,
      title,
      description,
      requirements: requirements || null,
      benefits: benefits || null,
      category,
      panel,
      job_type: jobType,
      location,
      country,
      salary_min: salaryMin ? parseFloat(salaryMin) : null,
      salary_max: salaryMax ? parseFloat(salaryMax) : null,
      salary_currency: salaryCurrency,
      experience_required: experienceRequired,
      openings,
      deadline: deadline || null,
      status: "pending",
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: err } = await supabase.from("jobs").insert(payload as any);

    if (err) {
      setError(err.message);
    } else {
      setSaved(true);
      setTimeout(() => router.push(`/${locale}/employer/jobs`), 2000);
    }
    setSaving(false);
  }

  if (hasSubscription === false) {
    return (
      <div className="max-w-2xl">
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800">Aktif üyelik gerekli</p>
            <p className="text-sm text-amber-600 mt-1">İlan verebilmek için aktif bir üyelik paketinizin olması gerekmektedir.</p>
            <button
              onClick={() => router.push(`/${locale}/fiyatlar`)}
              className="mt-3 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Üyelik Al
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!companyId) {
    return (
      <div className="max-w-2xl">
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800">Önce şirket profili oluşturun</p>
            <p className="text-sm text-amber-600 mt-1">İlan verebilmek için şirket bilgilerinizi doldurmanız gerekiyor.</p>
            <button
              onClick={() => router.push(`/${locale}/employer/company`)}
              className="mt-3 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Şirket Profili Oluştur
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Yeni İlan Ver</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          <span className="font-medium text-gray-700">{companyName}</span> adına ilan oluşturuluyor. Admin onayından sonra yayına girecek.
        </p>
      </div>

      {saved && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl p-3 mb-4 text-sm">
          <CheckCircle size={16} /> İlan oluşturuldu! Admin onayına gönderildi. Yönlendiriliyorsunuz...
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        {/* Basic */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pozisyon Adı *</label>
          <input
            required
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Örn: Otel Resepsiyonisti"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Panel *</label>
            <select
              value={panel}
              onChange={(e) => setPanel(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="skilled">Nitelikli İşçiler</option>
              <option value="regular">Normal İşçiler</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sektör / Kategori *</label>
            <select
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Seçin</option>
              {SECTORS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Çalışma Türü *</label>
            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {JOB_TYPES.map((jt) => <option key={jt.value} value={jt.value}>{jt.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Konum *</label>
            <input
              required
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Şehir, Ülke"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ülke</label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="TR"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deneyim</label>
            <select
              value={experienceRequired}
              onChange={(e) => setExperienceRequired(Number(e.target.value))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {EXPERIENCE_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min. Maaş</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={salaryMin}
                onChange={(e) => setSalaryMin(e.target.value)}
                placeholder="15000"
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <select
                value={salaryCurrency}
                onChange={(e) => setSalaryCurrency(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option>TRY</option>
                <option>USD</option>
                <option>EUR</option>
                <option>GBP</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max. Maaş</label>
            <input
              type="number"
              value={salaryMax}
              onChange={(e) => setSalaryMax(e.target.value)}
              placeholder="25000"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alınacak Kişi Sayısı</label>
            <input
              type="number"
              min={1}
              value={openings}
              onChange={(e) => setOpenings(Number(e.target.value))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Son Başvuru Tarihi</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">İş Tanımı *</label>
          <textarea
            required
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Görev tanımı, sorumluluklar, günlük işler..."
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Aranan Nitelikler</label>
          <textarea
            rows={3}
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            placeholder="Eğitim, sertifika, beceri gereksinimleri..."
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Yan Haklar</label>
          <textarea
            rows={2}
            value={benefits}
            onChange={(e) => setBenefits(e.target.value)}
            placeholder="Sigorta, yemek, servis, prim..."
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors text-sm"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {saving ? "Gönderiliyor..." : "İlanı Oluştur & Admin Onayına Gönder"}
          </button>
        </div>
      </form>
    </div>
  );
}
