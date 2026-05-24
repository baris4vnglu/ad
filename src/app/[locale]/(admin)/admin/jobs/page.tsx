import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Eye, Users } from "lucide-react";
import JobActions from "./JobActions";

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string }>;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:  { label: "Onay Bekliyor", color: "amber" },
  active:   { label: "Yayında",       color: "emerald" },
  rejected: { label: "Reddedildi",    color: "red" },
  draft:    { label: "Taslak",        color: "gray" },
  expired:  { label: "Süresi Doldu",  color: "gray" },
  filled:   { label: "Dolduruldu",    color: "blue" },
};

const STATUS_TABS = [
  { value: "", label: "Tümü" },
  { value: "pending", label: "Bekleyen" },
  { value: "active", label: "Yayında" },
  { value: "rejected", label: "Reddedilen" },
];

export default async function AdminJobsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { status } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("jobs")
    .select(`
      id, title, category, job_type, location, status,
      views, applications_count, created_at,
      companies (name)
    `)
    .order("created_at", { ascending: false })
    .limit(100);

  if (status) query = query.eq("status", status);

  const { data: jobs } = await query;
  const jobList = (jobs ?? []) as Array<Record<string, unknown>>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">İlan Yönetimi</h1>
          <p className="text-gray-500 text-sm mt-0.5">{jobList.length} ilan</p>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/${locale}/admin/jobs${tab.value ? `?status=${tab.value}` : ""}`}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              (status ?? "") === tab.value
                ? "bg-gray-900 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {jobList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <p className="text-gray-400">Bu durumda ilan yok.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">İlan</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Şirket</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Durum</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">İstatistik</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tarih</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {jobList.map((job) => {
                  const jobStatus = job.status as string;
                  const cfg = STATUS_LABELS[jobStatus] ?? STATUS_LABELS.draft;
                  const company = job.companies as Record<string, unknown> | null;
                  return (
                    <tr key={job.id as string} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-medium text-gray-900 truncate max-w-[200px]">{job.title as string}</div>
                        <div className="text-xs text-gray-400">{job.category as string} · {job.location as string}</div>
                      </td>
                      <td className="px-5 py-4 text-gray-600">{company?.name as string ?? "—"}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-${cfg.color}-100 text-${cfg.color}-700`}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><Eye size={12} /> {job.views as number}</span>
                          <span className="flex items-center gap-1"><Users size={12} /> {job.applications_count as number}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-400">
                        {new Date(job.created_at as string).toLocaleDateString("tr-TR")}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/${locale}/jobs/${job.id as string}`}
                            className="text-xs text-blue-600 hover:underline"
                            target="_blank"
                          >
                            Görüntüle
                          </Link>
                          <JobActions jobId={job.id as string} currentStatus={jobStatus} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
