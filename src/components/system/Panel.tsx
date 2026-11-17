import type { ReactNode } from "react";

export function SystemPanel({ title, children, label = "Mendes" }: { title: string; children: ReactNode; label?: string }) {
  return (
    <div className="grain relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-16">
      <div className="aurora absolute -inset-[20%] -z-10" aria-hidden />
      <div className="w-full max-w-xl rounded-[6px] border border-line bg-night-2/85 p-8 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl md:p-12">
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/mendes-crest-sm.webp" alt="" className="h-16 w-14 object-contain" />
          <p className="label">{label}</p>
        </div>
        <h1 className="mt-8 font-display text-h2 font-light">{title}</h1>
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}
