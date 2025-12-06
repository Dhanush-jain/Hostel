"use client";

import { useEffect, useState } from "react";
import { db } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    fetchPayments();
  }, []);

  async function fetchPayments() {
    const snap = await getDocs(collection(db, "payments"));
    const arr = [];
    snap.forEach((doc) => arr.push({ id: doc.id, ...doc.data() }));
    setPayments(arr);
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Payments</h1>

      <table className="w-full border">
        <thead className="bg-gray-200">
          <tr>
            <th className="border p-2">Name</th>
            <th className="border p-2">Amount</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Date</th>
          </tr>
        </thead>

        <tbody>
          {payments.map((p) => (
            <tr key={p.id}>
              <td className="border p-2">{p.name}</td>
              <td className="border p-2">₹{p.amount}</td>
              <td className="border p-2">{p.status}</td>
              <td className="border p-2">
                {new Date(p.createdAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
