"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  MessageCircle,
  User,
  Settings,
  Building2,
  TrendingUp,
  Users,
  ShieldCheck,
  Heart,
  ClipboardList,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Role = "worker" | "employer" | "investor" | "admin";

const NAV_BY_ROLE: Record<Role, { href: string; icon: React.ReactNode; label: string }[]> = {
  worker: [
    { href: "/worker", icon: <LayoutDashboard size={18} />, label: "Panel" },
    { href: "/nitelikli-isciler", icon: <Briefcase size={18} />, label: "İş İlanları" },
    { href: "/worker/applications", icon: <FileText size={18} />, label: "Başvurularım" },
    { href: "/worker/favorites", icon: <Heart size={18} />, label: "Kaydedilenler" },
    { href: "/worker/messages", icon: <MessageCircle size={18} />, label: "Mesajlar" },
    { href: "/worker/profile", icon: <User size={18} />, label: "Profilim" },
  ],
  employer: [
    { href: "/employer", icon: <LayoutDashboard size={18} />, label: "Panel" },
    { href: "/employer/jobs", icon: <Briefcase size={18} />, label: "İlanlarım" },
    { href: "/employer/applications", icon: <FileText size={18} />, label: "Başvurular" },
    { href: "/employer/messages", icon: <MessageCircle size={18} />, label: "Mesajlar" },
    { href: "/employer/company", icon: <Building2 size={18} />, label: "Şirket Profili" },
    { href: "/employer/settings", icon: <Settings size={18} />, label: "Ayarlar" },
  ],
  investor: [
    { href: "/investor", icon: <LayoutDashboard size={18} />, label: "Panel" },
    { href: "/investor/projects", icon: <TrendingUp size={18} />, label: "Projeler" },
    { href: "/investor/messages", icon: <MessageCircle size={18} />, label: "Mesajlar" },
    { href: "/investor/profile", icon: <User size={18} />, label: "Profilim" },
  ],
  admin: [
    { href: "/admin", icon: <LayoutDashboard size={18} />, label: "Panel" },
    { href: "/admin/users", icon: <Users size={18} />, label: "Kullanıcılar" },
    { href: "/admin/jobs", icon: <Briefcase size={18} />, label: "İlanlar" },
    { href: "/admin/applications", icon: <FileText size={18} />, label: "Başvurular" },
    { href: "/admin/payments", icon: <TrendingUp size={18} />, label: "Ödemeler" },
    { href: "/admin/blog", icon: <FileText size={18} />, label: "Blog" },
    { href: "/admin/audit", icon: <ClipboardList size={18} />, label: "Audit Log" },
    { href: "/admin/messages", icon: <Mail size={18} />, label: "İletişim Mesajları" },
    { href: "/admin/settings", icon: <ShieldCheck size={18} />, label: "Ayarlar" },
  ],
};

export default function DashboardSidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const locale = useLocale();
  const navItems = NAV_BY_ROLE[role];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full shrink-0">
      <div className="h-16 flex items-center px-4 border-b border-gray-200">
        <Link href={`/${locale}`} className="flex items-center gap-1">
          <span className="font-extrabold text-blue-700 text-lg">A&amp;D</span>
          <span className="font-semibold text-gray-800 text-lg">Global Work</span>
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const href = `/${locale}${item.href}`;
          const isActive = pathname === href || (item.href !== `/${role}` && pathname.startsWith(href));
          return (
            <Link
              key={item.href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
