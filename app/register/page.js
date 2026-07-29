"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../../firebase";
import { ensureUserProfile } from "../lib/profile";

/* Firebase error codes → messages a student can act on. */
const AUTH_ERRORS = {
  "auth/email-already-in-use":
    "That email is already registered. Try logging in instead.",
  "auth/invalid-email": "That email address doesn't look valid.",
  "auth/weak-password": "Password is too weak. Use at least 6 characters.",
  "auth/network-request-failed":
    "Network error. Check your connection and try again.",
  "auth/operation-not-allowed":
    "Email sign-up is disabled. Contact the hostel admin.",
  "auth/too-many-requests": "Too many attempts. Please wait and try again.",
};

/** Cheap 0-4 strength score. Not security — just feedback. */
function scorePassword(pw) {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 6) s++;
  if (pw.length >= 10) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

const STRENGTH = [
  { label: "", color: "" },
  { label: "Weak", color: "bg-red-500" },
  { label: "Fair", color: "bg-amber-500" },
  { label: "Good", color: "bg-blue-500" },
  { label: "Strong", color: "bg-green-500" },
];

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [touched, setTouched] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);

  /* Already signed in? Skip the form. Also stops a logged-in user from
     creating a second account by hitting /register directly. */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) router.replace("/dashboard");
      else setCheckingAuth(false);
    });
    return () => unsub();
  }, [router]);

  const set = (k) => (e) => {
    setForm((p) => ({ ...p, [k]: e.target.value }));
    if (error) setError("");
  };
  const blur = (k) => () => setTouched((p) => ({ ...p, [k]: true }));

  const strength = useMemo(() => scorePassword(form.password), [form.password]);

  /* Per-field messages, shown only after the field has been touched. */
  const fieldErrors = useMemo(() => {
    const e = {};
    if (form.name && form.name.trim().length < 3)
      e.name = "Enter your full name (at least 3 characters).";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email.trim()))
      e.email = "That email address doesn't look valid.";
    if (form.password && form.password.length < 6)
      e.password = "Password must be at least 6 characters.";
    if (form.confirm && form.confirm !== form.password)
      e.confirm = "Passwords do not match.";
    return e;
  }, [form]);

  const canSubmit =
    form.name.trim().length >= 3 &&
    /^\S+@\S+\.\S+$/.test(form.email.trim()) &&
    form.password.length >= 6 &&
    form.confirm === form.password &&
    agreed &&
    !busy;

  const handleRegister = async (e) => {
    e.preventDefault();
    if (busy) return;

    // Re-check on submit: guards against Enter-key bypass of the disabled button
    setTouched({ name: true, email: true, password: true, confirm: true });
    if (!canSubmit) {
      if (!agreed) setError("Please accept the hostel rules to continue.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      const { user } = await createUserWithEmailAndPassword(
        auth,
        form.email.trim(),
        form.password
      );

      // Mirror the name onto the Auth record so it's available app-wide
      await updateProfile(user, { displayName: form.name.trim() });

      // Create users/{uid} — where phone, roll no, room no etc. will live
      await ensureUserProfile(user, { name: form.name.trim() });

      // No setBusy(false) on success: we're navigating away, and clearing it
      // would flash the button back to "Register" mid-redirect.
      router.push("/dashboard");
    } catch (err) {
      console.error("Register error:", err);
      setError(
        AUTH_ERRORS[err?.code] || "Could not create your account. Please try again."
      );
      setBusy(false);
    }
  };

  /* Avoid flashing the form before the auth check resolves. */
  if (checkingAuth) {
    return (
      <div className="grid min-h-dvh place-items-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-slate-200 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-slate-50 px-4 py-8 sm:px-6 sm:py-12">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white p-6 shadow-lg sm:p-8">
          {/* ---------- Header ---------- */}
          <div className="mb-6 text-center">
            <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-lg font-bold text-white shadow-md shadow-blue-600/25">
              G
            </span>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Create your account
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Room number, roll number and other details come after sign-up.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="mt-0.5 h-4 w-4 shrink-0"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* noValidate: our own messages replace the browser's tooltips */}
          <form onSubmit={handleRegister} noValidate className="space-y-4">
            {/* ---------- Name ---------- */}
            <div>
              <label
                htmlFor="name"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={set("name")}
                onBlur={blur("name")}
                autoComplete="name"
                placeholder="Rahul Sharma"
                maxLength={60}
                className={`min-h-[48px] w-full rounded-lg border px-4 text-base transition
                  focus:outline-none focus:ring-2
                  ${
                    touched.name && fieldErrors.name
                      ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                      : "border-slate-300 focus:border-blue-500 focus:ring-blue-200"
                  }`}
              />
              {touched.name && fieldErrors.name && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>
              )}
            </div>

            {/* ---------- Email ---------- */}
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={set("email")}
                onBlur={blur("email")}
                autoComplete="email"
                placeholder="you@example.com"
                className={`min-h-[48px] w-full rounded-lg border px-4 text-base transition
                  focus:outline-none focus:ring-2
                  ${
                    touched.email && fieldErrors.email
                      ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                      : "border-slate-300 focus:border-blue-500 focus:ring-blue-200"
                  }`}
              />
              {touched.email && fieldErrors.email && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
              )}
            </div>

            {/* ---------- Password ---------- */}
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={set("password")}
                  onBlur={blur("password")}
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                  className={`min-h-[48px] w-full rounded-lg border pl-4 pr-12 text-base transition
                    focus:outline-none focus:ring-2
                    ${
                      touched.password && fieldErrors.password
                        ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                        : "border-slate-300 focus:border-blue-500 focus:ring-blue-200"
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                  className="absolute right-1 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  {showPw ? (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      className="h-5 w-5"
                    >
                      <path d="M3 3l18 18M10.6 10.6a2 2 0 1 0 2.8 2.8" />
                      <path d="M6.5 6.6C4.6 7.9 3.973 9.5 2.5 12c0 0 3.5 6 9.5 6 1.4 0 2.6-.3 3.7-.8M17.9 17.4c1.8-1.3 3.6-5.4 3.6-5.4s-3.5-6-9.5-6c-.6 0-1.2.06-1.7.17" />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      className="h-5 w-5"
                    >
                      <path d="M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
                      <circle cx="12" cy="12" r="2.6" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Strength meter */}
              {form.password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex flex-1 gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <span
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                          i <= strength ? STRENGTH[strength].color : "bg-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="w-12 text-right text-xs font-medium text-slate-500">
                    {STRENGTH[strength].label}
                  </span>
                </div>
              )}

              {touched.password && fieldErrors.password && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
              )}
            </div>

            {/* ---------- Confirm ---------- */}
            <div>
              <label
                htmlFor="confirm"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Confirm Password
              </label>
              <input
                id="confirm"
                type={showPw ? "text" : "password"}
                value={form.confirm}
                onChange={set("confirm")}
                onBlur={blur("confirm")}
                autoComplete="new-password"
                placeholder="Re-enter your password"
                className={`min-h-[48px] w-full rounded-lg border px-4 text-base transition
                  focus:outline-none focus:ring-2
                  ${
                    touched.confirm && fieldErrors.confirm
                      ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                      : "border-slate-300 focus:border-blue-500 focus:ring-blue-200"
                  }`}
              />
              {touched.confirm && fieldErrors.confirm && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.confirm}</p>
              )}
              {form.confirm && form.confirm === form.password && (
                <p className="mt-1 flex items-center gap-1 text-xs text-green-600">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    className="h-3.5 w-3.5"
                  >
                    <path d="m5 13 4 4L19 7" />
                  </svg>
                  Passwords match
                </p>
              )}
            </div>

            {/* ---------- Rules consent ---------- */}
            <label className="flex cursor-pointer items-start gap-2.5 pt-1">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-blue-600"
              />
              <span className="text-xs leading-relaxed text-slate-600">
                I have read and agree to the{" "}
                <Link
                  href="/rules"
                  className="font-semibold text-blue-600 hover:underline"
                >
                  hostel rules and regulations
                </Link>
                .
              </span>
            </label>

            {/* ---------- Submit ---------- */}
            <button
              type="submit"
              disabled={!canSubmit}
              className="mt-2 flex min-h-[50px] w-full items-center justify-center gap-2 rounded-lg
                bg-blue-600 text-base font-semibold text-white transition
                hover:bg-blue-700 active:scale-[.99]
                disabled:cursor-not-allowed disabled:bg-slate-300 disabled:active:scale-100
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
            >
              {busy && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              )}
              {busy ? "Creating account…" : "Register"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            Already registered?{" "}
            <Link
              href="/login"
              className="font-semibold text-blue-600 hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>

        <p className="mt-5 text-center text-xs text-slate-400">
          Hostel Management · GIT
        </p>
      </div>
    </div>
  );
}
