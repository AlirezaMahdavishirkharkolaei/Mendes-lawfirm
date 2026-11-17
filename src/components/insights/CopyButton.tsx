"use client";

import { useState } from "react";

export function CopyButton({ text, label, done }: { text: string; label: string; done: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          /* clipboard blocked */
        }
      }}
      className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-gold hover:text-gold-light"
    >
      {copied ? `✓ ${done}` : label}
    </button>
  );
}
