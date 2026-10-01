import { Component, type ErrorInfo, type ReactNode } from "react";
import { Logo } from "@/shared/brand/Logo";
import { env } from "@/shared/config/env";
import { ErrorState } from "@/shared/kit/ErrorState";

interface AppErrorBoundaryState {
  error: Error | null;
}

/** A render crash shows the popped bubble and a reload, instead of a blank page. */
export class AppErrorBoundary extends Component<{ children: ReactNode }, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (env.isDev) console.error("Unhandled render error", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="min-h-dvh bg-ground text-ink">
        <header className="px-4 pt-4 sm:px-8 sm:pt-6">
          <Logo className="h-11 w-auto sm:h-12" />
        </header>
        <ErrorState
          level="page"
          title="Something popped"
          message="This screen stopped drawing. Nothing you wrote was lost — reloading usually fixes it."
          onRetry={() => window.location.reload()}
          retryLabel="Reload page"
        />
      </div>
    );
  }
}
