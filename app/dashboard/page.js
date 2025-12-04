"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { auth, db } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

export default function UserDashboard() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "" });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      // If no document, create it
      if (!snap.exists()) {
        await setDoc(ref, {
          name: user.displayName || "",
          email: user.email || "",
          phone: "",
          photo: user.photoURL || "",
        });
        console.log("Created new user document in Firestore");
      }

      const data = snap.exists() ? snap.data() : {
        name: user.displayName || "",
        email: user.email || "",
        phone: "",
        photo: user.photoURL || "",
      };

      setUserData(data);
      setForm({ name: data.name, phone: data.phone });
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Save changes
  async function handleSave() {
    const user = auth.currentUser;
    if (!user) return;

    await updateDoc(doc(db, "users", user.uid), {
      name: form.name,
      phone: form.phone
    });

    setUserData({ ...userData, ...form });
    setEditMode(false);
  }

  if (loading) return <p className="p-6 text-lg">Loading dashboard...</p>;

  if (!userData) return <p className="p-6 text-lg">No user data available.</p>;

  return (
    <div className="m-20 max-w-3xl p-6 border rounded-xl shadow-lg bg-white">
      <h2 className="text-3xl font-bold mb-6 text-center">User Dashboard</h2>

      <div className="flex items-center gap-6">
        <Image
          src={userData.photo || "/default-user.png"}
          width={90}
          height={90}
          alt="User Photo"
          className="rounded-full border"
        />

        <div>
          <p><strong>Name:</strong> {userData.name || "Not set"}</p>
          <p><strong>Email:</strong> {userData.email}</p>
          <p><strong>Phone:</strong> {userData.phone || "Not set"}</p>
        </div>
      </div>

      <button
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg"
        onClick={() => setEditMode(true)}
      >
        Edit Profile
      </button>

      {/* Edit Popup */}
      {editMode && (
        <div className="mt-6 p-4 border rounded-lg bg-gray-50">
          <h3 className="text-xl font-semibold mb-4">Edit Profile</h3>

          <input
            className="border p-2 w-full mb-3"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            className="border p-2 w-full mb-3"
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />

          <button
            className="px-4 py-2 bg-green-600 text-white rounded-lg mr-3"
            onClick={handleSave}
          >
            Save
          </button>

          <button
            className="px-4 py-2 bg-gray-400 text-white rounded-lg"
            onClick={() => setEditMode(false)}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
