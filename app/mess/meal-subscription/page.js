"use client";

import { useState } from "react";
import Image from "next/image";
import { db, auth } from "../../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function MealSubscription() {
  const [plan, setPlan] = useState("");
  const [duration, setDuration] = useState("");
  const [amount, setAmount] = useState(0);
  const [user, setUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const costPerMeal = 50;
  const mealsInMonth = 30;
  const mealsInYear = 365;

  // ✅ Get current logged-in user
  onAuthStateChanged(auth, (currentUser) => setUser(currentUser));

  const calculateAmount = (planChoice, durationChoice) => {
    let mealsPerDay = 0;
    switch (planChoice) {
      case "breakfast":
      case "lunch":
      case "dinner":
        mealsPerDay = 1;
        break;
      case "two":
        mealsPerDay = 2;
        break;
      case "all":
        mealsPerDay = 3;
        break;
      default:
        mealsPerDay = 0;
    }

    let base = 0;
    if (durationChoice === "monthly") base = mealsPerDay * costPerMeal * mealsInMonth;
    if (durationChoice === "yearly") base = mealsPerDay * costPerMeal * mealsInYear;
    setAmount(base);
  };

  const handleChange = (type, value) => {
    if (type === "plan") setPlan(value);
    if (type === "duration") setDuration(value);

    const newPlan = type === "plan" ? value : plan;
    const newDuration = type === "duration" ? value : duration;

    if (newPlan && newDuration) calculateAmount(newPlan, newDuration);
  };

  const handleConfirm = async () => {
    if (!user) {
      alert("Please log in to confirm your subscription!");
      return;
    }

    if (!plan || !duration) {
      alert("Please select a plan and duration!");
      return;
    }

    setIsSaving(true);
    try {
      await addDoc(collection(db, "mealSubscriptions"), {
        uid: user.uid,
        email: user.email,
        plan,
        duration,
        amount,
        timestamp: serverTimestamp(),
      });
      setMessage("✅ Subscription saved successfully!");
    } catch (err) {
      console.error("Error saving subscription:", err);
      setMessage("❌ Failed to save subscription. Try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen m-10 bg-white text-white p-6 flex flex-col items-center">
      <div className="w-full max-w-2xl bg-gray-800 rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-400">
          🍽️ Meal Subscription & Payment
        </h1>

        {/* --- Meal Plan Selection --- */}
        <div className="space-y-4 mb-6">
          <h2 className="text-xl font-semibold">Select your meal plan:</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { value: "breakfast", label: "Only Breakfast" },
              { value: "lunch", label: "Only Lunch" },
              { value: "dinner", label: "Only Dinner" },
              { value: "two", label: "Any Two Meals" },
              { value: "all", label: "All Three Meals" },
            ].map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-2 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 cursor-pointer"
              >
                <input
                  type="radio"
                  name="plan"
                  value={opt.value}
                  checked={plan === opt.value}
                  onChange={(e) => handleChange("plan", e.target.value)}
                  className="accent-blue-500"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        {/* --- Duration --- */}
        <div className="space-y-4 mb-6">
          <h2 className="text-xl font-semibold">Select subscription duration:</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            {["monthly", "yearly"].map((d) => (
              <label
                key={d}
                className="flex items-center gap-2 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 cursor-pointer flex-1"
              >
                <input
                  type="radio"
                  name="duration"
                  value={d}
                  checked={duration === d}
                  onChange={(e) => handleChange("duration", e.target.value)}
                  className="accent-green-500"
                />
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </label>
            ))}
          </div>
        </div>

        {/* --- Display Amount --- */}
        {amount > 0 && (
          <div className="text-center mb-8">
            <h3 className="text-2xl font-semibold text-yellow-400">
              Total Payable Amount: ₹{amount.toLocaleString()}
            </h3>
            <p className="text-sm text-gray-400">(Includes all selected meals)</p>
          </div>
        )}

        {/* --- QR Code --- */}
        {amount > 0 && (
          <div className="bg-gray-700 p-4 rounded-xl text-center mb-6">
            <h2 className="text-lg font-semibold mb-2">Scan to Pay</h2>
            <div className="flex justify-center">
              <Image
                src="/qr-code.png"
                alt="Payment QR Code"
                width={200}
                height={200}
                className="rounded-lg border border-gray-500"
              />
            </div>
            <p className="text-gray-400 mt-2 text-sm">
              Scan the QR to complete your payment.
            </p>
          </div>
        )}

        {/* --- Confirm Button --- */}
        {amount > 0 && (
          <button
            onClick={handleConfirm}
            disabled={isSaving}
            className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-semibold transition disabled:bg-gray-600"
          >
            {isSaving ? "Saving..." : "Confirm Subscription"}
          </button>
        )}

        {/* --- Status Message --- */}
        {message && <p className="text-center mt-4 text-green-400">{message}</p>}
      </div>
    </div>
  );
}
