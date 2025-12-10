"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../firebase"; // <-- your Firebase setup
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function Voting() {
  const [user, setUser] = useState(null);
  const [selectedFood, setSelectedFood] = useState("");
  const [votes, setVotes] = useState({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const foodOptions = [
    "Paneer Butter Masala",
    "Fried Rice",
    "Rajma Chawal",
    "Pasta",
  ];

 // ✅ Check Firebase Login
 useEffect(() => {
   const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
     if (firebaseUser) {
       setUser({
         email: firebaseUser.email,
          studentId: firebaseUser.uid, // Firebase ID will act as unique studentId
        });
      } else {
        setUser(null);
      }
    });

   return () => unsubscribe();
  }, []);
// useEffect(() => {
//   // Temporary fake login (for testing)
//   setUser({
//     email: "ram@gmail.com",
//     studentId: "6937130fb7478c89b05d00f8"
//   });
// }, []);

  // ✅ Fetch Vote Results
  useEffect(() => {
    async function fetchVotes() {
      try {
        const res = await fetch("http://localhost:5000/api/votes/results");
        const data = await res.json();
        setVotes(data);
      } catch (err) {
        console.error("Error fetching votes:", err);
      }
      setLoading(false);
    }

    fetchVotes();
    const interval = setInterval(fetchVotes, 5000); // 🔥 live auto update
    return () => clearInterval(interval);
  }, []);

  // ✅ Submit Vote
  const handleVote = async () => {
    if (!user) {
      alert("Please log in to vote!");
      return;
    }
    try{
    const res = await fetch("http://localhost:5000/api/votes/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: user.studentId, // Firebase UID
        food: selectedFood,
      }),
    });

    const data = await res.json();
    console.log("Vote response:", res.status, data); // <-- check this
     if (!res.ok) {
    alert(data.message || "Error submitting vote");
    return;
  }

  alert("Vote Submitted Successfully!");

  router.push("/mess"); // 🔥 redirect to mess page
}catch (err) {
    console.error("Vote fetch error:", err);
    alert("Error submitting vote: " + err.message);
  }
};

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-950 text-white text-lg">
        Loading votes...
      </div>
    );
    // 🎯 Convert votes → chart format
  const chartData = foodOptions.map((food) => ({
    name: food,
    votes: votes[food] || 0,
  }));

  return (
    <div className="min-h-screen m-10 bg-white-950 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-gray-900 rounded-2xl shadow-lg border border-gray-800 p-8">
        <h2 className="text-3xl font-extrabold text-center text-yellow-400 mb-6">
          🍽 Vote for Today's Meal
        </h2>

        <p className="text-gray-400 text-center mb-6">
          Select your favorite dish for today's menu!
        </p>

        {/* FOOD OPTIONS */}
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

        {/* RESULTS */}
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
        {/* 📊 LIVE CHART */}
        <div className="mt-10 bg-gray-800 rounded-xl p-5 border border-gray-700">
          <h3 className="text-2xl font-semibold text-yellow-400 mb-4 text-center">
            📊 Live Voting Chart 
          </h3>

          <BarChart
            width={500}
            height={300}
            data={chartData}
            style={{ margin: "0 auto" }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#555" />
            <XAxis dataKey="name" stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip />
            <Bar dataKey="votes" fill="#facc15" animationDuration={800} />
          </BarChart>
        </div>

        <p className="text-sm text-gray-500 text-center mt-6">
          {user ? `Logged in as: ${user.email} `: "Please log in to vote"}
        </p>
      </div>
    </div>
  );
}