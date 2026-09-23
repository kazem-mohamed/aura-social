import { IdentitySticker } from "@/shared/brand/IdentitySticker";

const SIZES = { sm: 32, md: 40, lg: 64, xl: 128 } as const;

interface AvatarProps {
  /** Handle (preferred) or id. */
  identityKey: string;
  name: string;
  photo?: string | null;
  size?: keyof typeof SIZES;
  /** Identity frame behind the photo. */
  frame?: boolean;
  /** Accessible name; omit when the name is shown next to it. */
  label?: string;
  className?: string;
}

/** A person's photo inside their identity sticker. */
export function Avatar({ size = "md", ...props }: AvatarProps) {
  return <IdentitySticker size={SIZES[size]} {...props} />;
}
