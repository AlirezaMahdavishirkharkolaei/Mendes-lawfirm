import { useId, type InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  /** Optional error message. When present, sets aria-invalid and links via aria-describedby. */
  error?: string;
}

/**
 * Signature-line input: a visible mono-style label above a
 * bottom-border-only field, evoking a document field rather than a
 * boxed SaaS input. Never relies on placeholder text as the only
 * label — `label` is always rendered.
 */
export function Input({ label, error, id, className = "", ...props }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={inputId}
        className="font-mono text-ui-sm tracking-mono uppercase text-ink-muted"
      >
        {label}
      </label>
      <input
        id={inputId}
        className={
          "border-0 border-b border-border bg-transparent px-0 py-2 font-body text-body text-ink " +
          "focus-visible:outline-none focus-visible:border-b-2 focus-visible:border-accent " +
          "transition-colors duration-[175ms] ease-editorial " +
          className
        }
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={errorId}
        {...props}
      />
      {error && (
        <p id={errorId} className="font-body text-ui text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
