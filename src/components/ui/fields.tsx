import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

const control =
  "w-full rounded-[3px] border border-line bg-night-3/70 px-4 py-3 text-body text-ivory placeholder:text-ivory-muted/60 " +
  "transition-colors duration-300 focus:border-gold focus:bg-night-3 focus:outline-none disabled:opacity-50";

export function Field({ label, hint, children, error, htmlFor }: { label: string; hint?: string; children: ReactNode; error?: string; htmlFor?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-ivory-muted">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-ui-sm text-ivory-muted/80">{hint}</p>}
      {error && <p className="text-ui-sm text-danger">{error}</p>}
    </div>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${control} ${props.className ?? ""}`} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${control} min-h-32 leading-relaxed ${props.className ?? ""}`} />;
}

export function Select({ children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  return (
    <select {...props} className={`${control} appearance-none bg-[length:12px] bg-[position:right_1rem_center] rtl:bg-[position:left_1rem_center] bg-no-repeat pe-10 ${props.className ?? ""}`} style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'><path d='M1 1l5 5 5-5' fill='none' stroke='%23c9a96a' stroke-width='1.4'/></svg>\")" }}>
      {children}
    </select>
  );
}

export function Checkbox({ label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: ReactNode }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-ui text-ivory-muted">
      <input type="checkbox" {...props} className="mt-0.5 h-4 w-4 shrink-0 accent-[#c9a96a]" />
      <span>{label}</span>
    </label>
  );
}
