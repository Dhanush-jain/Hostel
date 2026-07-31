"use client";

import { useState, useEffect, useCallback } from "react";
import { auth, db } from "../../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

const FOOD_OPTIONS = [
  "Paneer Butter Masala",
  "Fried Rice",
  "Rajma Chawal",
  "Pasta",
];

export default function Voting() {
  const [currentUser, setCurrentUser] = useState(undefined);
  const [subscription, setSubscription] = useState(undefined); // undefined = loading
  const [existingVote, setExistingVote] = useState(null);
  const [selectedFood, setSelectedFood] = useState("");
  const [votes, setVotes] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /* -------- Auth -------- */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setCurrentUser(u ?? null));
    return unsub;
  }, []);

  /* -------- Load subscription + existing vote once auth resolves -------- */
  const loadUserData = useCallback(async (uid) => {
    // Check subscription
    const subQ = query(collection(db, "mealSubscriptions"), where("uid", "==", uid));
    const subSnap = await getDocs(subQ);
    if (subSnap.empty) {
      setSubscription(null);
    } else {
      const docs = subSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const latest = docs.sort(
        (a, b) => (b.timestamp?.toMillis?.() ?? 0) - (a.timestamp?.toMillis?.() ?? 0)
      )[0];
      setSubscription(latest);
    }

    // Check if already voted
    const voteSnap = await getDoc(doc(db, "votes", uid));
    if (voteSnap.exists()) {
      const food = voteSnap.data().food;
      setExistingVote(food);
      setSelectedFood(food);
    }
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    loadUserData(currentUser.uid);
  }, [currentUser, loadUserData]);

  /* -------- Live vote counts (realtime listener) -------- */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "votes"), (snap) => {
      const counts = {};
      snap.docs.forEach((d) => {
        const food = d.data().food;
        if (food) counts[food] = (counts[food] || 0) + 1;
      });
      setVotes(counts);
    });
    return unsub;
  }, []);

  /* -------- Submit vote -------- */
  const handleVote = async () => {
    if (!currentUser || !selectedFood || existingVote) return;

    setSaving(true);
    setError("");
    try {
      await setDoc(doc(db, "votes", currentUser.uid), {
        uid: currentUser.uid,
        food: selectedFood,
        votedAt: new Date().toISOString(),
      });
      setExistingVote(selectedFood);
    } catch (e) {
      console.error("Vote failed:", e);
      setError("Could not submit vote. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const chartData = FOOD_OPTIONS.map((food) => ({
    name: food.split(" ").slice(0, 2).join(" "), // shorten for chart
    fullName: food,
    votes: votes[food] || 0,
  }));

  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);

  /* -------- Loading state -------- */
  if (currentUser === undefined || subscription === undefined) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-gray-950">
        <p className="text-gray-400 text-sm animate-pulse">Loading…</p>
      </div>
    );
  }

  /* -------- Not signed in -------- */
  if (!currentUser) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-gray-950">
        <p className="text-gray-400 text-sm">Please sign in to vote.</p>
      </div>
    );
  }

  /* -------- No subscription -------- */
  if (!subscription) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-gray-950 px-4">
        <div className="w-full max-w-sm rounded-2xl bg-gray-900 border border-gray-800 p-8 text-center">
          <p className="text-4xl mb-4">🔒</p>
          <h2 className="text-lg font-bold text-white mb-2">Subscription Required</h2>
          <p className="text-sm text-gray-400">
            You need an active meal subscription to vote for today's menu.
          </p>
          <a
            href="/mess/meal-subscription"
            className="mt-6 inline-block w-full py-3 rounded-xl bg-yellow-500 hover:bg-yellow-600
              text-white font-semibold text-sm transition"
          >
            Get Subscription
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-gray-950 text-white">
      <div className="mx-auto w-full max-w-xl px-4 py-8 sm:px-6">

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-extrabold text-yellow-400 sm:text-3xl">
            Vote for Today's Meal
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            {currentUser.email}
          </p>
          {totalVotes > 0 && (
            <p className="mt-1 text-xs text-gray-500">{totalVotes} votes cast so far</p>
          )}
        </div>

        {/* Already voted banner */}
        {existingVote && (
          <div className="mb-6 rounded-xl bg-green-900/40 border border-green-700 px-4 py-3 text-center">
            <p className="text-sm font-semibold text-green-400">
              ✓ You voted for <span className="text-white">{existingVote}</span>
            </p>
            <p className="text-xs text-gray-500 mt-0.5">One vote per student — your vote is locked in.</p>
          </div>
        )}

        {/* Food options */}
        <div className="space-y-3 mb-6">
          {FOOD_OPTIONS.map((food) => {
            const selected = selectedFood === food;
            const voteCount = votes[food] || 0;
            const pct = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;

            return (
              <label
                key={food}
                className={`relative flex items-center justify-between gap-3 px-4 py-3.5
                  rounded-xl border cursor-pointer transition-all overflow-hidden
                  ${existingVote ? "cursor-default" : "cursor-pointer"}
                  ${selected
                    ? "bg-yellow-500/15 border-yellow-500"
                    : "bg-gray-900 border-gray-800 hover:border-gray-600"}`}
              >
                {/* Vote % bar background */}
                {existingVote && (
                  <div
                    className="absolute inset-0 bg-yellow-500/10 transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                )}

                <div className="relative flex items-center gap-3 min-w-0">
                  <input
                    type="radio"
                    value={food}
                    checked={selected}
                    disabled={!!existingVote}
                    onChange={(e) => !existingVote && setSelectedFood(e.target.value)}
                    className="w-4 h-4 accent-yellow-400 shrink-0"
                  />
                  <span className="text-sm font-medium text-gray-100 sm:text-base truncate">
                    {food}
                  </span>
                </div>

                {existingVote && (
                  <span className="relative text-sm font-bold text-yellow-400 shrink-0">
                    {pct}%
                  </span>
                )}
              </label>
            );
          })}
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-red-900/40 border border-red-800 px-4 py-3
            text-sm text-red-400 text-center">
            {error}
          </p>
        )}

        {/* Submit button */}
        {!existingVote && (
          <button
            onClick={handleVote}
            disabled={!selectedFood || saving}
            className="w-full min-h-[52px] rounded-xl bg-yellow-500 hover:bg-yellow-600
              text-white font-semibold text-base transition
              disabled:bg-gray-800 disabled:text-gray-600"
          >
            {saving ? "Submitting…" : "Submit Vote"}
          </button>
        )}

        {/* Live chart */}
        <div className="mt-8 rounded-2xl bg-gray-900 border border-gray-800 p-5">
          <h3 className="text-base font-semibold text-yellow-400 mb-5 text-center">
            Live Results
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="name"
                stroke="#9ca3af"
                tick={{ fontSize: 11 }}
              />
              <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8 }}
                labelStyle={{ color: "#f9fafb" }}
                formatter={(value, _, props) => [value, props.payload.fullName]}
              />
              <Bar dataKey="votes" fill="#eab308" radius={[4, 4, 0, 0]} animationDuration={600} />
            </BarChart>
          </ResponsiveContainer>

          {/* Vote count table */}
          <div className="mt-4 space-y-2">
            {FOOD_OPTIONS.map((food) => (
              <div key={food} className="flex items-center justify-between text-sm">
                <span className="text-gray-400 truncate mr-2">{food}</span>
                <span className="text-yellow-400 font-bold tabular-nums shrink-0">
                  {votes[food] || 0}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
