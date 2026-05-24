"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, ChevronDown, LayoutDashboard, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { locales, localeNames, type Locale } from "@/i18n/config";
import { useUser } from "@/hooks/useUser";
import { createClient } from "@/lib/supabase/client";
import NotificationBell from "@/components/common/NotificationBell";

const NAV_LINKS = [
  { href: "/", labelKey: "nav.home" },
  { href: "/nitelikli-isciler", labelKey: "nav.skilled" },
  { href: "/normal-isciler", labelKey: "nav.regular" },
  { href: "/yatirimcilar", labelKey: "nav.investors" },
  { href: "/fiyatlar", labelKey: "nav.pricing" },
];

const DASHBOARD_ROUTES: Record<string, string> = {
  worker: "/worker",
  employer: "/employer",
  investor: "/investor",
  admin: "/admin",
};

export default function Header() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, loading } = useUser();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function switchLocale(newLocale: Locale) {
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/"));
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(`/${locale}`);
    router.refresh();
  }

  const dashboardHref = profile
    ? `/${locale}${DASHBOARD_ROUTES[profile.role] ?? "/"}`
    : null;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-200",
        scrolled
          ? "bg-white/95 backdrop-blur shadow-sm border-b border-gray-100"
          : "bg-white border-b border-gray-100"
      )}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-1 shrink-0">
          <span className="font-extrabold text-blue-700 text-xl tracking-tight">A&amp;D</span>
          <span className="font-semibold text-gray-800 text-xl tracking-tight">Global Work</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const href = `/${locale}${link.href === "/" ? "" : link.href}`;
            const isActive =
              pathname === href || (link.href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={link.href}
                href={href}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "text-blue-700 bg-blue-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                {t(link.labelKey)}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-2">
          {/* Language switcher */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {locales.map((loc) => (
              <button
                key={loc}
                onClick={() => switchLocale(loc)}
                className={cn(
                  "px-2 py-1 rounded text-xs font-semibold transition-all",
                  locale === loc
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                {loc.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Auth section */}
          {!loading && (
            <>
              {user && profile ? (
                /* User menu */
                <>
                <NotificationBell />
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
                  >
                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold">
                      {(profile.full_name ?? profile.email)[0].toUpperCase()}
                    </div>
                    <span className="max-w-[120px] truncate">{profile.full_name ?? profile.email}</span>
                    <ChevronDown size={14} className={cn("transition-transform", userMenuOpen && "rotate-180")} />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs text-gray-400">Hesap</p>
                        <p className="text-sm font-medium text-gray-900 truncate">{profile.email}</p>
                      </div>
                      {dashboardHref && (
                        <Link
                          href={dashboardHref}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <LayoutDashboard size={15} />
                          {t("nav.dashboard")}
                        </Link>
                      )}
                      <Link
                        href={`/${locale}/${profile.role === "worker" ? "worker/profile" : "employer/company"}`}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <User size={15} />
                        Profilim
                      </Link>
                      <hr className="my-1" />
                      <button
                        onClick={() => { setUserMenuOpen(false); handleLogout(); }}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut size={15} />
                        {t("nav.logout")}
                      </button>
                    </div>
                  )}
                </div>
                </>
              ) : (
                /* Guest buttons */
                <>
                  <Link
                    href={`/${locale}/auth/login`}
                    className="text-sm font-medium text-gray-700 hover:text-gray-900 px-3 py-2"
                  >
                    {t("nav.login")}
                  </Link>
                  <Link
                    href={`/${locale}/ilan-ver`}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                  >
                    {t("nav.post")}
                  </Link>
                </>
              )}
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menü"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 flex flex-col gap-1">
          {NAV_LINKS.map((link) => {
            const href = `/${locale}${link.href === "/" ? "" : link.href}`;
            return (
              <Link
                key={link.href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {t(link.labelKey)}
              </Link>
            );
          })}
          <hr className="my-2" />
          {/* Mobile locale switcher */}
          <div className="flex items-center gap-1 mb-2 flex-wrap">
            {locales.map((loc) => (
              <button
                key={loc}
                onClick={() => { switchLocale(loc); setMenuOpen(false); }}
                className={cn(
                  "px-3 py-1 rounded text-xs font-semibold border transition-all",
                  locale === loc
                    ? "bg-blue-600 text-white border-blue-600"
                    : "text-gray-600 border-gray-200 hover:border-gray-400"
                )}
              >
                {localeNames[loc]}
              </button>
            ))}
          </div>
          {/* Mobile auth */}
          {!loading && user && profile ? (
            <>
              {dashboardHref && (
                <Link href={dashboardHref} onClick={() => setMenuOpen(false)} className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">
                  {t("nav.dashboard")}
                </Link>
              )}
              <button
                onClick={() => { setMenuOpen(false); handleLogout(); }}
                className="px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md text-left"
              >
                {t("nav.logout")}
              </button>
            </>
          ) : (
            <>
              <Link href={`/${locale}/auth/login`} onClick={() => setMenuOpen(false)} className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">
                {t("nav.login")}
              </Link>
              <Link href={`/${locale}/ilan-ver`} onClick={() => setMenuOpen(false)} className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg text-center">
                {t("nav.post")}
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
