import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Eye, Users, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface Props {
  params: Promise<{ locale: string }>;
}

const STATUS_CONFIG = {
  pending:  { label: "Onay Bekliyor", color: "amber",   icon: Clock },
  active:   { label: "Yayında",       color: "emerald", icon: CheckCircle },
  rejected: { label: "Reddedildi",    color: "red",     icon: XCircle },
  draft:    { label: "Taslak",        color: "gray",    icon: AlertCircle },
  expired:  { label: "Süresi Doldu",  color: "gray",    icon: AlertCircle },
  filled:   { label: "Dolduruldu",    color: "blue",    icon: CheckCircle },
};

export default async function EmployerJobsPage({ params }: Props) {
  const { locale } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect(`/${locale}/auth/login`);

  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, title, category, job_type, location, status, views, applications_count, created_at, deadline")
    .eq("employer_id", user.id)
    .order("created_at", { ascending: false });

  const jobList = (jobs ?? []) as Array<{
    id: string;
    title: string;
    category: string;
    job_type: string;
    location: string;
    status: keyof typeof STATUS_CONFIG;
    views: number;
    applications_count: number;
    created_at: string;
    deadline: string | null;
  }>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">İlanlarım</h1>
          <p className="text-gray-500 text-sm mt-0.5">{jobList.length} ilan</p>
        </div>
        <Link
          href={`/${locale}/employer/jobs/new`}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm"
        >
          <Plus size={16} /> Yeni İlan
        </Link>
      </div>

      {jobList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="text-4xl mb-3">📋</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Henüz ilan yok</h2>
          <p className="text-gray-500 text-sm mb-5">İlk ilanınızı oluşturun, admin onayından sonra yayına girecek.</p>
          <Link
            href={`/${locale}/employer/jobs/new`}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
          >
            <Plus size={16} /> İlk İlanı Oluştur
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {jobList.map((job) => {
            const cfg = STATUS_CONFIG[job.status] ?? STATUS_CONFIG.draft;
            const Icon = cfg.icon;
            return (
              <div key={job.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h2 className="font-semibold text-gray-900 truncate">{job.title}</h2>
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-${cfg.color}-100 text-${cfg.color}-700`}>
                        <Icon size={11} /> {cfg.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                      <span>{job.category}</span>
                      <span>{job.location}</span>
                      <span>{new Date(job.created_at).toLocaleDateString("tr-TR")}</span>
                      {job.deadline && <span>Son: {new Date(job.deadline).toLocaleDateString("tr-TR")}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 shrink-0">
                    <span className="flex items-center gap-1"><Eye size={14} /> {job.views}</span>
                    <span className="flex items-center gap-1"><Users size={14} /> {job.applications_count}</span>
                    <Link
                      href={`/${locale}/jobs/${job.id}`}
                      className="text-blue-600 hover:text-blue-700 font-medium text-xs border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 transition-colors"
                    >
                      Görüntüle
                    </Link>
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
