import { ButtonLink } from "@/shared/kit/ButtonLink";
import { Menu, type MenuItem } from "@/shared/kit/Menu";
import { useToast } from "@/shared/kit/toast/useToast";
import { useTheme } from "@/shared/lib/useTheme";
import { routes } from "@/app/router/routes";
import { useAuth } from "@/features/auth/hooks/useAuth";

/** On your own page: Settings, with the paper switch and sign-out one tap away. */
export function OwnProfileActions() {
  const { theme, toggle } = useTheme();
  const { signOut } = useAuth();
  const toast = useToast();

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
      onSelect: () => {
        signOut();
        toast.show({ title: "Signed out. See you soon." });
      },
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
