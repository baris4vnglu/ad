"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { CheckCircle, AlertCircle, ExternalLink, MessageCircle, Building2 } from "lucide-react";
import { PLANS, PAYMENT_CONFIG, buildWhatsappLink, type PlanId } from "@/lib/payment-config";
import { cn } from "@/lib/utils";

const SECTORS = [
  "Turizm & Otelcilik", "İnşaat & Yapı", "Bahçe & Peyzaj", "Sağlık",
  "Teknoloji", "Tarım", "Lojistik & Taşıma", "Temizlik & Hizmet",
  "Güvenlik", "Gıda & Restoran", "Tekstil", "Üretim", "Diğer",
];

const CATEGORY_OPTS: Record<string, string[]> = {
  skilled: ["Turizm & Otelcilik", "İnşaat & Yapı", "Bahçe & Peyzaj", "Sağlık", "Teknoloji", "Tarım", "Lojistik", "Hukuk", "Enerji"],
  regular: ["Temizlik & Hizmet", "Güvenlik", "Depo & Lojistik", "Tarım", "Gıda & Restoran", "Tekstil", "Kargo & Dağıtım", "Üretim"],
};

const JOB_TYPES = [
  { value: "full_time", label: "Tam Zamanlı" },
  { value: "part_time", label: "Yarı Zamanlı" },
  { value: "seasonal", label: "Mevsimlik" },
  { value: "contract", label: "Sözleşmeli" },
  { value: "remote", label: "Uzaktan" },
];

const EXPERIENCE_OPTS = [
  { value: "0", label: "Deneyim gerekmez" },
  { value: "1", label: "1+ yıl" },
  { value: "2", label: "2+ yıl" },
  { value: "3", label: "3+ yıl" },
  { value: "5", label: "5+ yıl" },
  { value: "7", label: "7+ yıl" },
];

const BENEFITS = [
  { icon: "⚡", title: "Hızlı Yayın", desc: "24 saat içinde onay ve yayın" },
  { icon: "🎯", title: "Hedefli Erişim", desc: "10.000+ aktif aday havuzu" },
  { icon: "🌍", title: "Küresel Ağ", desc: "40+ ülkeden aday erişimi" },
  { icon: "💰", title: "İlk İlan Ücretsiz", desc: "Ödeme yapmadan deneyin" },
];

