import { MotionConfig } from "framer-motion";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/shared/api/queryClient";
import { ErrorBoundary } from "@/shared/ui/ErrorBoundary";
import { FetchRule } from "@/shared/ui/FetchRule";
import { ToastProvider } from "@/shared/ui/toast";
import { AuthProvider } from "@/features/auth/context/AuthProvider";

/**
 * Provider stack for the whole app.
 *
 * `MotionConfig reducedMotion="user"` makes every Motion animation honour
 * `prefers-reduced-motion` by default; components still opt out of loops
 * through `useMotionPrefs()`.
 *
 * `AuthProvider` sits inside `QueryClientProvider` because signing out
 * clears the query cache, and the error boundary wraps everything so a
 * render failure cannot blank the page.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <MotionConfig reducedMotion="user">
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ToastProvider>
              <FetchRule />
              {children}
            </ToastProvider>
          </AuthProvider>
        </QueryClientProvider>
      </MotionConfig>
    </ErrorBoundary>
  );
}
