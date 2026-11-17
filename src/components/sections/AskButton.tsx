"use client";

import { openChat } from "@/components/chat/ChatWidget";

export function AskButton({ label, prefill, className = "" }: { label: string; prefill?: string; className?: string }) {
  return (
    <button type="button" onClick={() => openChat(prefill)} className={`group inline-flex items-center gap-3 rounded-[2px] border border-line-strong px-7 py-4 text-[0.8125rem] font-medium uppercase tracking-[0.16em] text-ivory transition-all duration-300 hover:border-gold hover:bg-gold/5 hover:text-gold-light ${className}`}>
      <span aria-hidden className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
      </span>
      {label}
    </button>
  );
}
