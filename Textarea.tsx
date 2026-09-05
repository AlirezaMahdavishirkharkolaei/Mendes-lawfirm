import { useId, type TextareaHTMLAttributes } from "react";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

/**
 * Signature-line textarea, matching Input.tsx's treatment: visible mono
 * label, bottom-border field, clear focus state.
 */
export function Textarea({
  label,
  error,
  id,
  className = "",
  rows = 5,
  ...props
}: TextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const errorId = error ? `${textareaId}-error` : undefined;

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={textareaId}
        className="font-mono text-ui-sm tracking-mono uppercase text-ink-muted"
      >
        {label}
      </label>
      <textarea
        id={textareaId}
        rows={rows}
        className={
          "border-0 border-b border-border bg-transparent px-0 py-2 font-body text-body text-ink " +
          "focus-visible:outline-none focus-visible:border-b-2 focus-visible:border-accent " +
          "transition-colors duration-[175ms] ease-editorial resize-y " +
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
