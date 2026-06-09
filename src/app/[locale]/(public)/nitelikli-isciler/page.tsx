import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { MapPin, Briefcase, Users, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import JobFilters from "./JobFilters";

const PAGE_SIZE = 12;

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; category?: string; job_type?: string; panel?: string; page?: string }>;
}

const JOB_TYPE_LABELS: Record<string, string> = {
  full_time: "Tam Zamanlı",
  part_time: "Yarı Zamanlı",
  seasonal: "Mevsimlik",
  contract: "Sözleşmeli",
  remote: "Uzaktan",
};

export default async function NitelikliIscilerPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const filters = await searchParams;
  const t = await getTranslations();
  const page = Math.max(1, parseInt(filters.page ?? "1") || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();

  let query = supabase
    .from("jobs")
    .select(`
      id, title, category, job_type, location, salary_min, salary_max,
      salary_currency, openings, applications_count, created_at, panel,
      companies (name, logo_url)
    `, { count: "exact" })
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filters.panel) query = query.eq("panel", filters.panel);
  else query = query.eq("panel", "skilled");

  if (filters.category) query = query.eq("category", filters.category);
  if (filters.job_type) query = query.eq("job_type", filters.job_type);

  const { data: jobs, count } = await query;
  const jobList = (jobs ?? []) as Array<Record<string, unknown>>;
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  return (
    <>
      {/* Hero */}
      <section
        className="py-16 md:py-20"
        style={{ background: "linear-gradient(135deg, #0f172a 0%, #1344b0 100%)" }}
      >
        <div className="container mx-auto px-4">
          <div className="text-xs font-medium text-white/60 mb-4">
            <Link href={`/${locale}`} className="hover:text-white/80">{t("nav.home")}</Link>
            <span className="mx-2">/</span>
            <span>{t("nav.skilled")}</span>
          </div>
          <div className="inline-block bg-blue-400/20 text-blue-200 text-xs font-semibold rounded-full px-3 py-1 mb-4">
            {t("skilled.badge")}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">{t("skilled.title")}</h1>
          <p className="text-white/70 text-lg max-w-xl">{t("skilled.sub")}</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <JobFilters locale={locale} currentFilters={filters} />

          {jobList.length === 0 ? (
            <div className="mt-8 bg-gray-50 rounded-2xl p-12 text-center">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-gray-500 mb-4">Bu kriterlere uygun ilan bulunamadı.</p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href={`/${locale}/employer/jobs/new`}
                  className="bg-blue-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
                >
                  İlan Ver
                </Link>
                <Link
                  href={`/${locale}/iletisim`}
                  className="border border-gray-300 text-gray-700 font-medium px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  İletişim
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {jobList.map((job) => {
                const company = job.companies as Record<string, unknown> | null;
                const salaryMin = job.salary_min as number | null;
                const salaryMax = job.salary_max as number | null;
                const currency = job.salary_currency as string ?? "TRY";
                const salaryText = salaryMin
                  ? `${salaryMin.toLocaleString("tr-TR")}${salaryMax ? `–${salaryMax.toLocaleString("tr-TR")}` : "+"} ${currency}`
                  : null;

                return (
                  <Link
                    key={job.id as string}
                    href={`/${locale}/jobs/${job.id as string}`}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all p-5 flex flex-col"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      {company?.logo_url ? (
                        <Image src={company.logo_url as string} alt="" width={40} height={40} className="rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 text-blue-600 font-bold text-sm">
                          {(company?.name as string ?? "?")[0]}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm truncate">{job.title as string}</h3>
                        <p className="text-gray-500 text-xs truncate">{company?.name as string ?? "—"}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-3">
                      <span className="flex items-center gap-1"><MapPin size={11} /> {job.location as string}</span>
                      <span className="flex items-center gap-1"><Briefcase size={11} /> {JOB_TYPE_LABELS[job.job_type as string] ?? job.job_type as string}</span>
                      <span className="flex items-center gap-1"><Users size={11} /> {job.openings as number} kişi</span>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                      {salaryText ? (
                        <span className="text-blue-600 font-bold text-sm">{salaryText}</span>
                      ) : (
                        <span className="text-gray-400 text-xs">Maaş belirtilmemiş</span>
                      )}
                      <span className="flex items-center gap-1 text-gray-400 text-xs">
                        <Clock size={11} />
                        {new Date(job.created_at as string).toLocaleDateString("tr-TR")}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              {page > 1 && (
                <Link
                  href={`/${locale}/nitelikli-isciler?${new URLSearchParams({ ...filters, page: String(page - 1) }).toString()}`}
                  className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft size={15} /> Önceki
                </Link>
              )}
              <span className="text-sm text-gray-500 px-3">
                {page} / {totalPages}
              </span>
              {page < totalPages && (
                <Link
                  href={`/${locale}/nitelikli-isciler?${new URLSearchParams({ ...filters, page: String(page + 1) }).toString()}`}
                  className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Sonraki <ChevronRight size={15} />
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-gray-900">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">{t("skilled.cta_title")}</h2>
            <p className="text-gray-400">{t("skilled.cta_sub")}</p>
          </div>
          <Link
            href={`/${locale}/employer/jobs/new`}
            className="bg-white text-gray-900 font-semibold px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors shrink-0"
          >
            {t("skilled.cta_btn")}
          </Link>
        </div>
      </section>
    </>
  );
}
