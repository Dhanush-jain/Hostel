"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Navbar from "../navbar/page";
import Footer from "../footer/page";
import PageTransition from "./PageTransition";
import { useRole } from "../lib/useRole";

const BARE_ROUTES = ["/login", "/register"];
const BARE_PREFIXES = ["/admin"];

export default function LayoutShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, ready } = useRole();

  // If a warden lands on any student page, bounce them to /admin
  useEffect(() => {
    if (!ready) return;
    const isAdminRoute =
      BARE_PREFIXES.some((p) => pathname === p || pathname?.startsWith(`${p}/`));
    if (user && role === "admin" && !isAdminRoute) {
      router.replace("/admin");
    }
  }, [ready, user, role, pathname, router]);

  const bare =
    BARE_ROUTES.includes(pathname) ||
    BARE_PREFIXES.some((p) => pathname === p || pathname?.startsWith(`${p}/`));

  if (bare) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-dvh pt-16">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
    </>
  );
}
