"use client";

import { usePathname } from "next/navigation";
import Navbar from "../navbar/page";
import Footer from "../footer/page";
import PageTransition from "./PageTransition";

/* Auth pages are full-screen and self-contained, so they skip the
   navbar and footer. Isolating this here keeps the root layout a
   server component — usePathname() would force "use client" on it,
   and that would opt the whole app out of server rendering. */
const BARE_ROUTES = ["/login", "/register"];

/* Prefix match, because these own their whole subtree. /admin brings its
   own header via app/admin/layout.js, so the student navbar would stack
   two bars on top of each other. Exact matching would miss the nested
   routes (/admin/students, /admin/payments, …). */
const BARE_PREFIXES = ["/admin"];

export default function LayoutShell({ children }) {
  const pathname = usePathname();

  const bare =
    BARE_ROUTES.includes(pathname) ||
    BARE_PREFIXES.some((p) => pathname === p || pathname?.startsWith(`${p}/`));

  if (bare) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      {/* pt-16 clears the fixed navbar (h-9 logo + py-3 ≈ 60px) */}
      <main className="min-h-dvh pt-16">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
    </>
  );
}
