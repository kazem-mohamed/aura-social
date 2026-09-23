import { ScrollRestoration } from "react-router";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { DocumentTitle } from "./components/DocumentTitle";
import { GuestLayout } from "./GuestLayout";
import { MainLayout } from "./MainLayout";

/** Members get the dock shell; guests get the bare shell. */
export default function RootLayout() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <DocumentTitle />
      <ScrollRestoration />
      {isAuthenticated ? <MainLayout /> : <GuestLayout />}
    </>
  );
}
