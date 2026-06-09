import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import SubscriptionBanner from "@/components/common/SubscriptionBanner";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function EmployerDashboard({ params }: Props) {
  const { locale } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect(`/${locale}/auth/login`);

  const [profileRes, companyRes, jobsRes, paymentRes] = await Promise.all([
    (supabase.from("profiles").select("*").eq("id", user.id).single() as unknown) as Promise<{ data: { full_name: string | null; role: string } | null; error: unknown }>,
    supabase.from("companies").select("name, logo_url, is_verified").eq("profile_id", user.id).single(),
    supabase.from("jobs").select("id", { count: "exact", head: true }).eq("employer_id", user.id).eq("status", "active"),
    supabase.from("payments").select("status, amount, currency, metadata, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
  ]);

  const profile = profileRes.data;
  if (profile?.role !== "employer") redirect(`/${locale}`);

  const company = companyRes.data as { name: string | null; logo_url: string | null; is_verified: boolean } | null;
  const activeJobs = jobsRes.count ?? 0;
  const companyComplete = !!(company?.name);
  const latestPayment = paymentRes.data as { status: string; amount: number; currency: string; metadata: Record<string, unknown> | null; created_at: string } | null;

  // Real stats
  const myJobIds = await supabase
    .from("jobs")
    .select("id")
    .eq("employer_id", user.id);
  const jobIdList = (myJobIds.data ?? []).map((j: Record<string, unknown>) => j.id as string);

  const [totalAppsRes, pendingAppsRes, unreadMsgsRes] = await Promise.all([
    jobIdList.length > 0
      ? supabase.from("applications").select("id", { count: "exact", head: true }).in("job_id", jobIdList)
      : Promise.resolve({ count: 0 }),
    jobIdList.length > 0
      ? supabase.from("applications").select("id", { count: "exact", head: true }).in("job_id", jobIdList).eq("status", "pending")
      : Promise.resolve({ count: 0 }),
    supabase.from("messages").select("id", { count: "exact", head: true }).eq("is_read", false).neq("sender_id", user.id),
  ]);

  const totalApps = totalAppsRes.count ?? 0;
  const pendingApps = pendingAppsRes.count ?? 0;
  const unreadMsgs = unreadMsgsRes.count ?? 0;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        Hoş Geldiniz, {profile?.full_name || "İşveren"} 👋
      </h1>
      <p className="text-gray-500 mb-6">İşveren paneline hoş geldiniz.</p>

      <SubscriptionBanner payment={latestPayment} locale={locale} />

      {/* Company profile banner */}
      {!companyComplete && (
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
          <AlertCircle size={20} className="text-blue-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-blue-800">Şirket profilinizi oluşturun</p>
            <p className="text-xs text-blue-600 mt-0.5">Şirket profili olmadan ilan veremezsiniz.</p>
          </div>
          <Link
            href={`/${locale}/employer/company`}
            className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
          >
            Oluştur
          </Link>
        </div>
      )}

      {/* Verified badge */}
      {company?.is_verified && (
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 mb-6">
          ✓ Doğrulanmış Şirket
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Aktif İlanlar", value: activeJobs, color: "blue" },
          { label: "Bekleyen Başvurular", value: pendingApps, color: "amber" },
          { label: "Toplam Başvuru", value: totalApps, color: "emerald" },
          { label: "Okunmamış Mesaj", value: unreadMsgs, color: "purple" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className={`text-3xl font-extrabold text-${s.color}-600`}>{s.value}</div>
            <div className="text-gray-500 text-sm mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          href={`/${locale}/employer/jobs/new`}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
        >
          + Yeni İlan Ver
        </Link>
        <Link
          href={`/${locale}/employer/jobs`}
          className="border border-gray-200 text-gray-700 font-medium px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm"
        >
          İlanlarımı Görüntüle
        </Link>
        <Link
          href={`/${locale}/employer/company`}
          className="border border-gray-200 text-gray-700 font-medium px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm"
        >
          Şirket Profilim
        </Link>
      </div>
    </div>
  );
}
