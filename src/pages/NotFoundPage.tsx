import { ObjectArt } from "@/shared/brand/ObjectArt";
import { ButtonLink } from "@/shared/kit/ButtonLink";
import { routes } from "@/app/router/routes";
import { useAuth } from "@/features/auth/hooks/useAuth";

/** Nothing at this address: the popped bubble, and the way back. */
export default function NotFoundPage() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="grid justify-items-center gap-5 py-12 text-center sm:py-16">
      <div className="w-56 sm:w-72">
        <ObjectArt name="bubble-popped" sizes="288px" />
      </div>
      <h1 className="type-display text-balance">This one popped</h1>
      <p className="max-w-[44ch] type-body-lg text-ink-2">There’s nothing at this address. It may have moved, or it never existed.</p>
      <ButtonLink to={isAuthenticated ? routes.home : routes.login} viewTransition size="lg">
        {isAuthenticated ? "Back to the wall" : "Go to sign in"}
      </ButtonLink>
    </section>
  );
}
