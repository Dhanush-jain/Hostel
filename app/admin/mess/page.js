"use client";

import { useEffect, useState } from "react";
import { db } from "@/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";

export default function MessPage() {
  const [menu, setMenu] = useState({});
  const [subscriptions, setSubscriptions] = useState([]);

  useEffect(() => {
    loadMenu();
    loadSubscriptions();
  }, []);

  // -------- LOAD MENU ----------
  async function loadMenu() {
    const snap = await getDoc(doc(db, "mess", "menu"));
    if (snap.exists()) setMenu(snap.data());
  }

  async function updateMenu(day, value) {
    const updated = { ...menu, [day]: value };
    await updateDoc(doc(db, "mess", "menu"), updated);
    setMenu(updated);
  }

  // -------- LOAD SUBSCRIPTIONS ----------
  async function loadSubscriptions() {
    const q = query(
      collection(db, "mealSubscriptions"),
      orderBy("timestamp", "desc")
    );

    const snap = await getDocs(q);
    const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    setSubscriptions(arr);
  }

  return (
    <div className="p-6">

      <h1 className="text-3xl font-bold mb-6">Mess Management</h1>

      {/* ------------------ MENU SECTION ------------------ */}
      <h2 className="text-2xl font-semibold mb-4">Mess Menu</h2>

      {Object.keys(menu).map((day) => (
        <div key={day} className="mb-4">
          <label className="font-semibold">{day.toUpperCase()}</label>
          <input
            type="text"
            value={menu[day]}
            onChange={(e) => updateMenu(day, e.target.value)}
            className="border p-2 ml-4 w-80 rounded"
          />
        </div>
      ))}

      <hr className="my-8" />

      {/* ------------------ SUBSCRIPTIONS SECTION ------------------ */}
      <h2 className="text-2xl font-semibold mb-4">Meal Subscriptions</h2>

      {subscriptions.length === 0 && (
        <p className="text-gray-600">No subscriptions yet.</p>
      )}

      {subscriptions.map((s) => (
        <div
          key={s.id}
          className="border p-4 mb-4 rounded bg-white shadow-md"
        >
          <p className="font-semibold text-lg">{s.email}</p>

          <p className="text-gray-700 mt-1">
            Plan: <strong>{s.plan}</strong>
          </p>

          <p className="text-gray-700">
            Duration: <strong>{s.duration}</strong>
          </p>

          <p className="text-gray-700">
            Amount Paid: <strong>₹{s.amount}</strong>
          </p>

          <p className="text-sm text-gray-500">
            {s.timestamp?.toDate().toLocaleString()}
          </p>
        </div>
      ))}

    </div>
  );
}
