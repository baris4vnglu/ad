import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ana Sayfa",
};

const STATS = [
  { key: "stat_workers", value: "10,000+" },
  { key: "stat_companies", value: "500+" },
  { key: "stat_countries", value: "40+" },
  { key: "stat_placements", value: "8,000+" },
];

const PANELS = [
  {
    key: "skilled",
    href: "/nitelikli-isciler",
    gradient: "from-blue-600 to-blue-900",
    icon: "🏨",
    titleKey: "panels.skilled_title",
    descKey: "panels.skilled_desc",
  },
  {
    key: "regular",
    href: "/normal-isciler",
    gradient: "from-emerald-600 to-emerald-900",
    icon: "🏭",
    titleKey: "panels.regular_title",
    descKey: "panels.regular_desc",
  },
  {
    key: "investor",
    href: "/yatirimcilar",
    gradient: "from-amber-600 to-amber-900",
    icon: "📈",
    titleKey: "panels.investor_title",
    descKey: "panels.investor_desc",
  },
];

const VALUES = [
  { icon: "🛡️", titleKey: "mission.value1_title", descKey: "mission.value1_desc" },
  { icon: "🌍", titleKey: "mission.value2_title", descKey: "mission.value2_desc" },
  { icon: "⚡", titleKey: "mission.value3_title", descKey: "mission.value3_desc" },
];

export default function HomePage() {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <>
      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a6e 60%, #1a56db 100%)" }}
      >
        <div className="container mx-auto px-4 py-20 md:py-28 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white/90 text-sm font-medium">{t("hero.badge")}</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
              {t("hero.title")}
            </h1>

            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl leading-relaxed">
              {t("hero.subtitle")}
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href={`/${locale}/nitelikli-isciler`}
                className="bg-white text-blue-700 font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
              >
                {t("hero.cta_worker")}
              </Link>
              <Link
                href={`/${locale}/ilan-ver`}
                className="bg-transparent border-2 border-white text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition-colors"
              >
                {t("hero.cta_employer")}
              </Link>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="bg-white/10 backdrop-blur border-t border-white/10">
          <div className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {STATS.map((stat) => (
                <div key={stat.key} className="text-center">
                  <div className="text-2xl md:text-3xl font-extrabold text-white">{stat.value}</div>
                  <div className="text-white/70 text-sm mt-1">{t(`hero.${stat.key}`)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Panels */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
              {t("panels.title")}
            </h2>
            <p className="text-gray-500 text-lg">{t("panels.subtitle")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PANELS.map((panel) => (
              <Link
                key={panel.key}
                href={`/${locale}${panel.href}`}
                className={`group bg-gradient-to-br ${panel.gradient} rounded-2xl p-8 text-white shadow-xl hover:scale-[1.02] transition-transform duration-200`}
              >
                <div className="text-5xl mb-5">{panel.icon}</div>
                <h3 className="text-xl font-bold mb-3">{t(panel.titleKey)}</h3>
                <p className="text-white/80 text-sm leading-relaxed mb-5">{t(panel.descKey)}</p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold bg-white/20 hover:bg-white/30 rounded-lg px-4 py-2 transition-colors">
                  {t("panels.explore")} →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              {t("mission.title")}
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">{t("mission.desc")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {VALUES.map((v) => (
              <div key={v.titleKey} className="bg-gray-50 rounded-2xl p-8 text-center">
                <div className="text-4xl mb-4">{v.icon}</div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">{t(v.titleKey)}</h4>
                <p className="text-gray-500 text-sm leading-relaxed">{t(v.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-16"
        style={{ background: "linear-gradient(135deg, #1a56db 0%, #059669 100%)" }}
      >
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">
              {t("panels.skilled_title")}
            </h2>
            <p className="text-white/80">{t("hero.subtitle")}</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link
              href={`/${locale}/ilan-ver`}
              className="bg-white text-blue-700 font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors"
            >
              {t("nav.post")}
            </Link>
            <Link
              href={`/${locale}/iletisim`}
              className="border-2 border-white text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition-colors"
            >
              {t("nav.contact")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
