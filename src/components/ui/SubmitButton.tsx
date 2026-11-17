"use client";

import { useFormStatus } from "react-dom";
import { Button } from "./Button";
import type { ReactNode } from "react";

export function SubmitButton({ children, pending, variant = "gold", size = "md", className = "", arrow = true }: { children: ReactNode; pending?: string; variant?: "gold" | "outline" | "danger" | "ghost"; size?: "sm" | "md" | "lg"; className?: string; arrow?: boolean }) {
  const status = useFormStatus();
  return (
    <Button type="submit" variant={variant} size={size} disabled={status.pending} arrow={arrow && !status.pending} className={className}>
      {status.pending ? (pending ?? "…") : children}
    </Button>
  );
}
