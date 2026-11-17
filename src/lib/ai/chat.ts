import "server-only";
import { db, now, uuid } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { localeMeta, type Locale } from "@/lib/i18n/config";
import { listTeam, publicCard, routeToMember, type PublicCard } from "@/lib/data/team";
import { TOPIC_KEYS, TOPICS, classifyTopics, isTopic, topicLabel, type TopicKey } from "@/lib/topics";
import { AiUnavailable, generateJson, type ChatTurn } from "./provider";

export interface ChatReply {
  sessionId: string;
  reply: string;
  topics: { key: TopicKey; label: string }[];
  specialist: PublicCard | null;
}

const MAX_HISTORY = 20;

function systemPrompt(locale: Locale, directory: string, firm: string): string {
  return `You are the intake assistant of ${firm}, a law and consultancy firm in Kyrenia (Girne), North Cyprus (TRNC).

Goal: through a short, warm, professional conversation, understand the visitor's situation, identify which legal topics it involves, and introduce the single most suitable member of the team.

Rules:
- Reply in the visitor's language. If unclear, use ${localeMeta[locale].label}.
- Keep replies under 120 words. Ask at most one clarifying question at a time, and only when it would change which topic applies.
- Give general orientation only. Never give definitive legal advice, predict outcomes, quote fees, or invent statutes, article numbers, deadlines or figures. Say a lawyer will confirm specifics.
- Never ask for passwords, ID numbers or bank details. If the visitor shares highly sensitive details, gently suggest discussing them in a meeting instead.
- If the visitor describes an emergency (violence, immediate danger), tell them to contact the police (155 in North Cyprus) first.
- Allowed topic keys: ${TOPIC_KEYS.map((k) => `${k} (${TOPICS[k].label.en})`).join(", ")}.
- Contract law, international trade, international tax and cybercrime matters are always handled by the team member marked as lead for them.
- Once you know at least one topic, introduce the recommended specialist by name and say the visitor can contact them directly or book a meeting; the contact card is shown by the website, so do not repeat phone numbers or e-mails yourself.

Team directory:
${directory}

Return ONLY a JSON object: {"reply": string, "topics": string[] (0-3 keys from the allowed list, most relevant first), "recommend": string | null (slug from the directory)}.`;
}

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

  const team = await listTeam();
  const directory = team
    .map(
      (m) =>
        `- slug: ${m.slug}; name: ${m.name}; role: ${m.position.en ?? ""}; topics: ${m.specialties.join(", ")}${m.isReferralLead ? " (lead for these topics)" : ""}; languages: ${m.languages.join(", ")}`,
    )
    .join("\n");

  let reply = "";
  let topics: TopicKey[] = [];
  try {
    const result = await generateJson<{ reply?: string; topics?: string[]; recommend?: string | null }>({
      system: systemPrompt(input.locale, directory, input.firm),
      messages: turns,
      maxTokens: 700,
      temperature: 0.3,
    });
    reply = (result.reply ?? "").trim();
    topics = (result.topics ?? []).filter(isTopic).slice(0, 3);
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
      : fb.ask;
  }

  const specialist = topics.length ? routeToMember(topics, team) : null;

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
