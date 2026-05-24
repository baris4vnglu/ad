import Link from "next/link";
import { useLocale } from "next-intl";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="p-4">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <span className="font-extrabold text-blue-700 text-xl">A&amp;D</span>
          <span className="font-semibold text-gray-700 text-xl">Global Work</span>
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center p-4">
        {children}
      </div>
    </div>
  );
}
