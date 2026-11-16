import type { ElementType, ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  as?: ElementType;
}

/**
 * Structural page container. Max width and responsive margins reference
 * the tokens in src/styles/tokens.css directly (--mendes-width-structural,
 * and Tailwind's default spacing scale for the 20/48/80px margins — see
 * docs/DESIGN-SYSTEM.md's spacing table) rather than duplicating the
 * pixel values here.
 */
export function PageContainer({
  children,
  className = "",
  as: Component = "div",
}: ContainerProps) {
  return (
    <Component
      className={`mx-auto w-full max-w-[var(--mendes-width-structural)] px-5 md:px-12 lg:px-20 ${className}`.trim()}
    >
      {children}
    </Component>
  );
}

/**
 * Vertical rhythm wrapper for a major page section: 64px mobile, 96px
 * tablet, 128px desktop — within the approved 96–160px desktop range,
 * leaving room for an individual section (e.g. a hero) to opt into a
 * larger value directly when it's built.
 */
export function SectionContainer({
  children,
  className = "",
  as: Component = "section",
}: ContainerProps) {
  return (
    <Component className={`py-16 md:py-24 lg:py-32 ${className}`.trim()}>
      {children}
    </Component>
  );
}

/** Long-form reading column: 720px max width, for Insights articles etc. */
export function ReadingContainer({
  children,
  className = "",
  as: Component = "div",
}: ContainerProps) {
  return (
    <Component
      className={`mx-auto w-full max-w-[var(--mendes-width-reading)] ${className}`.trim()}
    >
      {children}
    </Component>
  );
}
