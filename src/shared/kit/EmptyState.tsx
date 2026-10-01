import type { ObjectName } from "@/assets/objects/manifest";
import { ObjectArt } from "@/shared/brand/ObjectArt";
import { Button } from "./Button";
import { ButtonLink } from "./ButtonLink";
import { cx } from "./cx";

interface EmptyStateProps {
  /** A deflated object reads as "waiting for breath", not broken. */
  object: ObjectName;
  title: string;
  body?: string;
  action?: { label: string; onClick?: () => void; to?: string };
  compact?: boolean;
  titleAs?: "h2" | "h3";
  className?: string;
}

/** An invitation, not an apology: object, one line, one useful action. */
export function EmptyState({ object, title, body, action, compact = false, titleAs: Title = "h2", className }: EmptyStateProps) {
  return (
    <section className={cx("grid justify-items-center gap-3 px-6 text-center", compact ? "py-8" : "py-14", className)}>
      <div className={compact ? "w-28" : "w-44 sm:w-52"}>
        <ObjectArt name={object} sizes={compact ? "112px" : "208px"} />
      </div>
      <Title className="type-heading-sm text-balance">{title}</Title>
      {body ? <p className="max-w-[40ch] type-body text-ink-2">{body}</p> : null}
      {action ? (
        action.to ? (
          <ButtonLink to={action.to} className="mt-2">
            {action.label}
          </ButtonLink>
        ) : (
          <Button onClick={action.onClick} className="mt-2">
            {action.label}
          </Button>
        )
      ) : null}
    </section>
  );
}
