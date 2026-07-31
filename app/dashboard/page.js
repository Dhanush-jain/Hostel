"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../../firebase";
import {
  PROFILE_FIELDS,
  emptyProfile,
  ensureUserProfile,
  saveUserProfile,
  profileCompleteness,
  validateProfile,
} from "../lib/profile";
import { ADMISSION_STATUS, watchMyAdmissions } from "../lib/admissions";
import AdmissionStatus from "../components/AdmissionStatus";
import Navbar from "../navbar/page";

/* Room and block are assigned by the warden when they approve an admission,
   and mirrored onto users/{uid}. Once that's happened the student must not
   be able to type over them — otherwise anyone can move themselves into any
   room by editing their profile. Locked in the form AND stripped from the
   save payload, since a disabled input alone stops nothing. */
const ADMIN_MANAGED_FIELDS = ["roomNo", "hostelBlock"];

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(emptyProfile());
  const [draft, setDraft] = useState(emptyProfile());
  const [errors, setErrors] = useState({});
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null); // { kind, text }
  const [subscription, setSubscription] = useState(null);
  const [admission, setAdmission] = useState(null);

  /* ---------- Auth gate + profile load ---------- */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (current) => {
      if (!current) {
        router.replace("/login");
        return;
      }
      setUser(current);
      try {
        const data = await ensureUserProfile(current);
        const merged = { ...emptyProfile(), ...data };
        setProfile(merged);
        setDraft(merged);
      } catch (e) {
        console.error("Profile load failed:", e);
        setToast({ kind: "error", text: "Could not load your profile." });
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, [router]);

  /* ---------- Live admission status ----------
     ensureUserProfile above is a one-shot read, so a room assigned while
     this page is open wouldn't appear in the quick facts until a refresh.
     This listener fires the moment the warden approves, and folds the
     assigned room straight into local state. */
  useEffect(() => {
    if (!user) return;
    const unsub = watchMyAdmissions(
      user.uid,
      (rows) => {
        const latest = rows[0] || null;
        setAdmission(latest);

        if (latest?.status === ADMISSION_STATUS.APPROVED && latest.roomNo) {
          const assigned = {
            roomNo: latest.roomNo,
            hostelBlock: latest.hostelBlock || "",
          };
          setProfile((p) => ({ ...p, ...assigned }));
          // Only touch the draft when it isn't being edited, or we'd yank
          // fields out from under someone mid-form.
          setDraft((d) => ({ ...d, ...assigned }));
        }
      },
      (e) => console.error("Admission watch failed:", e)
    );
    return unsub;
  }, [user]);

  /* ---------- Latest meal subscription, if any ---------- */
  useEffect(() => {
    if (!user) return;
    let alive = true;
    (async () => {
      try {
        const snap = await getDocs(
          query(collection(db, "mealSubscriptions"), where("uid", "==", user.uid))
        );
        const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        // serverTimestamp() is briefly null after a write, so guard the sort
        all.sort(
          (a, b) =>
            (b.timestamp?.toMillis?.() ?? 0) - (a.timestamp?.toMillis?.() ?? 0)
        );
        if (alive) setSubscription(all[0] || null);
      } catch (e) {
        console.error("Subscription lookup failed:", e);
      }
    })();
    return () => {
      alive = false;
    };
  }, [user]);

  /* ---------- Auto-dismiss toast ---------- */
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const roomLocked = admission?.status === ADMISSION_STATUS.APPROVED;

  const completeness = useMemo(() => profileCompleteness(profile), [profile]);
  const dirty = useMemo(
    () =>
      PROFILE_FIELDS.some((f) => (draft[f.key] ?? "") !== (profile[f.key] ?? "")),
    [draft, profile]
  );

  const setField = (key) => (e) => {
    const v = e.target.value;
    setDraft((p) => ({ ...p, [key]: v }));
    // Clear the error as soon as the user starts fixing it
    setErrors((p) => (p[key] ? { ...p, [key]: undefined } : p));
  };

  const cancelEdit = () => {
    setDraft(profile);
    setErrors({});
    setEditing(false);
  };

  const handleSave = useCallback(async () => {
    const found = validateProfile(draft);
    if (Object.keys(found).length) {
      setErrors(found);
      setToast({ kind: "error", text: "Please fix the highlighted fields." });
      return;
    }

    setSaving(true);
    try {
      /* Drop the warden-assigned fields from the payload once admission is
         approved. saveUserProfile writes only the keys it receives, so
         omitting them leaves the stored values untouched. */
      const payload = { ...draft };
      if (roomLocked) ADMIN_MANAGED_FIELDS.forEach((k) => delete payload[k]);

      const saved = await saveUserProfile(user.uid, payload);

      // Keep the Auth displayName in step with the profile name
      if (saved.name && saved.name !== user.displayName) {
        await updateProfile(auth.currentUser, { displayName: saved.name });
      }

      const merged = { ...profile, ...saved };
      setProfile(merged);
      setDraft(merged);
      setEditing(false);
      setToast({ kind: "ok", text: "Profile updated." });
    } catch (e) {
      console.error("Save failed:", e);
      setToast({ kind: "error", text: "Could not save. Check your connection." });
    } finally {
      setSaving(false);
    }
  }, [draft, profile, user, roomLocked]);

  /* ---------- Loading skeleton ---------- */
  if (loading) {
    return (
      <div className="min-h-dvh bg-slate-50 px-4 py-8">
        <div className="mx-auto max-w-4xl space-y-4">
          <div className="h-28 animate-pulse rounded-2xl bg-slate-200" />
          <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />
        </div>
      </div>
    );
  }

  const initials =
    (profile.name || user?.email || "?")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("") || "?";

  return (
    <>
      <Navbar />
      <div className="min-h-dvh bg-slate-50 mt-9 pb-26">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
          {/* ---------- Identity header ---------- */}
          <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <div className="h-20 bg-gradient-to-r from-blue-600 to-indigo-600 sm:h-24" />
            <div className="px-4 pb-5 sm:px-6">
              <div className="-mt-10 flex flex-col gap-4 sm:-mt-12 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex items-end gap-3 sm:gap-4">
                  <span className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl border-4 border-white bg-slate-900 text-xl font-bold text-white shadow-md sm:h-24 sm:w-24 sm:text-2xl">
                    {initials}
                  </span>
                  <div className="min-w-0 pb-1">
                    <h1 className="truncate text-lg font-bold text-slate-900 sm:text-2xl">
                      {profile.name || "Add your name"}
                    </h1>
                    <p className="truncate text-xs text-slate-500 sm:text-sm">
                      {user?.email}
                    </p>
                  </div>
                </div>

                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="min-h-[44px] shrink-0 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-700"
                  >
                    Edit profile
                  </button>
                )}
              </div>

              {/* Quick facts */}
              <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  ["Roll No", profile.rollNo],
                  ["Room", profile.roomNo],
                  ["Block", profile.hostelBlock],
                  ["Year", profile.year],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-slate-50 px-3 py-2.5">
                    <dt className="text-[0.7rem] uppercase tracking-wide text-slate-500">
                      {label}
                    </dt>
                    <dd className="mt-0.5 truncate text-sm font-semibold text-slate-900">
                      {value || "—"}
                    </dd>
                  </div>
                ))}
              </dl>

              {/* Completeness meter */}
              <div className="mt-4">
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-600">
                    Profile completeness
                  </span>
                  <span className="font-semibold tabular-nums text-slate-900">
                    {completeness}%
                  </span>
                </div>
                <div
                  className="h-2 w-full overflow-hidden rounded-full bg-slate-200"
                  role="progressbar"
                  aria-valuenow={completeness}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      completeness === 100
                        ? "bg-green-500"
                        : completeness >= 60
                        ? "bg-blue-600"
                        : "bg-amber-500"
                    }`}
                    style={{ width: `${completeness}%` }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ---------- Admission status ----------
              Sits directly under the identity card: "did I get a room?" is
              the first thing a student opens this page to find out, ahead of
              whether their details are saved. */}
          <section className="mt-4">
            {/* <AdmissionStatus /> */}
          </section>

          {/* ---------- Meal subscription tie-in ---------- */}
          <section className="mt-4 rounded-2xl bg-white p-4 shadow-sm sm:p-5">
            <h2 className="text-sm font-semibold text-slate-700 sm:text-base">
              Mess Subscription
            </h2>
            {subscription ? (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold capitalize text-slate-900">
                    {subscription.plan} · {subscription.duration}
                  </p>
                  <p className="text-xs tabular-nums text-slate-500">
                    ₹{Number(subscription.amount || 0).toLocaleString("en-IN")} paid
                  </p>
                </div>
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  Active
                </span>
              </div>
            ) : (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-slate-500">No active subscription.</p>
                <Link
                  href="/mess"
                  className="min-h-[40px] rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Subscribe
                </Link>
              </div>
            )}
          </section>

          {/* ---------- Editable details ---------- */}
          <section className="mt-4 rounded-2xl bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5 sm:px-6">
              <h2 className="text-sm font-semibold text-slate-700 sm:text-base">
                Personal Details
              </h2>
              {editing && (
                <span className="text-xs text-slate-400">
                  {dirty ? "Unsaved changes" : "No changes"}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:gap-5 sm:p-6">
              {/* Email is read-only: changing it needs re-authentication */}
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Email{" "}
                  <span className="text-xs text-slate-400">(cannot be changed)</span>
                </label>
                <input
                  value={user?.email || ""}
                  readOnly
                  disabled
                  className="min-h-[46px] w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-4 text-base text-slate-500"
                />
              </div>

              {PROFILE_FIELDS.map((f) => {
                const err = errors[f.key];
                const value = draft[f.key] ?? "";
                const wide = f.type === "textarea";
                const locked = roomLocked && ADMIN_MANAGED_FIELDS.includes(f.key);
                const disabled = !editing || locked;

                const base = `w-full rounded-lg border px-4 text-base transition
                focus:outline-none focus:ring-2
                  ${
                    err
                      ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                      : "border-slate-300 focus:border-blue-500 focus:ring-blue-200"
                  }
                  ${disabled ? "cursor-default bg-slate-50 text-slate-600" : "bg-white"}`;

                return (
                  <div key={f.key} className={wide ? "sm:col-span-2" : ""}>
                    <label
                      htmlFor={f.key}
                      className="mb-1.5 block text-sm font-medium text-slate-700"
                    >
                      {f.label}
                      {f.required && <span className="ml-0.5 text-red-500">*</span>}
                      {locked && (
                        <span className="ml-1.5 text-xs font-normal text-slate-400">
                          (assigned by warden)
                        </span>
                      )}
                    </label>

                    {f.type === "select" ? (
                      <select
                        id={f.key}
                        value={value}
                        onChange={setField(f.key)}
                        disabled={disabled}
                        className={`${base} min-h-[46px]`}
                      >
                        <option value="">Select…</option>
                        {f.options.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    ) : f.type === "textarea" ? (
                      <textarea
                        id={f.key}
                        value={value}
                        onChange={setField(f.key)}
                        disabled={disabled}
                        rows={3}
                        maxLength={f.maxLength}
                        placeholder={editing ? f.placeholder : "—"}
                        className={`${base} resize-y py-3`}
                      />
                    ) : (
                      <div className="relative">
                        {f.prefix && (
                          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                            {f.prefix}
                          </span>
                        )}
                        <input
                          id={f.key}
                          type={f.type}
                          inputMode={f.type === "tel" ? "numeric" : undefined}
                          value={value}
                          onChange={setField(f.key)}
                          disabled={disabled}
                          maxLength={f.maxLength}
                          placeholder={editing ? f.placeholder : "—"}
                          className={`${base} min-h-[46px] ${f.prefix ? "pl-12" : ""}`}
                        />
                      </div>
                    )}

                    {err && <p className="mt-1 text-xs text-red-600">{err}</p>}
                  </div>
                );
              })}
            </div>

            {editing && (
              <div className="flex flex-col-reverse gap-2 border-t border-slate-100 px-4 py-4 sm:flex-row sm:justify-end sm:px-6">
                <button
                  onClick={cancelEdit}
                  disabled={saving}
                  className="min-h-[46px] rounded-lg border border-slate-300 px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !dirty}
                  className="min-h-[46px] rounded-lg bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:bg-slate-400"
                >
                  {saving ? "Saving…" : "Save changes"}
                </button>
              </div>
            )}
          </section>
        </div>

        {/* ---------- Toast ---------- */}
        {toast && (
          <div
            role="status"
            className={`fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-xl px-5 py-3 text-sm font-medium shadow-lg ${
              toast.kind === "ok" ? "bg-green-600 text-white" : "bg-red-600 text-white"
            }`}
          >
            {toast.text}
          </div>
        )}
      </div>
    </>
  );
}
