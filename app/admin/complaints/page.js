"use client";

import { useEffect, useState } from "react";
import { db } from "@/firebase";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  orderBy,
  query,
} from "firebase/firestore";

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [replyText, setReplyText] = useState({});

  useEffect(() => {
    const q = query(collection(db, "complaints"), orderBy("timestamp", "desc"));

    // 🔥 Real-time listener
    const unsub = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setComplaints(list);
    });

    return () => unsub();
  }, []);

  // Resolve complaint & instantly remove card from UI
  async function resolveComplaint(id) {
    await updateDoc(doc(db, "complaints", id), {
      status: "resolved",
    });

    // 🔥 Remove card immediately without waiting
    setComplaints((prev) => prev.filter((c) => c.id !== id));
  }

  // Send reply
  async function sendReply(id) {
    if (!replyText[id]) return;

    await updateDoc(doc(db, "complaints", id), {
      reply: replyText[id],
      status: "replied",
    });

    setReplyText((prev) => ({ ...prev, [id]: "" }));
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Student Complaints</h1>

      {complaints.length === 0 && (
        <p className="text-gray-600">No complaints yet.</p>
      )}

      {complaints.map((c) => (
        <div key={c.id} className="border p-4 mb-4 rounded bg-white shadow-md">
          <h2 className="font-bold text-lg">
            {c.name} — Room {c.room}
          </h2>

          <p className="mt-2 text-gray-700">
            <strong>Complaint:</strong> {c.complaint}
          </p>

          <p className="text-sm text-blue-700 mt-1">
            Status: <span className="font-semibold">{c.status || "pending"}</span>
          </p>

          <p className="text-sm text-gray-500">
            {c.timestamp?.toDate().toLocaleString()}
          </p>

          {/* Reply Box */}
          <textarea
            className="border p-2 rounded w-full mt-3"
            placeholder="Write a reply..."
            value={replyText[c.id] || ""}
            onChange={(e) =>
              setReplyText({ ...replyText, [c.id]: e.target.value })
            }
          ></textarea>

          <div className="flex gap-3 mt-3">
            <button
              onClick={() => sendReply(c.id)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Send Reply
            </button>

            <button
              onClick={() => resolveComplaint(c.id)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Mark Resolved
            </button>
          </div>

          {/* Show admin reply */}
          {c.reply && (
            <div className="mt-3 p-3 bg-gray-100 rounded border">
              <p className="font-medium">Admin Reply:</p>
              <p>{c.reply}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
