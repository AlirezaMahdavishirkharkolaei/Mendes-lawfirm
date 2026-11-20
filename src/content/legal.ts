import type { Locale } from "@/lib/i18n/config";

/**
 * Privacy Policy and Terms of Use, in every site language.
 * The firm should have a lawyer review these texts before relying on them;
 * edit here and redeploy. `{email}` is replaced with the public office e-mail.
 */

export interface LegalSection {
  h: string;
  p: string[];
}
export interface LegalDoc {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}

const UPDATED = "2026-11-20";

export const privacy: Record<Locale, LegalDoc> = {
  en: {
    title: "Privacy Policy",
    updated: UPDATED,
    intro: "This policy explains what personal data Mendes Law & Consultancy (Girne, North Cyprus) collects through this website, why, and the rights you have. We process personal data in line with the TRNC Personal Data Protection Law and, where it applies to you, the EU General Data Protection Regulation (GDPR).",
    sections: [
      { h: "Who is responsible", p: ["Mendes Law & Consultancy, Near Şht. Orhan Durusoy Sk, Girne 99300, North Cyprus, is the controller of the data described here. Contact: {email}."] },
      { h: "What we collect", p: ["Meeting requests: your name, e-mail, phone, company, the area of law, your message, the time you chose and your time zone.", "Accounts (Client Club and authors): name, e-mail, phone or university, a securely hashed password, and the cases, updates and documents linked to your account.", "AI assistant: the messages you type and the topics identified. Conversations are not linked to your identity or account.", "Articles: the text, files and author details you submit.", "Technical data: a session cookie when you sign in, your language choice, and a salted hash of your IP address used only to prevent abuse. We do not use advertising or analytics trackers."] },
      { h: "Why we use it", p: ["To answer and schedule your meeting request, provide legal services and keep you informed about your case (contract and legitimate interest); to publish articles you submit (consent); to protect the website from abuse (legitimate interest); and to meet legal and professional obligations."] },
      { h: "Who processes it for us", p: ["Cloudflare (hosting, database, file storage and e-mail delivery), Resend (e-mail delivery) and Google (Gemini AI, which receives the text of AI-assistant conversations and generates law explanations). They act on our instructions. Some of them may process data outside North Cyprus, under appropriate safeguards.", "We never sell personal data. We share client information with courts, authorities or other parties only when your matter or the law requires it."] },
      { h: "How long we keep it", p: ["Meeting requests that do not become a case: up to 24 months. Client files and documents: for as long as professional rules require after the matter closes. AI-assistant conversations: up to 12 months. Published articles: until you ask us to remove them. You can ask for earlier deletion where the law allows."] },
      { h: "Your rights", p: ["You can ask to access, correct or delete your data, to restrict or object to its use, to receive it in a portable format, and to withdraw consent at any time. Write to {email}. You may also complain to the TRNC Personal Data Protection Board or, if you are in the EU, to your local data protection authority."] },
      { h: "Security", p: ["Connections are encrypted (HTTPS), passwords are stored as one-way hashes, and each case and document is visible only to the client, their lawyer and administrators. Every download is logged. Please don't send passwords or highly sensitive data through the AI assistant."] },
      { h: "Changes", p: ["We may update this policy. The date at the top shows the latest version."] },
    ],
  },
  tr: {
    title: "Gizlilik Politikası",
    updated: UPDATED,
    intro: "Bu politika, Mendes Hukuk ve Danışmanlık'ın (Girne, Kuzey Kıbrıs) bu web sitesi aracılığıyla hangi kişisel verileri, neden topladığını ve haklarınızı açıklar. Kişisel verileri KKTC Kişisel Verilerin Korunması Yasası'na ve sizin için geçerli olduğu durumlarda AB Genel Veri Koruma Tüzüğü'ne (GDPR) uygun olarak işleriz.",
    sections: [
      { h: "Veri sorumlusu", p: ["Burada açıklanan verilerin sorumlusu Mendes Hukuk ve Danışmanlık, Near Şht. Orhan Durusoy Sk, Girne 99300, Kuzey Kıbrıs'tır. İletişim: {email}."] },
      { h: "Topladığımız veriler", p: ["Randevu talepleri: adınız, e-posta, telefon, şirket, hukuk alanı, mesajınız, seçtiğiniz saat ve saat diliminiz.", "Hesaplar (Müvekkil Kulübü ve yazarlar): ad, e-posta, telefon veya üniversite, güvenli şekilde özetlenmiş şifre ve hesabınıza bağlı dosyalar, güncellemeler ve belgeler.", "Yapay zekâ asistanı: yazdığınız mesajlar ve belirlenen konular. Sohbetler kimliğinize veya hesabınıza bağlanmaz.", "Makaleler: gönderdiğiniz metin, dosyalar ve yazar bilgileri.", "Teknik veriler: giriş yaptığınızda bir oturum çerezi, dil tercihiniz ve yalnızca kötüye kullanımı önlemek için IP adresinizin tuzlanmış özeti. Reklam veya analiz takipçisi kullanmayız."] },
      { h: "Neden kullanıyoruz", p: ["Randevu talebinizi yanıtlamak ve planlamak, hukuki hizmet sunmak ve dosyanız hakkında sizi bilgilendirmek (sözleşme ve meşru menfaat); gönderdiğiniz makaleleri yayımlamak (açık rıza); siteyi kötüye kullanıma karşı korumak (meşru menfaat) ve yasal ve mesleki yükümlülüklerimizi yerine getirmek için."] },
      { h: "Verileri bizim adımıza işleyenler", p: ["Cloudflare (barındırma, veritabanı, dosya depolama ve e-posta gönderimi), Resend (e-posta gönderimi) ve Google (yapay zekâ asistanı sohbetlerinin metnini alan ve yasa açıklamaları üreten Gemini). Bu şirketler talimatlarımız doğrultusunda çalışır; bazıları verileri uygun güvencelerle Kuzey Kıbrıs dışında işleyebilir.", "Kişisel verileri asla satmayız. Müvekkil bilgilerini mahkemeler, makamlar veya diğer taraflarla yalnızca dosyanız ya da yasa gerektirdiğinde paylaşırız."] },
      { h: "Saklama süresi", p: ["Dosyaya dönüşmeyen randevu talepleri: en fazla 24 ay. Müvekkil dosyaları ve belgeler: dosya kapandıktan sonra meslek kurallarının gerektirdiği süre boyunca. Yapay zekâ sohbetleri: en fazla 12 ay. Yayımlanan makaleler: kaldırılmasını isteyene kadar. Yasanın izin verdiği durumlarda daha erken silinmesini talep edebilirsiniz."] },
      { h: "Haklarınız", p: ["Verilerinize erişmeyi, düzeltilmesini veya silinmesini, işlenmesinin kısıtlanmasını veya itiraz etmeyi, taşınabilir biçimde almayı ve rızanızı istediğiniz zaman geri çekmeyi talep edebilirsiniz. {email} adresine yazın. KKTC Kişisel Verileri Koruma Kurulu'na veya AB'de iseniz yerel veri koruma otoritesine şikâyette bulunabilirsiniz."] },
      { h: "Güvenlik", p: ["Bağlantılar şifrelidir (HTTPS), şifreler tek yönlü özet olarak saklanır ve her dosya ile belge yalnızca müvekkile, avukatına ve yöneticilere görünür. Her indirme kayıt altına alınır. Lütfen yapay zekâ asistanına şifre veya çok hassas bilgi yazmayın."] },
      { h: "Değişiklikler", p: ["Bu politikayı güncelleyebiliriz. Üstteki tarih en son sürümü gösterir."] },
    ],
  },
  fa: {
    title: "سیاست حریم خصوصی",
    updated: UPDATED,
    intro: "این سیاست توضیح می‌دهد که مؤسسه حقوقی و مشاوره مندس (گیرنه، قبرس شمالی) از طریق این وب‌سایت چه داده‌های شخصی‌ای را و به چه دلیل جمع‌آوری می‌کند و شما چه حقوقی دارید. ما داده‌های شخصی را مطابق قانون حمایت از داده‌های شخصی جمهوری ترک قبرس شمالی و در صورت شمول، مقررات عمومی حفاظت از داده اتحادیه اروپا (GDPR) پردازش می‌کنیم.",
    sections: [
      { h: "مسئول پردازش", p: ["مسئول داده‌های شرح‌داده‌شده در اینجا مؤسسه حقوقی و مشاوره مندس به نشانی Near Şht. Orhan Durusoy Sk, Girne 99300، قبرس شمالی است. تماس: {email}."] },
      { h: "چه داده‌هایی جمع‌آوری می‌کنیم", p: ["درخواست جلسه: نام، ایمیل، تلفن، شرکت، حوزه حقوقی، پیام شما، زمان انتخابی و منطقه زمانی شما.", "حساب کاربری (باشگاه موکلین و نویسندگان): نام، ایمیل، تلفن یا دانشگاه، رمز عبوری که به‌صورت امن هش شده، و پرونده‌ها، به‌روزرسانی‌ها و مدارک مرتبط با حساب شما.", "دستیار هوش مصنوعی: پیام‌هایی که می‌نویسید و موضوعات تشخیص‌داده‌شده. گفتگوها به هویت یا حساب شما متصل نمی‌شوند.", "مقالات: متن، فایل‌ها و اطلاعات نویسنده که ارسال می‌کنید.", "داده‌های فنی: یک کوکی نشست هنگام ورود، زبان انتخابی شما، و هش نمک‌زده نشانی IP که فقط برای جلوگیری از سوءاستفاده به کار می‌رود. از ردیاب‌های تبلیغاتی یا آماری استفاده نمی‌کنیم."] },
      { h: "چرا از آن استفاده می‌کنیم", p: ["برای پاسخ و برنامه‌ریزی درخواست جلسه، ارائه خدمات حقوقی و آگاه نگه‌داشتن شما از روند پرونده (قرارداد و منافع مشروع)؛ انتشار مقالاتی که ارسال می‌کنید (رضایت)؛ محافظت از سایت در برابر سوءاستفاده (منافع مشروع)؛ و انجام تکالیف قانونی و حرفه‌ای."] },
      { h: "چه کسانی داده را برای ما پردازش می‌کنند", p: ["Cloudflare (میزبانی، پایگاه داده، ذخیره فایل و ارسال ایمیل)، Resend (ارسال ایمیل) و Google (هوش مصنوعی Gemini که متن گفتگوهای دستیار را دریافت می‌کند و توضیح قوانین را تولید می‌کند). این شرکت‌ها طبق دستور ما عمل می‌کنند و برخی ممکن است داده را با تضمین‌های مناسب خارج از قبرس شمالی پردازش کنند.", "ما هرگز داده‌های شخصی را نمی‌فروشیم. اطلاعات موکل را فقط وقتی پرونده یا قانون اقتضا کند با دادگاه‌ها، مقامات یا اشخاص دیگر به اشتراک می‌گذاریم."] },
      { h: "مدت نگهداری", p: ["درخواست‌های جلسه‌ای که به پرونده تبدیل نمی‌شوند: حداکثر ۲۴ ماه. پرونده‌ها و مدارک موکلین: تا مدتی که مقررات حرفه‌ای پس از مختومه شدن پرونده الزام می‌کند. گفتگوهای دستیار هوش مصنوعی: حداکثر ۱۲ ماه. مقالات منتشرشده: تا زمانی که درخواست حذف کنید. در مواردی که قانون اجازه دهد می‌توانید درخواست حذف زودتر بدهید."] },
      { h: "حقوق شما", p: ["می‌توانید درخواست دسترسی، اصلاح یا حذف داده‌هایتان، محدود کردن یا اعتراض به پردازش، دریافت داده در قالب قابل انتقال و پس گرفتن رضایت در هر زمان را بدهید. به {email} بنویسید. همچنین می‌توانید به هیئت حمایت از داده‌های شخصی قبرس شمالی یا اگر در اتحادیه اروپا هستید، به مرجع حفاظت از داده کشورتان شکایت کنید."] },
      { h: "امنیت", p: ["ارتباط‌ها رمزنگاری می‌شوند (HTTPS)، رمزهای عبور به‌صورت هش یک‌طرفه ذخیره می‌شوند و هر پرونده و مدرک فقط برای موکل، وکیل او و مدیران قابل مشاهده است. هر دانلود ثبت می‌شود. لطفاً رمز عبور یا اطلاعات بسیار حساس را در دستیار هوش مصنوعی وارد نکنید."] },
      { h: "تغییرات", p: ["ممکن است این سیاست را به‌روز کنیم. تاریخ بالای صفحه آخرین نسخه را نشان می‌دهد."] },
    ],
  },
  ru: {
    title: "Политика конфиденциальности",
    updated: UPDATED,
    intro: "Эта политика объясняет, какие персональные данные Mendes Law & Consultancy (Гирне, Северный Кипр) собирает через этот сайт, зачем, и какие у вас есть права. Мы обрабатываем персональные данные в соответствии с Законом ТРСК о защите персональных данных и, если он к вам применим, Общим регламентом ЕС по защите данных (GDPR).",
    sections: [
      { h: "Кто отвечает за данные", p: ["Контролёр описанных здесь данных — Mendes Law & Consultancy, Near Şht. Orhan Durusoy Sk, Girne 99300, Северный Кипр. Контакт: {email}."] },
      { h: "Что мы собираем", p: ["Заявки на встречу: имя, e-mail, телефон, компания, область права, ваше сообщение, выбранное время и ваш часовой пояс.", "Аккаунты (Клуб клиентов и авторы): имя, e-mail, телефон или университет, надёжно хешированный пароль, а также дела, обновления и документы, связанные с аккаунтом.", "ИИ-ассистент: введённые вами сообщения и определённые темы. Диалоги не связываются с вашей личностью или аккаунтом.", "Статьи: текст, файлы и данные автора, которые вы отправляете.", "Технические данные: cookie сессии при входе, выбранный язык и хеш IP-адреса с «солью», используемый только для защиты от злоупотреблений. Мы не используем рекламные и аналитические трекеры."] },
      { h: "Зачем мы их используем", p: ["Чтобы ответить на заявку и назначить встречу, оказывать юридические услуги и информировать вас о ходе дела (договор и законный интерес); публиковать присланные статьи (согласие); защищать сайт от злоупотреблений (законный интерес); выполнять правовые и профессиональные обязанности."] },
      { h: "Кто обрабатывает данные по нашему поручению", p: ["Cloudflare (хостинг, база данных, хранение файлов и отправка e-mail), Resend (отправка e-mail) и Google (ИИ Gemini, который получает текст диалогов с ассистентом и готовит пояснения к законам). Они действуют по нашим инструкциям; некоторые могут обрабатывать данные за пределами Северного Кипра с надлежащими гарантиями.", "Мы никогда не продаём персональные данные. Информацию клиентов мы передаём судам, органам власти или третьим лицам только тогда, когда этого требуют ваше дело или закон."] },
      { h: "Сколько мы храним данные", p: ["Заявки, не ставшие делом: до 24 месяцев. Материалы и документы клиентов: столько, сколько требуют профессиональные правила после закрытия дела. Диалоги с ИИ-ассистентом: до 12 месяцев. Опубликованные статьи: пока вы не попросите их удалить. Где закон позволяет, вы можете попросить удалить данные раньше."] },
      { h: "Ваши права", p: ["Вы можете запросить доступ к данным, их исправление или удаление, ограничение или возражение против обработки, получение данных в переносимом формате и в любой момент отозвать согласие. Пишите на {email}. Вы также можете подать жалобу в Совет по защите персональных данных ТРСК или, если вы находитесь в ЕС, в местный надзорный орган."] },
      { h: "Безопасность", p: ["Соединения шифруются (HTTPS), пароли хранятся в виде необратимых хешей, а каждое дело и документ видны только клиенту, его юристу и администраторам. Каждое скачивание фиксируется. Пожалуйста, не отправляйте ИИ-ассистенту пароли и особо чувствительные данные."] },
      { h: "Изменения", p: ["Мы можем обновлять эту политику. Дата вверху указывает последнюю версию."] },
    ],
  },
  ar: {
    title: "سياسة الخصوصية",
    updated: UPDATED,
    intro: "توضح هذه السياسة البيانات الشخصية التي يجمعها مكتب منديس للمحاماة والاستشارات (غيرنه، شمال قبرص) عبر هذا الموقع، وسبب جمعها، والحقوق التي تتمتع بها. نعالج البيانات الشخصية وفقًا لقانون حماية البيانات الشخصية في جمهورية شمال قبرص التركية، ووفقًا للائحة الأوروبية العامة لحماية البيانات (GDPR) عندما تنطبق عليك.",
    sections: [
      { h: "الجهة المسؤولة", p: ["الجهة المسؤولة عن البيانات الموضحة هنا هي مكتب منديس للمحاماة والاستشارات، Near Şht. Orhan Durusoy Sk, Girne 99300، شمال قبرص. للتواصل: {email}."] },
      { h: "ما الذي نجمعه", p: ["طلبات الاجتماع: الاسم، البريد الإلكتروني، الهاتف، الشركة، مجال القانون، رسالتك، الموعد الذي اخترته ومنطقتك الزمنية.", "الحسابات (نادي العملاء والكتّاب): الاسم، البريد الإلكتروني، الهاتف أو الجامعة، كلمة مرور مُجزّأة بشكل آمن، والقضايا والتحديثات والمستندات المرتبطة بحسابك.", "المساعد الذكي: الرسائل التي تكتبها والمواضيع التي حُددت. لا تُربط المحادثات بهويتك أو بحسابك.", "المقالات: النص والملفات وبيانات الكاتب التي ترسلها.", "البيانات التقنية: ملف تعريف ارتباط للجلسة عند تسجيل الدخول، واللغة التي اخترتها، وقيمة مُجزّأة مملّحة لعنوان IP تُستخدم فقط لمنع إساءة الاستخدام. لا نستخدم أدوات تتبّع إعلانية أو تحليلية."] },
      { h: "لماذا نستخدمها", p: ["للرد على طلب الاجتماع وجدولته، وتقديم الخدمات القانونية وإبقائك على اطلاع بقضيتك (العقد والمصلحة المشروعة)؛ ولنشر المقالات التي ترسلها (الموافقة)؛ ولحماية الموقع من إساءة الاستخدام (المصلحة المشروعة)؛ وللوفاء بالالتزامات القانونية والمهنية."] },
      { h: "من يعالج البيانات نيابةً عنا", p: ["Cloudflare (الاستضافة وقاعدة البيانات وتخزين الملفات وإرسال البريد)، وResend (إرسال البريد)، وGoogle (الذكاء الاصطناعي Gemini الذي يتلقى نص محادثات المساعد ويُعدّ شروح القوانين). تعمل هذه الجهات وفق تعليماتنا، وقد يعالج بعضها البيانات خارج شمال قبرص مع ضمانات مناسبة.", "لا نبيع البيانات الشخصية أبدًا. لا نشارك معلومات العملاء مع المحاكم أو السلطات أو أطراف أخرى إلا عندما تقتضي القضية أو القانون ذلك."] },
      { h: "مدة الاحتفاظ", p: ["طلبات الاجتماع التي لا تتحول إلى قضية: حتى 24 شهرًا. ملفات العملاء ومستنداتهم: طوال المدة التي تفرضها القواعد المهنية بعد إغلاق القضية. محادثات المساعد الذكي: حتى 12 شهرًا. المقالات المنشورة: حتى تطلب إزالتها. يمكنك طلب الحذف في وقت أبكر حيث يسمح القانون."] },
      { h: "حقوقك", p: ["يمكنك طلب الوصول إلى بياناتك أو تصحيحها أو حذفها، وتقييد معالجتها أو الاعتراض عليها، والحصول عليها بصيغة قابلة للنقل، وسحب موافقتك في أي وقت. راسلنا على {email}. ويمكنك أيضًا تقديم شكوى إلى مجلس حماية البيانات الشخصية في شمال قبرص، أو إلى سلطة حماية البيانات المحلية إن كنت في الاتحاد الأوروبي."] },
      { h: "الأمان", p: ["الاتصالات مشفّرة (HTTPS)، وتُخزّن كلمات المرور بتجزئة أحادية الاتجاه، ولا يرى كل قضية ومستند إلا العميل ومحاميه والمسؤولون. يُسجَّل كل تنزيل. يرجى عدم إرسال كلمات المرور أو البيانات شديدة الحساسية عبر المساعد الذكي."] },
      { h: "التغييرات", p: ["قد نحدّث هذه السياسة. يشير التاريخ في الأعلى إلى أحدث إصدار."] },
    ],
  },
};

