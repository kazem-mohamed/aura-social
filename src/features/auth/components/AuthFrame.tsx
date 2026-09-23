import type { ReactNode } from "react";
import { PosterHeader } from "@/shared/kit/PosterHeader";

interface AuthFrameProps {
  title: string;
  lede: ReactNode;
  /** Beside the form from 1024px up; hidden on smaller screens. */
  art: ReactNode;
  /** The line under the form card — the way to the other auth page. */
  footer: ReactNode;
  children: ReactNode;
}

/** Sign in and Register share one frame: the poster and its art on the left, the form card on the right. */
export function AuthFrame({ title, lede, art, footer, children }: AuthFrameProps) {
  return (
    <div className="grid gap-6 pb-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)] lg:gap-16">
      <div className="grid content-start">
        <PosterHeader title={title} lede={lede} />
        <div className="hidden lg:block">{art}</div>
      </div>
      <div className="grid content-start gap-5 lg:pt-12">
        <div className="rounded-card-lg border border-line bg-surface p-6 sm:p-8">{children}</div>
        <p className="text-center type-body text-ink-2">{footer}</p>
      </div>
    </div>
  );
}
