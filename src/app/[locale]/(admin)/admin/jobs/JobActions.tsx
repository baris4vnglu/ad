"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, XCircle, Loader } from "lucide-react";

interface Props {
  jobId: string;
  currentStatus: string;
}

export default function JobActions({ jobId, currentStatus }: Props) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  async function updateStatus(newStatus: string) {
    setLoading(true);
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("jobs")
      .update({ status: newStatus })
      .eq("id", jobId);

    if (!error) {
      // Write audit log
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from("audit_logs").insert({
          admin_id: user.id,
          action: newStatus === "active" ? "job_approved" : "job_rejected",
          target_type: "job",
          target_id: jobId,
          details: { previous_status: status, new_status: newStatus },
        });
      }
      setStatus(newStatus);
    }
    setLoading(false);
  }

  if (status === "active") {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-1 rounded-lg">✓ Yayında</span>
        <button
          onClick={() => updateStatus("rejected")}
          disabled={loading}
          className="text-xs text-red-600 hover:text-red-700 border border-red-200 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          Yayından Kaldır
        </button>
      </div>
    );
  }

  if (status === "rejected") {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-red-600 font-semibold bg-red-50 px-2 py-1 rounded-lg">✗ Reddedildi</span>
        <button
          onClick={() => updateStatus("active")}
          disabled={loading}
          className="text-xs text-emerald-600 hover:text-emerald-700 border border-emerald-200 px-2 py-1 rounded-lg hover:bg-emerald-50 transition-colors disabled:opacity-50"
        >
          Onayla
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {loading && <Loader size={14} className="animate-spin text-gray-400" />}
      <button
        onClick={() => updateStatus("active")}
        disabled={loading}
        className="flex items-center gap-1 text-xs text-emerald-700 font-semibold border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
      >
        <CheckCircle size={13} /> Onayla
      </button>
      <button
        onClick={() => updateStatus("rejected")}
        disabled={loading}
        className="flex items-center gap-1 text-xs text-red-700 font-semibold border border-red-300 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
      >
        <XCircle size={13} /> Reddet
      </button>
    </div>
  );
}
