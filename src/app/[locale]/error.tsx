"use client";

import Link from "next/link";
import { useEffect } from "react";

import * as Sentry from "@sentry/nextjs";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-20">
      <div className="text-7xl mb-6">⚠️</div>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Bir Hata Oluştu</h1>
      <p className="text-gray-500 text-base max-w-md mb-8">
        Beklenmedik bir sorun yaşandı. Lütfen tekrar deneyin.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
        >
          Tekrar Dene
        </button>
        <Link
          href="/tr"
          className="border border-gray-200 text-gray-700 font-medium px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors"
        >
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );
}
