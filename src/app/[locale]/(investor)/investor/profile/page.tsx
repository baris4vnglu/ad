"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import { CheckCircle } from "lucide-react";

const BUDGET_RANGES = ["€100K – €500K", "€500K – €1M", "€1M – €5M", "€5M+"];
const SECTOR_INTERESTS = [
  "Turizm & Otelcilik", "İnşaat & Gayrimenkul", "Tarım & Teknoloji", "Enerji", "Teknoloji", "Diğer",
];

export default function InvestorProfilePage() {
  const { user, profile } = useAuthStore();

  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [phone, setPhone] = useState("");
  const [budgetRange, setBudgetRange] = useState("");
  const [sectorInterest, setSectorInterest] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    supabase
      .from("investor_inquiries")
      .select("*")
      .eq("profile_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => {
        if (!data) return;
        const d = data as Record<string, unknown>;
        setFullName((d.full_name as string) ?? "");
        setPhone((d.phone as string) ?? "");
        setBudgetRange((d.budget_range as string) ?? "");
        setSectorInterest((d.sector_interest as string) ?? "");
        setMessage((d.message as string) ?? "");
      });
  }, [user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError("");

    const supabase = createClient();
    const inquiryPayload = {
      profile_id: user.id,
      full_name: fullName,
      email: profile?.email ?? "",
      phone: phone || null,
      budget_range: budgetRange || null,
      sector_interest: sectorInterest || null,
      message: message || null,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: err } = await supabase.from("investor_inquiries").insert(inquiryPayload as any);

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
        <h1 className="text-2xl font-bold text-gray-900">Yatırım Profilim</h1>
        <p className="text-gray-500 text-sm mt-0.5">Yatırım tercihlerinizi belirtin, size uygun projeler sunalım.</p>
      </div>

      {saved && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl p-3 mb-4 text-sm">
          <CheckCircle size={16} /> Profiliniz kaydedildi. Ekibimiz kısa sürede sizinle iletişime geçecektir.
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad *</label>
            <input
              required
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ahmet Yılmaz"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefon / WhatsApp</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+90 5XX XXX XX XX"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Yatırım Bütçesi</label>
            <select
              value={budgetRange}
              onChange={(e) => setBudgetRange(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="">Seçin</option>
              {BUDGET_RANGES.map((b) => <option key={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">İlgilendiğiniz Sektör</label>
            <select
              value={sectorInterest}
              onChange={(e) => setSectorInterest(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="">Seçin</option>
              {SECTOR_INTERESTS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Yatırım Hedefleri & Notlar</label>
          <textarea
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Yatırım beklentileriniz, tercih ettiğiniz proje türleri..."
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          {saving ? "Kaydediliyor..." : "Profili Kaydet"}
        </button>
      </form>
    </div>
  );
}
