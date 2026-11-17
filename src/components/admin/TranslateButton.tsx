"use client";

import { useState, useTransition } from "react";
import type { AdminState } from "@/app/(system)/admin/actions";

/** Translates the English field into the other languages (fills only empty ones). */
export function TranslateButton({ action, prefix }: { action: (s: AdminState, f: FormData) => Promise<AdminState>; prefix: string }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState("");
  return (
    <span className="inline-flex items-center gap-3">
      <button
        type="button"
        disabled={pending}
        className="rounded-[2px] border border-gold/50 px-3 py-1.5 text-[0.62rem] uppercase tracking-[0.12em] text-gold hover:bg-gold/10 disabled:opacity-40"
        onClick={(e) => {
          const form = (e.currentTarget as HTMLElement).closest("form");
          const source = (form?.elements.namedItem(`${prefix}_en`) as HTMLInputElement | HTMLTextAreaElement | null)?.value ?? "";
          const fd = new FormData();
          fd.set("source", source);
          start(async () => {
            const res = await action({}, fd);
            if (res.error) return setMsg(res.error);
            const out = JSON.parse(res.message ?? "{}") as Record<string, string>;
            let n = 0;
            for (const [l, v] of Object.entries(out)) {
              const el = form?.elements.namedItem(`${prefix}_${l}`) as HTMLInputElement | HTMLTextAreaElement | null;
              if (el && !el.value.trim() && v) {
                el.value = v;
                n++;
              }
            }
            setMsg(`Filled ${n} language(s) — review, then save.`);
          });
        }}
      >
        {pending ? "Translating…" : "✦ Translate from English"}
      </button>
      {msg && <span className="text-ui-sm text-ivory-muted">{msg}</span>}
    </span>
  );
}
