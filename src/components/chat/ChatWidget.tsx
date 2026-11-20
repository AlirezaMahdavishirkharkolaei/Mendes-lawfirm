"use client";

import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/lib/i18n";

interface Specialist {
  slug: string;
  name: string;
  position: string;
  email: string | null;
  phone: string | null;
}

interface Msg {
  role: "user" | "assistant";
  content: string;
  specialist?: Specialist | null;
  topics?: { key: string; label: string }[];
}

const STORE = "mendes_chat";

/** Opens the assistant from anywhere: window.dispatchEvent(new CustomEvent("mendes:chat", { detail: "question" })) */
export function openChat(prefill?: string) {
  window.dispatchEvent(new CustomEvent("mendes:chat", { detail: prefill }));
}

export function ChatWidget({ locale, t, bookingHref, privacyLabel }: { locale: string; t: Dictionary["chat"]; bookingHref: string; privacyLabel: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const restored = useRef(false);
  /** Restores this tab's conversation the first time the panel opens. */
  const restore = useCallback(() => {
    if (restored.current) return;
    restored.current = true;
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORE) ?? "null") as { id: string; messages: Msg[] } | null;
      if (saved) {
        setSessionId(saved.id);
        setMessages(saved.messages);
      }
    } catch {
      /* storage unavailable */
    }
  }, []);

  useEffect(() => {
    try {
      if (sessionId) sessionStorage.setItem(STORE, JSON.stringify({ id: sessionId, messages: messages.slice(-30) }));
    } catch {
      /* ignore */
    }
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sessionId]);

  const send = useCallback(
    async (text: string) => {
      const message = text.trim();
      if (!message || busy) return;
      setInput("");
      setMessages((m) => [...m, { role: "user", content: message }]);
      setBusy(true);
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ sessionId, message, locale }),
        });
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as { sessionId: string; reply: string; specialist: Specialist | null; topics: Msg["topics"] };
        setSessionId(data.sessionId);
        setMessages((m) => [...m, { role: "assistant", content: data.reply, specialist: data.specialist, topics: data.topics }]);
      } catch {
        setMessages((m) => [...m, { role: "assistant", content: t.error }]);
      } finally {
        setBusy(false);
        inputRef.current?.focus();
      }
    },
    [busy, locale, sessionId, t.error],
  );

  useEffect(() => {
    const handler = (e: Event) => {
      restore();
      setOpen(true);
      const prefill = (e as CustomEvent<string | undefined>).detail;
      if (prefill) setInput(prefill);
      setTimeout(() => inputRef.current?.focus(), 350);
    };
    window.addEventListener("mendes:chat", handler);
    return () => window.removeEventListener("mendes:chat", handler);
  }, [restore]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function reset() {
    setMessages([]);
    setSessionId(null);
    try {
      sessionStorage.removeItem(STORE);
    } catch {
      /* ignore */
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          restore();
          setOpen((v) => !v);
        }}
        aria-expanded={open}
        aria-controls="mendes-chat"
        className={`pulse-ring fixed bottom-6 end-6 z-[55] flex h-16 items-center gap-3 rounded-full border border-gold/60 bg-night-2/90 pe-2 ps-2 text-ivory shadow-[0_20px_60px_-15px_rgba(201,169,106,0.6)] backdrop-blur-xl transition-all duration-500 ease-editorial hover:border-gold sm:pe-6 ${open ? "pointer-events-none translate-y-4 opacity-0" : "opacity-100"}`}
      >
        <span className="grid h-12 w-12 place-items-center rounded-full bg-gold-sheen text-on-gold">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
            <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4H6.5A2.5 2.5 0 0 1 4 13.5z" />
            <path d="M8.5 8.5h7M8.5 11.5h4.5" />
          </svg>
        </span>
        <span className="hidden text-[0.72rem] font-medium uppercase tracking-[0.14em] sm:inline">{t.open}</span>
      </button>

      <section
        id="mendes-chat"
        role="dialog"
        aria-label={t.title}
        aria-modal="false"
        className={`fixed bottom-0 end-0 z-[56] flex h-[min(720px,100dvh)] w-full flex-col overflow-hidden border-line bg-night-2/95 shadow-[0_40px_120px_-20px_var(--mendes-shadow)] backdrop-blur-2xl transition-all duration-700 ease-editorial sm:bottom-6 sm:end-6 sm:h-[min(680px,calc(100dvh-3rem))] sm:w-[420px] sm:rounded-[6px] sm:border ${open ? "visible translate-y-0 opacity-100" : "invisible translate-y-8 opacity-0"}`}
      >
        <header className="relative flex items-start justify-between gap-4 border-b border-line px-6 py-5">
          <div className="aurora pointer-events-none absolute inset-0 opacity-60" aria-hidden />
          <div className="relative">
            <p className="label">AI · Mendes</p>
            <h2 className="mt-2 font-display text-2xl font-light">{t.title}</h2>
            <p className="mt-1 text-ui-sm text-ivory-muted">{t.subtitle}</p>
          </div>
          <div className="relative flex gap-1">
            <button type="button" onClick={reset} className="rounded-full p-2 text-ivory-muted hover:text-gold-light" aria-label={t.reset} title={t.reset}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4" /></svg>
            </button>
            <button type="button" onClick={() => setOpen(false)} className="rounded-full p-2 text-ivory-muted hover:text-gold-light" aria-label={t.close}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden><path d="M6 6l12 12M18 6 6 18" /></svg>
            </button>
          </div>
        </header>

        <div ref={listRef} className="flex-1 space-y-5 overflow-y-auto px-6 py-6" aria-live="polite">
          <Bubble role="assistant">{t.greeting}</Bubble>
          {messages.map((m, i) => (
            <div key={i} className="fade-in space-y-3">
              <Bubble role={m.role}>{m.role === "assistant" ? <RichText text={m.content} /> : m.content}</Bubble>
              {m.topics && m.topics.length > 0 && (
                <div className="flex flex-wrap gap-2 ps-1">
                  <span className="sr-only">{t.topics}:</span>
                  {m.topics.map((topic) => (
                    <span key={topic.key} className="rounded-full border border-gold/30 bg-gold/[0.07] px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-gold-light">{topic.label}</span>
                  ))}
                </div>
              )}
              {m.specialist && <SpecialistCard s={m.specialist} t={t} bookingHref={`${bookingHref}?topic=${m.topics?.[0]?.key ?? ""}`} />}
            </div>
          ))}
          {busy && (
            <div className="flex items-center gap-3 text-ui-sm text-ivory-muted">
              <span className="typing" aria-hidden><span /><span /><span /></span>
              {t.thinking}
            </div>
          )}
        </div>

        <form
          className="border-t border-line p-4"
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
        >
          <div className="flex items-end gap-2 rounded-[4px] border border-line bg-night-3/80 p-2 focus-within:border-gold">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(input);
                }
              }}
              rows={2}
              maxLength={2000}
              placeholder={t.placeholder}
              aria-label={t.placeholder}
              className="max-h-40 min-h-12 flex-1 resize-none bg-transparent px-2 py-1.5 text-ui text-ivory placeholder:text-ivory-muted/60 focus:outline-none"
            />
            <button type="submit" disabled={busy || !input.trim()} className="grid h-11 w-11 shrink-0 place-items-center rounded-[3px] bg-gold-sheen text-on-gold transition-opacity disabled:opacity-30" aria-label={t.send}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="rtl:-scale-x-100" aria-hidden><path d="M4 12h15M13 6l6 6-6 6" /></svg>
            </button>
          </div>
          <p className="mt-2 px-1 text-[0.68rem] leading-snug text-ivory-muted/70">{t.disclaimer} <a href={`/${locale}/privacy`} className="underline underline-offset-2 hover:text-gold">{privacyLabel}</a></p>
        </form>
      </section>
    </>
  );
}

