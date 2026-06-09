import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Clock, Briefcase, Users, Calendar, Eye, Building2 } from "lucide-react";
import type { Metadata } from "next";
import ApplyButton from "./ApplyButton";
import FavoriteButton from "@/components/jobs/FavoriteButton";

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("jobs")
    .select("title, description, location, companies(name)")
    .eq("id", id)
    .eq("status", "active")
    .single();

  if (!data) return { title: "İlan Bulunamadı" };

  const d = data as Record<string, unknown>;
  const company = d.companies as Record<string, unknown> | null;
  const title = `${d.title as string} – ${company?.name as string ?? ""}`;
  const description = (d.description as string ?? "").slice(0, 155);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

const JOB_TYPE_LABELS: Record<string, string> = {
  full_time: "Tam Zamanlı",
  part_time: "Yarı Zamanlı",
  seasonal: "Mevsimlik",
  contract: "Sözleşmeli",
  remote: "Uzaktan",
};

export default async function JobDetailPage({ params }: Props) {
  const { locale, id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: job } = await supabase
    .from("jobs")
    .select(`
      *,
      companies (name, logo_url, website, sector, city, country)
    `)
    .eq("id", id)
    .eq("status", "active")
    .single();

  if (!job) notFound();

  const j = job as Record<string, unknown>;
  const company = j.companies as Record<string, unknown> | null;

  // Increment views (fire-and-forget)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (supabase.rpc as any)("increment_job_views", { job_id: id });

  // Check if user already applied and favorited
  let hasApplied = false;
  let hasFavorited = false;
  let workerCvUrl: string | null = null;
  if (user) {
    const [appRes, workerRes, favRes] = await Promise.all([
      supabase.from("applications").select("id").eq("job_id", id).eq("worker_id", user.id).single(),
      supabase.from("worker_profiles").select("cv_url").eq("profile_id", user.id).single(),
      supabase.from("favorites").select("id").eq("job_id", id).eq("user_id", user.id).single(),
    ]);
    hasApplied = !!appRes.data;
    hasFavorited = !!favRes.data;
    workerCvUrl = (workerRes.data as Record<string, unknown> | null)?.cv_url as string ?? null;
  }

  const jobTitle = j.title as string;
  const jobLocation = j.location as string;
  const jobType = j.job_type as string;
  const jobOpenings = j.openings as number;
  const jobViews = j.views as number;
  const jobDeadline = j.deadline as string | null;
  const jobDescription = j.description as string;
  const jobRequirements = j.requirements as string | null;
  const jobBenefits = j.benefits as string | null;
  const jobCreatedAt = j.created_at as string;
  const jobExperience = j.experience_required as number;

  const companyName = company?.name as string ?? "Şirket";
  const companySector = company?.sector as string | null;
  const companyCity = company?.city as string | null;
  const companyWebsite = company?.website as string | null;
  const companyLogoUrl = company?.logo_url as string | null;

  const salaryMin = j.salary_min as number | null;
  const salaryMax = j.salary_max as number | null;
  const currency = j.salary_currency as string ?? "TRY";
  const salaryText = salaryMin
    ? `${salaryMin.toLocaleString("tr-TR")} ${currency}${salaryMax ? ` – ${salaryMax.toLocaleString("tr-TR")} ${currency}` : "+"}`
    : null;

  return (
    <>
      {/* Hero */}
      <section className="py-12 bg-gradient-to-br from-gray-900 to-blue-900">
        <div className="container mx-auto px-4">
          <div className="text-xs font-medium text-white/60 mb-4">
            <Link href={`/${locale}`} className="hover:text-white/80">Ana Sayfa</Link>
            <span className="mx-2">/</span>
            <Link href={`/${locale}/nitelikli-isciler`} className="hover:text-white/80">İş İlanları</Link>
            <span className="mx-2">/</span>
            <span>{jobTitle}</span>
          </div>

          <div className="flex items-start gap-4">
            {companyLogoUrl ? (
              <Image src={companyLogoUrl} alt="" width={64} height={64} className="rounded-xl object-cover bg-white/10 shrink-0" />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <Building2 size={28} className="text-white/50" />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-1">{jobTitle}</h1>
              <p className="text-white/70 text-lg mb-3">{companyName}</p>
              <div className="flex flex-wrap gap-3 text-sm text-white/60">
                <span className="flex items-center gap-1.5"><MapPin size={14} /> {jobLocation}</span>
                <span className="flex items-center gap-1.5"><Briefcase size={14} /> {JOB_TYPE_LABELS[jobType] ?? jobType}</span>
                <span className="flex items-center gap-1.5"><Users size={14} /> {jobOpenings} kişi</span>
                <span className="flex items-center gap-1.5"><Eye size={14} /> {jobViews} görüntülenme</span>
                {jobDeadline && (
                  <span className="flex items-center gap-1.5"><Calendar size={14} /> Son: {new Date(jobDeadline).toLocaleDateString("tr-TR")}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main */}
            <div className="flex-1 space-y-6">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-bold text-gray-900 text-lg mb-3">İş Tanımı</h2>
                <p className="text-gray-700 whitespace-pre-line text-sm leading-relaxed">{jobDescription}</p>
              </div>

              {jobRequirements && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="font-bold text-gray-900 text-lg mb-3">Aranan Nitelikler</h2>
                  <p className="text-gray-700 whitespace-pre-line text-sm leading-relaxed">{jobRequirements}</p>
                </div>
              )}

              {jobBenefits && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="font-bold text-gray-900 text-lg mb-3">Yan Haklar</h2>
                  <p className="text-gray-700 whitespace-pre-line text-sm leading-relaxed">{jobBenefits}</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:w-80 space-y-4">
              {/* Apply card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                {salaryText && (
                  <div className="text-2xl font-extrabold text-blue-600 mb-4">{salaryText}<span className="text-sm font-normal text-gray-400"> /ay</span></div>
                )}
                <ApplyButton
                  jobId={id}
                  locale={locale}
                  user={user ? { id: user.id } : null}
                  hasApplied={hasApplied}
                  workerCvUrl={workerCvUrl}
                />
                {user && (
                  <div className="mt-3 flex justify-end">
                    <FavoriteButton jobId={id} userId={user.id} initialSaved={hasFavorited} />
                  </div>
                )}
              </div>

              {/* Job info */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
                <h3 className="font-semibold text-gray-900">İlan Detayları</h3>
                {[
                  { icon: Briefcase, label: "Çalışma türü", value: JOB_TYPE_LABELS[jobType] ?? jobType },
                  { icon: MapPin, label: "Konum", value: jobLocation },
                  { icon: Clock, label: "Deneyim", value: jobExperience ? `${jobExperience}+ yıl` : "Gerekmez" },
                  { icon: Users, label: "Açık pozisyon", value: `${jobOpenings} kişi` },
                  { icon: Calendar, label: "İlan tarihi", value: new Date(jobCreatedAt).toLocaleDateString("tr-TR") },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 text-sm">
                    <item.icon size={15} className="text-gray-400 shrink-0" />
                    <span className="text-gray-500">{item.label}:</span>
                    <span className="font-medium text-gray-800 ml-auto">{item.value}</span>
                  </div>
                ))}
              </div>

              {/* Company card */}
              {company && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-semibold text-gray-900 mb-3">Şirket Hakkında</h3>
                  <p className="font-bold text-gray-800">{companyName}</p>
                  {companySector && <p className="text-sm text-gray-500">{companySector}</p>}
                  {companyCity && <p className="text-sm text-gray-500">{companyCity}</p>}
                  {companyWebsite && (
                    <a href={companyWebsite} target="_blank" rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline mt-1 block">
                      Web Sitesi →
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
