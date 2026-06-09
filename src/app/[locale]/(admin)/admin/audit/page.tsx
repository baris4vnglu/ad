import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";

interface Props {
  params: Promise<{ locale: string }>;
}

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  job_approved:       { label: "İlan Onaylandı",    color: "emerald" },
  job_rejected:       { label: "İlan Reddedildi",   color: "red" },
  payment_completed:  { label: "Ödeme Onaylandı",   color: "emerald" },
  payment_failed:     { label: "Ödeme Reddedildi",  color: "red" },
  payment_refunded:   { label: "Ödeme İade Edildi", color: "amber" },
};

export default async function AuditLogPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const supabase = await createClient();

  const { data: logs } = await supabase
    .from("audit_logs")
    .select(`
      id, action, target_type, target_id, details, created_at,
      profiles!audit_logs_admin_id_fkey (full_name, email)
    `)
    .order("created_at", { ascending: false })
    .limit(200);

  const list = (logs ?? []) as Array<Record<string, unknown>>;
  const dateLocale = locale === "tr" ? "tr-TR" : "en-GB";

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">{t("admin.audit")}</h1>
      <p className="text-gray-500 text-sm mb-6">{t("admin.audit_sub")}</p>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{t("admin.action")}</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Admin</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{t("admin.target")}</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{t("admin.detail")}</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{t("admin.date")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {list.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-gray-400">{t("admin.no_activity")}</td>
                </tr>
              ) : list.map((log) => {
                const admin = log.profiles as Record<string, unknown> | null;
                const cfg = ACTION_LABELS[log.action as string] ?? { label: log.action as string, color: "gray" };
                const details = log.details as Record<string, unknown> | null;
                return (
                  <tr key={log.id as string} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-${cfg.color}-100 text-${cfg.color}-700`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-600 text-xs">
                      {admin?.full_name as string ?? admin?.email as string ?? "—"}
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-400 font-mono truncate max-w-[120px]">
                      {log.target_type as string}: {String(log.target_id).slice(0, 8)}…
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-500">
                      {details ? JSON.stringify(details) : "—"}
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-400">
                      {new Date(log.created_at as string).toLocaleString(dateLocale)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
