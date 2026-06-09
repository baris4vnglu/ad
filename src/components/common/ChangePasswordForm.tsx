"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle } from "lucide-react";

export default function ChangePasswordForm() {
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    if (newPassword !== confirm) {
      setError("Şifreler eşleşmiyor.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Şifre en az 8 karakter olmalı.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.updateUser({ password: newPassword });
    if (err) {
      setError(err.message);
    } else {
      setSuccess(true);
      setNewPassword("");
      setConfirm("");
    }
    setLoading(false);
  }

  return (
    <div className="mt-8 pt-8 border-t border-gray-200">
      <h2 className="text-base font-semibold text-gray-900 mb-1">Şifre Değiştir</h2>
      <p className="text-sm text-gray-500 mb-4">Yeni bir şifre belirleyebilirsiniz.</p>

      {success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl p-3 mb-4 text-sm">
          <CheckCircle size={15} /> Şifreniz güncellendi.
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3 max-w-sm">
        <input
          type="password"
          placeholder="Yeni şifre (min 8 karakter)"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          minLength={8}
          required
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="password"
          placeholder="Şifreyi tekrar girin"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50"
        >
          {loading ? "Güncelleniyor..." : "Şifreyi Güncelle"}
        </button>
      </form>
    </div>
  );
}
