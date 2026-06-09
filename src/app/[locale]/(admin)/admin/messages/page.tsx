import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function AdminMessagesPage({ params }: Props) {
  const { locale } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login`);

  const t = await getTranslations({ locale });
  const profileRes = await (supabase as any).from("profiles").select("role").eq("id", user.id).single();
  if (profileRes.data?.role !== "admin") redirect(`/${locale}`);

  const { data: messages } = await (supabase as any)
    .from("contact_messages")
    .select("id, name, email, phone, subject, message, is_read, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  const list = (messages ?? []) as Array<Record<string, unknown>>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t("admin.messages")}</h1>
        <p className="text-gray-500 text-sm mt-0.5">{t("admin.messages_sub")}</p>
      </div>

      {list.length === 0 ? (
        <div className="bg-gray-50 rounded-2xl p-12 text-center">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-gray-500">{t("admin.no_messages")}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">{t("admin.sender")}</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">{t("admin.subject")}</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">{t("admin.message")}</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">{t("admin.date")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {list.map((msg) => (
                <tr key={msg.id as string} className={`hover:bg-gray-50 transition-colors ${!msg.is_read ? "bg-blue-50/30" : ""}`}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{msg.name as string}</div>
                    <div className="text-gray-500 text-xs">{msg.email as string}</div>
                    {msg.phone ? <div className="text-gray-400 text-xs">{msg.phone as string}</div> : null}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{(msg.subject as string) || "—"}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs">
                    <p className="line-clamp-2">{msg.message as string}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap text-xs">
                    {new Date(msg.created_at as string).toLocaleDateString("tr-TR", {
                      day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
