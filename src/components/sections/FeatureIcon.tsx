const paths: Record<string, string> = {
  booking: "M4 7h16v13H4zM4 11h16M9 3v5M15 3v5M8 15h3",
  ai: "M12 3v3M12 18v3M3 12h3M18 12h3M6.3 6.3l2.1 2.1M15.6 15.6l2.1 2.1M6.3 17.7l2.1-2.1M15.6 8.4l2.1-2.1M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  portal: "M5 10V7a7 7 0 0 1 14 0v3M4 10h16v11H4zM12 14v3",
  laws: "M12 3v18M5 7h14M7 7l-3 7a3 3 0 0 0 6 0zM17 7l-3 7a3 3 0 0 0 6 0zM8 21h8",
};

export function FeatureIcon({ name }: { name: keyof typeof paths | string }) {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="text-gold">
      <path d={paths[name] ?? paths.laws} />
    </svg>
  );
}
