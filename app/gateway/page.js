"use client";

import React, { useState } from "react";
import Script from "next/script";

const PaymentPage = () => {
  const AMOUNT = 100;
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      const response = await fetch("/api/create-order", { method: "POST" });
      const data = await response.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: AMOUNT * 100,
        currency: "INR",
        name: "Company Name",
        order_id: data.id,
        handler: function (response) {
          console.log("Payment Successful:", response);
        },
        prefill: {
          name: "Dhanush Jain",
          email: "dhanushjain70@gmail.com",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment Error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-200">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      <div className="text-2xl font-bold mb-4">
        Payment Page
        <p>Amount Pay: {AMOUNT} INR</p>

        <button
          onClick={handlePayment}
          disabled={isProcessing}
          className="px-4 py-2 bg-blue-600 text-white rounded-2xl mt-4"
        >
          {isProcessing ? "Processing..." : "Pay Now"}
        </button>
      </div>
    </div>
  );
};

export default PaymentPage;
