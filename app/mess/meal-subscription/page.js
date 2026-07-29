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

  const mealOptions = [
    { value: "breakfast", label: "Only Breakfast" },
    { value: "lunch", label: "Only Lunch" },
    { value: "dinner", label: "Only Dinner" },
    { value: "two", label: "Any Two Meals" },
    { value: "all", label: "All Three Meals" },
  ];

  return (
    // dvh instead of vh: survives the mobile browser address bar collapsing.
    // Fluid padding replaces the old `m-10` + `p-6`, which ate ~128px on a 360px screen.
    <div className="min-h-dvh w-full bg-slate-900 text-slate-100 px-4 py-8 sm:px-6 sm:py-10 lg:py-14 flex flex-col items-center">
      {/* Razorpay script */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      <div className="w-full max-w-2xl bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl p-5 sm:p-7 lg:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center text-blue-400 text-balance">
          🍽️ Meal Subscription &amp; Payment
        </h1>

        {/* Meal Plan */}
        <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold">
            Select your meal plan:
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            {mealOptions.map((opt, i) => {
              const selected = plan === opt.value;
              return (
                <label
                  key={opt.value}
                  // Last of 5 spans both columns so it isn't orphaned in a half cell.
                  className={`flex items-center gap-3 p-3 sm:p-3.5 min-h-[52px] rounded-lg cursor-pointer select-none
                    text-sm sm:text-base transition-colors
                    ${i === mealOptions.length - 1 ? "sm:col-span-2" : ""}
                    ${
                      selected
                        ? "bg-blue-600/25 ring-2 ring-blue-500"
                        : "bg-gray-700 hover:bg-gray-600 ring-1 ring-white/5"
                    }`}
                >
                  <input
                    type="radio"
                    name="plan"
                    value={opt.value}
                    checked={selected}
                    onChange={(e) => handleChange("plan", e.target.value)}
                    // shrink-0 keeps the dot from squashing when the label wraps
                    className="accent-blue-500 w-4 h-4 shrink-0"
                  />
                  <span className="min-w-0">{opt.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Duration */}
        <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold">
            Select subscription duration:
          </h2>
          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
            {["monthly", "yearly"].map((d) => {
              const selected = duration === d;
              return (
                <label
                  key={d}
                  className={`flex items-center gap-3 p-3 sm:p-3.5 min-h-[52px] rounded-lg cursor-pointer select-none
                    flex-1 text-sm sm:text-base transition-colors
                    ${
                      selected
                        ? "bg-green-600/25 ring-2 ring-green-500"
                        : "bg-gray-700 hover:bg-gray-600 ring-1 ring-white/5"
                    }`}
                >
                  <input
                    type="radio"
                    name="duration"
                    value={d}
                    checked={selected}
                    onChange={(e) => handleChange("duration", e.target.value)}
                    className="accent-green-500 w-4 h-4 shrink-0"
                  />
                  <span className="min-w-0">
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Amount Display */}
        {amount > 0 && (
          <div className="text-center mb-6 sm:mb-8 rounded-lg bg-gray-900/50 px-4 py-4 sm:py-5">
            <p className="text-xs sm:text-sm uppercase tracking-wide text-gray-400">
              Total Payable Amount
            </p>
            <h3 className="text-2xl sm:text-3xl font-semibold text-yellow-400 mt-1 tabular-nums break-words">
              ₹{amount.toLocaleString("en-IN")}
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              (Includes all meals)
            </p>
          </div>
        )}

        {/* Proceed to Pay */}
        {amount > 0 && (
          <button
            onClick={handleConfirm}
            disabled={isProcessing}
            className="w-full min-h-[52px] bg-blue-600 hover:bg-blue-700 active:scale-[.99]
              py-3 sm:py-3.5 px-4 rounded-lg font-semibold text-base text-white
              transition disabled:bg-gray-600 disabled:active:scale-100 disabled:cursor-not-allowed
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800"
          >
            {isProcessing ? "Processing..." : "Proceed to Pay"}
          </button>
        )}

        {/* Message */}
        {message && (
          <p className="text-center mt-4 text-sm sm:text-base text-green-400 break-words">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
