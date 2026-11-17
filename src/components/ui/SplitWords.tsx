import type { ElementType } from "react";

/** Headline whose words rise into place one after another (CSS only). */
export function SplitWords({ text, as: Tag = "h1", className = "" }: { text: string; as?: ElementType; className?: string }) {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <Tag className={`words ${className}`} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} aria-hidden>
          <span style={{ ["--i" as string]: i }}>{w}</span>
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </Tag>
  );
}
