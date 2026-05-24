"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Role = "worker" | "employer" | "investor";

const ROLES: { key: Role; labelKey: string; icon: string }[] = [
  { key: "worker", labelKey: "auth.role_worker", icon: "👷" },
  { key: "employer", labelKey: "auth.role_employer", icon: "🏢" },
  { key: "investor", labelKey: "auth.role_investor", icon: "📈" },
];

export default function RegisterPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [role, setRole] = useState<Role>("worker");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const callbackUrl = `${window.location.origin}/${locale}/auth/callback`;
    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: callbackUrl,
        data: { full_name: fullName, role, locale },
      },
    });

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div className="w-full max-w-md space-y-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="text-5xl mb-4">✉️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">E-postanızı Doğrulayın</h2>
          <p className="text-gray-500 text-sm">
            <span className="font-medium text-gray-700">{email}</span> adresine bir doğrulama
            e-postası gönderdik. Lütfen gelen kutunuzu kontrol edin.
          </p>
          <Link
            href={`/${locale}/auth/login`}
            className="mt-6 inline-block text-blue-600 font-medium hover:underline text-sm"
          >
            Giriş sayfasına dön
          </Link>
        </div>

        {(role === "worker" || role === "employer") && (
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200 p-6 text-center">
            <div className="text-3xl mb-2">💼</div>
            <h3 className="font-bold text-blue-900 mb-1">Üyelik Paketleri</h3>
            <p className="text-blue-700 text-sm mb-4">
              E-postanızı doğruladıktan sonra bir üyelik paketi seçerek platformun tüm
              özelliklerinden yararlanabilirsiniz.
            </p>
            <Link
              href={`/${locale}/fiyatlar`}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
            >
              Paketleri İncele →
            </Link>
          </div>
        )}

        {role === "investor" && (
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl border border-amber-200 p-6 text-center">
            <div className="text-3xl mb-2">📈</div>
            <h3 className="font-bold text-amber-900 mb-1">Yatırım Profilinizi Oluşturun</h3>
            <p className="text-amber-700 text-sm mb-4">
              Giriş yaptıktan sonra yatırım tercihlerinizi belirterek ekibimizin sizinle
              iletişime geçmesini sağlayabilirsiniz.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{t("auth.register_title")}</h1>
        <p className="text-gray-500 text-sm mb-6">{t("auth.register_sub")}</p>

        {/* Role selector */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {ROLES.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => setRole(r.key)}
              className={cn(
                "flex flex-col items-center gap-1 p-3 rounded-xl border-2 text-xs font-medium transition-all",
                role === r.key
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              )}
            >
              <span className="text-xl">{r.icon}</span>
              {t(r.labelKey)}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("contact.name")}</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ahmet Yılmaz"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("auth.email")}</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@email.com"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("auth.password")}</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="En az 8 karakter"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-colors"
          >
            {loading ? t("common.loading") : t("auth.register_title")}
          </button>
        </form>

        <p className="text-sm text-gray-500 text-center mt-5">
          {t("auth.has_account")}{" "}
          <Link href={`/${locale}/auth/login`} className="text-blue-600 font-medium hover:underline">
            {t("auth.login_title")}
          </Link>
        </p>
      </div>
    </div>
  );
}
