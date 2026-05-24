export interface SubCategory {
  tr: string;
  en: string;
  ar: string;
}

export interface Category {
  id: string;
  icon: string;
  name: { tr: string; en: string; ar: string };
  subcategories: SubCategory[];
}

export const CATEGORIES_SKILLED: Category[] = [
  {
    id: "turizm",
    icon: "🏨",
    name: { tr: "Turizm", en: "Tourism", ar: "السياحة" },
    subcategories: [
      { tr: "Aşçı", en: "Chef", ar: "طاهي" },
      { tr: "Garson", en: "Waiter", ar: "نادل" },
      { tr: "Barmen", en: "Bartender", ar: "بارمان" },
      { tr: "Hause Keeping", en: "Housekeeping", ar: "تدبير المنزل" },
      { tr: "Vale", en: "Valet", ar: "خادم" },
      { tr: "Ön Büro", en: "Front Office", ar: "الاستقبال" },
      { tr: "Misafir İlişkileri", en: "Guest Relations", ar: "علاقات الضيوف" },
      { tr: "Barmaid", en: "Barmaid", ar: "بارميد" },
      { tr: "Spa & Masör", en: "Spa & Masseur", ar: "سبا ومساج" },
      { tr: "Teknik", en: "Technician", ar: "فني" },
      { tr: "Teknik Soğutma", en: "HVAC Technician", ar: "فني تكييف" },
      { tr: "Teknik Mekanikçi", en: "Mechanical Technician", ar: "فني ميكانيكي" },
      { tr: "Teknik Su Tesisat", en: "Plumbing Technician", ar: "فني سباكة" },
    ],
  },
  {
    id: "insaat",
    icon: "🏗️",
    name: { tr: "İnşaat", en: "Construction", ar: "البناء" },
    subcategories: [
      { tr: "Duvar Ustası", en: "Mason", ar: "بناء جدران" },
      { tr: "Demir Ustası", en: "Iron Worker", ar: "حداد" },
      { tr: "Sıvacı", en: "Plasterer", ar: "مبيض" },
      { tr: "Boya Ustası", en: "Painter", ar: "دهان" },
      { tr: "Alçıpan Ustası", en: "Drywall Worker", ar: "عامل جبس" },
      { tr: "Elektrik Ustası", en: "Electrician", ar: "كهربائي" },
      { tr: "Su Tesisatçısı", en: "Plumber", ar: "سباك" },
      { tr: "Kalıpçı", en: "Formwork Carpenter", ar: "نجار قوالب" },
      { tr: "Mermer Ustası", en: "Marble Worker", ar: "عامل رخام" },
      { tr: "Fanyas Ustası", en: "Tile Layer", ar: "مبلط" },
      { tr: "Vinç Operatörü", en: "Crane Operator", ar: "مشغل رافعة" },
      { tr: "Şiro Operatörü", en: "Shiro Operator", ar: "مشغل شيرو" },
      { tr: "Ağır Vasıta Kamyon Şoförü", en: "Heavy Vehicle Driver", ar: "سائق شاحنة ثقيلة" },
      { tr: "Şoför", en: "Driver", ar: "سائق" },
      { tr: "Kepçe Operatörü", en: "Excavator Operator", ar: "مشغل حفار" },
    ],
  },
  {
    id: "bahce",
    icon: "🌿",
    name: { tr: "Bahçe", en: "Garden", ar: "الحديقة" },
    subcategories: [
      { tr: "Bahçıvan", en: "Gardener", ar: "بستاني" },
      { tr: "Peyzaj Tasarımcısı", en: "Landscape Designer", ar: "مصمم مناظر طبيعية" },
      { tr: "Sulama Uzmanı", en: "Irrigation Expert", ar: "خبير ري" },
      { tr: "Ağaç Bakım Uzmanı", en: "Arborist", ar: "متخصص عناية بالأشجار" },
      { tr: "Çim Bakım Elemanı", en: "Lawn Care Worker", ar: "عامل عناية بالعشب" },
      { tr: "Havuz Bakım Uzmanı", en: "Pool Maintenance", ar: "صيانة المسبح" },
      { tr: "Sera Çalışanı", en: "Greenhouse Worker", ar: "عامل بيت الزجاج" },
    ],
  },
];

export const CATEGORIES_REGULAR = [
  { id: "temizlik", icon: "🧹", name: { tr: "Temizlik & Hizmet", en: "Cleaning & Service", ar: "تنظيف وخدمة" } },
  { id: "guvenlik", icon: "🛡️", name: { tr: "Güvenlik", en: "Security", ar: "أمن" } },
  { id: "depo", icon: "📦", name: { tr: "Depo & Lojistik", en: "Warehouse & Logistics", ar: "مستودع ولوجستيات" } },
  { id: "tarim", icon: "🌾", name: { tr: "Tarım", en: "Agriculture", ar: "زراعة" } },
  { id: "gida", icon: "🍔", name: { tr: "Gıda & Restoran", en: "Food & Restaurant", ar: "غذاء ومطعم" } },
  { id: "tekstil", icon: "👔", name: { tr: "Tekstil", en: "Textile", ar: "نسيج" } },
  { id: "kargo", icon: "🚚", name: { tr: "Kargo & Dağıtım", en: "Cargo & Delivery", ar: "شحن وتوزيع" } },
  { id: "uretim", icon: "🏭", name: { tr: "Üretim", en: "Manufacturing", ar: "تصنيع" } },
];
