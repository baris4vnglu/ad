"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Trash2 } from "lucide-react";

export default function DeleteAccountButton() {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const locale = useLocale();

  async function handleDelete() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/account/delete", { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json() as { error?: string };
      setError(data.error ?? "Bir hata oluştu.");
      setLoading(false);
      return;
    }
    router.push(`/${locale}/auth/login`);
  }

  if (confirming) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
        <p className="font-semibold text-red-800 mb-1">Hesabınızı silmek istediğinizden emin misiniz?</p>
        <p className="text-sm text-red-600 mb-4">
          Tüm verileriniz (profil, başvurular, mesajlar) kalıcı olarak silinecek. Bu işlem geri alınamaz.
        </p>
        {error && <p className="text-sm text-red-700 mb-3">{error}</p>}
        <div className="flex gap-3">
          <button
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? "Siliniyor..." : "Evet, Hesabımı Sil"}
          </button>
          <button
            onClick={() => setConfirming(false)}
            disabled={loading}
            className="border border-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
          >
            İptal
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 border border-red-200 hover:bg-red-50 px-4 py-2.5 rounded-xl transition-colors"
    >
      <Trash2 size={15} /> Hesabımı Sil
    </button>
  );
}
