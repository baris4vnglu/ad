"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Check, MessageCircle, CreditCard, Building2, Mail } from "lucide-react";
import { PLANS, PAYMENT_CONFIG } from "@/lib/payment-config";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";

const PLAN_FEATURE_KEYS: Record<string, string[]> = {
  "3m": ["pricing.feat_listing", "pricing.feat_tracking", "pricing.feat_messaging"],
  "6m": ["pricing.feat_listing", "pricing.feat_tracking", "pricing.feat_messaging", "pricing.feat_save_6m"],
  "1y": ["pricing.feat_listing", "pricing.feat_tracking", "pricing.feat_messaging", "pricing.feat_save_1y", "pricing.feat_priority"],
};

export default function FiyatlarPage() {
  const locale = useLocale();
  const router = useRouter();
  const { user } = useAuthStore();
  const t = useTranslations();

  const HOW_IT_WORKS = [
    { icon: CreditCard, step: "1", title: t("pricing.step1_title"), desc: t("pricing.step1_desc") },
    { icon: Building2,  step: "2", title: t("pricing.step2_title"), desc: t("pricing.step2_desc") },
    { icon: MessageCircle, step: "3", title: t("pricing.step3_title"), desc: t("pricing.step3_desc") },
    { icon: Check,     step: "4", title: t("pricing.step4_title"), desc: t("pricing.step4_desc") },
  ];

  function handleSelect(planId: string) {
    if (user) {
      router.push(`/${locale}/odeme?plan=${planId}`);
    } else {
      router.push(`/${locale}/auth/login?redirect=/${locale}/odeme?plan=${planId}`);
    }
  }

  function getPlanLabel(id: string) {
    if (id === "3m") return t("pricing.plan_3m");
    if (id === "6m") return t("pricing.plan_6m");
    if (id === "1y") return t("pricing.plan_1y");
    return id;
  }

  function getPlanBadge(badge: string | null) {
    if (!badge) return null;
    if (badge === "Popüler") return t("pricing.popular");
    if (badge === "En Avantajlı") return t("pricing.best_value");
    return badge;
  }

  return (
    <>
      {/* Hero */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-gray-900 to-blue-900">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-block bg-blue-400/20 text-blue-200 text-xs font-semibold rounded-full px-3 py-1 mb-4">
            {t("pricing.badge_label")}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            {t("pricing.title")}
          </h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto">
            {t("pricing.subtitle")}
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {PLANS.map((plan) => {
              const badge = getPlanBadge(plan.badge);
              return (
                <div
                  key={plan.id}
                  className={cn(
                    "bg-white rounded-2xl border shadow-sm flex flex-col relative overflow-hidden",
                    plan.badge === "Popüler"
                      ? "border-blue-400 shadow-blue-100"
                      : plan.badge === "En Avantajlı"
                      ? "border-emerald-400 shadow-emerald-100"
                      : "border-gray-100"
                  )}
                >
                  {badge && (
                    <div className={cn(
                      "text-xs font-bold text-white text-center py-1.5",
                      plan.badge === "Popüler" ? "bg-blue-600" : "bg-emerald-600"
                    )}>
                      {badge}
                    </div>
                  )}
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{getPlanLabel(plan.id)}</h3>
                    <div className="flex items-end gap-1 mb-5">
                      <span className="text-4xl font-extrabold text-gray-900">${plan.price}</span>
                      <span className="text-gray-400 text-sm mb-1">USD</span>
                    </div>
                    <ul className="space-y-2.5 mb-6 flex-1">
                      {(PLAN_FEATURE_KEYS[plan.id] ?? []).map((key) => (
                        <li key={key} className="flex items-start gap-2 text-sm text-gray-600">
                          <Check size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                          {t(key as Parameters<typeof t>[0])}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => handleSelect(plan.id)}
                      className={cn(
                        "w-full py-3 rounded-xl font-semibold text-sm transition-colors",
                        plan.badge === "Popüler"
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : plan.badge === "En Avantajlı"
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                          : "bg-gray-900 hover:bg-gray-800 text-white"
                      )}
                    >
                      {t("pricing.select_btn")}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
            <a
              href={`https://wa.me/${PAYMENT_CONFIG.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              <MessageCircle size={15} /> {t("pricing.whatsapp_link")}
            </a>
            <span className="text-gray-300">|</span>
            <a
              href={`mailto:${PAYMENT_CONFIG.email}`}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              <Mail size={15} /> {PAYMENT_CONFIG.email}
            </a>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl font-extrabold text-gray-900 text-center mb-10">{t("pricing.how_title")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {HOW_IT_WORKS.map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="flex items-start gap-4 bg-gray-50 rounded-2xl p-5">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
                  {step}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">{title}</p>
                  <p className="text-sm text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* IBAN */}
      <section className="py-14 bg-gray-50">
        <div className="container mx-auto px-4 max-w-xl">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
            <Building2 size={32} className="text-blue-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-900 mb-4">{t("pricing.bank_info")}</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-500">{t("pricing.receiver")}</span>
                <span className="font-semibold text-gray-900">{PAYMENT_CONFIG.accountHolder}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-500">{t("pricing.bank")}</span>
                <span className="font-semibold text-gray-900">{PAYMENT_CONFIG.bankName}</span>
              </div>
              <div className="flex flex-col gap-1 py-2">
                <span className="text-gray-500 text-xs">IBAN</span>
                <span className="font-mono font-bold text-gray-900 text-base tracking-wider">
                  {PAYMENT_CONFIG.iban}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-4">{t("pricing.bank_note")}</p>
          </div>
        </div>
      </section>
    </>
  );
}
