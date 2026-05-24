import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function InvestorDashboard({ params }: Props) {
  const { locale } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect(`/${locale}/auth/login`);

  const [profileRes, inquiryRes] = await Promise.all([
    (supabase.from("profiles").select("*").eq("id", user.id).single() as unknown) as Promise<{ data: { full_name: string | null; role: string } | null; error: unknown }>,
    supabase
      .from("investor_inquiries")
      .select("id, full_name, budget_range, sector_interest, message, created_at")
      .eq("profile_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const profile = profileRes.data;
  if (profile?.role !== "investor") redirect(`/${locale}`);

  const inquiry = inquiryRes.data as {
    id: string;
    full_name: string | null;
    budget_range: string | null;
    sector_interest: string | null;
    message: string | null;
    created_at: string;
  } | null;

  const profileComplete = !!(inquiry?.budget_range || inquiry?.sector_interest);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        Hoş Geldiniz, {profile?.full_name || "Yatırımcı"} 👋
      </h1>
      <p className="text-gray-500 mb-6">Yatırımcı paneline hoş geldiniz.</p>

      {/* Profile completion banner */}
      {!profileComplete && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
          <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">Yatırım profilinizi oluşturun</p>
            <p className="text-xs text-amber-600 mt-0.5">
              Yatırım tercihlerinizi belirtin, ekibimiz kısa sürede sizinle iletişime geçsin.
            </p>
          </div>
          <Link
            href={`/${locale}/investor/profile`}
            className="shrink-0 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
          >
            Oluştur
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="text-3xl font-extrabold text-amber-600">{inquiry ? 1 : 0}</div>
          <div className="text-gray-500 text-sm mt-1">Yatırım Talebi</div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="text-3xl font-extrabold text-blue-600">0</div>
          <div className="text-gray-500 text-sm mt-1">Mesajlar</div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="text-3xl font-extrabold text-emerald-600">0</div>
          <div className="text-gray-500 text-sm mt-1">İzlenen Projeler</div>
        </div>
      </div>

      {/* Inquiry status */}
      {inquiry ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Son Talebiniz</h2>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
              <Clock size={16} className="text-amber-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-gray-800">İnceleme Bekliyor</span>
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Beklemede</span>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                {new Date(inquiry.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })} tarihinde gönderildi
              </p>
              <div className="grid grid-cols-2 gap-3">
                {inquiry.budget_range && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="text-xs text-gray-400 mb-0.5">Bütçe Aralığı</div>
                    <div className="text-sm font-medium text-gray-700">{inquiry.budget_range}</div>
                  </div>
                )}
                {inquiry.sector_interest && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="text-xs text-gray-400 mb-0.5">İlgilenilen Sektör</div>
                    <div className="text-sm font-medium text-gray-700">{inquiry.sector_interest}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Info card */}
      <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl border border-amber-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle size={18} className="text-amber-600" />
          <h3 className="font-semibold text-amber-900">Nasıl Çalışır?</h3>
        </div>
        <ol className="space-y-2 text-sm text-amber-800">
          <li className="flex gap-2"><span className="font-bold">1.</span> Yatırım profilinizi doldurun.</li>
          <li className="flex gap-2"><span className="font-bold">2.</span> Ekibimiz talebinizi inceler ve sizinle iletişime geçer.</li>
          <li className="flex gap-2"><span className="font-bold">3.</span> Size özel yatırım fırsatları sunulur.</li>
        </ol>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          href={`/${locale}/investor/profile`}
          className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
        >
          {profileComplete ? "Profilimi Düzenle" : "Profil Oluştur"}
        </Link>
        <Link
          href={`/${locale}/iletisim`}
          className="border border-gray-200 text-gray-700 font-medium px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm"
        >
          İletişime Geç
        </Link>
      </div>
    </div>
  );
}
