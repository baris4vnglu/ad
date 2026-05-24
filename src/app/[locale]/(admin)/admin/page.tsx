import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Users, Briefcase, FileText, Clock, CreditCard } from "lucide-react";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function AdminDashboard({ params }: Props) {
  const { locale } = await params;
  const supabase = await createClient();

  const [
    { count: usersCount },
    { count: jobsCount },
    { count: appsCount },
    { count: pendingCount },
    { count: pendingPayments },
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("jobs").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("applications").select("id", { count: "exact", head: true }),
    supabase.from("jobs").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("payments").select("id", { count: "exact", head: true }).eq("status", "pending"),
  ]);

  const stats = [
    { label: "Toplam Kullanıcı", value: usersCount ?? 0, color: "blue", icon: Users, href: `/${locale}/admin/users` },
    { label: "Aktif İlanlar", value: jobsCount ?? 0, color: "emerald", icon: Briefcase, href: `/${locale}/admin/jobs` },
    { label: "Başvurular", value: appsCount ?? 0, color: "purple", icon: FileText, href: "#" },
    { label: "Onay Bekleyen", value: pendingCount ?? 0, color: "amber", icon: Clock, href: `/${locale}/admin/jobs?status=pending` },
    { label: "Bekleyen Ödeme", value: pendingPayments ?? 0, color: "purple", icon: CreditCard, href: `/${locale}/admin/payments?status=pending` },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Admin Paneli</h1>
      <p className="text-gray-500 mb-8">Platform genel durumu</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <s.icon size={20} className={`text-${s.color}-500`} />
              {s.label === "Onay Bekleyen" && (s.value as number) > 0 && (
                <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">!</span>
              )}
            </div>
            <div className={`text-3xl font-extrabold text-${s.color}-600`}>{s.value}</div>
            <div className="text-gray-500 text-sm mt-1">{s.label}</div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Hızlı Erişim</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href={`/${locale}/admin/jobs?status=pending`}
            className="flex items-center gap-3 p-3 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 transition-colors text-sm font-medium text-amber-800">
            ⏳ Bekleyen İlanları Onayla
          </Link>
          <Link href={`/${locale}/admin/jobs`}
            className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
            📋 Tüm İlanlar
          </Link>
          <Link href={`/${locale}/admin/users`}
            className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
            👥 Kullanıcılar
          </Link>
          <Link href={`/${locale}/admin/payments?status=pending`}
            className="flex items-center gap-3 p-3 rounded-xl border border-purple-100 bg-purple-50 hover:bg-purple-100 transition-colors text-sm font-medium text-purple-800">
            💳 Bekleyen Ödemeleri Onayla
          </Link>
          <Link href={`/${locale}/nitelikli-isciler`}
            className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
            🌐 Siteyi Görüntüle
          </Link>
        </div>
      </div>
    </div>
  );
}
