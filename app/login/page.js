"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { auth } from "../../firebase";
import { ensureUserProfile } from "../lib/profile";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

import { useRouter } from "next/navigation";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/* Firebase collapsed "no such user" and "wrong password" into one generic
   code to stop email enumeration, so both map to the same message. */
const AUTH_ERRORS = {
  "auth/invalid-credential":
    "Incorrect email or password. Not registered yet? Switch to Register.",
  "auth/invalid-login-credentials":
    "Incorrect email or password. Not registered yet? Switch to Register.",
  "auth/user-not-found": "No account found with that email.",
  "auth/wrong-password": "Incorrect password.",
  "auth/email-already-in-use":
    "That email is already registered. Switch to Login.",
  "auth/invalid-email": "That email address doesn't look valid.",
  "auth/weak-password": "Password must be at least 6 characters.",
  "auth/network-request-failed": "Network error. Check your connection.",
  "auth/too-many-requests": "Too many attempts. Please wait and try again.",
  "auth/operation-not-allowed":
    "Email sign-in is disabled. Contact the hostel admin.",
};

/* Where each flow lands.
   Login  → home, so returning students see the hostel site.
   Admin  → the warden console, a separate page students never route to.
   Register → dashboard, because a new account has empty roll no / room no
   and the profile form is the natural next step. Registration never yields
   an admin (firestore.rules pins new docs to role:"student"), so it has no
   admin branch. */
const AFTER_LOGIN = "/";
const AFTER_ADMIN_LOGIN = "/admin";
const AFTER_REGISTER = "/dashboard";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const router = useRouter();
  const submitting = useRef(false);

  const resetFields = () => {
    setPassword("");
    setConfirm("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting.current) return;

    /* ---------- Client-side checks first, so we don't waste a round-trip ---------- */
    const mail = email.trim();

    if (!mail || !password) {
      toast.error("Please enter your email and password.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (!isLogin) {
      if (name.trim().length < 3) {
        toast.error("Please enter your full name.");
        return;
      }
      if (password !== confirm) {
        toast.error("Passwords do not match.");
        return;
      }
    }

    submitting.current = true;
    setBusy(true);

    try {
      if (isLogin) {
        /* ---------- LOGIN ---------- */
        const { user } = await signInWithEmailAndPassword(auth, mail, password);

        /* Backfills users/{uid} for accounts created before the profile
           schema, and returns the existing doc otherwise — so this doubles
           as the role lookup. One read, no separate getDoc.

           Reading role from Firestore (not a custom claim) keeps this in
           step with firestore.rules, which resolves isAdmin() off the very
           same field. */
        const profile = await ensureUserProfile(user);
        const isAdmin = profile.role === "admin";

        toast.success(isAdmin ? "Signed in as warden." : "Logged in.");

        // replace() rather than push(): the login page shouldn't sit in
        // history, or Back lands a signed-in user right back on the form.
        router.replace(isAdmin ? AFTER_ADMIN_LOGIN : AFTER_LOGIN);
      } else {
        /* ---------- REGISTER ---------- */
        const { user } = await createUserWithEmailAndPassword(
          auth,
          mail,
          password
        );

        // Mirror the name onto the Auth record so it's available app-wide
        await updateProfile(user, { displayName: name.trim() });

        // ensureUserProfile writes the FULL schema from lib/profile.js
        // (collegeId, rollNo, roomNo, bloodGroup…) with serverTimestamp().
        // A manual setDoc here would overwrite those keys with a partial doc.
        await ensureUserProfile(user, { name: name.trim() });

        toast.success("Account created. Add your room and roll number below.");
        router.replace(AFTER_REGISTER);
      }

      // Deliberately not clearing `busy` on success — we're navigating away,
      // and resetting it would flash the button back mid-redirect.
    } catch (error) {
      console.error("Auth Error:", error);
      toast.error(
        AUTH_ERRORS[error?.code] ||
          (isLogin
            ? "Could not sign you in. Please try again."
            : "Could not create your account. Please try again.")
      );
      submitting.current = false;
      setBusy(false);
    }
  };

  const inputCls =
    "w-full rounded-lg border border-white/30 bg-white/20 px-4 py-3 text-base text-white placeholder-gray-300 transition focus:border-white/60 focus:bg-white/25 focus:outline-none focus:ring-2 focus:ring-white/30 disabled:opacity-60";

  return (
    <div
      className="relative flex min-h-dvh items-center justify-center bg-cover bg-center bg-no-repeat px-4 py-10"
      style={{ backgroundImage: "url('/IMG_2162.JPG')" }}
    >
      {/* Scrim: keeps white text readable whatever the photo looks like */}
      <div className="absolute inset-0 bg-slate-900/45" aria-hidden="true" />

      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md rounded-2xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-md sm:p-8"
      >
        <h2 className="mb-1 text-center text-xl font-bold text-white sm:text-2xl">
          {isLogin ? "Welcome Back 👋" : "Create an Account ✨"}
        </h2>
        <p className="mb-6 text-center text-sm text-gray-200">
          {isLogin
            ? "Sign in to view your hostel profile."
            : "Room and roll number come after sign-up."}
        </p>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {!isLogin && (
            <div>
              <label
                htmlFor="name"
                className="mb-1.5 block text-sm font-medium text-white"
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                disabled={busy}
                maxLength={60}
                className={inputCls}
              />
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-white"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              disabled={busy}
              className={inputCls}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-white"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isLogin ? "current-password" : "new-password"}
              disabled={busy}
              className={inputCls}
            />
          </div>

          {!isLogin && (
            <div>
              <label
                htmlFor="confirm"
                className="mb-1.5 block text-sm font-medium text-white"
              >
                Confirm Password
              </label>
              <input
                id="confirm"
                type="password"
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                disabled={busy}
                className={inputCls}
              />
              {confirm && confirm !== password && (
                <p className="mt-1 text-xs text-red-300">
                  Passwords do not match.
                </p>
              )}
            </div>
          )}

          <motion.button
            whileHover={busy ? undefined : { scale: 1.02 }}
            whileTap={busy ? undefined : { scale: 0.98 }}
            type="submit"
            disabled={busy}
            className="mt-2 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg
              bg-indigo-600/90 font-semibold text-white transition
              hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-500/70"
          >
            {busy && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            )}
            {busy
              ? isLogin
                ? "Signing in…"
                : "Creating account…"
              : isLogin
              ? "Login"
              : "Register"}
          </motion.button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-200">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              setIsLogin((v) => !v);
              resetFields(); // don't carry a password across modes
            }}
            className="ml-1 font-semibold text-white hover:underline disabled:opacity-50"
          >
            {isLogin ? "Register" : "Login"}
          </button>
        </p>
      </motion.div>

      <ToastContainer theme="colored" position="top-center" autoClose={2500} />
    </div>
  );
}
