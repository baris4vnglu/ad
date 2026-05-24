import { createClient } from "@/lib/supabase/server";

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ role?: string }>;
}

const ROLE_TABS = [
  { value: "", label: "Tümü" },
  { value: "worker", label: "İşçiler" },
  { value: "employer", label: "İşverenler" },
  { value: "investor", label: "Yatırımcılar" },
  { value: "admin", label: "Adminler" },
];

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  worker:   { label: "İşçi",      color: "blue" },
  employer: { label: "İşveren",   color: "emerald" },
  investor: { label: "Yatırımcı", color: "amber" },
  admin:    { label: "Admin",     color: "purple" },
};

export default async function AdminUsersPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { role } = await searchParams;
  const supabase = await createClient();

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
        <h1 className="text-2xl font-bold text-gray-900">Kullanıcı Yönetimi</h1>
        <p className="text-gray-500 text-sm mt-0.5">{userList.length} kullanıcı</p>
      </div>

      {/* Role tabs */}
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
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Kullanıcı</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">E-posta</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Rol</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Kayıt Tarihi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {userList.map((user) => {
                const userRole = user.role as string;
                const cfg = ROLE_LABELS[userRole] ?? { label: userRole, color: "gray" };
                return (
                  <tr key={user.id as string} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 font-medium text-gray-900">
                      {user.full_name as string ?? "—"}
                    </td>
                    <td className="px-5 py-4 text-gray-600">{user.email as string ?? "—"}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-${cfg.color}-100 text-${cfg.color}-700`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-400">
                      {new Date(user.created_at as string).toLocaleDateString("tr-TR")}
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
