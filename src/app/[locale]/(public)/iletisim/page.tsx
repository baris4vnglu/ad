"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";

export default function IletisimPage() {
  const t = useTranslations();
  const locale = useLocale();
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "";
  const contactPhone = process.env.NEXT_PUBLIC_WHATSAPP || "";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value,
      subject: (form.elements.namedItem("subject") as HTMLSelectElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
    };
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const json = await res.json() as { error?: string };
      setError(json.error ?? t("common.error"));
    } else {
      setSuccess(true);
    }
    setLoading(false);
  }

  return (
    <>
      {/* Hero */}
      <section className="py-16 bg-gradient-to-br from-gray-900 to-blue-900">
        <div className="container mx-auto px-4">
          <div className="text-xs font-medium text-white/60 mb-4">
            <Link href={`/${locale}`} className="hover:text-white/80">{t("nav.home")}</Link>
            <span className="mx-2">/</span>
            <span>{t("nav.contact")}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">{t("contact.title")}</h1>
          <p className="text-white/70 text-lg">{t("contact.sub")}</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-14 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {/* Info cards */}
            <div className="md:col-span-2 flex flex-col gap-4">
              {[
                { icon: "📧", labelKey: "contact.email_label", value: contactEmail },
                { icon: "📞", labelKey: "contact.phone_label", value: contactPhone },
                { icon: "🌍", labelKey: "contact.region_label", value: t("contact.region_value") },
                { icon: "🕐", labelKey: "contact.hours_label", value: t("contact.hours_value") },
              ].map((item) => (
                <div key={item.labelKey} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <div className="font-semibold text-gray-900 text-sm">{t(item.labelKey)}</div>
                  <div className="text-gray-500 text-sm mt-1">{item.value}</div>
                </div>
              ))}
            </div>

            {/* Form */}
            <div className="md:col-span-3 bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 text-lg mb-6">{t("contact.form_title")}</h3>

              {success ? (
                <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-4">
                  ✅ {t("contact.success")}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {error && (
                    <div className="sm:col-span-2 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">{error}</div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("contact.name")} *</label>
                    <input name="name" required type="text" placeholder="Ahmet Yılmaz" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("contact.email")} *</label>
                    <input name="email" required type="email" placeholder="ornek@email.com" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("contact.phone")}</label>
                    <input name="phone" type="tel" placeholder="+90 5XX XXX XX XX" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("contact.subject")}</label>
                    <select name="subject" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                      <option>{t("contact.subjects.apply")}</option>
                      <option>{t("contact.subjects.post")}</option>
                      <option>{t("contact.subjects.invest")}</option>
                      <option>{t("contact.subjects.general")}</option>
                      <option>{t("contact.subjects.other")}</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("contact.message")} *</label>
                    <textarea name="message" required rows={4} placeholder="Mesajınızı buraya yazın..." className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none" />
                  </div>
                  <div className="sm:col-span-2">
                    <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60">
                      {loading ? t("common.loading") : t("contact.send")}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
