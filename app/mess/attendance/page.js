"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { db } from "../../../firebase";
import {
  collection,
  doc,
  setDoc,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

/* ------------------------------------------------------------------
   Meal windows (24h local time). Tune to your mess timings.
   ------------------------------------------------------------------ */
const MEALS = [
  { key: "breakfast", label: "Breakfast", startHour: 7, endHour: 10, emoji: "🌅" },
  { key: "lunch", label: "Lunch", startHour: 12, endHour: 15, emoji: "☀️" },
  { key: "dinner", label: "Dinner", startHour: 19, endHour: 22, emoji: "🌙" },
];

/* Plans a subscription can hold, and which meals each entitles.
   "two" = any two per day, so it's capped by count rather than by meal. */
const PLAN_COVERAGE = {
  breakfast: ["breakfast"],
  lunch: ["lunch"],
  dinner: ["dinner"],
  all: ["breakfast", "lunch", "dinner"],
  two: ["breakfast", "lunch", "dinner"], // any two — enforced via TWO_MEAL_CAP
};
const TWO_MEAL_CAP = 2;

/** Local YYYY-MM-DD. Avoids toISOString(), which shifts to UTC and
    would roll the date over for late-evening dinners in IST. */
function localDateKey(d = new Date()) {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Meal whose window contains now; otherwise the next one up. */
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

  const [roster, setRoster] = useState([]);          // subscribed students
  const [todayRecords, setTodayRecords] = useState([]); // all of today's check-ins
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingUid, setSavingUid] = useState(null);
  const [error, setError] = useState("");
  const [guestName, setGuestName] = useState("");
  const [showGuest, setShowGuest] = useState(false);

  /* -------- Roster: latest subscription per student -------- */
  const loadRoster = useCallback(async () => {
    const snap = await getDocs(collection(db, "mealSubscriptions"));
    const byUid = new Map();

    snap.docs.forEach((d) => {
      const s = { id: d.id, ...d.data() };
      if (!s.uid) return;
      const prev = byUid.get(s.uid);
      // Keep the most recent subscription. serverTimestamp() is null for a
      // beat after write, so fall back to 0 rather than crashing on .toMillis.
      const ms = s.timestamp?.toMillis?.() ?? 0;
      if (!prev || ms > prev._ms) byUid.set(s.uid, { ...s, _ms: ms });
    });

    setRoster(
      [...byUid.values()].sort((a, b) =>
        (a.name || a.email || "").localeCompare(b.name || b.email || "")
      )
    );
  }, []);

  /* -------- Today's check-ins only.
     Single equality filter, so no composite index needed; meal is
     split out client-side. -------- */
  const loadToday = useCallback(async () => {
    const q = query(
      collection(db, "mealAttendance"),
      where("dateKey", "==", dateKey)
    );
    const snap = await getDocs(q);
    setTodayRecords(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }, [dateKey]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        await Promise.all([loadRoster(), loadToday()]);
      } catch (e) {
        console.error("Failed loading attendance data:", e);
        if (alive) setError("Could not load data. Check your connection and retry.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [loadRoster, loadToday]);

  /* -------- Derived lookups -------- */
  const servedThisMeal = useMemo(
    () => new Set(todayRecords.filter((r) => r.meal === meal).map((r) => r.uid)),
    [todayRecords, meal]
  );

  /** uid -> how many meals they've taken today (for the "two" cap) */
  const mealsTodayByUid = useMemo(() => {
    const m = new Map();
    todayRecords.forEach((r) => m.set(r.uid, (m.get(r.uid) || 0) + 1));
    return m;
  }, [todayRecords]);

  /** Why a student can or can't be served right now. */
  const entitlement = useCallback(
    (student) => {
      const covered = PLAN_COVERAGE[student.plan] || [];
      if (!covered.includes(meal))
        return { ok: false, reason: `Plan covers ${covered.join(", ") || "nothing"}` };

      if (student.plan === "two") {
        const used = mealsTodayByUid.get(student.uid) || 0;
        const alreadyThisMeal = servedThisMeal.has(student.uid);
        if (!alreadyThisMeal && used >= TWO_MEAL_CAP)
          return { ok: false, reason: `Daily limit reached (${TWO_MEAL_CAP}/2)` };
      }
      return { ok: true, reason: "" };
    },
    [meal, mealsTodayByUid, servedThisMeal]
  );

  const eligible = useMemo(
    () => roster.filter((s) => entitlement(s).ok),
    [roster, entitlement]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return roster;
    return roster.filter(
      (s) =>
        (s.name || "").toLowerCase().includes(q) ||
        (s.email || "").toLowerCase().includes(q)
    );
  }, [roster, search]);

  const servedCount = servedThisMeal.size;
  const expected = eligible.length;
  const guests = todayRecords.filter((r) => r.meal === meal && r.isGuest).length;

  /* -------- Check in: deterministic ID makes the write idempotent -------- */
  const checkIn = async (student) => {
    const gate = entitlement(student);
    if (!gate.ok || servedThisMeal.has(student.uid)) return;

    const recordId = `${student.uid}_${dateKey}_${meal}`;
    setSavingUid(student.uid);
    setError("");

    // Optimistic: the row flips immediately, rolled back if the write fails.
    const optimistic = {
      id: recordId,
      uid: student.uid,
      name: student.name || student.email,
      meal,
      dateKey,
      isGuest: false,
    };
    setTodayRecords((prev) => [...prev, optimistic]);

    try {
      await setDoc(
        doc(db, "mealAttendance", recordId),
        {
          uid: student.uid,
          name: student.name || student.email || "Unknown",
          email: student.email || null,
          plan: student.plan || null,
          meal,
          dateKey,
          isGuest: false,
          servedAt: serverTimestamp(),
        },
        { merge: true } // re-tapping overwrites the same doc instead of duplicating
      );
    } catch (e) {
      console.error("Check-in failed:", e);
      setTodayRecords((prev) => prev.filter((r) => r.id !== recordId));
      setError(`Could not check in ${student.name || "student"}. Try again.`);
    } finally {
      setSavingUid(null);
    }
  };

  /* -------- Walk-in guest: no uid, so addDoc with a random ID -------- */
  const addGuest = async () => {
    const nm = guestName.trim();
    if (!nm) return;
    setSavingUid("__guest__");
    setError("");
    try {
      const ref = await addDoc(collection(db, "mealAttendance"), {
        uid: null,
        name: nm,
        email: null,
        plan: null,
        meal,
        dateKey,
        isGuest: true,
        servedAt: serverTimestamp(),
      });
      setTodayRecords((prev) => [
        ...prev,
        { id: ref.id, uid: null, name: nm, meal, dateKey, isGuest: true },
      ]);
      setGuestName("");
      setShowGuest(false);
    } catch (e) {
      console.error("Guest entry failed:", e);
      setError("Could not record the walk-in entry.");
    } finally {
      setSavingUid(null);
    }
  };

  const activeMeal = MEALS.find((m) => m.key === meal);
  const pct = expected > 0 ? Math.round((servedCount / expected) * 100) : 0;

  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900">
      <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8">

        {/* ---------- Header ---------- */}
        <header className="mb-5 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-center text-balance">
            Mess Attendance
          </h1>
          <p className="mt-1 text-center text-xs sm:text-sm text-slate-500">
            {new Date(dateKey).toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </header>

        {/* ---------- Meal session switch ---------- */}
        <div className="mb-4 grid grid-cols-3 gap-2 rounded-xl bg-white p-2 shadow-sm">
          {MEALS.map((m) => {
            const on = m.key === meal;
            return (
              <button
                key={m.key}
                onClick={() => setMeal(m.key)}
                aria-pressed={on}
                className={`min-h-[48px] rounded-lg px-2 py-2 text-xs font-semibold transition sm:text-sm
                  ${on
                    ? "bg-blue-600 text-white shadow"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                <span className="mr-1">{m.emoji}</span>
                <span className="hidden sm:inline">{m.label}</span>
                <span className="sm:hidden">{m.label.slice(0, 5)}</span>
              </button>
            );
          })}
        </div>

        {/* ---------- Live counters ---------- */}
        <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                {activeMeal?.label} served
              </p>
              <p className="mt-0.5 text-2xl font-bold tabular-nums sm:text-3xl">
                {servedCount}
                <span className="text-base font-medium text-slate-400">
                  {" "}/ {expected}
                </span>
              </p>
            </div>
            <div className="text-right text-xs text-slate-500 sm:text-sm">
              <p className="tabular-nums">
                {Math.max(expected - servedCount, 0)} pending
              </p>
              {guests > 0 && <p className="tabular-nums">{guests} walk-in</p>}
            </div>
          </div>
          <div
            className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {/* ---------- Search + walk-in ---------- */}
        <div className="mb-4 flex flex-col gap-2 sm:flex-row">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or email…"
            type="search"
            className="min-h-[48px] w-full rounded-lg border border-slate-300 bg-white px-4 text-base
              placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <button
            onClick={() => setShowGuest((v) => !v)}
            className="min-h-[48px] shrink-0 rounded-lg border border-slate-300 bg-white px-4
              text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            + Walk-in
          </button>
        </div>

        {showGuest && (
          <div className="mb-4 flex flex-col gap-2 rounded-xl bg-amber-50 p-3 sm:flex-row">
            <input
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addGuest()}
              placeholder="Guest / unsubscribed student name"
              className="min-h-[48px] w-full rounded-lg border border-amber-300 bg-white px-4 text-base
                focus:border-amber-500 focus:outline-none"
            />
            <button
              onClick={addGuest}
              disabled={!guestName.trim() || savingUid === "__guest__"}
              className="min-h-[48px] shrink-0 rounded-lg bg-amber-600 px-5 text-sm font-semibold
                text-white hover:bg-amber-700 disabled:bg-slate-400"
            >
              {savingUid === "__guest__" ? "Saving…" : "Record"}
            </button>
          </div>
        )}

        {/* ---------- Roster ---------- */}
        <div className="rounded-2xl bg-white shadow-sm">
          <h2 className="border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 sm:text-base">
            Roster{" "}
            <span className="font-normal text-slate-400">
              ({filtered.length})
            </span>
          </h2>

          {loading ? (
            <div className="space-y-2 p-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded-lg bg-slate-100" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-slate-500">
              {roster.length === 0
                ? "No subscriptions found yet. Students appear here once they subscribe."
                : "No students match that search."}
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {filtered.map((s) => {
                const done = servedThisMeal.has(s.uid);
                const gate = entitlement(s);
                const busy = savingUid === s.uid;

                return (
                  <li
                    key={s.uid}
                    className="flex items-center gap-3 px-3 py-2.5 sm:px-4 sm:py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium sm:text-base">
                        {s.name || s.email || "Unnamed"}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {s.plan
                          ? `${s.plan} · ${s.duration || "—"}`
                          : "no plan on record"}
                        {!gate.ok && (
                          <span className="text-amber-600"> · {gate.reason}</span>
                        )}
                      </p>
                    </div>

                    <button
                      onClick={() => checkIn(s)}
                      disabled={done || !gate.ok || busy}
                      aria-label={
                        done
                          ? `${s.name} already served`
                          : `Mark ${s.name} present for ${meal}`
                      }
                      className={`min-h-[44px] shrink-0 rounded-lg px-3 text-xs font-semibold transition sm:px-4 sm:text-sm
                        ${done
                          ? "bg-green-100 text-green-700"
                          : !gate.ok
                          ? "cursor-not-allowed bg-slate-100 text-slate-400"
                          : "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"}`}
                    >
                      {busy ? "…" : done ? "✓ Served" : "Mark"}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* ---------- This session's log ---------- */}
        {servedCount + guests > 0 && (
          <details className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
            <summary className="cursor-pointer text-sm font-semibold text-slate-700">
              {activeMeal?.label} log ({servedCount + guests})
            </summary>
            <ul className="mt-3 divide-y divide-slate-100">
              {todayRecords
                .filter((r) => r.meal === meal)
                .map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center justify-between gap-3 py-2 text-sm"
                  >
                    <span className="truncate">{r.name}</span>
                    {r.isGuest && (
                      <span className="shrink-0 rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                        walk-in
                      </span>
                    )}
                  </li>
                ))}
            </ul>
          </details>
        )}
      </div>
    </div>
  );
}
