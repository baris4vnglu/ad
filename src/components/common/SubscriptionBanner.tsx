import Link from "next/link";
import { CreditCard, CheckCircle, AlertCircle } from "lucide-react";
import { PLANS } from "@/lib/payment-config";

interface Payment {
  status: string;
  amount: number;
  currency: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

interface Props {
  payment: Payment | null;
  locale: string;
}

function getDaysLeft(createdAt: string, planId: string): number {
  const plan = PLANS.find((p) => p.id === planId);
  const days = plan?.days ?? 90;
  const expiry = new Date(createdAt);
  expiry.setDate(expiry.getDate() + days);
  const now = new Date();
  return Math.max(0, Math.ceil((expiry.getTime() - now.getTime()) / 86400000));
}

export default function SubscriptionBanner({ payment, locale }: Props) {
  if (!payment || payment.status !== "completed") {
    return (
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
        <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-amber-800">Aktif üyeliğiniz bulunmuyor</p>
          <p className="text-xs text-amber-600 mt-0.5">
            {payment?.status === "pending"
              ? "Ödemeniz onay bekliyor. Havaleyi yaptıysanız WhatsApp'tan bildirim yapın."
              : "Platformu tam kapasitede kullanmak için bir üyelik paketi edinin."}
          </p>
        </div>
        <Link
          href={`/${locale}/fiyatlar`}
          className="shrink-0 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
        >
          {payment?.status === "pending" ? "Paketler" : "Üyelik Al"}
        </Link>
      </div>
    );
  }

  const planId = payment.metadata?.plan as string ?? "3m";
  const planLabel = payment.metadata?.plan_label as string ?? planId;
  const daysLeft = getDaysLeft(payment.created_at, planId);
  const isExpiringSoon = daysLeft <= 14;

  return (
    <div className={`flex items-center gap-3 rounded-2xl p-4 mb-6 ${
      isExpiringSoon
        ? "bg-amber-50 border border-amber-200"
        : "bg-emerald-50 border border-emerald-200"
    }`}>
      <CheckCircle size={20} className={isExpiringSoon ? "text-amber-500" : "text-emerald-500"} />
      <div className="flex-1">
        <p className={`text-sm font-semibold ${isExpiringSoon ? "text-amber-800" : "text-emerald-800"}`}>
          {planLabel} üyeliği aktif
        </p>
        <p className={`text-xs mt-0.5 ${isExpiringSoon ? "text-amber-600" : "text-emerald-600"}`}>
          {daysLeft > 0
            ? `${daysLeft} gün kaldı`
            : "Üyeliğiniz sona erdi"}
          {isExpiringSoon && daysLeft > 0 && " — Yenilemeyi unutmayın!"}
        </p>
      </div>
      {isExpiringSoon && (
        <Link
          href={`/${locale}/odeme`}
          className="shrink-0 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
        >
          Yenile
        </Link>
      )}
      {!isExpiringSoon && (
        <div className="flex items-center gap-1 text-xs text-emerald-700 font-medium shrink-0">
          <CreditCard size={13} /> ${payment.amount} {payment.currency}
        </div>
      )}
    </div>
  );
}
