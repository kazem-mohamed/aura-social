export type ButtonVariant = "primary" | "secondary" | "ghost" | "sticker" | "destructive" | "link";
export type ButtonSize = "sm" | "md" | "lg";
/** Fills allowed on the `sticker` variant. Never blue — Electric Blue is not an action colour. */
export type StickerFill = "sun" | "mint" | "lavender" | "violet";

const BASE =
  "relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-pill border font-bold uppercase tracking-[0.032em] transition-[background-color,color,border-color,opacity,translate,rotate,scale] disabled:cursor-not-allowed disabled:opacity-45";

const SIZES: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-[11px]",
  md: "h-11 px-5 text-[13px]",
  lg: "h-14 px-7 text-[15px]",
};

const VARIANTS: Record<Exclude<ButtonVariant, "sticker">, string> = {
  primary: "border-action bg-action text-action-ink",
  secondary: "border-line bg-surface text-ink hover:bg-surface-2",
  ghost: "border-transparent bg-transparent text-ink hover:bg-surface-2",
  destructive: "border-carbon bg-ember text-carbon",
  link: "h-auto border-transparent px-0 normal-case tracking-normal underline decoration-1 underline-offset-4",
};

const FILLS: Record<StickerFill, string> = {
  sun: "bg-sun text-carbon",
  mint: "bg-mint text-carbon",
  lavender: "bg-lavender text-carbon",
  violet: "bg-violet text-paper",
};

/** Class string shared by `Button` and `ButtonLink`. */
export function buttonClasses({
  variant = "primary",
  size = "md",
  fill = "sun",
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fill?: StickerFill;
}): string {
  const tone = variant === "sticker" ? `border-carbon ${FILLS[fill]}` : VARIANTS[variant];
  return `${BASE} ${variant === "link" ? "" : SIZES[size]} ${tone}`;
}
