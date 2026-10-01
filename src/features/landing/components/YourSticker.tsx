import { useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { identityFor } from "@/shared/brand/identity";
import { useMediaQuery } from "@/shared/hooks/useMediaQuery";
import { Button } from "@/shared/kit/Button";
import { Field } from "@/shared/kit/Field";
import { routes } from "@/app/router/routes";
import { IdentityPreview } from "@/features/auth/components/IdentityPreview";

/** Usernames are capped at 15 characters by the API. */
const MAX_HANDLE = 15;

/** Type a username, watch it turn into a sticker, and take it to sign-up. */
export function YourSticker() {
  const navigate = useNavigate();
  const isWide = useMediaQuery("(min-width: 1024px)");
  const fieldRef = useRef<HTMLInputElement>(null);
  const [handle, setHandle] = useState("");
  const clean = handle.trim().replace(/^@/, "");
  const identity = identityFor(clean || "you");

  const claim = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Nothing typed yet: the button points you at the field instead of greying out.
    if (!clean) {
      fieldRef.current?.focus();
      return;
    }
    navigate(routes.register, { state: { handle: clean }, viewTransition: true });
  };

  return (
    <section id="sticker" aria-labelledby="sticker-title" className="scroll-mt-24 bg-band-lav">
      <div className="mx-auto grid max-w-(--page-max) items-center gap-12 px-4 py-20 sm:px-8 sm:py-28 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="grid gap-8">
          <h2 id="sticker-title" className="type-display text-balance">
            Nobody picks yours
          </h2>
          <p className="max-w-[46ch] type-body-lg">
            Type a username. Aura turns it into a sticker — one colour, one shape, one tilt — and it follows you everywhere: your
            posts, your comments, your profile.
          </p>
          <form onSubmit={claim} aria-label="Try a username" className="grid max-w-md gap-4">
            <Field
              ref={fieldRef}
              label="Try a username"
              iconStart="at"
              placeholder="your.handle"
              value={handle}
              maxLength={MAX_HANDLE}
              counter={{ value: handle.length, max: MAX_HANDLE }}
              ringColor={identity.color.hex}
              autoCapitalize="none"
              autoComplete="off"
              spellCheck={false}
              onChange={(event) => setHandle(event.target.value)}
            />
            <Button type="submit" variant="sticker" fill="sun" size="lg" iconEnd="arrow-right" className="justify-self-start">
              Claim it
            </Button>
          </form>
        </div>
        <figure className="grid justify-items-center gap-5">
          {/* Until something is typed, the sticker is a question: which one is yours? */}
          <IdentityPreview username={clean} name={clean || "?"} size={isWide ? 340 : 220} />
          <figcaption className="text-center type-body">
            <span className="font-bold capitalize">
              {identity.color.name} · {identity.shape}
            </span>
            <span className="block text-ink-2">{clean ? `@${clean}` : "Start typing to see yours."}</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
