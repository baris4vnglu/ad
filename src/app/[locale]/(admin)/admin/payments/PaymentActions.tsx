"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Loader } from "lucide-react";

export default function PaymentActions({ paymentId, currentStatus }: { paymentId: string; currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  async function update(newStatus: string) {
    setLoading(true);
    const res = await fetch("/api/admin/update-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentId, status: newStatus }),
    });
    if (res.ok) setStatus(newStatus);
    setLoading(false);
  }

  if (status === "completed") {
    return <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">✓ Onaylandı</span>;
  }
  if (status === "failed") {
    return <span className="text-xs font-semibold text-red-700 bg-red-50 px-2 py-1 rounded-lg">✗ Reddedildi</span>;
  }

  return (
    <div className="flex items-center gap-2">
      {loading && <Loader size={14} className="animate-spin text-gray-400" />}
      <button
        onClick={() => update("completed")}
        disabled={loading}
        className="flex items-center gap-1 text-xs text-emerald-700 font-semibold border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
      >
        <CheckCircle size={13} /> Onayla
      </button>
      <button
        onClick={() => update("failed")}
        disabled={loading}
        className="flex items-center gap-1 text-xs text-red-700 font-semibold border border-red-300 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
      >
        <XCircle size={13} /> Reddet
      </button>
    </div>
  );
}
