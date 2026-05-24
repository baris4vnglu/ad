import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";

export default function Footer() {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href={`/${locale}`} className="flex items-center gap-1 mb-4">
              <span className="font-extrabold text-blue-400 text-xl">A&amp;D</span>
              <span className="font-semibold text-white text-xl">Global Work</span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">{t("footer.brand_desc")}</p>
          </div>

          {/* Platform links */}
          <div>
            <h5 className="font-semibold text-white mb-4">{t("footer.platform")}</h5>
            <ul className="space-y-2 text-sm">
              <li><Link href={`/${locale}/nitelikli-isciler`} className="hover:text-white transition-colors">{t("nav.skilled")}</Link></li>
              <li><Link href={`/${locale}/normal-isciler`} className="hover:text-white transition-colors">{t("nav.regular")}</Link></li>
              <li><Link href={`/${locale}/yatirimcilar`} className="hover:text-white transition-colors">{t("nav.investors")}</Link></li>
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h5 className="font-semibold text-white mb-4">{t("footer.company")}</h5>
            <ul className="space-y-2 text-sm">
              <li><Link href={`/${locale}/hakkimizda`} className="hover:text-white transition-colors">{t("footer.about")}</Link></li>
              <li><Link href={`/${locale}/ilan-ver`} className="hover:text-white transition-colors">{t("nav.post")}</Link></li>
              <li><Link href={`/${locale}/iletisim`} className="hover:text-white transition-colors">{t("nav.contact")}</Link></li>
              <li><Link href={`/${locale}/blog`} className="hover:text-white transition-colors">Blog</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h5 className="font-semibold text-white mb-4">{t("footer.contact")}</h5>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="mailto:info@adglobalwork.com" className="hover:text-white transition-colors">
                  📧 info@adglobalwork.com
                </a>
              </li>
              <li>
                <a href="tel:+905338240294" className="hover:text-white transition-colors">
                  📞 +90 533 824 02 94
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <p>© 2024 A&amp;D Global Work. {t("footer.rights")}</p>
          <div className="flex gap-4">
            <Link href={`/${locale}/gizlilik`} className="hover:text-gray-300">{t("footer.privacy")}</Link>
            <Link href={`/${locale}/kullanim-kosullari`} className="hover:text-gray-300">{t("footer.terms")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
