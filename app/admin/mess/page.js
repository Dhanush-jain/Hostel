"use client";

import { useEffect, useState } from "react";
import { db } from "@/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function MessPage() {
  const [menu, setMenu] = useState({});

  useEffect(() => {
    loadMenu();
  }, []);

  async function loadMenu() {
    const snap = await getDoc(doc(db, "mess", "menu"));
    if (snap.exists()) setMenu(snap.data());
  }

  async function updateMenu(day, value) {
    const updated = { ...menu, [day]: value };
    await updateDoc(doc(db, "mess", "menu"), updated);
    setMenu(updated);
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Mess Menu</h1>

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
    </div>
  );
}
