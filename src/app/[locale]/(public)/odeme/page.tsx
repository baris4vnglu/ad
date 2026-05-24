"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { Check, Copy, MessageCircle, Building2, CheckCircle } from "lucide-react";
import { PLANS, PAYMENT_CONFIG, getPlan, buildWhatsappLink, type PlanId } from "@/lib/payment-config";
import { useAuthStore } from "@/stores/authStore";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button onClick={copy} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" title="Copy">
      {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} className="text-gray-400" />}
    </button>
  );
}

export default function OdemePage() {
  const searchParams = useSearchParams();
  const locale = useLocale();
  const router = useRouter();
  const { user, profile } = useAuthStore();
  const t = useTranslations();

  const paramPlan = (searchParams.get("plan") ?? "3m") as PlanId;
  const validIds = PLANS.map((p) => p.id);
  const [selectedId, setSelectedId] = useState<PlanId>(
    validIds.includes(paramPlan) ? paramPlan : "3m"
  );
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const plan = getPlan(selectedId);

  function getPlanLabel(id: string) {
    if (id === "3m") return t("pricing.plan_3m");
    if (id === "6m") return t("pricing.plan_6m");
    if (id === "1y") return t("pricing.plan_1y");
    return id;
  }

  const whatsappUrl = buildWhatsappLink({
    planLabel:   getPlanLabel(plan.id),
    price:       plan.price,
    fullName:    profile?.full_name ?? undefined,
    email:       profile?.email,
    companyName: undefined,
    jobTitle:    undefined,
  });

  useEffect(() => {
    if (!user) router.replace(`/${locale}/auth/login`);
  }, [user, locale, router]);

  async function handleSave() {
    if (!user || saving || saved) return;
    setSaving(true);
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as unknown as { from: (t: string) => any };
    await db.from("payments").insert({
      user_id:  user.id,
      amount:   plan.price,
      currency: "USD",
      provider: "iyzico",
      status:   "pending",
      metadata: { plan: plan.id, plan_label: getPlanLabel(plan.id), payment_type: "bank_transfer" },
    });
    setSaving(false);
    setSaved(true);
  }

  if (!user) return null;

  return (
    <>
      <section className="py-12 bg-gradient-to-br from-gray-900 to-blue-900">
        <div className="container mx-auto px-4">
          <div className="text-xs font-medium text-white/60 mb-3">
            <Link href={`/${locale}/fiyatlar`} className="hover:text-white/80">{t("nav.pricing")}</Link>
            <span className="mx-2">/</span>
            <span>{t("payment.breadcrumb")}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">{t("payment.title")}</h1>
          <p className="text-white/70 mt-1 text-sm">{t("payment.subtitle")}</p>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 max-w-2xl space-y-6">
          {/* Plan seçici */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-4">{t("payment.select_plan")}</h2>
            <div className="grid grid-cols-3 gap-3">
              {PLANS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={cn(
                    "rounded-xl border p-3 text-center transition-all",
                    selectedId === p.id
                      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-300"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <div className="font-bold text-gray-900 text-lg">${p.price}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{getPlanLabel(p.id)}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Kullanıcı bilgisi */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-3">{t("payment.account_info")}</h2>
            <div className="space-y-2 text-sm">
              {profile?.full_name && (
                <div className="flex justify-between">
                  <span className="text-gray-500">{t("payment.full_name")}</span>
                  <span className="font-medium text-gray-900">{profile.full_name}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">{t("payment.email")}</span>
                <span className="font-medium text-gray-900">{profile?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t("payment.selected_plan")}</span>
                <span className="font-semibold text-blue-700">{getPlanLabel(plan.id)} — ${plan.price} USD</span>
              </div>
            </div>
          </div>

          {/* IBAN */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 size={18} className="text-blue-600" />
              {t("payment.bank_info")}
            </h2>
            <div className="space-y-3 text-sm">
              {[
                { label: t("payment.receiver"), value: PAYMENT_CONFIG.accountHolder },
                { label: t("payment.bank"),     value: PAYMENT_CONFIG.bankName },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-medium text-gray-900">{value}</span>
                </div>
              ))}
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-500">IBAN</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-gray-900 text-sm tracking-wider">
                    {PAYMENT_CONFIG.iban}
                  </span>
                  <CopyButton text={PAYMENT_CONFIG.iban} />
                </div>
              </div>
            </div>
            <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mt-4">
              {t("payment.iban_note", { plan: getPlanLabel(plan.id) })}
            </p>
          </div>

          {/* WhatsApp */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <MessageCircle size={18} className="text-emerald-600" />
              {t("payment.notify_title")}
            </h2>
            <p className="text-sm text-gray-500 mb-4">{t("payment.notify_desc")}</p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              <MessageCircle size={18} />
              {t("payment.whatsapp_btn")}
            </a>
          </div>

          {/* Kaydet */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
            {saved ? (
              <div className="flex items-center gap-3 text-emerald-700">
                <CheckCircle size={20} />
                <div>
                  <p className="font-semibold">{t("payment.saved_title")}</p>
                  <p className="text-sm mt-0.5">{t("payment.saved_desc")}</p>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm text-blue-800 mb-3">{t("payment.save_prompt")}</p>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  {saving ? t("payment.saving") : t("payment.save_btn")}
                </button>
              </>
            )}
          </div>

          <p className="text-center text-xs text-gray-400">
            {t("payment.support")}{" "}
            <Link href={`/${locale}/iletisim`} className="text-blue-600 hover:underline">
              {t("payment.contact_link")}
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
