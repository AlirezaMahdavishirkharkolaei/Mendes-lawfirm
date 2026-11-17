import Link from "next/link";
import { Seal } from "@/components/ui/misc";

export default function NotFound() {
  return (
    <section className="flex min-h-[80vh] flex-col items-center justify-center gap-8 px-6 pt-24 text-center">
      <Seal className="h-36 w-36 opacity-80" />
      <h1 className="font-display text-h1 font-light">404</h1>
      <p className="max-w-md text-ivory-muted">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
      <Link href="/" className="label link-grow">← Mendes</Link>
    </section>
  );
}
