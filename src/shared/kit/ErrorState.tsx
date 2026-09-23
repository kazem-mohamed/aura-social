import { ObjectArt } from "@/shared/brand/ObjectArt";
import { Sticker } from "@/shared/brand/Sticker";
import { Button } from "./Button";
import { cx } from "./cx";

interface ErrorStateProps {
  level?: "inline" | "section" | "page";
  title?: string;
  /** What happened and what to do, in one or two plain sentences. */
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

/** Human error with a way back — inline in a list, a section card, or a whole page. */
export function ErrorState({ level = "section", title, message, onRetry, retryLabel = "Try again", className }: ErrorStateProps) {
  if (level === "inline") {
    return (
      <p role="alert" className={cx("flex flex-wrap items-center gap-2 type-body", className)}>
        <Sticker name="cross" fill="var(--ember)" size={18} className="shrink-0" />
        {message}
        {onRetry ? (
          <button type="button" onClick={onRetry} className="font-bold underline decoration-1 underline-offset-4">
            {retryLabel}
          </button>
        ) : null}
      </p>
    );
  }

  if (level === "page") {
    return (
      <section role="alert" className={cx("grid justify-items-center gap-5 px-6 py-16 text-center", className)}>
        <div className="w-56 sm:w-72">
          <ObjectArt name="bubble-popped" sizes="288px" />
        </div>
        <h1 className="type-display text-balance">{title ?? "This one popped"}</h1>
        <p className="max-w-[44ch] type-body-lg text-ink-2">{message}</p>
        {onRetry ? (
          <Button size="lg" iconStart="refresh" onClick={onRetry}>
            {retryLabel}
          </Button>
        ) : null}
      </section>
    );
  }

  return (
    <section role="alert" className={cx("grid justify-items-start gap-3 rounded-card border border-line bg-surface p-6", className)}>
      <div className="flex items-center gap-3">
        <Sticker name="cross" fill="var(--ember)" size={32} className="shrink-0" />
        <h2 className="type-heading-sm">{title ?? "That didn’t stick"}</h2>
      </div>
      <p className="max-w-[60ch] type-body text-ink-2">{message}</p>
      {onRetry ? (
        <Button variant="secondary" iconStart="refresh" onClick={onRetry}>
          {retryLabel}
        </Button>
      ) : null}
    </section>
  );
}
