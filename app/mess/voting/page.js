"use client";

import { useState, useEffect } from "react";
import { db, auth } from "../../../firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function Voting() {
  const [user, setUser] = useState(null);
  const [selectedFood, setSelectedFood] = useState("");
  const [votes, setVotes] = useState({});
  const [loading, setLoading] = useState(true);

  const foodOptions = [
    "Paneer Butter Masala",
    "Fried Rice",
    "Rajma Chawal",
    "Pasta",
  ];

  // ✅ Watch for user login
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  // ✅ Fetch and listen to votes in real time
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "votes"), (snapshot) => {
      const counts = {};
      snapshot.forEach((doc) => {
        const { food } = doc.data();
        counts[food] = (counts[food] || 0) + 1;
      });
      setVotes(counts);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // ✅ Handle vote submission
  const handleVote = async () => {
    if (!user) {
      alert("Please log in to vote!");
      return;
    }

    const q = query(collection(db, "votes"), where("uid", "==", user.uid));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      alert("You have already voted!");
      return;
    }

    await addDoc(collection(db, "votes"), {
      uid: user.uid,
      food: selectedFood,
    });

    alert("Vote submitted successfully!");
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-950 text-white text-lg">
        Loading votes...
      </div>
    );

  return (
    <div className="min-h-screen m-10 bg-white-950 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-gray-900 rounded-2xl shadow-lg border border-gray-800 p-8">
        <h2 className="text-3xl font-extrabold text-center text-yellow-400 mb-6">
          🍽️ Vote for Today's Meal
        </h2>

        <p className="text-gray-400 text-center mb-6">
          Select your favorite dish for today's menu and see what others are
          choosing in real time!
        </p>

        <div className="space-y-4 mb-6 text-amber-50">
          {foodOptions.map((food) => (
            <label
              key={food}
              className={`flex justify-between items-center px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                selectedFood === food
                  ? "bg-yellow-500/20 border-yellow-400"
                  : "bg-gray-800 border-gray-700 hover:bg-gray-800/70"
              }`}
            >
              <span className="text-lg font-medium">{food}</span>
              <input
                type="radio"
                value={food}
                checked={selectedFood === food}
                onChange={(e) => setSelectedFood(e.target.value)}
                className="w-5 h-5 accent-yellow-400"
              />
            </label>
          ))}
        </div>

        <button
          onClick={handleVote}
          disabled={!selectedFood}
          className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold text-lg rounded-xl transition-all disabled:bg-gray-700 disabled:text-gray-500"
        >
          Submit Vote
        </button>

        <div className="mt-8 bg-gray-800 rounded-xl p-5 border border-gray-700">
          <h3 className="text-2xl font-semibold text-yellow-400 mb-4 text-center">
            Current Results
          </h3>

          <div className="space-y-3">
            {foodOptions.map((food) => (
              <div
                key={food}
                className="flex justify-between items-center bg-gray-900 px-4 py-2 rounded-lg"
              >
                <span className="text-gray-300 font-medium">{food}</span>
                <span className="text-yellow-400 font-bold text-lg">
                  {votes[food] || 0}
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm text-gray-500 text-center mt-6">
          {user
            ? `Logged in as: ${user.email}`
            : "Please log in to cast your vote"}
        </p>
      </div>
    </div>
  );
}
