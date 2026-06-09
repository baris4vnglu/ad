import Link from "next/link";

export default function LocaleNotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-20">
      <div className="text-7xl mb-6">🔍</div>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Sayfa Bulunamadı</h1>
      <p className="text-gray-500 text-base max-w-md mb-8">
        Aradığınız sayfa taşınmış, silinmiş ya da hiç var olmamış olabilir.
      </p>
      <Link
        href="/tr"
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
      >
        Ana Sayfaya Dön
      </Link>
    </div>
  );
}
