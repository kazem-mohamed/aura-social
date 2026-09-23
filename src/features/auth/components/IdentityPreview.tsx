import { motion } from "framer-motion";
import { identityFor } from "@/shared/brand/identity";
import { IdentitySticker } from "@/shared/brand/IdentitySticker";
import { spring } from "@/shared/motion/tokens";

interface IdentityPreviewProps {
  username: string;
  name: string;
  size: number;
}

/** The sticker this username will get. It slaps back on with every keystroke. */
export function IdentityPreview({ username, name, size }: IdentityPreviewProps) {
  const key = username.trim() || "you";
  const identity = identityFor(key);

  return (
    <motion.div
      key={key}
      className="inline-grid"
      initial={{ scale: 0.82, rotate: -10 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={spring.release}
    >
      <IdentitySticker
        identityKey={key}
        name={name.trim() || key}
        size={size}
        label={`Your sticker: ${identity.color.name}, ${identity.shape}`}
      />
    </motion.div>
  );
}
