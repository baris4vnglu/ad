"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { INVESTOR_PROJECTS } from "@/components/jobs/InvestorData";

const STATS = [
  { value: "€500M+", label: "Toplam Yönetilen Portföy" },
  { value: "120+", label: "Tamamlanan Proje" },
  { value: "%19", label: "Ortalama Yıllık ROI" },
  { value: "40+", label: "Ülkede Proje" },
];

const WHY_US = [
  { icon: "🛡️", title: "İK Güvencesi", desc: "Projeleriniz için nitelikli insan kaynağı teminini garantiliyoruz. İşe alımdan eğitime tüm süreç yönetimi dahil." },
  { icon: "📊", title: "Şeffaf Raporlama", desc: "Aylık detaylı yatırım raporları, gerçek zamanlı panel erişimi ve bağımsız denetim desteği." },
  { icon: "🌍", title: "Küresel Ağ", desc: "40'tan fazla ülkede yerel ortaklarımız ve uzman ekibimizle projenizi en hızlı şekilde hayata geçiriyoruz." },
  { icon: "⚡", title: "Hızlı Başlangıç", desc: "Proje onayından itibaren 30 gün içinde operasyonel faaliyete geçiş. Bürokratik süreçleri sizin adınıza yönetiyoruz." },
];

export default function YatirimcilarPage() {
  const t = useTranslations();
  const locale = useLocale();
  const [sectorFilter, setSectorFilter] = useState("");
  const [formSuccess, setFormSuccess] = useState(false);

  const projects = sectorFilter
    ? INVESTOR_PROJECTS.filter((p) => p.category === sectorFilter)
    : INVESTOR_PROJECTS;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormSuccess(true);
  }

  return (
    <>
      {/* Hero */}
      <section
        className="py-16 md:py-20"
        style={{ background: "linear-gradient(135deg, #78350f 0%, #d97706 100%)" }}
      >
        <div className="container mx-auto px-4">
          <div className="text-xs font-medium text-white/60 mb-4">
            <Link href={`/${locale}`} className="hover:text-white/80">{t("nav.home")}</Link>
            <span className="mx-2">/</span>
            <span>{t("nav.investors")}</span>
          </div>
          <div className="inline-block bg-amber-400/20 text-amber-200 text-xs font-semibold rounded-full px-3 py-1 mb-4">
            {t("investors.badge")}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">{t("investors.title")}</h1>
          <p className="text-white/70 text-lg max-w-xl">{t("investors.sub")}</p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((s) => (
              <div key={s.value} className="bg-white rounded-2xl p-6 text-center shadow-sm">
                <div className="text-2xl md:text-3xl font-extrabold text-amber-600">{s.value}</div>
                <div className="text-gray-500 text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects */}
      <section className="py-14">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{t("investors.openProjects")}</h2>
              <p className="text-gray-500">{t("investors.openProjectsSub")}</p>
            </div>
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="">{t("investors.allSectors")}</option>
              <option value="Turizm">Turizm</option>
              <option value="İnşaat">İnşaat</option>
              <option value="Tarım">Tarım</option>
              <option value="Enerji">Enerji</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className={`${p.colorClass} p-6 text-white`}>
                  <div className="text-xs font-semibold uppercase tracking-wider opacity-80 mb-2">{p.category}</div>
                  <div className="text-xl font-bold">{p.title}</div>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 text-sm mb-4">{p.desc}</p>
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    {[
                      ["📍 Konum", p.location],
                      ["💰 Bütçe", p.budget],
                      ["📈 Tahmini ROI", p.roi],
                      ["⏱️ Süre", p.duration],
                    ].map(([label, val]) => (
                      <div key={label} className="bg-gray-50 rounded-xl p-3">
                        <div className="text-xs text-gray-400 mb-0.5">{label}</div>
                        <div className="font-semibold text-gray-800 text-sm">{val}</div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => document.getElementById("contact-form")?.scrollIntoView({ behavior: "smooth" })}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2.5 rounded-xl transition-colors"
                  >
                    İletişime Geç
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="py-14 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">{t("investors.whyUs")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {WHY_US.map((w) => (
              <div key={w.title} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="text-3xl mb-3">{w.icon}</div>
                <h4 className="font-bold text-gray-900 mb-2">{w.title}</h4>
                <p className="text-gray-500 text-sm leading-relaxed">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact form */}
      <section
        id="contact-form"
        className="py-16"
        style={{ background: "linear-gradient(135deg, #78350f 0%, #d97706 100%)" }}
      >
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">{t("investors.contactTitle")}</h2>
            <p className="text-white/80">{t("investors.contactSub")}</p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-xl">
            {formSuccess ? (
              <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-4 text-center">
                ✅ Mesajınız alındı! En kısa sürede size ulaşacağız.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad *</label>
                  <input required type="text" placeholder="Ahmet Yılmaz" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-posta *</label>
                  <input required type="email" placeholder="ornek@email.com" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                  <input type="tel" placeholder="+90 5XX XXX XX XX" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Yatırım Bütçesi</label>
                  <select className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                    <option>€100K – €500K</option>
                    <option>€500K – €1M</option>
                    <option>€1M – €5M</option>
                    <option>€5M+</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mesajınız</label>
                  <textarea rows={3} placeholder="Yatırım hedefleriniz hakkında bilgi verin..." className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
                </div>
                <div className="sm:col-span-2">
                  <button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 rounded-xl transition-colors">
                    Gönder
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
