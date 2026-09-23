import type { ReactNode } from "react";
import { Button } from "@/shared/kit/Button";
import { PosterHeader } from "@/shared/kit/PosterHeader";
import { Toggle } from "@/shared/kit/Toggle";
import { useToast } from "@/shared/kit/toast/useToast";
import { useTheme } from "@/shared/lib/useTheme";
import { ChangePasswordForm } from "@/features/auth/components/ChangePasswordForm";
import { useAuth } from "@/features/auth/hooks/useAuth";

const THEME_TOGGLE_ID = "theme-toggle";

function SettingsSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="grid gap-5 rounded-card border border-line bg-surface p-5 sm:p-7">
      <h2 id={id} className="type-heading-sm">
        {title}
      </h2>
      {children}
    </section>
  );
}

/** Your paper, your password, and the way out. */
export default function SettingsPage() {
  const { theme, set } = useTheme();
  const { signOut } = useAuth();
  const toast = useToast();

  const setNight = (night: boolean) => {
    // The new paper peels on from the switch itself.
    const box = document.getElementById(THEME_TOGGLE_ID)?.getBoundingClientRect();
    set(night ? "dark" : "light", box ? { x: box.left + box.width / 2, y: box.top + box.height / 2 } : undefined);
  };

  const leave = () => {
    signOut();
    toast.show({ title: "Signed out. See you soon." });
  };

  return (
    <div className="mx-auto grid max-w-(--reading) gap-6">
      <PosterHeader title="Settings" lede="Your paper, your password, and the way out." />

      <SettingsSection id="settings-paper" title="Paper">
        <Toggle
          id={THEME_TOGGLE_ID}
          label="Night paper"
          description="Dark paper for late scrolling. Until you choose, Aura follows your device."
          checked={theme === "dark"}
          onChange={setNight}
        />
      </SettingsSection>

      <SettingsSection id="settings-password" title="Password">
        <ChangePasswordForm />
      </SettingsSection>

      <SettingsSection id="settings-session" title="Session">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="type-body text-ink-2">You’re signed in on this device.</p>
          <Button variant="secondary" iconStart="logout" onClick={leave}>
            Sign out
          </Button>
        </div>
      </SettingsSection>
    </div>
  );
}
