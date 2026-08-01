"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useRole } from "../lib/useRole";
// Add this import at the top
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";


/* Every admin subroute in one place. Adding a folder under app/admin/
   means adding one line here — the gate itself needs no change. */
const ADMIN_NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/students", label: "Students" },
  { href: "/admin/admissions", label: "Admissions" },
  { href: "/admin/bookedrooms", label: "Booked Rooms" },
  { href: "/admin/mess", label: "Mess" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/complaints", label: "Complaints" },
];

export default function AdminLayout({ children }) {
  const { user, role, ready } = useRole();
  const router = useRouter();
  const pathname = usePathname();

  /* One gate for all of /admin/**. Redirect lives in an effect because
     router calls during render are not allowed. */
  useEffect(() => {
    if (!ready) return;
    if (!user) router.replace("/login");
    else if (role !== "admin") router.replace("/dashboard");
  }, [ready, user, role, router]);

  /* Block the render entirely until the role is confirmed — otherwise a
     student sees a flash of admin data before the redirect lands. */
  if (!ready) {
    return (
      <div className="grid min-h-dvh place-items-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-slate-200 border-t-blue-600" />
      </div>
    );
  }

  if (!user || role !== "admin") {
    return (
      <div className="grid min-h-dvh place-items-center bg-slate-50 px-4">
        <div className="max-w-sm text-center">
          <p className="text-3xl">🔒</p>
          <h1 className="mt-3 text-lg font-bold text-slate-900">
            Admin access only
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Redirecting you to your dashboard…
          </p>
        </div>
      </div>
    );
  }

  const isActive = (href) =>
    href === "/admin" ? pathname === "/admin" : pathname?.startsWith(href);

  return (
    <div className="min-h-dvh bg-slate-50">
      {/* Admin bar — distinct from the student navbar so you always know
          which side of the app you're on */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-14 items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-amber-500 text-xs font-bold text-white">
                A
              </span>
              <span className="truncate font-semibold text-white">
                Admin Panel
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <span className="hidden truncate text-xs text-slate-400 sm:block">
                {user.email}
              </span>
           <button
  onClick={() => signOut(auth).then(() => router.replace("/login"))}
  className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
>
  Exit to site
</button>

            </div>
          </div>

          {/* Horizontal scroll on mobile rather than wrapping into two rows */}
          <nav className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
            {ADMIN_NAV.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                aria-current={isActive(href) ? "page" : undefined}
                className={`shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition
                  ${
                    isActive(href)
                      ? "bg-amber-500 text-white"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
