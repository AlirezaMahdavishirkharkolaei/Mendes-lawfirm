export function Marquee({ items }: { items: string[] }) {
  const row = [...items, ...items];
  return (
    <div className="marquee overflow-hidden border-y border-line py-7" aria-hidden dir="ltr">
      <div className="marquee-track gap-14">
        {row.map((item, i) => (
          <span key={i} className="flex items-center gap-14 whitespace-nowrap font-display text-3xl font-light italic text-ivory/70 md:text-4xl">
            {item}
            <span className="text-xl not-italic text-gold">§</span>
          </span>
        ))}
      </div>
    </div>
  );
}
