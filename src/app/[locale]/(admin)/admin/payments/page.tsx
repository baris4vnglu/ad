import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import PaymentActions from "./PaymentActions";
import { getTranslations } from "next-intl/server";

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminPaymentsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { status } = await searchParams;
  const t = await getTranslations({ locale });
  const supabase = await createClient();

  const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    pending:   { label: t("admin.pending_short"), color: "amber" },
    completed: { label: t("admin.approved"),      color: "emerald" },
    failed:    { label: t("admin.rejected"),      color: "red" },
    refunded:  { label: t("admin.refunded"),      color: "gray" },
  };

  const STATUS_TABS = [
    { value: "",          label: t("admin.all") },
    { value: "pending",   label: t("admin.pending_short") },
    { value: "completed", label: t("admin.approved") },
    { value: "failed",    label: t("admin.rejected") },
  ];

  let query = supabase
    .from("payments")
    .select("id, amount, currency, status, metadata, created_at, profiles!payments_user_id_fkey (full_name, email, role)")
    .order("created_at", { ascending: false })
    .limit(200);

  if (status) query = query.eq("status", status);

  const { data: payments } = await query;
  const list = (payments ?? []) as Array<Record<string, unknown>>;

  const pendingCount = status ? null : list.filter((p) => p.status === "pending").length;
  const dateLocale = locale === "tr" ? "tr-TR" : "en-GB";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("admin.payments")}</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {list.length} kayıt
            {pendingCount ? <span className="ml-2 bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">{pendingCount} bekliyor</span> : null}
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/${locale}/admin/payments${tab.value ? `?status=${tab.value}` : ""}`}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              (status ?? "") === tab.value
                ? "bg-gray-900 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center text-gray-400">
          {t("admin.no_items")}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{t("admin.user")}</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{t("admin.package")}</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{t("admin.amount")}</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{t("admin.status")}</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{t("admin.date")}</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{t("admin.action")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {list.map((payment) => {
                  const user = payment.profiles as Record<string, unknown> | null;
                  const meta = payment.metadata as Record<string, unknown> | null;
                  const payStatus = payment.status as string;
                  const cfg = STATUS_LABELS[payStatus] ?? STATUS_LABELS.pending;
                  return (
                    <tr key={payment.id as string} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-medium text-gray-900 truncate max-w-[180px]">
                          {user?.full_name as string ?? "—"}
                        </div>
                        <div className="text-xs text-gray-400 truncate">{user?.email as string ?? "—"}</div>
                      </td>
                      <td className="px-5 py-4 text-gray-600">
                        {meta?.plan_label as string ?? meta?.plan as string ?? "—"}
                      </td>
                      <td className="px-5 py-4 font-semibold text-gray-900">
                        {payment.amount as number} {payment.currency as string}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-${cfg.color}-100 text-${cfg.color}-700`}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-400">
                        {new Date(payment.created_at as string).toLocaleDateString(dateLocale)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <PaymentActions paymentId={payment.id as string} currentStatus={payStatus} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
