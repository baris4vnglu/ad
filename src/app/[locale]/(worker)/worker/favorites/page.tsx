import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Briefcase, Building2, Heart } from "lucide-react";

interface Props {
  params: Promise<{ locale: string }>;
}

const JOB_TYPE_LABELS: Record<string, string> = {
  full_time: "Tam Zamanlı",
  part_time: "Yarı Zamanlı",
  seasonal: "Mevsimlik",
  contract: "Sözleşmeli",
  remote: "Uzaktan",
};

export default async function FavoritesPage({ params }: Props) {
  const { locale } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login`);

  const { data } = await supabase
    .from("favorites")
    .select(`
      id, created_at,
      jobs (
        id, title, category, job_type, location, salary_min, salary_max,
        salary_currency, status, companies (name, logo_url)
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const favorites = (data ?? []) as Array<{
    id: string;
    created_at: string;
    jobs: Record<string, unknown> | null;
  }>;

  const active = favorites.filter((f) => (f.jobs as Record<string, unknown> | null)?.status === "active");

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
        <Heart size={22} className="text-red-500" fill="currentColor" />
        Kaydedilen İlanlar
      </h1>
      <p className="text-gray-500 mb-6">{active.length} aktif ilan</p>

      {active.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <Heart size={40} className="text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">Henüz kaydedilen ilan yok.</p>
          <Link
            href={`/${locale}/nitelikli-isciler`}
            className="inline-block bg-blue-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
          >
            İlanları Keşfet
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {active.map((fav) => {
            const job = fav.jobs as Record<string, unknown>;
            const company = job.companies as Record<string, unknown> | null;
            const salaryMin = job.salary_min as number | null;
            const salaryMax = job.salary_max as number | null;
            const currency = (job.salary_currency as string) ?? "TRY";
            const salaryText = salaryMin
              ? `${salaryMin.toLocaleString("tr-TR")}${salaryMax ? `–${salaryMax.toLocaleString("tr-TR")}` : "+"} ${currency}`
              : null;

            return (
              <Link
                key={fav.id}
                href={`/${locale}/jobs/${job.id as string}`}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all p-5 flex flex-col"
              >
                <div className="flex items-start gap-3 mb-3">
                  {company?.logo_url ? (
                    <Image
                      src={company.logo_url as string}
                      alt=""
                      width={40}
                      height={40}
                      className="rounded-lg object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                      <Building2 size={18} className="text-blue-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm truncate">{job.title as string}</h3>
                    <p className="text-gray-500 text-xs truncate">{(company?.name as string) ?? "—"}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-3">
                  <span className="flex items-center gap-1">
                    <MapPin size={11} /> {job.location as string}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase size={11} /> {JOB_TYPE_LABELS[job.job_type as string] ?? (job.job_type as string)}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                  {salaryText ? (
                    <span className="text-blue-600 font-bold text-sm">{salaryText}</span>
                  ) : (
                    <span className="text-gray-400 text-xs">Maaş belirtilmemiş</span>
                  )}
                  <span className="text-xs text-gray-400">
                    {new Date(fav.created_at).toLocaleDateString("tr-TR")}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
