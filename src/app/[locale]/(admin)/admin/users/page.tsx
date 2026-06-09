import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ role?: string }>;
}

const ROLE_LABELS: Record<string, { color: string; key: string }> = {
  worker:   { color: "blue",    key: "admin.workers" },
  employer: { color: "emerald", key: "admin.employers" },
  investor: { color: "amber",   key: "admin.investors" },
  admin:    { color: "purple",  key: "admin.admins" },
};

export default async function AdminUsersPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { role } = await searchParams;
  const t = await getTranslations({ locale });
  const supabase = await createClient();

  const ROLE_TABS = [
    { value: "", label: t("admin.all") },
    { value: "worker", label: t("admin.workers") },
    { value: "employer", label: t("admin.employers") },
    { value: "investor", label: t("admin.investors") },
    { value: "admin", label: t("admin.admins") },
  ];

  let query = supabase
    .from("profiles")
    .select("id, full_name, email, role, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (role) query = query.eq("role", role);

  const { data: users } = await query;
  const userList = (users ?? []) as Array<Record<string, unknown>>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t("admin.users")}</h1>
        <p className="text-gray-500 text-sm mt-0.5">{userList.length} {t("admin.user").toLowerCase()}</p>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {ROLE_TABS.map((tab) => {
          const href = `/${locale}/admin/users${tab.value ? `?role=${tab.value}` : ""}`;
          const active = (role ?? "") === tab.value;
          return (
            <a
              key={tab.value}
              href={href}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? "bg-gray-900 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </a>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{t("admin.user")}</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{t("admin.email")}</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{t("admin.role")}</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{t("admin.reg_date")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {userList.map((user) => {
                const userRole = user.role as string;
                const cfg = ROLE_LABELS[userRole] ?? { color: "gray", key: "" };
                const roleLabel = cfg.key ? t(cfg.key) : userRole;
                return (
                  <tr key={user.id as string} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 font-medium text-gray-900">
                      {user.full_name as string ?? "—"}
                    </td>
                    <td className="px-5 py-4 text-gray-600">{user.email as string ?? "—"}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-${cfg.color}-100 text-${cfg.color}-700`}>
                        {roleLabel}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-400">
                      {new Date(user.created_at as string).toLocaleDateString(locale === "tr" ? "tr-TR" : "en-GB")}
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
