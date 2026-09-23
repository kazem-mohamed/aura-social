import type { ReactNode } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";

/** `/` is the wall for members and the front door for guests. */
export function HomeGate({ member, guest }: { member: ReactNode; guest: ReactNode }) {
  const { isAuthenticated } = useAuth();
  return <>{isAuthenticated ? member : guest}</>;
}
