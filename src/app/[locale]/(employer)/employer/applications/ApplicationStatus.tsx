"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const STATUSES = [
  { value: "pending",     label: "Bekliyor" },
  { value: "reviewing",   label: "İnceleniyor" },
  { value: "shortlisted", label: "Kısa Liste" },
  { value: "rejected",    label: "Reddedildi" },
  { value: "hired",       label: "İşe Alındı" },
];

interface Props {
  appId: string;
  currentStatus: string;
}

export default function ApplicationStatus({ appId, currentStatus }: Props) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  async function handleChange(newStatus: string) {
    setLoading(true);
    const supabase = createClient();
    const client = supabase as unknown as { from: (t: string) => { update: (v: unknown) => { eq: (c: string, v: string) => Promise<unknown> } } };
    await client.from("applications").update({ status: newStatus }).eq("id", appId);
    setStatus(newStatus);
    setLoading(false);
  }

  return (
    <select
      value={status}
      onChange={(e) => handleChange(e.target.value)}
      disabled={loading}
      className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
    >
      {STATUSES.map((s) => (
        <option key={s.value} value={s.value}>{s.label}</option>
      ))}
    </select>
  );
}