function Bubble({ role, children }: { role: "user" | "assistant"; children: React.ReactNode }) {
  const mine = role === "user";
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <p className={`max-w-[88%] whitespace-pre-wrap rounded-[4px] px-4 py-3 text-ui leading-relaxed ${mine ? "bg-gold/15 text-ivory" : "border border-line bg-night-3/60 text-ivory/90"}`}>{children}</p>
    </div>
  );
}

function SpecialistCard({ s, t, bookingHref }: { s: Specialist; t: Dictionary["chat"]; bookingHref: string }) {
  return (
    <div className="relative overflow-hidden rounded-[4px] border border-gold/40 bg-gradient-to-br from-gold/[0.12] to-transparent p-5">
      <p className="label">{t.recommended}</p>
      <p className="mt-3 font-display text-2xl font-light leading-tight text-ivory">{s.name}</p>
      <p className="mt-1 text-ui-sm text-ivory-muted">{s.position}</p>
      <div className="mt-4 space-y-2 text-ui">
        {s.phone && (
          <a href={`tel:${s.phone.replace(/\s/g, "")}`} className="flex items-center gap-3 text-gold-light hover:text-gold" dir="ltr">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden><path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" /></svg>
            {s.phone}
          </a>
        )}
        {s.email && (
          <a href={`mailto:${s.email}`} className="flex items-center gap-3 break-all text-gold-light hover:text-gold">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden><rect x="3" y="5" width="18" height="14" rx="1.5" /><path d="m3.5 6 8.5 7 8.5-7" /></svg>
            {s.email}
          </a>
        )}
      </div>
      <a href={bookingHref} className="mt-5 inline-flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-ivory hover:text-gold-light">
        {t.book} →
      </a>
    </div>
  );
}

/** Renders the assistant's light markdown: **bold** and [links](/same-site/path). */
function RichText({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text))) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    if (match[1]) parts.push(<strong key={match.index} className="font-semibold text-ivory">{match[1]}</strong>);
    else {
      const href = match[3];
      const safe = href.startsWith("/") && !href.startsWith("//");
      parts.push(
        safe ? (
          <a key={match.index} href={href} className="text-gold underline decoration-line-strong underline-offset-4 hover:decoration-gold">
            {match[2]}
          </a>
        ) : (
          match[2]
        ),
      );
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}
