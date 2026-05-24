interface Props {
  params: Promise<{ locale: string }>;
}

const CONTENT = {
  tr: {
    title: "Gizlilik Politikası",
    updated: "Son güncelleme: Mayıs 2025",
    sections: [
      {
        heading: "1. Veri Sorumlusu",
        body: `Bu Gizlilik Politikası, A&D Global Work Ltd. ("Şirket", "biz") tarafından işletilen adglobalwork.com web sitesi için geçerlidir. Şirketimiz, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında veri sorumlusu sıfatıyla hareket etmektedir.`,
      },
      {
        heading: "2. Toplanan Kişisel Veriler",
        body: `Platformumuzu kullandığınızda aşağıdaki kişisel veriler toplanabilir:\n\n• Ad ve soyad\n• E-posta adresi\n• Telefon numarası\n• Meslek bilgisi ve özgeçmiş (CV)\n• Şirket bilgileri (işverenler için)\n• IP adresi ve cihaz bilgileri\n• Platform üzerindeki işlem geçmişi`,
      },
      {
        heading: "3. Verilerin İşlenme Amaçları",
        body: `Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:\n\n• Hesap oluşturma ve kimlik doğrulama\n• İş ilanı ve başvuru süreçlerinin yönetimi\n• İşveren ve iş arayan arasında iletişim kurulması\n• Ödeme işlemlerinin gerçekleştirilmesi\n• Yasal yükümlülüklerin yerine getirilmesi\n• Platform güvenliğinin sağlanması\n• Hizmet kalitesinin iyileştirilmesi`,
      },
      {
        heading: "4. Verilerin Aktarımı",
        body: `Kişisel verileriniz;\n\n• Hizmet sağlayıcılarımız (Supabase — veritabanı altyapısı, Vercel — hosting)\n• Yasal zorunluluk halinde yetkili kamu kurum ve kuruluşları\n\nile paylaşılabilir. Verileriniz açık rızanız olmaksızın üçüncü şahıslara satılmaz veya ticari amaçla kullanılmaz.`,
      },
      {
        heading: "5. Veri Saklama Süresi",
        body: `Kişisel verileriniz, hesabınız aktif olduğu süre boyunca ve hesap silme talebinden itibaren 30 gün içinde sistemlerimizden kalıcı olarak silinir. Yasal zorunluluklar gerektirdiği durumlarda ilgili mevzuatta öngörülen süreler boyunca saklanabilir.`,
      },
      {
        heading: "6. KVKK Kapsamında Haklarınız",
        body: `6698 sayılı KVKK'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:\n\n• Kişisel verilerinizin işlenip işlenmediğini öğrenme\n• İşlenmişse buna ilişkin bilgi talep etme\n• İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme\n• Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme\n• Eksik veya yanlış işlenmişse düzeltilmesini isteme\n• Silinmesini veya yok edilmesini isteme\n• İşlemenin otomatik sistemler vasıtasıyla yapılması halinde aleyhte bir sonucun ortaya çıkmasına itiraz etme\n• Zararın giderilmesini talep etme`,
      },
      {
        heading: "7. Çerezler (Cookies)",
        body: `Platformumuz oturum yönetimi için zorunlu çerezler kullanmaktadır. Bu çerezler olmadan giriş yapma ve oturum sürdürme mümkün değildir. Analitik veya pazarlama amaçlı üçüncü taraf çerez kullanılmamaktadır.`,
      },
      {
        heading: "8. Güvenlik",
        body: `Kişisel verileriniz endüstri standardı güvenlik önlemleriyle korunmaktadır:\n\n• Tüm iletişim HTTPS/TLS şifrelemesiyle sağlanmaktadır\n• Şifreler hiçbir zaman düz metin olarak saklanmamakta, hash'lenerek tutulmaktadır\n• Veritabanı erişimi satır düzeyinde güvenlik (RLS) politikalarıyla kısıtlanmaktadır`,
      },
      {
        heading: "9. İletişim",
        body: `KVKK kapsamındaki başvurularınızı ve gizlilik ile ilgili sorularınızı aşağıdaki kanallar aracılığıyla iletebilirsiniz:\n\nE-posta: haseebakram7777okay@gmail.com\nTelefon: +90 542 888 06 96\n\nBaşvurularınız en geç 30 gün içinde yanıtlanacaktır.`,
      },
    ],
  },
  en: {
    title: "Privacy Policy",
    updated: "Last updated: May 2025",
    sections: [
      {
        heading: "1. Data Controller",
        body: `This Privacy Policy applies to the adglobalwork.com website operated by A&D Global Work Ltd. ("Company", "we"). Our company acts as a data controller under the Personal Data Protection Law No. 6698 (KVKK) and applicable international regulations including GDPR.`,
      },
      {
        heading: "2. Data We Collect",
        body: `When you use our platform, the following personal data may be collected:\n\n• Full name\n• Email address\n• Phone number\n• Professional information and CV/resume\n• Company information (for employers)\n• IP address and device information\n• Transaction history on the platform`,
      },
      {
        heading: "3. Purposes of Processing",
        body: `Your personal data is processed for the following purposes:\n\n• Account creation and identity verification\n• Management of job listings and applications\n• Facilitating communication between employers and job seekers\n• Processing payments\n• Fulfilling legal obligations\n• Ensuring platform security\n• Improving service quality`,
      },
      {
        heading: "4. Data Sharing",
        body: `Your personal data may be shared with:\n\n• Our service providers (Supabase — database infrastructure, Vercel — hosting)\n• Competent public authorities when legally required\n\nYour data is never sold to or used commercially by third parties without your explicit consent.`,
      },
      {
        heading: "5. Data Retention",
        body: `Your personal data is permanently deleted from our systems while your account is active and within 30 days of an account deletion request. Where legally required, data may be retained for the period stipulated by applicable legislation.`,
      },
      {
        heading: "6. Your Rights",
        body: `You have the following rights regarding your personal data:\n\n• Right to know whether your data is being processed\n• Right to request information if processed\n• Right to request correction of incomplete or inaccurate data\n• Right to request deletion or destruction of your data\n• Right to object to processing\n• Right to data portability\n• Right to lodge a complaint with a supervisory authority`,
      },
      {
        heading: "7. Cookies",
        body: `Our platform uses essential cookies for session management. Without these cookies, login and session maintenance would not be possible. No third-party analytics or marketing cookies are used.`,
      },
      {
        heading: "8. Security",
        body: `Your personal data is protected with industry-standard security measures:\n\n• All communication is secured with HTTPS/TLS encryption\n• Passwords are never stored in plain text — they are hashed\n• Database access is restricted by Row Level Security (RLS) policies`,
      },
      {
        heading: "9. Contact",
        body: `You can submit your requests and questions regarding privacy through the following channels:\n\nEmail: haseebakram7777okay@gmail.com\nPhone: +90 542 888 06 96\n\nYour requests will be responded to within 30 days at the latest.`,
      },
    ],
  },
};

export default async function GizlilikPage({ params }: Props) {
  const { locale } = await params;
  const lang = locale === "tr" ? "tr" : "en";
  const c = CONTENT[lang];

  return (
    <>
      <section className="py-14 bg-gradient-to-br from-gray-900 to-blue-900">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">{c.title}</h1>
          <p className="text-white/60 text-sm">{c.updated}</p>
        </div>
      </section>

      <section className="py-14 bg-gray-50">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-8">
            {c.sections.map((section) => (
              <div key={section.heading}>
                <h2 className="text-lg font-bold text-gray-900 mb-3">{section.heading}</h2>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{section.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
