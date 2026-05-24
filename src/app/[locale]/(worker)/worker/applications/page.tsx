import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { MapPin, Briefcase, Calendar, Clock } from "lucide-react";
import StartConversationButton from "@/components/messages/StartConversationButton";

interface Props {
  params: Promise<{ locale: string }>;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; desc: string }> = {
  pending:     { label: "Bekliyor",     color: "amber",   desc: "Başvurunuz işveren tarafından henüz incelenmedi." },
  reviewing:   { label: "İnceleniyor", color: "blue",    desc: "İşveren başvurunuzu inceliyor." },
  shortlisted: { label: "Kısa Liste",  color: "purple",  desc: "Kısa listeye alındınız! İşveren yakında iletişime geçecek." },
  rejected:    { label: "Reddedildi",  color: "red",     desc: "Bu pozisyon için uygun bulunmadınız." },
  hired:       { label: "İşe Alındı",  color: "emerald", desc: "Tebrikler! İşe alındınız." },
};

export default async function WorkerApplicationsPage({ params }: Props) {
  const { locale } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect(`/${locale}/auth/login`);

  const { data: apps } = await supabase
    .from("applications")
    .select(`
      id, status, cover_letter, created_at, worker_id,
      jobs (id, title, category, job_type, location, status, employer_id,
        companies (name, logo_url)
      )
    `)
    .eq("worker_id", user.id)
    .order("created_at", { ascending: false });

  const appList = (apps ?? []) as Array<Record<string, unknown>>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Başvurularım</h1>
        <p className="text-gray-500 text-sm mt-0.5">{appList.length} başvuru</p>
      </div>

      {appList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="text-4xl mb-3">📄</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Henüz başvuru yok</h2>
          <p className="text-gray-500 text-sm mb-5">İş ilanlarına göz atın ve başvurun.</p>
          <Link
            href={`/${locale}/nitelikli-isciler`}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
          >
            İş İlanlarına Bak
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {appList.map((app) => {
            const job = app.jobs as Record<string, unknown> | null;
            const company = job?.companies as Record<string, unknown> | null;
            const appStatus = app.status as string;
            const cfg = STATUS_CONFIG[appStatus] ?? STATUS_CONFIG.pending;

            const jobLocation = job?.location as string | null;
            const jobJobType = job?.job_type as string | null;
            const appCoverLetter = app.cover_letter as string | null;
            const employerId = job?.employer_id as string | null;
            const workerId = app.worker_id as string;

            return (
              <div key={app.id as string} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start gap-4">
                  {company?.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={company.logo_url as string} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0 text-blue-600 font-bold">
                      {(company?.name as string ?? "?")[0]}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <Link
                          href={`/${locale}/jobs/${job?.id as string}`}
                          className="font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                        >
                          {job?.title as string ?? "—"}
                        </Link>
                        <p className="text-sm text-gray-500">{company?.name as string ?? "—"}</p>
                      </div>
                      <span className={`shrink-0 inline-block text-xs font-semibold px-3 py-1 rounded-full bg-${cfg.color}-100 text-${cfg.color}-700`}>
                        {cfg.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mt-2">
                      {jobLocation && <span className="flex items-center gap-1"><MapPin size={11} /> {jobLocation}</span>}
                      {jobJobType && <span className="flex items-center gap-1"><Briefcase size={11} /> {jobJobType}</span>}
                      <span className="flex items-center gap-1"><Calendar size={11} /> Başvuru: {new Date(app.created_at as string).toLocaleDateString("tr-TR")}</span>
                    </div>

                    <p className="text-xs text-gray-500 mt-2 bg-gray-50 rounded-lg px-3 py-2">
                      <Clock size={11} className="inline mr-1" />
                      {cfg.desc}
                    </p>

                    {appCoverLetter && (
                      <details className="mt-2">
                        <summary className="text-xs text-blue-600 cursor-pointer hover:underline">Ön yazımı gör</summary>
                        <p className="text-xs text-gray-600 mt-2 bg-gray-50 rounded-lg p-3 whitespace-pre-line">
                          {appCoverLetter}
                        </p>
                      </details>
                    )}

                    {employerId && (
                      <div className="mt-3">
                        <StartConversationButton
                          workerId={workerId}
                          employerId={employerId}
                          locale={locale}
                          role="worker"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
