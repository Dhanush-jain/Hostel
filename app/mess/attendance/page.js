"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { db, auth } from "../../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

const MEALS = [
  { key: "breakfast", label: "Breakfast", startHour: 7, endHour: 10, emoji: "🌅" },
  { key: "lunch", label: "Lunch", startHour: 12, endHour: 15, emoji: "☀️" },
  { key: "dinner", label: "Dinner", startHour: 19, endHour: 22, emoji: "🌙" },
];

const PLAN_COVERAGE = {
  breakfast: ["breakfast"],
  lunch: ["lunch"],
  dinner: ["dinner"],
  all: ["breakfast", "lunch", "dinner"],
  two: ["breakfast", "lunch", "dinner"],
};
const TWO_MEAL_CAP = 2;

function localDateKey(d = new Date()) {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function detectMeal(d = new Date()) {
  const h = d.getHours() + d.getMinutes() / 60;
  const open = MEALS.find((m) => h >= m.startHour && h < m.endHour);
  if (open) return open.key;
  const next = MEALS.find((m) => h < m.startHour);
  return (next || MEALS[0]).key;
}

export default function AttendancePage() {
  const [dateKey] = useState(() => localDateKey());
  const [meal, setMeal] = useState(() => detectMeal());

  const [currentUser, setCurrentUser] = useState(undefined);
  const [subscription, setSubscription] = useState(null);
  const [todayRecords, setTodayRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* -------- Wait for auth -------- */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user ?? null);
    });
    return unsub;
  }, []);

  /* -------- Load this student's subscription -------- */
  const loadSubscription = useCallback(async (uid) => {
    const q = query(
      collection(db, "mealSubscriptions"),
      where("uid", "==", uid)
    );
    const snap = await getDocs(q);
    if (snap.empty) {
      setSubscription(null);
      return;
    }
    // Pick the most recent subscription
    const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const latest = docs.sort(
      (a, b) => (b.timestamp?.toMillis?.() ?? 0) - (a.timestamp?.toMillis?.() ?? 0)
    )[0];
    setSubscription(latest);
  }, []);

  /* -------- Load this student's attendance today -------- */
  const loadToday = useCallback(async (uid) => {
    const q = query(
      collection(db, "mealAttendance"),
      where("uid", "==", uid),
      where("dateKey", "==", dateKey)
    );
    const snap = await getDocs(q);
    setTodayRecords(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }, [dateKey]);

  /* -------- Only run after auth confirms -------- */
  useEffect(() => {
    if (currentUser === undefined) return;
    if (!currentUser) {
      setLoading(false);
      setError("You must be signed in to mark attendance.");
      return;
    }

    let alive = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        await Promise.all([
          loadSubscription(currentUser.uid),
          loadToday(currentUser.uid),
        ]);
      } catch (e) {
        console.error("Failed loading attendance data:", e);
        if (alive) setError("Could not load data. Check your connection and retry.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [currentUser, loadSubscription, loadToday]);

  /* -------- Derived state -------- */
  const mealsTodayCount = todayRecords.length;

  const alreadyCheckedIn = useMemo(
    () => todayRecords.some((r) => r.meal === meal),
    [todayRecords, meal]
  );

  const entitlement = useMemo(() => {
    if (!subscription) return { ok: false, reason: "No active subscription found." };
    const covered = PLAN_COVERAGE[subscription.plan] || [];
    if (!covered.includes(meal))
      return { ok: false, reason: `Your plan covers: ${covered.join(", ") || "nothing"}.` };
    if (subscription.plan === "two" && !alreadyCheckedIn && mealsTodayCount >= TWO_MEAL_CAP)
      return { ok: false, reason: `Daily limit reached (${TWO_MEAL_CAP}/2).` };
    return { ok: true, reason: "" };
  }, [subscription, meal, alreadyCheckedIn, mealsTodayCount]);

  /* -------- Check in -------- */
  const checkIn = async () => {
    if (!currentUser || !entitlement.ok || alreadyCheckedIn) return;

    const recordId = `${currentUser.uid}_${dateKey}_${meal}`;
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await setDoc(
        doc(db, "mealAttendance", recordId),
        {
          uid: currentUser.uid,
          name: currentUser.displayName || currentUser.email || "Unknown",
          email: currentUser.email || null,
          plan: subscription?.plan || null,
          meal,
          dateKey,
          isGuest: false,
          servedAt: serverTimestamp(),
        },
        { merge: true }
      );
      setTodayRecords((prev) => [
        ...prev,
        { id: recordId, uid: currentUser.uid, meal, dateKey, isGuest: false },
      ]);
      setSuccess(`${MEALS.find((m) => m.key === meal)?.label} attendance marked!`);
    } catch (e) {
      console.error("Check-in failed:", e);
      setError("Could not mark attendance. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const activeMeal = MEALS.find((m) => m.key === meal);

  if (currentUser === undefined) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <p className="text-sm text-slate-500">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900">
      <div className="mx-auto w-full max-w-md px-4 py-8 sm:px-6">

        <header className="mb-6 text-center">
          <h1 className="text-xl font-bold sm:text-2xl">Mess Attendance</h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            {new Date(dateKey).toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
          {currentUser && (
            <p className="mt-1 text-xs text-slate-400">{currentUser.email}</p>
          )}
        </header>

        {/* Meal selector */}
        <div className="mb-6 grid grid-cols-3 gap-2 rounded-xl bg-white p-2 shadow-sm">
          {MEALS.map((m) => {
            const on = m.key === meal;
            const done = todayRecords.some((r) => r.meal === m.key);
            return (
              <button
                key={m.key}
                onClick={() => { setMeal(m.key); setSuccess(""); setError(""); }}
                aria-pressed={on}
                className={`relative min-h-[48px] rounded-lg px-2 py-2 text-xs font-semibold transition sm:text-sm
                  ${on
                    ? "bg-blue-600 text-white shadow"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                <span className="mr-1">{m.emoji}</span>
                {m.label}
                {done && (
                  <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-green-400" />
                )}
              </button>
            );
          })}
        </div>

        {/* Status card */}
        <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm text-center">
          {loading ? (
            <div className="h-20 animate-pulse rounded-lg bg-slate-100" />
          ) : (
            <>
              <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
                {activeMeal?.emoji} {activeMeal?.label}
              </p>
              {subscription ? (
                <p className="text-sm text-slate-600">
                  Plan: <span className="font-semibold capitalize">{subscription.plan}</span>
                  {subscription.duration && ` · ${subscription.duration}`}
                </p>
              ) : (
                <p className="text-sm text-amber-600 font-medium">No active subscription</p>
              )}

              {alreadyCheckedIn ? (
                <div className="mt-4 rounded-xl bg-green-50 py-4">
                  <p className="text-2xl">✓</p>
                  <p className="mt-1 text-sm font-semibold text-green-700">
                    Already marked for {activeMeal?.label}
                  </p>
                </div>
              ) : !entitlement.ok ? (
                <div className="mt-4 rounded-xl bg-amber-50 py-4 px-3">
                  <p className="text-sm text-amber-700">{entitlement.reason}</p>
                </div>
              ) : (
                <button
                  onClick={checkIn}
                  disabled={saving}
                  className="mt-4 w-full min-h-[52px] rounded-xl bg-blue-600 text-white
                    font-semibold text-base hover:bg-blue-700 active:scale-95 transition
                    disabled:bg-slate-400"
                >
                  {saving ? "Marking…" : `Mark ${activeMeal?.label} Attendance`}
                </button>
              )}
            </>
          )}
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 text-center">
            {error}
          </p>
        )}
        {success && (
          <p className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 text-center font-medium">
            {success}
          </p>
        )}

        {/* Today's log */}
        {todayRecords.length > 0 && (
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">
              Today's attendance ({todayRecords.length})
            </h2>
            <ul className="space-y-1">
              {MEALS.map((m) => {
                const checked = todayRecords.some((r) => r.meal === m.key);
                return (
                  <li key={m.key} className="flex items-center gap-2 text-sm">
                    <span className={checked ? "text-green-600" : "text-slate-300"}>
                      {checked ? "✓" : "○"}
                    </span>
                    <span className={checked ? "text-slate-800" : "text-slate-400"}>
                      {m.emoji} {m.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
