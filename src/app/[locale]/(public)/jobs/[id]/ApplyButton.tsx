"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle } from "lucide-react";

interface Props {
  jobId: string;
  locale: string;
  user: { id: string } | null;
  hasApplied: boolean;
  workerCvUrl: string | null;
}

export default function ApplyButton({ jobId, locale, user, hasApplied: initialApplied, workerCvUrl }: Props) {
  const router = useRouter();
  const [hasApplied, setHasApplied] = useState(initialApplied);
  const [coverLetter, setCoverLetter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState("");

  if (!user) {
    return (
      <button
        onClick={() => router.push(`/${locale}/auth/login`)}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors"
      >
        Giriş Yap & Başvur
      </button>
    );
  }

  if (hasApplied) {
    return (
      <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-sm font-medium">
        <CheckCircle size={16} /> Başvurdunuz
      </div>
    );
  }

  async function handleApply() {
    setApplying(true);
    setError("");
    const supabase = createClient();
    const { error: err } = await supabase.from("applications").insert({
      job_id: jobId,
      worker_id: user!.id,
      cover_letter: coverLetter || null,
      cv_url: workerCvUrl,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    if (err) {
      setError(err.message);
    } else {
      setHasApplied(true);
      setShowForm(false);
    }
    setApplying(false);
  }

  if (showForm) {
    return (
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">Ön Yazı (isteğe bağlı)</label>
        <textarea
          rows={4}
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          placeholder="Neden bu pozisyon için uygunsunuz?"
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
        />
        {workerCvUrl && (
          <p className="text-xs text-gray-500">✓ Profilinizdeki CV otomatik eklenecek</p>
        )}
        {error && <p className="text-xs text-red-600">{error}</p>}
        <div className="flex gap-2">
          <button
            onClick={() => setShowForm(false)}
            className="flex-1 border border-gray-200 text-gray-700 font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm"
          >
            İptal
          </button>
          <button
            onClick={handleApply}
            disabled={applying}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
          >
            {applying ? "Gönderiliyor..." : "Başvur"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowForm(true)}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors"
    >
      Hemen Başvur
    </button>
  );
}
