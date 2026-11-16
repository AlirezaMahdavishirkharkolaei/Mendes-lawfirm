import { practiceAreasSchema, type PracticeArea } from "@/lib/schemas/practice-area";

/**
 * Mendes practice areas. Descriptions say what the firm does; they make
 * no claims about results, rankings or experience (see docs/PROJECT.md,
 * content policy). Statutory references are to the laws of the TRNC as
 * consolidated (e.g. Cap. 113 Companies Law, Cap. 232 Sale of Land
 * (Specific Performance) Law).
 */
const rawPracticeAreas: PracticeArea[] = [
  {
    slug: "real-estate",
    title: { en: "Real estate & property", tr: "Gayrimenkul ve mülkiyet", fa: "املاک و مستغلات" },
    summary: {
      en: "Title checks, purchase contracts and transfer of property in Northern Cyprus.",
      tr: "Kuzey Kıbrıs'ta tapu araştırması, satış sözleşmeleri ve mülk devri.",
      fa: "بررسی سند، قرارداد خرید و انتقال ملک در قبرس شمالی.",
    },
    description: {
      en: [
        "Buying property in Northern Cyprus involves steps that are easy to get wrong: checking who really owns the land, whether it carries a mortgage or other burden, and protecting the buyer before the title deed is transferred.",
        "We act for buyers, sellers and developers from the first search at the Land Registry to the transfer of title, and we explain each step in plain language.",
      ],
      tr: [
        "Kuzey Kıbrıs'ta mülk edinmek, hata yapılması kolay adımlar içerir: arazinin gerçek sahibinin kim olduğunu, üzerinde ipotek veya başka bir takyidat bulunup bulunmadığını kontrol etmek ve tapu devrinden önce alıcıyı korumak.",
        "Tapu Dairesi'ndeki ilk araştırmadan mülkiyetin devrine kadar alıcı, satıcı ve müteahhitleri temsil ediyor, her adımı açık bir dille anlatıyoruz.",
      ],
      fa: [
        "خرید ملک در قبرس شمالی مراحلی دارد که اشتباه در آن‌ها آسان است: اینکه مالک واقعی زمین کیست، آیا ملک در رهن است یا محدودیت دیگری دارد، و اینکه خریدار پیش از انتقال سند چگونه محافظت شود.",
        "ما از اولین استعلام در اداره ثبت املاک (تاپو) تا انتقال سند، وکالت خریداران، فروشندگان و سازندگان را بر عهده می‌گیریم و هر مرحله را به زبان ساده توضیح می‌دهیم.",
      ],
    },
    services: {
      en: [
        "Title deed and encumbrance searches at the Land Registry",
        "Drafting and reviewing sales and off-plan contracts",
        "Depositing sales contracts at the Land Registry to protect the buyer (Cap. 232)",
        "Purchase permits for foreign buyers",
        "Transfer of title, mortgages and tenancy matters",
      ],
      tr: [
        "Tapu Dairesi'nde tapu ve takyidat araştırması",
        "Satış ve projeden satış sözleşmelerinin hazırlanması ve incelenmesi",
        "Alıcıyı korumak için satış sözleşmesinin Tapu Dairesi'ne yatırılması (Fasıl 232)",
        "Yabancı alıcılar için satın alma izni",
        "Tapu devri, ipotek ve kira işleri",
      ],
      fa: [
        "استعلام سند و محدودیت‌های ملک در اداره ثبت املاک",
        "تنظیم و بررسی قرارداد فروش و پیش‌فروش",
        "ثبت قرارداد فروش در اداره ثبت املاک برای حمایت از خریدار (Cap. 232)",
        "مجوز خرید برای خریداران خارجی",
        "انتقال سند، رهن و امور اجاره",
      ],
    },
    relatedAttorneySlugs: [],
  },
  {
    slug: "residency-citizenship",
    title: { en: "Residency & citizenship", tr: "Oturma izni ve vatandaşlık", fa: "اقامت و تابعیت" },
    summary: {
      en: "Residence and work permits, and citizenship applications.",
      tr: "Oturma ve çalışma izinleri ile vatandaşlık başvuruları.",
      fa: "اقامت، مجوز کار و درخواست تابعیت.",
    },
    description: {
      en: [
        "Moving to Northern Cyprus to live, study, work or invest means dealing with several authorities and changing requirements.",
        "We prepare and follow applications for individuals and families, and advise employers on permits for foreign staff.",
      ],
      tr: [
        "Yaşamak, okumak, çalışmak veya yatırım yapmak için Kuzey Kıbrıs'a taşınmak, birden fazla kurumla ve değişen şartlarla uğraşmayı gerektirir.",
        "Bireyler ve aileler için başvuruları hazırlıyor ve takip ediyor, yabancı personel çalıştıran işverenlere izinler konusunda danışmanlık veriyoruz.",
      ],
      fa: [
        "مهاجرت به قبرس شمالی برای زندگی، تحصیل، کار یا سرمایه‌گذاری یعنی سروکار داشتن با چند نهاد و شرایطی که مدام تغییر می‌کند.",
        "ما درخواست‌های افراد و خانواده‌ها را آماده و پیگیری می‌کنیم و به کارفرمایان دربارهٔ مجوز کارکنان خارجی مشاوره می‌دهیم.",
      ],
    },
    services: {
      en: [
        "Residence permits for individuals and families",
        "Work permits and employer applications",
        "Citizenship applications",
        "Status issues for students and investors",
      ],
      tr: [
        "Bireyler ve aileler için oturma izni",
        "Çalışma izni ve işveren başvuruları",
        "Vatandaşlık başvuruları",
        "Öğrenci ve yatırımcıların statü sorunları",
      ],
      fa: [
        "اقامت برای افراد و خانواده‌ها",
        "مجوز کار و درخواست‌های کارفرما",
        "درخواست تابعیت",
        "مسائل اقامتی دانشجویان و سرمایه‌گذاران",
      ],
    },
    relatedAttorneySlugs: [],
  },
  {
    slug: "company-commercial",
    title: { en: "Company & commercial", tr: "Şirketler ve ticaret hukuku", fa: "شرکت‌ها و حقوق تجارت" },
    summary: {
      en: "Company formation, commercial contracts and corporate housekeeping.",
      tr: "Şirket kuruluşu, ticari sözleşmeler ve şirket işlemleri.",
      fa: "ثبت شرکت، قراردادهای تجاری و امور جاری شرکت.",
    },
    description: {
      en: [
        "We help local and foreign businesses set up and run companies in Northern Cyprus, including standard companies and companies in the Freeport, and we draft the contracts they trade on.",
        "Company work is governed by the Companies Law, Cap. 113; contracts by the Contract Law, Cap. 149.",
      ],
      tr: [
        "Yerli ve yabancı işletmelerin Kuzey Kıbrıs'ta standart şirketler ve Serbest Liman şirketleri dahil şirket kurmasına ve yönetmesine yardımcı oluyor, ticari sözleşmelerini hazırlıyoruz.",
        "Şirket işlemleri Şirketler Yasası (Fasıl 113), sözleşmeler ise Sözleşmeler Yasası (Fasıl 149) kapsamındadır.",
      ],
      fa: [
        "ما به کسب‌وکارهای داخلی و خارجی کمک می‌کنیم در قبرس شمالی شرکت ثبت و اداره کنند، از جمله شرکت‌های عادی و شرکت‌های منطقهٔ آزاد (Freeport)، و قراردادهای تجاری‌شان را تنظیم می‌کنیم.",
        "امور شرکت‌ها تابع قانون شرکت‌ها (Cap. 113) و قراردادها تابع قانون قراردادها (Cap. 149) است.",
      ],
    },
    services: {
      en: [
        "Company formation and registration",
        "Standard and Freeport company structures",
        "Shareholder agreements, share transfers and changes of directors",
        "Drafting and reviewing commercial contracts",
        "Commercial disputes",
      ],
      tr: [
        "Şirket kuruluşu ve tescili",
        "Standart ve Serbest Liman şirket yapıları",
        "Hissedar sözleşmeleri, hisse devri ve müdür değişiklikleri",
        "Ticari sözleşmelerin hazırlanması ve incelenmesi",
        "Ticari uyuşmazlıklar",
      ],
      fa: [
        "تأسیس و ثبت شرکت",
        "ساختار شرکت‌های عادی و منطقهٔ آزاد",
        "قرارداد سهامداران، انتقال سهام و تغییر مدیران",
        "تنظیم و بررسی قراردادهای تجاری",
        "اختلافات تجاری",
      ],
    },
    relatedAttorneySlugs: [],
  },
  {
    slug: "family-law",
    title: { en: "Family law", tr: "Aile hukuku", fa: "حقوق خانواده" },
    summary: {
      en: "Divorce, custody, maintenance and division of property.",
      tr: "Boşanma, velayet, nafaka ve mal paylaşımı.",
      fa: "طلاق، حضانت، نفقه و تقسیم اموال.",
    },
    description: {
      en: [
        "Family matters are personal and often urgent. We advise and represent clients before the Family Courts with discretion, and we look for agreed solutions where they protect the client and the children.",
      ],
      tr: [
        "Aile meseleleri kişisel ve çoğu zaman acildir. Müvekkillerimize Aile Mahkemelerinde gizlilik içinde danışmanlık ve temsil hizmeti veriyor, müvekkili ve çocukları koruduğu durumlarda uzlaşmaya dayalı çözümler arıyoruz.",
      ],
      fa: [
        "امور خانوادگی شخصی و اغلب فوری‌اند. ما با رازداری در دادگاه‌های خانواده مشاوره و وکالت می‌کنیم و هرجا به نفع موکل و فرزندان باشد، دنبال راه‌حل توافقی هستیم.",
      ],
    },
    services: {
      en: ["Divorce", "Custody and contact arrangements", "Maintenance", "Division of matrimonial property"],
      tr: ["Boşanma", "Velayet ve kişisel ilişki düzenlemesi", "Nafaka", "Evlilik mallarının paylaşımı"],
      fa: ["طلاق", "حضانت و ملاقات فرزند", "نفقه", "تقسیم اموال مشترک"],
    },
    relatedAttorneySlugs: [],
  },
  {
    slug: "litigation",
    title: { en: "Litigation & dispute resolution", tr: "Dava ve uyuşmazlık çözümü", fa: "دعاوی و حل اختلاف" },
    summary: {
      en: "Representation before the courts of Northern Cyprus, and enforcement of judgments.",
      tr: "Kuzey Kıbrıs mahkemelerinde temsil ve kararların icrası.",
      fa: "وکالت در دادگاه‌های قبرس شمالی و اجرای احکام.",
    },
    description: {
      en: [
        "When a dispute cannot be settled, we prepare the case and represent clients in court, and we pursue enforcement once judgment is given. We always look first at whether negotiation or settlement serves the client better.",
      ],
      tr: [
        "Bir uyuşmazlık uzlaşmayla çözülemediğinde davayı hazırlıyor, müvekkillerimizi mahkemede temsil ediyor ve karardan sonra icra takibini yürütüyoruz. Her zaman önce müzakere veya sulhün müvekkilin yararına olup olmadığına bakıyoruz.",
      ],
      fa: [
        "وقتی اختلاف با سازش حل نشود، پرونده را آماده می‌کنیم، در دادگاه وکالت می‌کنیم و پس از صدور حکم، اجرای آن را پیگیری می‌کنیم. همیشه اول بررسی می‌کنیم که آیا مذاکره یا سازش برای موکل بهتر است.",
      ],
    },
    services: {
      en: ["Civil and commercial litigation", "Contract and property disputes", "Enforcement of judgments", "Negotiated settlements"],
      tr: ["Hukuk ve ticaret davaları", "Sözleşme ve mülkiyet uyuşmazlıkları", "Kararların icrası", "Müzakere yoluyla sulh"],
      fa: ["دعاوی حقوقی و تجاری", "اختلافات قراردادی و ملکی", "اجرای احکام", "سازش از راه مذاکره"],
    },
    relatedAttorneySlugs: [],
  },
];

export const practiceAreas: PracticeArea[] = practiceAreasSchema.parse(rawPracticeAreas);

export function getPracticeArea(slug: string): PracticeArea | undefined {
  return practiceAreas.find((a) => a.slug === slug);
}
