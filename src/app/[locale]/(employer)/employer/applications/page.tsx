import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Calendar, FileText } from "lucide-react";
import ApplicationStatus from "./ApplicationStatus";
import StartConversationButton from "@/components/messages/StartConversationButton";

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ job_id?: string }>;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending:     { label: "Bekliyor",     color: "amber" },
  reviewing:   { label: "İnceleniyor", color: "blue" },
  shortlisted: { label: "Kısa Liste",  color: "purple" },
  rejected:    { label: "Reddedildi",  color: "red" },
  hired:       { label: "İşe Alındı",  color: "emerald" },
};

export default async function EmployerApplicationsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { job_id } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect(`/${locale}/auth/login`);

  // Get employer's jobs for the filter dropdown
  const { data: myJobs } = await supabase
    .from("jobs")
    .select("id, title")
    .eq("employer_id", user.id)
    .order("created_at", { ascending: false });

  const jobOptions = (myJobs ?? []) as Array<{ id: string; title: string }>;

  let query = supabase
    .from("applications")
    .select(`
      id, status, cover_letter, cv_url, created_at,
      jobs!inner (id, title, employer_id),
      profiles:worker_id (full_name, email)
    `)
    .eq("jobs.employer_id", user.id)
    .order("created_at", { ascending: false });

  if (job_id) query = query.eq("job_id", job_id);

  const { data: apps } = await query;
  const appList = (apps ?? []) as Array<Record<string, unknown>>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gelen Başvurular</h1>
          <p className="text-gray-500 text-sm mt-0.5">{appList.length} başvuru</p>
        </div>

        {/* Job filter */}
        {jobOptions.length > 0 && (
          <form method="GET">
            <select
              name="job_id"
              defaultValue={job_id ?? ""}
              onChange={(e) => {
                const url = new URL(window.location.href);
                if (e.target.value) url.searchParams.set("job_id", e.target.value);
                else url.searchParams.delete("job_id");
                window.location.href = url.toString();
              }}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Tüm İlanlar</option>
              {jobOptions.map((j) => (
                <option key={j.id} value={j.id}>{j.title}</option>
              ))}
            </select>
          </form>
        )}
      </div>

      {appList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="text-4xl mb-3">📬</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Henüz başvuru yok</h2>
          <p className="text-gray-500 text-sm mb-5">İlanlarınıza başvuru geldiğinde burada görünecek.</p>
          <Link
            href={`/${locale}/employer/jobs/new`}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
          >
            Yeni İlan Ver
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {appList.map((app) => {
            const job = app.jobs as Record<string, unknown> | null;
            const worker = app.profiles as Record<string, unknown> | null;
            const appStatus = app.status as string;
            const cfg = STATUS_CONFIG[appStatus] ?? STATUS_CONFIG.pending;

            const appCoverLetter = app.cover_letter as string | null;
            const appCvUrl = app.cv_url as string | null;
            const workerId = app.worker_id as string;

            return (
              <div key={app.id as string} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">{worker?.full_name as string ?? "Anonim"}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-${cfg.color}-100 text-${cfg.color}-700`}>
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{worker?.email as string ?? "—"}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      İlan: <span className="font-medium text-gray-600">{job?.title as string ?? "—"}</span>
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar size={11} /> {new Date(app.created_at as string).toLocaleDateString("tr-TR")}
                      </span>
                    </div>

                    {appCoverLetter && (
                      <details className="mt-3">
                        <summary className="text-xs text-blue-600 cursor-pointer hover:underline">Ön yazıyı gör</summary>
                        <p className="text-xs text-gray-600 mt-2 bg-gray-50 rounded-lg p-3 whitespace-pre-line">
                          {appCoverLetter}
                        </p>
                      </details>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {appCvUrl && (
                      <a
                        href={appCvUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 transition-colors"
                      >
                        <FileText size={12} /> CV İndir
                      </a>
                    )}
                    <StartConversationButton
                      workerId={workerId}
                      employerId={user.id}
                      locale={locale}
                      role="employer"
                    />
                    <ApplicationStatus appId={app.id as string} currentStatus={appStatus} />
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
