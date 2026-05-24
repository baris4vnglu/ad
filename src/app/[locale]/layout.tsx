import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { isRTL, type Locale } from "@/i18n/config";
import AuthProvider from "@/components/common/AuthProvider";
import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "A&D Global Work – Uluslararası İnsan Kaynakları",
    template: "%s | A&D Global Work",
  },
  description:
    "KKTC ve Türkiye merkezli uluslararası istihdam ve yatırım platformu. Nitelikli işçi, turizm, inşaat, tarım sektörlerinde iş ilanları.",
  keywords: ["iş ilanı", "nitelikli işçi", "KKTC iş ilanı", "turizm işçisi", "inşaat işçisi", "yatırım", "global work", "işçi alımı"],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://adglobalwork.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "A&D Global Work",
    title: "A&D Global Work – Uluslararası İnsan Kaynakları",
    description: "KKTC ve Türkiye merkezli uluslararası istihdam platformu.",
  },
  twitter: {
    card: "summary_large_image",
    title: "A&D Global Work",
    description: "KKTC ve Türkiye merkezli uluslararası istihdam platformu.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

interface Props {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} dir={isRTL(locale as Locale) ? "rtl" : "ltr"} suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
