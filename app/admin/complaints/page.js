"use client";

import { useEffect, useState } from "react";
import { db } from "@/firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    loadComplaints();
  }, []);

  async function loadComplaints() {
    const snap = await getDocs(collection(db, "complaints"));
    const arr = [];
    snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
    setComplaints(arr);
  }

  async function resolveComplaint(id) {
    await updateDoc(doc(db, "complaints", id), {
      status: "resolved",
    });
    loadComplaints();
  }

  async function sendReply(id, reply) {
    await updateDoc(doc(db, "complaints", id), { reply });
    loadComplaints();
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Complaints</h1>

      {complaints.map((c) => (
        <div
          key={c.id}
          className="border p-4 mb-4 rounded bg-white shadow"
        >
          <h2 className="font-bold">
            {c.name} ({c.room})
          </h2>
          <p className="text-gray-600">{c.message}</p>
          <p className="text-sm text-blue-700">Category: {c.category}</p>
          <p className="text-sm">Status: {c.status}</p>

          {/* Reply box */}
          <textarea
            className="border p-2 rounded w-full mt-2"
            placeholder="Reply to student"
            onBlur={(e) => sendReply(c.id, e.target.value)}
          ></textarea>

          {/* Resolve Button */}
          <button
            onClick={() => resolveComplaint(c.id)}
            className="bg-green-600 text-white px-4 py-2 rounded mt-3"
          >
            Mark Resolved
          </button>
        </div>
      ))}
    </div>
  );
}
