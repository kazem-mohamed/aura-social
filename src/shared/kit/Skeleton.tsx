import type { CSSProperties } from "react";
import { cx } from "./cx";

interface SkeletonProps {
  shape?: "line" | "circle" | "block";
  className?: string;
  style?: CSSProperties;
}

/** A placeholder that breathes (opacity + scale) — never a gradient shimmer. */
export function Skeleton({ shape = "line", className, style }: SkeletonProps) {
  return (
    <span
      aria-hidden
      style={style}
      className={cx(
        "kit-skeleton block",
        shape === "circle" ? "rounded-full" : shape === "block" ? "rounded-card" : "h-3 rounded-pill",
        className,
      )}
    />
  );
}

/** The loading shape of one post card. */
export function PostSkeleton() {
  return (
    <div role="status" aria-label="Loading post" className="rounded-card border border-line bg-surface p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <Skeleton shape="circle" className="h-10 w-10" />
        <div className="grid flex-1 gap-2">
          <Skeleton className="w-32" />
          <Skeleton className="w-20" />
        </div>
      </div>
      <div className="mt-5 grid gap-2.5">
        <Skeleton />
        <Skeleton className="w-11/12" />
        <Skeleton className="w-3/5" />
      </div>
      <div className="mt-5 flex gap-2">
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-20" />
      </div>
    </div>
  );
}

/** Rows of avatar + two lines — people, notifications, comments. */
export function ListSkeleton({ rows = 4, label = "Loading" }: { rows?: number; label?: string }) {
  return (
    <div role="status" aria-label={label} className="grid gap-4">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex items-center gap-3">
          <Skeleton shape="circle" className="h-11 w-11 shrink-0" />
          <div className="grid flex-1 gap-2">
            <Skeleton className="w-2/5" />
            <Skeleton className="w-4/5" />
          </div>
        </div>
      ))}
    </div>
  );
}
