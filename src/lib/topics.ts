import type { Locale } from "@/lib/i18n/config";

/**
 * Legal topics the platform understands. The chatbot classifies a
 * visitor's conversation into these keys and refers them to the team
 * member whose `specialties` contain the topic. `keywords` power the
 * offline fallback classifier used when no AI provider is configured,
 * and are matched case-insensitively in every site language.
 */
export const TOPICS = {
  contract: {
    label: { en: "Contract law", tr: "Sözleşmeler hukuku", fa: "حقوق قراردادها", ru: "Договорное право", ar: "قانون العقود" },
    keywords: ["contract", "agreement", "breach", "clause", "nda", "sözleşme", "ihlal", "قرارداد", "توافق‌نامه", "договор", "контракт", "عقد", "اتفاقية"],
  },
  international_trade: {
    label: { en: "International trade law", tr: "Uluslararası ticaret hukuku", fa: "حقوق تجارت بین‌الملل", ru: "Международное торговое право", ar: "قانون التجارة الدولية" },
    keywords: ["import", "export", "trade", "customs", "wto", "incoterms", "distribution", "ithalat", "ihracat", "gümrük", "ticaret", "واردات", "صادرات", "گمرک", "تجارت", "импорт", "экспорт", "таможн", "торгов", "استيراد", "تصدير", "جمارك", "تجارة"],
  },
  international_tax: {
    label: { en: "International tax law", tr: "Uluslararası vergi hukuku", fa: "حقوق مالیات بین‌الملل", ru: "Международное налоговое право", ar: "قانون الضرائب الدولية" },
    keywords: ["tax", "vat", "double taxation", "transfer pricing", "offshore", "tax haven", "vergi", "kdv", "مالیات", "ارزش افزوده", "налог", "НДС", "офшор", "ضريبة", "ضرائب"],
  },
  cybercrime: {
    label: { en: "Cybercrime & digital law", tr: "Siber suçlar ve bilişim hukuku", fa: "جرائم سایبری و حقوق فناوری", ru: "Киберпреступления и цифровое право", ar: "الجرائم الإلكترونية والقانون الرقمي" },
    keywords: ["hack", "cyber", "phishing", "fraud online", "data breach", "scam", "ransomware", "gdpr", "personal data", "siber", "dolandırıcılık", "kişisel veri", "هک", "سایبری", "کلاهبرداری اینترنتی", "فیشینگ", "داده شخصی", "кибер", "взлом", "мошенничеств", "персональн", "اختراق", "احتيال", "سيبراني", "بيانات شخصية"],
  },
  company_formation: {
    label: { en: "Company formation", tr: "Şirket kuruluşu", fa: "ثبت و تأسیس شرکت", ru: "Регистрация компаний", ar: "تأسيس الشركات" },
    keywords: ["incorporat", "company formation", "company registration", "set up a company", "open a company", "register a company", "start a company", "start a business", "shareholder", "branch office", "ltd company", "şirket kur", "şirket aç", "şirket tescil", "ortaklık", "ثبت شرکت", "تأسیس شرکت", "شرکت ثبت", "سهامدار", "регистрация компании", "регистрацию компании", "открыть компанию", "открыть фирму", "учредит", "акционер", "تأسيس شركة", "تسجيل شركة", "مساهم"],
  },
  investment: {
    label: { en: "Investment & finance", tr: "Yatırım ve finans", fa: "سرمایه‌گذاری و امور مالی", ru: "Инвестиции и финансы", ar: "الاستثمار والتمويل" },
    keywords: ["invest", "fund", "bank", "loan", "finance", "incentive", "yatırım", "banka", "kredi", "teşvik", "سرمایه", "بانک", "وام", "инвест", "банк", "кредит", "استثمار", "بنك", "قرض", "تمويل"],
  },
  real_estate: {
    label: { en: "Property & real estate", tr: "Gayrimenkul hukuku", fa: "املاک و مستغلات", ru: "Недвижимость", ar: "العقارات" },
    keywords: ["property", "title deed", "land", "apartment", "villa", "rent", "lease", "tapu", "arsa", "kira", "daire", "ملک", "سند", "زمین", "آپارتمان", "اجاره", "недвижим", "квартир", "аренд", "земл", "عقار", "سند ملكية", "أرض", "إيجار", "شقة"],
  },
  construction: {
    label: { en: "Construction & development", tr: "İnşaat ve proje geliştirme", fa: "ساخت‌وساز و توسعه", ru: "Строительство и девелопмент", ar: "البناء والتطوير" },
    keywords: ["construction", "contractor", "building permit", "developer", "project", "inşaat", "müteahhit", "yapı izni", "ساخت", "پیمانکار", "پروانه ساخت", "строительств", "подрядчик", "застройщ", "بناء", "مقاول", "تطوير"],
  },
  immigration: {
    label: { en: "Residency & immigration", tr: "Oturma izni ve göç", fa: "اقامت و مهاجرت", ru: "ВНЖ и иммиграция", ar: "الإقامة والهجرة" },
    keywords: ["residence permit", "residency", "visa", "work permit", "citizenship", "oturma izni", "çalışma izni", "vize", "اقامت", "ویزا", "مجوز کار", "вид на жительство", "виза", "разрешение на работу", "إقامة", "تأشيرة", "تصريح عمل"],
  },
  employment: {
    label: { en: "Employment law", tr: "İş hukuku", fa: "حقوق کار", ru: "Трудовое право", ar: "قانون العمل" },
    keywords: ["employee", "employer", "salary", "dismiss", "fired", "labour", "işçi", "işveren", "maaş", "kıdem", "کارگر", "کارفرما", "اخراج", "حقوق و دستمزد", "работник", "работодатель", "увольн", "зарплат", "موظف", "صاحب العمل", "فصل", "راتب"],
  },
  family: {
    label: { en: "Family & succession", tr: "Aile ve miras hukuku", fa: "خانواده و ارث", ru: "Семейное и наследственное право", ar: "الأسرة والميراث" },
    keywords: ["divorce", "marriage", "custody", "inheritance", "will", "estate", "boşanma", "evlilik", "velayet", "miras", "vasiyet", "طلاق", "ازدواج", "حضانت", "ارث", "وصیت", "развод", "брак", "опек", "наследств", "завещан", "طلاق", "زواج", "حضانة", "ميراث", "وصية"],
  },
  criminal: {
    label: { en: "Criminal defence", tr: "Ceza hukuku", fa: "حقوق کیفری", ru: "Уголовная защита", ar: "الدفاع الجنائي" },
    keywords: ["police", "arrest", "criminal", "charge", "court case", "polis", "tutuklama", "ceza", "suç", "پلیس", "بازداشت", "کیفری", "جرم", "полиция", "арест", "уголовн", "شرطة", "اعتقال", "جنائي", "جريمة"],
  },
  litigation: {
    label: { en: "Litigation & disputes", tr: "Dava ve uyuşmazlık çözümü", fa: "دعاوی و حل اختلاف", ru: "Судебные споры", ar: "التقاضي والنزاعات" },
    keywords: ["lawsuit", "sue", "dispute", "arbitration", "debt", "dava", "uyuşmazlık", "tahkim", "alacak", "دعوا", "شکایت", "داوری", "طلب", "иск", "спор", "арбитраж", "долг", "دعوى", "نزاع", "تحكيم", "دين"],
  },
  intellectual_property: {
    label: { en: "Intellectual property", tr: "Fikri mülkiyet", fa: "مالکیت فکری", ru: "Интеллектуальная собственность", ar: "الملكية الفكرية" },
    keywords: ["trademark", "copyright", "patent", "brand", "marka", "telif", "patent", "علامت تجاری", "کپی‌رایت", "اختراع", "товарный знак", "авторск", "патент", "علامة تجارية", "حقوق النشر", "براءة"],
  },
} as const satisfies Record<string, { label: Record<Locale, string>; keywords: readonly string[] }>;

export type TopicKey = keyof typeof TOPICS;
export const TOPIC_KEYS = Object.keys(TOPICS) as TopicKey[];

export function isTopic(value: unknown): value is TopicKey {
  return typeof value === "string" && value in TOPICS;
}

export function topicLabel(key: string, locale: Locale): string {
  return isTopic(key) ? TOPICS[key].label[locale] : key;
}

/** Offline keyword classifier — used when no AI provider is reachable. */
export function classifyTopics(text: string): TopicKey[] {
  const haystack = text.toLowerCase();
  const scored = TOPIC_KEYS.map((key) => ({
    key,
    score: TOPICS[key].keywords.filter((k) => haystack.includes(k.toLowerCase())).length,
  }))
    .filter((t) => t.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, 3).map((t) => t.key);
}
