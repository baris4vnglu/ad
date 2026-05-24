interface Props {
  params: Promise<{ locale: string }>;
}

const CONTENT = {
  tr: {
    title: "Kullanım Koşulları",
    updated: "Son güncelleme: Mayıs 2025",
    sections: [
      {
        heading: "1. Genel",
        body: `adglobalwork.com web sitesini ("Platform") kullanarak aşağıdaki kullanım koşullarını kabul etmiş sayılırsınız. Bu koşulları kabul etmiyorsanız lütfen platformu kullanmayınız.\n\nPlatformu işleten A&D Global Work Ltd. ("Şirket"), bu koşulları önceden haber vermeksizin güncelleme hakkını saklı tutar.`,
      },
      {
        heading: "2. Hizmet Tanımı",
        body: `A&D Global Work, işverenler ile iş arayanları ve yatırımcıları bir araya getiren uluslararası bir insan kaynakları platformudur. Platform üzerinden:\n\n• İş ilanı yayınlayabilir ve başvurabilirsiniz\n• İşçi ve işveren profili oluşturabilirsiniz\n• Yatırım danışmanlığı talebinde bulunabilirsiniz\n• Üyelik paketi satın alabilirsiniz`,
      },
      {
        heading: "3. Hesap Oluşturma",
        body: `Platform'a kayıt olurken:\n\n• Doğru, güncel ve eksiksiz bilgi vermeyi kabul edersiniz\n• Hesap güvenliğinden siz sorumlusunuz\n• Hesabınızı başkasıyla paylaşamazsınız\n• 18 yaşından küçükseniz platformu kullanamazsınız\n• Şirket, kurallara aykırı hesapları askıya alma veya silme hakkını saklı tutar`,
      },
      {
        heading: "4. Kullanıcı Sorumlulukları",
        body: `Platform kullanıcıları aşağıdaki kurallara uymakla yükümlüdür:\n\n• Yanıltıcı, sahte veya hatalı bilgi paylaşmamak\n• Başkalarının haklarını ihlal etmemek (telif hakkı, ticari marka vb.)\n• Spam, taciz veya zararlı içerik paylaşmamak\n• Platformun teknik altyapısına zarar vermeye çalışmamak\n• Yürürlükteki Türk hukuku ve uluslararası hukuklara uymak`,
      },
      {
        heading: "5. Üyelik ve Ödemeler",
        body: `Platform üzerinden banka havalesi ile üyelik paketi satın alınabilmektedir:\n\n• Seçilen paket bedeli belirtilen IBAN'a transfer edilir\n• Ödeme dekontunun WhatsApp üzerinden iletilmesi gerekmektedir\n• Ödeme doğrulandıktan sonra 24 saat içinde üyelik aktifleştirilir\n• Onaylanan ödemeler iade edilmez\n• Şirket, fiyatları önceden bildirmek kaydıyla değiştirme hakkını saklı tutar`,
      },
      {
        heading: "6. İçerik ve Fikri Mülkiyet",
        body: `Platform üzerindeki tüm içerik (logo, tasarım, yazılım, metinler) A&D Global Work Ltd.'e aittir ve telif hakkıyla korunmaktadır.\n\nKullanıcılar platforma yükledikleri içerikten (ilan, profil, mesaj) bizzat sorumludur. Yüklenen içerik üçüncü tarafların haklarını ihlal edemez.`,
      },
      {
        heading: "7. Sorumluluk Sınırlaması",
        body: `Şirket aşağıdaki durumlardan sorumlu tutulamaz:\n\n• Kullanıcılar arasındaki anlaşmazlıklar\n• Yanlış veya yanıltıcı kullanıcı profilleri\n• Platform üzerinden gerçekleştirilen iş görüşmelerinin sonuçları\n• Teknik arızalar veya veri kayıpları nedeniyle oluşan zararlar\n• Mücbir sebepler`,
      },
      {
        heading: "8. Hesap Feshi",
        body: `Kullanıcılar istedikleri zaman hesaplarını silebilir. Şirket, kullanım koşullarını ihlal eden kullanıcıların hesaplarını önceden uyarı yapmaksızın askıya alma veya kapatma hakkını saklı tutar.`,
      },
      {
        heading: "9. Uygulanacak Hukuk",
        body: `Bu koşullar Türkiye Cumhuriyeti hukukuna tabidir. Uyuşmazlıklarda İstanbul Mahkemeleri ve İcra Müdürlükleri yetkilidir.`,
      },
      {
        heading: "10. İletişim",
        body: `Kullanım koşullarına ilişkin sorularınız için:\n\nE-posta: haseebakram7777okay@gmail.com\nTelefon: +90 542 888 06 96`,
      },
    ],
  },
  en: {
    title: "Terms of Use",
    updated: "Last updated: May 2025",
    sections: [
      {
        heading: "1. General",
        body: `By using the adglobalwork.com website ("Platform"), you are deemed to have accepted the following terms of use. If you do not accept these terms, please do not use the Platform.\n\nA&D Global Work Ltd. ("Company"), which operates the Platform, reserves the right to update these terms without prior notice.`,
      },
      {
        heading: "2. Service Description",
        body: `A&D Global Work is an international human resources platform that brings together employers, job seekers and investors. Through the Platform you can:\n\n• Post job listings and apply for jobs\n• Create worker and employer profiles\n• Request investment consulting\n• Purchase a membership plan`,
      },
      {
        heading: "3. Account Creation",
        body: `When registering on the Platform:\n\n• You agree to provide accurate, current and complete information\n• You are responsible for the security of your account\n• You may not share your account with others\n• You must be 18 years or older to use the Platform\n• The Company reserves the right to suspend or delete accounts that violate the rules`,
      },
      {
        heading: "4. User Responsibilities",
        body: `Platform users are obliged to comply with the following rules:\n\n• Not to share misleading, fake or inaccurate information\n• Not to violate the rights of others (copyright, trademark, etc.)\n• Not to share spam, harassment or harmful content\n• Not to attempt to damage the technical infrastructure of the Platform\n• To comply with applicable Turkish law and international law`,
      },
      {
        heading: "5. Membership and Payments",
        body: `Membership packages can be purchased through bank transfer:\n\n• The selected package fee is transferred to the specified IBAN\n• The payment receipt must be sent via WhatsApp\n• Membership is activated within 24 hours after payment is verified\n• Confirmed payments are non-refundable\n• The Company reserves the right to change prices with prior notice`,
      },
      {
        heading: "6. Content and Intellectual Property",
        body: `All content on the Platform (logo, design, software, texts) belongs to A&D Global Work Ltd. and is protected by copyright.\n\nUsers are solely responsible for the content they upload to the Platform (listings, profiles, messages). Uploaded content may not infringe the rights of third parties.`,
      },
      {
        heading: "7. Limitation of Liability",
        body: `The Company cannot be held responsible for:\n\n• Disputes between users\n• False or misleading user profiles\n• Outcomes of job interviews conducted through the Platform\n• Damages arising from technical failures or data loss\n• Force majeure events`,
      },
      {
        heading: "8. Account Termination",
        body: `Users may delete their accounts at any time. The Company reserves the right to suspend or close accounts of users who violate the terms of use without prior warning.`,
      },
      {
        heading: "9. Governing Law",
        body: `These terms are subject to the laws of the Republic of Turkey. Istanbul Courts and Enforcement Offices have jurisdiction in disputes.`,
      },
      {
        heading: "10. Contact",
        body: `For questions regarding the terms of use:\n\nEmail: haseebakram7777okay@gmail.com\nPhone: +90 542 888 06 96`,
      },
    ],
  },
};

export default async function KullanimKosullariPage({ params }: Props) {
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
