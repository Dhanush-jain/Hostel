"use client";

import { useState, useEffect } from "react";
import Script from "next/script";
import { db, auth } from "../../../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function MealSubscription() {
  const [plan, setPlan] = useState("");
  const [duration, setDuration] = useState("");
  const [amount, setAmount] = useState(0);
  const [user, setUser] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState("");

  const costPerMeal = 50;
  const mealsInMonth = 30;
  const mealsInYear = 365;

  // useEffect so auth state is set reactively
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsub();
  }, []);

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
    if (durationChoice === "monthly")
      base = mealsPerDay * costPerMeal * mealsInMonth;
    if (durationChoice === "yearly")
      base = mealsPerDay * costPerMeal * mealsInYear;

    setAmount(base);
  };

  const handleChange = (type, value) => {
    if (type === "plan") setPlan(value);
    if (type === "duration") setDuration(value);

    const newPlan = type === "plan" ? value : plan;
    const newDuration = type === "duration" ? value : duration;

    if (newPlan && newDuration) calculateAmount(newPlan, newDuration);
    else setAmount(0);
  };

  // Razorpay + Firebase flow
  const handleConfirm = async () => {
    if (!user) {
      alert("Please log in first!");
      return;
    }
    if (!plan || !duration) {
      alert("Please select plan & duration!");
      return;
    }
    if (!amount || amount <= 0) {
      alert("Invalid amount. Please reselect plan/duration.");
      return;
    }

    setIsProcessing(true);
    setMessage("");

    try {
      // send amount to backend to create order
      const createOrderRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }), // send INR amount
      });

      const orderData = await createOrderRes.json();
      if (!createOrderRes.ok || !orderData?.id) {
        throw new Error(orderData?.error || "Failed to create order");
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: Math.round(amount * 100), // paise
        currency: "INR",
        name: "Hostel Meal Subscription",
        description: `${plan} - ${duration}`,
        order_id: orderData.id,
        handler: async function (response) {
          try {
            // Save subscription after successful payment
            await addDoc(collection(db, "mealSubscriptions"), {
              uid: user.uid,
              email: user.email,
              plan,
              duration,
              amount,
              payment_id: response.razorpay_payment_id,
              order_id: response.razorpay_order_id,
              signature: response.razorpay_signature,
              timestamp: serverTimestamp(),
            });
            setMessage("✅ Payment successful & subscription saved!");
          } catch (err) {
            console.error("Failed saving subscription:", err);
            setMessage("⚠️ Payment succeeded but saving subscription failed.");
          }
        },
        prefill: {
          name: user.displayName || "Student",
          email: user.email,
        },
        theme: {
          color: "#3b82f6",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        console.error("Payment failed:", response);
        setMessage("❌ Payment failed. Try again or contact support.");
      });

      rzp.open();
    } catch (err) {
      console.error("Payment flow error:", err);
      setMessage("❌ Could not start payment. Try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen m-10 bg-white text-white p-6 flex flex-col items-center">
      {/* Razorpay script */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      <div className="w-full max-w-2xl bg-gray-800 rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-400">
          🍽️ Meal Subscription & Payment
        </h1>

        {/* Meal Plan */}
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

        {/* Duration */}
        <div className="space-y-4 mb-6">
          <h2 className="text-xl font-semibold">
            Select subscription duration:
          </h2>
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

        {/* Amount Display */}
        {amount > 0 && (
          <div className="text-center mb-8">
            <h3 className="text-2xl font-semibold text-yellow-400">
              Total Payable Amount: ₹{amount.toLocaleString()}
            </h3>
            <p className="text-sm text-gray-400">(Includes all meals)</p>
          </div>
        )}

        {/* Proceed to Pay */}
        {amount > 0 && (
          <button
            onClick={handleConfirm}
            disabled={isProcessing}
            className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-semibold transition disabled:bg-gray-600"
          >
            {isProcessing ? "Processing..." : "Proceed to Pay"}
          </button>
        )}

        {/* Message */}
        {message && (
          <p className="text-center mt-4 text-green-400">{message}</p>
        )}
      </div>
    </div>
  );
}
