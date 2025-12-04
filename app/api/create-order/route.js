// app/api/create-order/route.js
import Razorpay from "razorpay";

export async function POST(request) {
  try {
    const body = await request.json();
    const amount = Number(body?.amount); // amount in INR

    if (!amount || isNaN(amount) || amount <= 0) {
      return new Response(
        JSON.stringify({ error: "Invalid amount provided" }),
        { status: 400 }
      );
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // Razorpay expects amount in paise (integer)
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // convert INR -> paise
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    });

    return new Response(JSON.stringify({ id: order.id, order }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (error) {
    console.error("ORDER ERROR:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create order", details: String(error) }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}
