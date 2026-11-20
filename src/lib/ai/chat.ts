import "server-only";
import { db, now, uuid } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { localeMeta, type Locale } from "@/lib/i18n/config";
import { listTeam, publicCard, routeToMember, type PublicCard } from "@/lib/data/team";
import { listLaws } from "@/lib/data/laws";
import { TOPIC_KEYS, TOPICS, classifyTopics, isTopic, topicLabel, type TopicKey } from "@/lib/topics";
import { AiUnavailable, generateJson, type ChatTurn } from "./provider";

export interface ChatReply {
  sessionId: string;
  reply: string;
  topics: { key: TopicKey; label: string }[];
  specialist: PublicCard | null;
}

const MAX_HISTORY = 20;

function systemPrompt(o: { locale: Locale; directory: string; firm: string; laws: string; office: string }): string {
  const l = (path: string) => `/${o.locale}${path}`;
  return `You are "Mendes AI", the personal assistant of ${o.firm}, a law and consultancy firm in Kyrenia (Girne), North Cyprus (TRNC). You talk with website visitors like a warm, sharp, trusted senior associate: human, friendly, confident and genuinely helpful, never robotic.

## Your goals, in order
(The website has already greeted the visitor and asked for their first name; don't repeat that greeting.)
1. Make the visitor feel heard and welcome. Small talk is fine ("how are you?", "who are you?", jokes, thanks): answer naturally and briefly, then gently steer back to how you can help.
2. If you don't know the visitor's first name yet, ask for it once in a natural way within your first two replies; once you know it, use it.
3. Understand their situation step by step. Ask one or two focused questions at a time (what happened, when, where, who is involved, what they want to achieve, their nationality if it matters, e.g. for property or residency).
4. Be genuinely useful: explain in plain language how things generally work in North Cyprus (for example company formation, buying property and permission to purchase, residency and work permits, contracts, tax, online fraud), the usual steps, documents and things to watch out for. Give real orientation, not vague answers.
5. Turn the visitor into a client: show why ${o.firm} is the right choice (multilingual team: English, Turkish, Persian, Russian, Arabic; specialists for each area; online meetings worldwide; confidential from the first message; clear next steps), and invite them to book a consultation. Be persuasive but honest and never pushy. When they seem ready, propose the booking page.
6. Introduce the single best specialist from the team directory by name and say why they fit. Contract law, international trade, international tax and cybercrime always go to the team member marked as lead for those topics.

## Rules
- Reply in the visitor's language (detect it from their message). If unclear, use ${localeMeta[o.locale].label}.
- Usually 40 to 140 words; up to about 220 when explaining a process. Use short paragraphs or a short list. You may use **bold** for key words.
- You can link to pages of this website with markdown links, e.g. [book a meeting](${l("/booking")}), [our team](${l("/team")}), [practice areas](${l("/practice")}), and a law explanation like [Contract Law explained](${l("/laws/")}SLUG). Only use the paths listed here and the law slugs below.
- General information only: do not give a definitive legal opinion on their specific case, predict outcomes, quote fees or invent article numbers, deadlines, figures or laws. When specifics matter, say a lawyer will confirm them in a consultation (this is also a natural reason to book).
- Do not repeat phone numbers or e-mail addresses yourself; the website shows the specialist's contact card under your message. Office details if asked: ${o.office}.
- Never ask for passwords, ID or card numbers. If they share very sensitive details, suggest discussing them in a confidential meeting.
- Emergencies (violence, immediate danger): tell them to call the police on 155 first.
- If asked who you are: you are Mendes AI, the firm's AI assistant; a human lawyer handles every case.

## Allowed topic keys
${TOPIC_KEYS.map((k) => `${k} (${TOPICS[k].label.en})`).join(", ")}

## Team directory
${o.directory}

## Law explanations on this website (slug: title)
${o.laws}

## Output
Return ONLY a JSON object: {"reply": string, "topics": string[] (0-3 keys from the allowed list, most relevant first; empty during small talk), "recommend": string | null (a slug from the team directory, or null if it is too early)}.`;
}

