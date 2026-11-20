"use client";

import { useActionState, type ReactNode } from "react";
import type { AdminState } from "@/app/(system)/admin/actions";
import { Notice } from "@/components/ui/misc";

/** Wraps an admin server action and shows its success / error message. */
export function ActionForm({ action, children, className = "space-y-5", encType }: { action: (s: AdminState, f: FormData) => Promise<AdminState>; children: ReactNode; className?: string; encType?: string }) {
  const [state, formAction] = useActionState(action, {});
  return (
    <form action={formAction} className={className} encType={encType}>
      {state.error && <Notice tone="danger">{state.error}</Notice>}
      {state.ok && state.message && <Notice tone="success">{state.message}</Notice>}
      {children}
    </form>
  );
}

export function ActionButton({ action, children, variant = "outline" }: { action: (s: AdminState, f: FormData) => Promise<AdminState>; children: ReactNode; variant?: "outline" | "gold" }) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} className="flex flex-col gap-2">
      <button disabled={pending} className={`rounded-[2px] px-4 py-2.5 text-[0.68rem] font-medium uppercase tracking-[0.14em] transition-colors disabled:opacity-40 ${variant === "gold" ? "bg-gold-fill text-on-gold hover:bg-gold-light" : "border border-line-strong text-ivory hover:border-gold hover:text-gold-light"}`}>
        {pending ? "Working…" : children}
      </button>
      {state.message && <span className="text-ui-sm text-success">{state.message}</span>}
      {state.error && <span className="text-ui-sm text-danger">{state.error}</span>}
    </form>
  );
}
