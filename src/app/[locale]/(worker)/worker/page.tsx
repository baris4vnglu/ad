import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import SubscriptionBanner from "@/components/common/SubscriptionBanner";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function WorkerDashboard({ params }: Props) {
  const { locale } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect(`/${locale}/auth/login`);

  const [profileRes, workerProfileRes, appsRes, paymentRes, favRes, unreadMsgsRes] = await Promise.all([
    (supabase.from("profiles").select("*").eq("id", user.id).single() as unknown) as Promise<{ data: { full_name: string | null; role: string } | null; error: unknown }>,
    supabase.from("worker_profiles").select("title, cv_url, is_available").eq("profile_id", user.id).single(),
    supabase.from("applications").select("id", { count: "exact", head: true }).eq("worker_id", user.id),
    supabase.from("payments").select("status, amount, currency, metadata, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("favorites").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("messages").select("id", { count: "exact", head: true }).eq("is_read", false).neq("sender_id", user.id),
  ]);

  const profile = profileRes.data;
  if (profile?.role !== "worker") redirect(`/${locale}`);

  const workerProfile = workerProfileRes.data as { title: string | null; cv_url: string | null; is_available: boolean } | null;
  const appsCount = appsRes.count ?? 0;
  const favCount = favRes.count ?? 0;
  const unreadMsgs = unreadMsgsRes.count ?? 0;
  const latestPayment = paymentRes.data as { status: string; amount: number; currency: string; metadata: Record<string, unknown> | null; created_at: string } | null;

  // Calculate profile completeness
  const completionItems = [
    { done: !!workerProfile?.title, label: "Unvan eklendi" },
    { done: !!workerProfile?.cv_url, label: "CV yüklendi" },
  ];
  const completionPct = Math.round((completionItems.filter((i) => i.done).length / completionItems.length) * 100);
  const profileComplete = completionPct === 100;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        Hoş Geldiniz, {profile?.full_name || "İşçi"} 👋
      </h1>
      <p className="text-gray-500 mb-6">İşçi paneline hoş geldiniz.</p>

      <SubscriptionBanner payment={latestPayment} locale={locale} />

      {/* Profile completion banner */}
      {!profileComplete && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
          <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">Profilinizi tamamlayın</p>
            <p className="text-xs text-amber-600 mt-0.5 mb-2">Eksiksiz profil daha fazla işverene ulaşmanızı sağlar.</p>
            <div className="w-full bg-amber-100 rounded-full h-1.5 mb-2">
              <div className="bg-amber-500 h-1.5 rounded-full transition-all" style={{ width: `${completionPct}%` }} />
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {completionItems.map((item) => (
                <span key={item.label} className={`text-xs ${item.done ? "text-emerald-600 line-through" : "text-amber-700"}`}>
                  {item.done ? "✓ " : "• "}{item.label}
                </span>
              ))}
            </div>
          </div>
          <Link
            href={`/${locale}/worker/profile`}
            className="shrink-0 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
          >
            Tamamla
          </Link>
        </div>
      )}

      {/* Availability badge */}
      {workerProfile && (
        <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full mb-6 ${
          workerProfile.is_available
            ? "bg-emerald-100 text-emerald-700"
            : "bg-gray-100 text-gray-500"
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${workerProfile.is_available ? "bg-emerald-500 animate-pulse" : "bg-gray-400"}`} />
          {workerProfile.is_available ? "İş arıyorum" : "Şu an müsait değilim"}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Başvurularım", value: appsCount, color: "blue", href: `/${locale}/worker/applications` },
          { label: "Kaydedilen İlanlar", value: favCount, color: "emerald", href: `/${locale}/worker/favorites` },
          { label: "Okunmamış Mesaj", value: unreadMsgs, color: "purple", href: `/${locale}/worker/messages` },
        ].map((s) => (
          <Link key={s.label} href={s.href} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className={`text-3xl font-extrabold text-${s.color}-600`}>{s.value}</div>
            <div className="text-gray-500 text-sm mt-1">{s.label}</div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Hızlı Erişim</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href={`/${locale}/nitelikli-isciler`} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
            🔍 İş İlanlarına Göz At
          </Link>
          <Link href={`/${locale}/worker/profile`} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
            👤 Profili Düzenle
          </Link>
          <Link href={`/${locale}/worker/applications`} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
            📄 Başvurularım
          </Link>
          <Link href={`/${locale}/worker/messages`} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
            💬 Mesajlarım
          </Link>
        </div>
      </div>
    </div>
  );
}
