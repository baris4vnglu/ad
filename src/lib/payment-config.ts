// ─── ÖDEME BİLGİLERİ ───────────────────────────────────────────────────────
// Bu dosyadaki IBAN ve WhatsApp numarasını güncelleyin.
// .env.local dosyasında da ayarlayabilirsiniz:
//   NEXT_PUBLIC_IBAN=TR...
//   NEXT_PUBLIC_WHATSAPP=905XXXXXXXXX
//   NEXT_PUBLIC_ACCOUNT_HOLDER=AD Global Work Ltd.
//   NEXT_PUBLIC_BANK_NAME=Ziraat Bankası

export const PAYMENT_CONFIG = {
  iban:          process.env.NEXT_PUBLIC_IBAN            ?? "TR00 0000 0000 0000 0000 0000 00",
  bankName:      process.env.NEXT_PUBLIC_BANK_NAME       ?? "Ziraat Bankası",
  accountHolder: process.env.NEXT_PUBLIC_ACCOUNT_HOLDER  ?? "AD Global Work Ltd.",
  email:         process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "",
  // WhatsApp: sadece rakamlar, başında + yok
  whatsapp:      process.env.NEXT_PUBLIC_WHATSAPP        ?? "905428880696",
};

export const PLANS = [
  {
    id:       "3m",
    label:    "3 Aylık",
    price:    150,
    currency: "USD",
    days:     90,
    badge:    null,
    features: [
      "İlan yayını",
      "Aday başvuru takibi",
      "İşveren / İşçi mesajlaşma",
    ],
  },
  {
    id:       "6m",
    label:    "6 Aylık",
    price:    300,
    currency: "USD",
    days:     180,
    badge:    "Popüler",
    features: [
      "İlan yayını",
      "Aday başvuru takibi",
      "İşveren / İşçi mesajlaşma",
      "3 aya göre %0 ek ücret",
    ],
  },
  {
    id:       "1y",
    label:    "1 Yıllık",
    price:    550,
    currency: "USD",
    days:     365,
    badge:    "En Avantajlı",
    features: [
      "İlan yayını",
      "Aday başvuru takibi",
      "İşveren / İşçi mesajlaşma",
      "6 aya göre %8 tasarruf",
      "Öncelikli destek",
    ],
  },
] as const;

export type PlanId = typeof PLANS[number]["id"];

export function getPlan(id: PlanId) {
  return PLANS.find((p) => p.id === id)!;
}

export function buildWhatsappLink({
  planLabel,
  price,
  fullName,
  email,
  companyName,
  jobTitle,
}: {
  planLabel: string;
  price: number;
  fullName?: string;
  email?: string;
  companyName?: string;
  jobTitle?: string;
}) {
  const lines = [
    "Merhaba, A&D Global Work üyelik paketi satın almak istiyorum.",
    "",
    `Seçilen Paket : ${planLabel} — $${price}`,
    fullName    ? `Ad Soyad     : ${fullName}`    : null,
    email       ? `E-posta      : ${email}`        : null,
    companyName ? `Şirket       : ${companyName}`  : null,
    jobTitle    ? `İlan Başlığı : ${jobTitle}`     : null,
    "",
    "IBAN'a ödeme yapacağım. Onaylayabilir misiniz?",
  ].filter((l) => l !== null).join("\n");

  return `https://wa.me/${PAYMENT_CONFIG.whatsapp}?text=${encodeURIComponent(lines)}`;
}
