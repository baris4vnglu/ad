"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import NotificationBell from "@/components/common/NotificationBell";

export default function DashboardHeader() {
  const router = useRouter();
  const locale = useLocale();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(`/${locale}`);
    router.refresh();
  }

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-6 gap-3 shrink-0">
      <NotificationBell />
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
      >
        <LogOut size={16} />
        Çıkış
      </button>
    </header>
  );
}
