import type { ReactNode } from "react";

interface KitBlockProps {
  title: string;
  note?: string;
  children: ReactNode;
}

/** One labelled specimen block on the kit page. */
export function KitBlock({ title, note, children }: KitBlockProps) {
  return (
    <section className="grid gap-5 border-t border-line pt-6">
      <header className="grid gap-1">
        <h3 className="type-heading-sm">{title}</h3>
        {note ? <p className="max-w-[70ch] type-caption text-ink-2">{note}</p> : null}
      </header>
      {children}
    </section>
  );
}
