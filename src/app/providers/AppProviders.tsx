import { MotionConfig } from "framer-motion";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/shared/api/queryClient";
import { ToastProvider } from "@/shared/kit/toast/ToastProvider";
import { ErrorBoundary } from "@/shared/ui/ErrorBoundary";
import { FetchRule } from "@/shared/ui/FetchRule";
import { ToastProvider as LegacyToastProvider } from "@/shared/ui/toast";
import { AuthProvider } from "@/features/auth/context/AuthProvider";

/**
 * Provider stack for the whole app.
 *
 * `MotionConfig reducedMotion="user"` makes every Motion animation honour
 * `prefers-reduced-motion` by default; components still opt out of loops
 * through `useMotionPrefs()`.
 *
 * The legacy toast provider stays until Phase 3 moves every screen onto the
 * kit's toasts.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <MotionConfig reducedMotion="user">
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ToastProvider>
              <LegacyToastProvider>
                <FetchRule />
                {children}
              </LegacyToastProvider>
            </ToastProvider>
          </AuthProvider>
        </QueryClientProvider>
      </MotionConfig>
    </ErrorBoundary>
  );
}
