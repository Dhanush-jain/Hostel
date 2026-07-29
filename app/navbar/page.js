"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";

/* Public pages only. My Profile is rendered separately as a pill so it can
   never be squeezed out by the long labels in this list. */
const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/mess", label: "Mess Facility" },
  { href: "/rules", label: "Rules" },
  { href: "/admission", label: "Admission" },
  { href: "/contact", label: "Contact" },
];

/* Small inline icons */
const UserIcon = (p) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...p}
  >
    <circle cx="12" cy="8" r="3.5" />
    <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
  </svg>
);

const LogoutIcon = (p) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...p}
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="m16 17 5-5-5-5M21 12H9" />
  </svg>
);

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (href) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  /* Track auth so we show My Profile + Logout to signed-in users and
     Login + Register to everyone else. */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  // Handle Firebase logout — guarded so a double-tap can't fire signOut twice
  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    setOpen(false);
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      setLoggingOut(false);
    }
  };

  // Glass + shadow once you leave the top. rAF-throttled and passive so it
  // never blocks the scroll thread.
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 8);
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Escape to dismiss
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Lock body scroll while the drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Bail out of mobile state if the viewport grows past the breakpoint
  useEffect(() => {
    const onResize = () => window.innerWidth >= 1280 && setOpen(false);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const initials =
    (user?.displayName || user?.email || "")
      .split(/[\s@.]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("") || "?";

  return (
    <>
      <nav
        className={`fixed left-0 top-0 z-50 w-full transition-all duration-300
          ${
            scrolled
              ? "border-b border-slate-200/80 bg-white/85 shadow-sm backdrop-blur-xl backdrop-saturate-150"
              : "border-b border-transparent bg-white"
          }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          {/* Logo */}
          <Link
            href="/"
            className="group flex shrink-0 items-center gap-2.5 rounded-lg py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-md shadow-blue-600/25 transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-105">
              G
            </span>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              GIT
            </span>
          </Link>

          {/* Desktop row — xl (1280px), not lg. Seven items plus the auth
              controls need ~1050px, so lg:1024 clipped the last ones. */}
          <div className="hidden items-center xl:flex">
            {links.map(({ href, label }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`relative shrink-0 whitespace-nowrap rounded-lg px-2.5 py-2 text-[0.875rem] font-medium transition-colors
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                    ${
                      active
                        ? "text-blue-600"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                >
                  {label}
                  {/* Gradient underline marks the current page */}
                  <span
                    className={`pointer-events-none absolute inset-x-2.5 -bottom-px h-0.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-transform duration-300 ${
                      active ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                </Link>
              );
            })}

            <span className="mx-2.5 h-6 w-px shrink-0 bg-slate-200" aria-hidden="true" />

            {/* Auth controls. Rendered only once auth resolves, so a signed-out
                visitor never sees a flash of Logout. */}
            {!authReady ? (
              <span className="h-9 w-36 animate-pulse rounded-lg bg-slate-100" />
            ) : user ? (
              <div className="flex shrink-0 items-center gap-2">
                {/* My Profile — a distinct pill, so it can't blend into the
                    grey link row or get pushed out by the long labels */}
                <Link
                  href="/dashboard"
                  aria-current={isActive("/dashboard") ? "page" : undefined}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-[0.875rem] font-semibold transition
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
                    ${
                      isActive("/dashboard")
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                        : "bg-slate-900 text-white hover:bg-slate-700"
                    }`}
                >
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-white/20 text-[0.6rem] font-bold">
                    {initials}
                  </span>
                  My Profile
                </Link>

                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  title="Logout"
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-slate-200
                    text-slate-500 transition
                    hover:border-red-200 hover:bg-red-50 hover:text-red-600
                    disabled:cursor-not-allowed disabled:opacity-50
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2"
                  aria-label="Logout"
                >
                  {loggingOut ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
                  ) : (
                    <LogoutIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
            ) : (
              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href="/login"
                  className="whitespace-nowrap rounded-lg px-3 py-2 text-[0.875rem] font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="whitespace-nowrap rounded-lg bg-blue-600 px-3.5 py-2 text-[0.875rem] font-semibold text-white shadow-md shadow-blue-600/25 transition hover:bg-blue-700"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile: profile shortcut sits outside the drawer so it's always
              one tap away */}
          <div className="flex items-center gap-1 xl:hidden">
            {authReady && user && (
              <Link
                href="/dashboard"
                aria-label="My Profile"
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg text-xs font-bold transition
                  ${
                    isActive("/dashboard")
                      ? "bg-blue-600 text-white"
                      : "bg-slate-900 text-white hover:bg-slate-700"
                  }`}
              >
                {initials}
              </Link>
            )}

            {/* Hamburger */}
            <button
              className="relative h-11 w-11 shrink-0 rounded-lg transition-colors hover:bg-slate-100
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-menu"
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className={`absolute left-1/2 top-1/2 h-[3px] w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-800 transition-all duration-300
                    ${
                      i === 0
                        ? open
                          ? "rotate-45"
                          : "-translate-y-[9px]"
                        : i === 1
                        ? open
                          ? "scale-x-0 opacity-0"
                          : ""
                        : open
                        ? "-rotate-45"
                        : "translate-y-[5px]"
                    }`}
                />
              ))}
            </button>
          </div>
        </div>
      </nav>

      {/* Backdrop */}
      <button
        aria-hidden="true"
        tabIndex={-1}
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 xl:hidden
          ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />

      {/* Mobile drawer */}
      <aside
        id="mobile-menu"
        aria-hidden={!open}
        className={`fixed right-0 top-0 z-50 flex h-dvh w-[min(20rem,85vw)] flex-col
          border-l border-slate-200 bg-white shadow-2xl transition-transform duration-400 ease-out xl:hidden
          ${open ? "translate-x-0" : "translate-x-full"}`}
        style={{ transitionTimingFunction: "cubic-bezier(.22,1,.36,1)" }}
      >
        {/* Header doubles as the signed-in identity card */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3.5">
          {authReady && user ? (
            <span className="flex min-w-0 items-center gap-2.5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-bold text-white">
                {initials}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-slate-900">
                  {user.displayName || "Student"}
                </span>
                <span className="block truncate text-xs text-slate-500">
                  {user.email}
                </span>
              </span>
            </span>
          ) : (
            <span className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-bold text-white">
                G
              </span>
              <span className="font-bold text-slate-900">GIT</span>
            </span>
          )}

          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="h-5 w-5"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          {links.map(({ href, label }, i) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                onClick={() => setOpen(false)}
                style={{ transitionDelay: open ? `${60 + i * 45}ms` : "0ms" }}
                className={`flex min-h-[48px] items-center gap-3 rounded-xl px-3.5 text-[0.95rem] font-medium
                  transition-all duration-400
                  ${open ? "translate-x-0 opacity-100" : "translate-x-5 opacity-0"}
                  ${
                    active
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full transition-colors ${
                    active ? "bg-blue-600" : "bg-slate-300"
                  }`}
                />
                {label}
              </Link>
            );
          })}

          {/* My Profile — highlighted, below a separator */}
          {authReady && user && (
            <>
              <span className="my-2 block h-px bg-slate-100" aria-hidden="true" />
              <Link
                href="/dashboard"
                aria-current={isActive("/dashboard") ? "page" : undefined}
                onClick={() => setOpen(false)}
                style={{ transitionDelay: open ? `${60 + links.length * 45}ms` : "0ms" }}
                className={`flex min-h-[48px] items-center gap-3 rounded-xl px-3.5 text-[0.95rem] font-semibold
                  transition-all duration-400
                  ${open ? "translate-x-0 opacity-100" : "translate-x-5 opacity-0"}
                  ${
                    isActive("/dashboard")
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                  }`}
              >
                <UserIcon className="h-4 w-4" />
                My Profile
              </Link>
            </>
          )}
        </nav>

        <div className="space-y-2 border-t border-slate-100 p-3">
          {!authReady ? (
            <span className="block h-12 animate-pulse rounded-xl bg-slate-100" />
          ) : user ? (
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-slate-200
                px-4 text-[0.95rem] font-semibold text-slate-600 transition
                hover:border-red-200 hover:bg-red-50 hover:text-red-600
                disabled:cursor-not-allowed disabled:opacity-50"
            >
              <LogoutIcon className="h-4 w-4" />
              {loggingOut ? "Logging out…" : "Logout"}
            </button>
          ) : (
            <>
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="flex min-h-[48px] w-full items-center justify-center rounded-xl bg-blue-600 px-4 text-[0.95rem] font-semibold text-white transition hover:bg-blue-700"
              >
                Register
              </Link>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex min-h-[48px] w-full items-center justify-center rounded-xl border border-slate-200 px-4 text-[0.95rem] font-semibold text-slate-600 transition hover:bg-slate-100"
              >
                Log in
              </Link>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
