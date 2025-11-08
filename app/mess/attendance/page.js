"use client";

import { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

export default function AttendancePage() {
  const [attendance, setAttendance] = useState([]);
  const [name, setName] = useState("");

  const fetchAttendance = async () => {
    const querySnapshot = await getDocs(collection(db, "attendance"));
    const data = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setAttendance(data);
  };

  const markAttendance = async () => {
    if (!name) return;
    await addDoc(collection(db, "attendance"), {
      name,
      time: new Date().toLocaleString(),
    });
    setName("");
    fetchAttendance();
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Attendance & Mess Entry System
      </h1>

      <div className="bg-white p-4 rounded-2xl shadow mb-6">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter Student Name"
          className="border p-2 rounded w-full mb-3"
        />
        <button
          onClick={markAttendance}
          className="bg-blue-600 text-white py-2 w-full rounded hover:bg-blue-700"
        >
          Mark Attendance
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow">
        <h2 className="text-lg font-semibold mb-2">Today's Entries</h2>
        {attendance.map((a) => (
          <div key={a.id} className="border-b py-2">
            <p className="font-medium">{a.name}</p>
            <p className="text-gray-600">{a.time}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