export default function IlanVerPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const { user, profile } = useAuthStore();

  // Company fields
  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [sector, setSector] = useState("");

  // Job fields
  const [panel, setPanel] = useState("");
  const [category, setCategory] = useState("");
  const [jobType, setJobType] = useState("full_time");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [experience, setExperience] = useState("0");
  const [openings, setOpenings] = useState("1");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [benefits, setBenefits] = useState("");

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<PlanId>("3m");

  // Already logged in as employer → redirect to dashboard
  if (user && profile?.role === "employer") {
    return (
      <>
        <section className="py-16 bg-gradient-to-br from-gray-900 to-blue-900">
          <div className="container mx-auto px-4">
            <div className="text-xs font-medium text-white/60 mb-4">
              <Link href={`/${locale}`} className="hover:text-white/80">{t("nav.home")}</Link>
              <span className="mx-2">/</span>
              <span>{t("nav.post")}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">{t("post.title")}</h1>
          </div>
        </section>
        <section className="py-14 bg-gray-50">
          <div className="container mx-auto px-4 max-w-xl">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
              <div className="text-4xl mb-4">👋</div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Hoş geldiniz, {profile.full_name ?? profile.email}!</h2>
              <p className="text-gray-500 text-sm mb-6">
                İşveren hesabınızla zaten giriş yaptınız. İlan vermek için işveren panelinizi kullanabilirsiniz.
              </p>
              <button
                onClick={() => router.push(`/${locale}/employer/jobs/new`)}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
              >
                <ExternalLink size={16} />
                İşveren Panelinde İlan Ver
              </button>
            </div>
          </div>
        </section>
      </>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const res = await fetch("/api/submit-job-listing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        full_name: contactPerson,
        phone,
        company_name: companyName,
        website,
        sector,
        title,
        panel,
        category,
        job_type: jobType,
        location,
        salary_min: salaryMin,
        salary_max: salaryMax,
        experience,
        openings,
        description,
        requirements,
        benefits,
      }),
    });

    const data = await res.json() as { success?: boolean; error?: string };

    if (!res.ok || data.error) {
      setError(data.error ?? "Bir hata oluştu. Lütfen tekrar deneyin.");
      setSaving(false);
      return;
    }

    setSaving(false);
    setSuccess(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      {/* Hero */}
      <section className="py-16 bg-gradient-to-br from-gray-900 to-blue-900">
        <div className="container mx-auto px-4">
          <div className="text-xs font-medium text-white/60 mb-4">
            <Link href={`/${locale}`} className="hover:text-white/80">{t("nav.home")}</Link>
            <span className="mx-2">/</span>
            <span>{t("nav.post")}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">{t("post.title")}</h1>
          <p className="text-white/70 text-lg">{t("post.sub")}</p>
        </div>
      </section>

      <section className="py-14 bg-gray-50">
        <div className="container mx-auto px-4 max-w-3xl">
          {success ? (
            <div className="space-y-5">
              {/* Onay */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle size={28} className="text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">İlanınız Alındı!</h2>
                <p className="text-gray-500 text-sm">
                  İlanınız admin onayına gönderildi. Ödemeniz onaylandıktan sonra yayına girecek.
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  <strong>{email}</strong> adresine doğrulama e-postası gönderildi.
                </p>
              </div>

              {/* Plan seç */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-3">Üyelik Paketi Seçin</h3>
                <div className="grid grid-cols-3 gap-3">
                  {PLANS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPlan(p.id)}
                      className={cn(
                        "rounded-xl border p-3 text-center transition-all",
                        selectedPlan === p.id
                          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <div className="font-bold text-gray-900">${p.price}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{p.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* IBAN */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Building2 size={16} className="text-blue-600" />
                  Banka Bilgileri
                </h3>
                <div className="space-y-2 text-sm">
                  {[
                    { label: "Alıcı", value: PAYMENT_CONFIG.accountHolder },
                    { label: "Banka",  value: PAYMENT_CONFIG.bankName },
                    { label: "IBAN",   value: PAYMENT_CONFIG.iban, mono: true },
                  ].map(({ label, value, mono }) => (
                    <div key={label} className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
                      <span className="text-gray-500">{label}</span>
                      <span className={cn("font-medium text-gray-900", mono && "font-mono tracking-wider text-xs")}>
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mt-3">
                  Açıklama: adınız + &quot;{PLANS.find((p) => p.id === selectedPlan)?.label}&quot;
                </p>
              </div>

              {/* WhatsApp */}
              <a
                href={buildWhatsappLink({
                  planLabel:   PLANS.find((p) => p.id === selectedPlan)?.label ?? "",
                  price:       PLANS.find((p) => p.id === selectedPlan)?.price ?? 0,
                  fullName:    contactPerson,
                  email:       email,
                  companyName: companyName,
                  jobTitle:    title,
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                <MessageCircle size={18} />
                WhatsApp&apos;ta Ödeme Bildir
              </a>

              <p className="text-center text-xs text-gray-400">
                Daha sonra ödemek istiyorsanız{" "}
                <Link href={`/${locale}/fiyatlar`} className="text-blue-600 hover:underline">Fiyatlar</Link>{" "}
                sayfasından ulaşabilirsiniz.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 text-sm">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Company section */}
                <div>
                  <h3 className="text-base font-bold text-gray-900 border-b pb-3 mb-5">{t("post.company_section")}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Şirket Adı *</label>
                      <input
                        required
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Şirket A.Ş."
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">İletişim Kişisi *</label>
                      <input
                        required
                        type="text"
                        value={contactPerson}
                        onChange={(e) => setContactPerson(e.target.value)}
                        placeholder="Ad Soyad"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">E-posta *</label>
                      <input
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ik@sirket.com"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Şifre *</label>
                      <input
                        required
                        type="password"
                        minLength={8}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="En az 8 karakter"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+90 5XX XXX XX XX"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Web Sitesi</label>
                      <input
                        type="url"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="https://sirket.com"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sektör *</label>
                      <select
                        required
                        value={sector}
                        onChange={(e) => setSector(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      >
                        <option value="">Seçin</option>
                        {SECTORS.map((o) => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Job section */}
                <div>
                  <h3 className="text-base font-bold text-gray-900 border-b pb-3 mb-5">{t("post.job_section")}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Panel *</label>
                      <select
                        required
                        value={panel}
                        onChange={(e) => { setPanel(e.target.value); setCategory(""); }}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      >
                        <option value="">Seçin</option>
                        <option value="skilled">Nitelikli İşçiler</option>
                        <option value="regular">Normal İşçiler</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Kategori *</label>
                      <select
                        required
                        disabled={!panel}
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-50 disabled:text-gray-400"
                      >
                        <option value="">{panel ? "Seçin" : "Önce panel seçin"}</option>
                        {(CATEGORY_OPTS[panel] ?? []).map((o) => <option key={o}>{o}</option>)}
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Min. Maaş (₺)</label>
                      <input
                        type="number"
                        min={0}
                        value={salaryMin}
                        onChange={(e) => setSalaryMin(e.target.value)}
                        placeholder="15000"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Max. Maaş (₺)</label>
                      <input
                        type="number"
                        min={0}
                        value={salaryMax}
                        onChange={(e) => setSalaryMax(e.target.value)}
                        placeholder="25000"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Deneyim Gereksinimi</label>
                      <select
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      >
                        {EXPERIENCE_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">İstihdam Sayısı</label>
                      <input
                        type="number"
                        min={1}
                        value={openings}
                        onChange={(e) => setOpenings(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">İş Tanımı *</label>
                      <textarea
                        required
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Görev tanımı, sorumluluklar..."
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Aranan Nitelikler</label>
                      <textarea
                        rows={3}
                        value={requirements}
                        onChange={(e) => setRequirements(e.target.value)}
                        placeholder="Eğitim, sertifika, beceri..."
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Yan Haklar</label>
                      <textarea
                        rows={2}
                        value={benefits}
                        onChange={(e) => setBenefits(e.target.value)}
                        placeholder="Sigorta, yemek, servis..."
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 min-w-[200px] bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
                  >
                    {saving ? "Gönderiliyor..." : t("post.submit")}
                  </button>
                </div>

                <p className="text-xs text-gray-400">{t("post.required_note")}</p>

                <p className="text-xs text-center text-gray-500">
                  Zaten hesabınız var mı?{" "}
                  <Link href={`/${locale}/auth/login`} className="text-blue-600 hover:underline font-medium">
                    Giriş yapın
                  </Link>
                </p>
              </form>
            </div>
          )}

          {/* Benefits */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {BENEFITS.map((b) => (
              <div key={b.title} className="bg-white rounded-2xl p-5 text-center border border-gray-100 shadow-sm">
                <div className="text-3xl mb-2">{b.icon}</div>
                <div className="font-semibold text-gray-900 text-sm">{b.title}</div>
                <p className="text-gray-400 text-xs mt-1">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