export const terms: Record<Locale, LegalDoc> = {
  en: {
    title: "Terms of Use",
    updated: UPDATED,
    intro: "By using this website you agree to these terms. Please read them together with our Privacy Policy.",
    sections: [
      { h: "General information, not legal advice", p: ["Content on this site — including the AI assistant's answers and the plain-language law explanations — is general information. It is not legal advice and may not reflect the latest changes in the law. Do not act on it without speaking to a lawyer.", "Explanations marked “AI-generated, not yet reviewed” were drafted by artificial intelligence and have not been checked by our lawyers."] },
      { h: "No lawyer–client relationship", p: ["Using the website, chatting with the assistant or requesting a meeting does not by itself create a lawyer–client relationship. That relationship begins only when we confirm in writing that we act for you."] },
      { h: "Meetings", p: ["Meeting requests are subject to confirmation by the firm. You can cancel or ask for another time using the link in your e-mails."] },
      { h: "Accounts", p: ["Keep your password confidential and tell us at once if you think your account has been misused. You are responsible for the documents you upload and confirm that you have the right to share them."] },
      { h: "Publishing articles", p: ["When you submit an article you confirm that it is your original work, that it does not infringe anyone's rights, and that its sources are cited. You keep the copyright and grant Mendes a non-exclusive, worldwide, royalty-free licence to publish, display and archive it on this website with your name. We may edit for formatting, and we may decline or remove any article. You can ask us to take your article down at any time."] },
      { h: "Acceptable use", p: ["Do not misuse the website: no attempts to gain unauthorised access, no automated scraping that burdens the service, no unlawful, misleading or abusive content, and no attempts to make the AI assistant produce harmful output."] },
      { h: "Liability", p: ["The website is provided “as is”. To the extent the law allows, Mendes is not liable for loss arising from reliance on general information on the site or from temporary unavailability of the service. Nothing here limits liability that cannot be limited by law."] },
      { h: "Governing law", p: ["These terms are governed by the laws of the Turkish Republic of Northern Cyprus. The courts of Girne (Kyrenia) have jurisdiction, without prejudice to mandatory consumer protections in your country."] },
      { h: "Contact", p: ["Questions about these terms: {email}."] },
    ],
  },
  tr: {
    title: "Kullanım Koşulları",
    updated: UPDATED,
    intro: "Bu web sitesini kullanarak bu koşulları kabul etmiş olursunuz. Lütfen Gizlilik Politikamızla birlikte okuyun.",
    sections: [
      { h: "Genel bilgi, hukuki tavsiye değil", p: ["Bu sitedeki içerik — yapay zekâ asistanının yanıtları ve sade dilli yasa açıklamaları dahil — genel bilgi niteliğindedir. Hukuki tavsiye değildir ve mevzuattaki son değişiklikleri yansıtmayabilir. Bir avukatla görüşmeden buna dayanarak işlem yapmayın.", "“Yapay zekâ tarafından oluşturuldu, henüz incelenmedi” etiketli açıklamalar yapay zekâ tarafından hazırlanmıştır ve avukatlarımızca kontrol edilmemiştir."] },
      { h: "Avukat–müvekkil ilişkisi doğmaz", p: ["Siteyi kullanmak, asistanla sohbet etmek veya randevu talep etmek tek başına avukat–müvekkil ilişkisi kurmaz. Bu ilişki, sizi temsil ettiğimizi yazılı olarak teyit ettiğimizde başlar."] },
      { h: "Görüşmeler", p: ["Randevu talepleri büronun onayına tabidir. E-postalarınızdaki bağlantıyla iptal edebilir veya başka bir saat isteyebilirsiniz."] },
      { h: "Hesaplar", p: ["Şifrenizi gizli tutun ve hesabınızın kötüye kullanıldığını düşünürseniz hemen bize bildirin. Yüklediğiniz belgelerden siz sorumlusunuz ve bunları paylaşma hakkınız olduğunu kabul edersiniz."] },
      { h: "Makale yayımlama", p: ["Bir makale gönderdiğinizde, bunun özgün çalışmanız olduğunu, kimsenin haklarını ihlal etmediğini ve kaynakların gösterildiğini kabul edersiniz. Telif hakkı sizde kalır; Mendes'e makaleyi adınızla bu sitede yayımlama, gösterme ve arşivleme için münhasır olmayan, dünya çapında ve ücretsiz bir lisans verirsiniz. Biçimlendirme amacıyla düzenleme yapabilir, herhangi bir makaleyi reddedebilir veya kaldırabiliriz. Makalenizin kaldırılmasını istediğiniz zaman isteyebilirsiniz."] },
      { h: "Kabul edilebilir kullanım", p: ["Siteyi kötüye kullanmayın: yetkisiz erişim girişimi, hizmete yük bindiren otomatik veri çekme, hukuka aykırı, yanıltıcı veya kötü niyetli içerik ve yapay zekâ asistanına zararlı çıktı ürettirme girişimi yasaktır."] },
      { h: "Sorumluluk", p: ["Site “olduğu gibi” sunulur. Yasanın izin verdiği ölçüde Mendes, sitedeki genel bilgilere dayanılmasından veya hizmetin geçici olarak kullanılamamasından doğan zararlardan sorumlu değildir. Bu hükümler, yasa gereği sınırlandırılamayan sorumluluğu sınırlamaz."] },
      { h: "Uygulanacak hukuk", p: ["Bu koşullar Kuzey Kıbrıs Türk Cumhuriyeti hukukuna tabidir. Ülkenizdeki zorunlu tüketici korumaları saklı kalmak kaydıyla Girne mahkemeleri yetkilidir."] },
      { h: "İletişim", p: ["Bu koşullarla ilgili sorularınız için: {email}."] },
    ],
  },
  fa: {
    title: "شرایط استفاده",
    updated: UPDATED,
    intro: "با استفاده از این وب‌سایت این شرایط را می‌پذیرید. لطفاً آن را همراه با سیاست حریم خصوصی ما مطالعه کنید.",
    sections: [
      { h: "اطلاعات عمومی، نه مشاوره حقوقی", p: ["محتوای این سایت — از جمله پاسخ‌های دستیار هوش مصنوعی و توضیحات ساده قوانین — اطلاعات عمومی است، مشاوره حقوقی نیست و ممکن است آخرین تغییرات قانون را منعکس نکند. بدون مشورت با وکیل بر اساس آن اقدام نکنید.", "توضیحاتی که برچسب «تولیدشده با هوش مصنوعی، هنوز بازبینی نشده» دارند توسط هوش مصنوعی نوشته شده‌اند و وکلای ما آن‌ها را بررسی نکرده‌اند."] },
      { h: "ایجاد نشدن رابطه وکیل و موکل", p: ["استفاده از سایت، گفتگو با دستیار یا درخواست جلسه به‌تنهایی رابطه وکیل و موکل ایجاد نمی‌کند. این رابطه فقط زمانی آغاز می‌شود که ما کتباً تأیید کنیم وکالت شما را بر عهده گرفته‌ایم."] },
      { h: "جلسات", p: ["درخواست‌های جلسه منوط به تأیید مؤسسه است. می‌توانید با لینک موجود در ایمیل‌هایتان جلسه را لغو کنید یا زمان دیگری بخواهید."] },
      { h: "حساب کاربری", p: ["رمز عبور خود را محرمانه نگه دارید و اگر فکر می‌کنید از حسابتان سوءاستفاده شده، فوراً به ما اطلاع دهید. مسئولیت مدارکی که بارگذاری می‌کنید با شماست و تأیید می‌کنید که حق اشتراک‌گذاری آن‌ها را دارید."] },
      { h: "انتشار مقاله", p: ["با ارسال مقاله تأیید می‌کنید که اثر اصیل شماست، حقوق کسی را نقض نمی‌کند و منابع آن ذکر شده است. حق نشر (کپی‌رایت) نزد شما می‌ماند و به مندس مجوزی غیرانحصاری، جهانی و رایگان می‌دهید تا آن را با نام شما در این وب‌سایت منتشر، نمایش و بایگانی کند. ممکن است برای قالب‌بندی ویرایش کنیم و هر مقاله‌ای را رد یا حذف کنیم. هر زمان بخواهید می‌توانید درخواست حذف مقاله‌تان را بدهید."] },
      { h: "استفاده مجاز", p: ["از سایت سوءاستفاده نکنید: تلاش برای دسترسی غیرمجاز، استخراج خودکار داده که بر سرویس فشار بیاورد، محتوای غیرقانونی، گمراه‌کننده یا توهین‌آمیز، و تلاش برای وادار کردن دستیار هوش مصنوعی به تولید محتوای مضر ممنوع است."] },
      { h: "مسئولیت", p: ["این سایت «همان‌طور که هست» ارائه می‌شود. تا حدی که قانون اجازه دهد، مندس مسئول زیان‌های ناشی از اتکا به اطلاعات عمومی سایت یا در دسترس نبودن موقت سرویس نیست. هیچ‌یک از این بندها مسئولیتی را که قانوناً قابل محدود شدن نیست محدود نمی‌کند."] },
      { h: "قانون حاکم", p: ["این شرایط تابع قوانین جمهوری ترک قبرس شمالی است و دادگاه‌های گیرنه صلاحیت رسیدگی دارند، بدون آنکه به حمایت‌های اجباری مصرف‌کننده در کشور شما خللی وارد شود."] },
      { h: "تماس", p: ["برای پرسش درباره این شرایط: {email}."] },
    ],
  },
  ru: {
    title: "Условия использования",
    updated: UPDATED,
    intro: "Пользуясь этим сайтом, вы принимаете настоящие условия. Пожалуйста, читайте их вместе с нашей Политикой конфиденциальности.",
    sections: [
      { h: "Общая информация, а не юридическая консультация", p: ["Материалы сайта, включая ответы ИИ-ассистента и пояснения к законам простым языком, носят общий характер. Это не юридическая консультация, и они могут не отражать последние изменения законодательства. Не принимайте решений на их основе без консультации с юристом.", "Пояснения с пометкой «Создано ИИ, ещё не проверено» подготовлены искусственным интеллектом и не проверены нашими юристами."] },
      { h: "Отношения «юрист — клиент» не возникают", p: ["Использование сайта, общение с ассистентом или заявка на встречу сами по себе не создают отношений «юрист — клиент». Они возникают только после нашего письменного подтверждения, что мы представляем ваши интересы."] },
      { h: "Встречи", p: ["Заявки на встречу подлежат подтверждению фирмой. Отменить встречу или попросить другое время можно по ссылке в ваших письмах."] },
      { h: "Аккаунты", p: ["Храните пароль в тайне и сразу сообщите нам, если подозреваете неправомерное использование аккаунта. Вы отвечаете за загружаемые документы и подтверждаете своё право ими делиться."] },
      { h: "Публикация статей", p: ["Отправляя статью, вы подтверждаете, что это ваша оригинальная работа, она не нарушает чьих-либо прав, а источники указаны. Авторские права остаются за вами; вы предоставляете Mendes неисключительную, всемирную и безвозмездную лицензию на публикацию, показ и архивирование статьи на этом сайте под вашим именем. Мы можем редактировать оформление, а также отклонить или удалить любую статью. Вы можете в любой момент попросить снять статью с публикации."] },
      { h: "Допустимое использование", p: ["Не злоупотребляйте сайтом: запрещены попытки несанкционированного доступа, автоматический сбор данных, создающий нагрузку на сервис, незаконный, вводящий в заблуждение или оскорбительный контент, а также попытки заставить ИИ-ассистента выдавать вредоносные ответы."] },
      { h: "Ответственность", p: ["Сайт предоставляется «как есть». В пределах, допускаемых законом, Mendes не несёт ответственности за убытки, вызванные использованием общей информации с сайта или временной недоступностью сервиса. Ничто здесь не ограничивает ответственность, которая не может быть ограничена по закону."] },
      { h: "Применимое право", p: ["Настоящие условия регулируются правом Турецкой Республики Северного Кипра. Споры рассматриваются судами Гирне (Кирении) без ущерба для обязательной защиты прав потребителей в вашей стране."] },
      { h: "Контакты", p: ["Вопросы об этих условиях: {email}."] },
    ],
  },
  ar: {
    title: "شروط الاستخدام",
    updated: UPDATED,
    intro: "باستخدامك هذا الموقع فإنك توافق على هذه الشروط. يرجى قراءتها مع سياسة الخصوصية الخاصة بنا.",
    sections: [
      { h: "معلومات عامة وليست استشارة قانونية", p: ["المحتوى على هذا الموقع — بما في ذلك إجابات المساعد الذكي وشروح القوانين المبسّطة — معلومات عامة، وليس استشارة قانونية، وقد لا يعكس أحدث التعديلات التشريعية. لا تتصرف بناءً عليه دون استشارة محامٍ.", "الشروح التي تحمل وسم «أُعدّ بالذكاء الاصطناعي ولم يُراجَع بعد» كتبها الذكاء الاصطناعي ولم يدققها محامونا."] },
      { h: "لا تنشأ علاقة محامٍ بموكّل", p: ["استخدام الموقع أو التحدث مع المساعد أو طلب اجتماع لا يُنشئ بحد ذاته علاقة محامٍ بموكّل. تبدأ هذه العلاقة فقط عندما نؤكد كتابيًا أننا نمثّلك."] },
      { h: "الاجتماعات", p: ["تخضع طلبات الاجتماع لتأكيد المكتب. يمكنك الإلغاء أو طلب موعد آخر عبر الرابط الموجود في رسائلك."] },
      { h: "الحسابات", p: ["حافظ على سرية كلمة المرور وأبلغنا فورًا إذا اعتقدت أن حسابك استُخدم دون إذن. أنت مسؤول عن المستندات التي ترفعها وتؤكد أن لديك الحق في مشاركتها."] },
      { h: "نشر المقالات", p: ["عند إرسال مقال، تؤكد أنه عملك الأصلي، وأنه لا ينتهك حقوق أحد، وأن مصادره مذكورة. تبقى حقوق المؤلف لك، وتمنح منديس ترخيصًا غير حصري وعالميًا ومجانيًا لنشره وعرضه وأرشفته على هذا الموقع باسمك. قد نُجري تعديلات على التنسيق، ولنا أن نرفض أي مقال أو نزيله. ويمكنك طلب إزالة مقالك في أي وقت."] },
      { h: "الاستخدام المقبول", p: ["لا تُسئ استخدام الموقع: يُحظر محاولة الوصول غير المصرّح به، والجمع الآلي للبيانات الذي يُثقل الخدمة، والمحتوى غير القانوني أو المضلل أو المسيء، ومحاولة دفع المساعد الذكي إلى إنتاج محتوى ضار."] },
      { h: "المسؤولية", p: ["يُقدَّم الموقع «كما هو». وبالقدر الذي يسمح به القانون، لا تتحمل منديس المسؤولية عن الخسائر الناتجة عن الاعتماد على المعلومات العامة في الموقع أو عن تعذّر الوصول المؤقت إلى الخدمة. ولا يحدّ أي شيء هنا من المسؤولية التي لا يجوز تحديدها قانونًا."] },
      { h: "القانون الحاكم", p: ["تخضع هذه الشروط لقوانين جمهورية شمال قبرص التركية، وتختص محاكم غيرنه (كيرينيا) بالنظر في النزاعات، دون الإخلال بحمايات المستهلك الإلزامية في بلدك."] },
      { h: "التواصل", p: ["للاستفسار عن هذه الشروط: {email}."] },
    ],
  },
};
