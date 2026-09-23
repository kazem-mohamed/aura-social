import { useState, type MouseEvent } from "react";
import { Logo } from "@/shared/brand/Logo";
import { readTheme, setTheme, type Theme } from "@/shared/lib/theme";
import { useMotionPrefs } from "@/shared/motion/useMotionPrefs";
import { BrandSection } from "./BrandSection";
import { ControlsSection } from "./ControlsSection";
import { FeedbackSection } from "./FeedbackSection";
import { PostsSection } from "./PostsSection";
import { ProfileSection } from "./ProfileSection";
import { ShellSection } from "./ShellSection";
import { SurfacesSection } from "./SurfacesSection";

/** Development-only specimen page for the Aura design system. */
export default function KitPage() {
  const [theme, setThemeState] = useState<Theme>(() => readTheme());
  const { reduced } = useMotionPrefs();

  const toggleTheme = (event: MouseEvent<HTMLButtonElement>) => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    const rect = event.currentTarget.getBoundingClientRect();
    setTheme(next, { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    setThemeState(next);
  };

  return (
    <div className="min-h-dvh bg-ground text-ink">
      <header className="sticky top-0 z-(--z-sticky) flex items-center gap-4 border-b border-line bg-ground px-4 py-3 sm:px-8">
        <Logo interactive className="h-10 w-auto" />
        <span className="type-label">Kit · dev only</span>
        <span className="ml-auto hidden type-caption text-ink-2 sm:inline">{reduced ? "Reduced motion on" : "Full motion"}</span>
        <button type="button" onClick={toggleTheme} className="rounded-pill border border-line bg-surface px-4 py-2 type-label">
          {theme === "dark" ? "Paper" : "Night paper"}
        </button>
      </header>
      <main className="mx-auto grid max-w-(--page-max) grid-cols-[minmax(0,1fr)] gap-24 overflow-x-clip px-4 py-12 sm:px-8 sm:py-16">
        <BrandSection />
        <ControlsSection />
        <SurfacesSection />
        <FeedbackSection />
        <ShellSection />
        <PostsSection />
        <ProfileSection />
      </main>
    </div>
  );
}