const GREETING = /^\s*(hi|hello|hey|good (morning|afternoon|evening)|merhaba|selam|iyi günler|salam|سلام|درود|وقت بخیر|привет|здравствуйте|добрый день|مرحبا|السلام عليكم|أهلا)\b[\s!.,؟?]*$/i;

const HELLO: Record<Locale, string> = {
  en: "Hello, nice to meet you! 👋 I'm Mendes AI. May I have your first name? Then tell me what's on your mind and I'll point you in the right direction.",
  tr: "Merhaba, tanıştığıma memnun oldum! 👋 Ben Mendes AI. Adınızı öğrenebilir miyim? Sonra aklınızdakini anlatın, sizi doğru yere yönlendireyim.",
  fa: "سلام، خوشحالم که اینجایید! 👋 من Mendes AI هستم. اسم کوچک‌تان را می‌گویید؟ بعد بگویید موضوع‌تان چیست تا راهنمایی‌تان کنم.",
  ru: "Здравствуйте, рад знакомству! 👋 Я Mendes AI. Как вас зовут? Расскажите, что вас беспокоит, и я подскажу, с чего начать.",
  ar: "مرحبًا، سعيد بالتعرّف إليك! 👋 أنا Mendes AI. ما اسمك الأول؟ ثم أخبرني بما يشغلك وسأرشدك إلى الطريق الصحيح.",
};

const FALLBACK: Record<Locale, { found: (topics: string, name: string) => string; ask: string }> = {
  en: { found: (t, n) => `Thank you. From what you describe, this concerns ${t}. The best person on our team for this is ${n} — you can contact them directly using the details below, or book a meeting.`, ask: "Thank you. Could you tell me a little more — for example whether this is about a contract, a company, property, tax, employment, family matters or something that happened online?" },
  tr: { found: (t, n) => `Teşekkürler. Anlattıklarınıza göre konu ${t} ile ilgili. Ekibimizde bu konuda en uygun kişi ${n} — aşağıdaki bilgilerden doğrudan ulaşabilir ya da randevu alabilirsiniz.`, ask: "Teşekkürler. Biraz daha anlatabilir misiniz? Örneğin bir sözleşme, şirket, gayrimenkul, vergi, iş, aile meselesi ya da internette yaşanan bir olay mı?" },
  fa: { found: (t, n) => `سپاس. با توجه به توضیحات شما، موضوع به ${t} مربوط است. مناسب‌ترین فرد در تیم ما برای این موضوع ${n} است — می‌توانید با اطلاعات زیر مستقیماً تماس بگیرید یا جلسه رزرو کنید.`, ask: "سپاس. ممکن است کمی بیشتر توضیح دهید؟ مثلاً موضوع درباره قرارداد، شرکت، ملک، مالیات، کار، مسائل خانوادگی یا اتفاقی در فضای اینترنت است؟" },
  ru: { found: (t, n) => `Спасибо. Судя по описанию, вопрос касается темы «${t}». Лучше всего у нас этим занимается ${n} — свяжитесь напрямую по контактам ниже или запишитесь на встречу.`, ask: "Спасибо. Расскажите чуть подробнее: речь о договоре, компании, недвижимости, налогах, трудовых или семейных вопросах либо о чём-то, что произошло в интернете?" },
  ar: { found: (t, n) => `شكرًا لك. بحسب ما وصفت، تتعلق المسألة بـ ${t}. أنسب شخص في فريقنا لذلك هو ${n} — يمكنك التواصل معه مباشرة عبر البيانات أدناه أو حجز اجتماع.`, ask: "شكرًا لك. هل يمكنك توضيح المزيد؟ مثلًا هل الأمر يتعلق بعقد، أو شركة، أو عقار، أو ضرائب، أو عمل، أو مسائل أسرية، أو شيء حدث عبر الإنترنت؟" },
};

async function officeContact() {
  const s = await getSettings();
  return { phone: s.office_phone, email: s.office_email || s.boss_email?.split(",")[0]?.trim() };
}

