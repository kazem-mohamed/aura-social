import { ButtonLink } from "@/shared/kit/ButtonLink";
import { Menu, type MenuItem } from "@/shared/kit/Menu";
import { useTheme } from "@/shared/lib/useTheme";
import { routes } from "@/app/router/routes";
import { useSignOut } from "@/features/auth/hooks/useSignOut";

/** On your own page: Settings, with the paper switch and sign-out one tap away. */
export function OwnProfileActions() {
  const { theme, toggle } = useTheme();
  const signOut = useSignOut();

  const items: MenuItem[] = [
    {
      label: theme === "dark" ? "Switch to Paper" : "Switch to Night paper",
      glyph: theme === "dark" ? "sun" : "moon",
      onSelect: () => toggle(),
    },
    {
      label: "Sign out",
      glyph: "logout",
      tone: "danger",
      onSelect: () => void signOut(),
    },
  ];

  return (
    <>
      <ButtonLink to={routes.settings} viewTransition variant="secondary" size="sm">
        Settings
      </ButtonLink>
      <Menu label="More options" items={items} />
    </>
  );
}