export async function chat(input: { sessionId?: string | null; message: string; locale: Locale; firm: string }): Promise<ChatReply> {
  const database = await db();
  const message = input.message.trim().slice(0, 2000);
  const stamp = now();

  let sessionId = input.sessionId ?? null;
  if (sessionId) {
    const exists = await database.prepare("SELECT id FROM chat_sessions WHERE id = ?").bind(sessionId).first();
    if (!exists) sessionId = null;
  }
  if (!sessionId) {
    sessionId = uuid();
    await database
      .prepare("INSERT INTO chat_sessions (id, locale, created_at, updated_at) VALUES (?, ?, ?, ?)")
      .bind(sessionId, input.locale, stamp, stamp)
      .run();
  }

  const history = await database
    .prepare("SELECT role, content FROM chat_messages WHERE session_id = ? ORDER BY created_at DESC LIMIT ?")
    .bind(sessionId, MAX_HISTORY)
    .all<ChatTurn>();
  const turns: ChatTurn[] = [...(history.results ?? [])].reverse();
  turns.push({ role: "user", content: message });

  const [team, laws, settings] = await Promise.all([listTeam(), listLaws(), getSettings()]);
  const directory = team
    .map(
      (m) =>
        `- slug: ${m.slug}; name: ${m.name}; role: ${m.position.en ?? ""}; topics: ${m.specialties.join(", ")}${m.isReferralLead ? " (lead for these topics)" : ""}; languages: ${m.languages.join(", ")}`,
    )
    .join("\n");

  let reply = "";
  let topics: TopicKey[] = [];
  let recommended: (typeof team)[number] | null = null;
  try {
    const result = await generateJson<{ reply?: string; topics?: string[]; recommend?: string | null }>({
      system: systemPrompt({
        locale: input.locale,
        directory,
        firm: input.firm,
        laws: laws.map((law) => `${law.slug}: ${law.title.en ?? law.slug}`).join("\n"),
        office: [settings.office_address, settings.office_map_url].filter(Boolean).join(" · ") || "Kyrenia (Girne), North Cyprus",
      }),
      messages: turns,
      maxTokens: 1200,
      temperature: 0.7,
    });
    reply = (result.reply ?? "").trim();
    topics = (result.topics ?? []).filter(isTopic).slice(0, 3);
    if (result.recommend) recommended = team.find((m) => m.slug === result.recommend) ?? null;
  } catch (error) {
    if (!(error instanceof AiUnavailable)) console.error("chat AI failed, using fallback", error);
  }

  // Offline / failure fallback: keyword classification over the whole conversation.
  if (!reply) {
    const userText = turns.filter((t) => t.role === "user").map((t) => t.content).join("\n");
    topics = classifyTopics(userText);
    const member = routeToMember(topics, team);
    const fb = FALLBACK[input.locale];
    reply = topics.length && member
      ? fb.found(topics.map((t) => topicLabel(t, input.locale)).join(", "), member.name)
      : GREETING.test(message)
        ? HELLO[input.locale]
        : fb.ask;
  }

  // Routing rules (e.g. Alireza for contract / trade / tax / cybercrime) win over the model's pick.
  const specialist = topics.length ? routeToMember(topics, team) ?? recommended : recommended;

  await database.batch([
    database
      .prepare("INSERT INTO chat_messages (id, session_id, role, content, created_at) VALUES (?, ?, 'user', ?, ?)")
      .bind(uuid(), sessionId, message, stamp),
    database
      .prepare("INSERT INTO chat_messages (id, session_id, role, content, created_at) VALUES (?, ?, 'assistant', ?, ?)")
      .bind(uuid(), sessionId, reply, new Date(Date.now() + 1).toISOString()),
    database
      .prepare(
        `UPDATE chat_sessions SET message_count = message_count + 2, updated_at = ?,
         topics = CASE WHEN ? = '[]' THEN topics ELSE ? END,
         referred_to = COALESCE(?, referred_to) WHERE id = ?`,
      )
      .bind(now(), JSON.stringify(topics), JSON.stringify(topics), specialist?.slug ?? null, sessionId),
  ]);

  return {
    sessionId,
    reply,
    topics: topics.map((key) => ({ key, label: topicLabel(key, input.locale) })),
    specialist: specialist ? publicCard(specialist, input.locale, await officeContact()) : null,
  };
}
