"use client";
import React, { useState } from "react";

export default function NoticeBoard() {
  const [notices, setNotices] = useState([
    {
      id: 1,
      title: "Hostel Fees Payment Due",
      date: "November 15, 2025",
      description: "All hostel residents are requested to complete their fee payment by the due date to avoid penalties.",
    },
    {
      id: 2,
      title: "Wi-Fi Maintenance Scheduled",
      date: "November 10, 2025",
      description: "Hostel Wi-Fi will be under maintenance from 10 AM to 1 PM. Kindly plan your work accordingly.",
    },
    {
      id: 3,
      title: "Mess Menu Updated",
      date: "November 8, 2025",
      description: "The weekly mess menu has been updated. Check the mess section for details.",
    },
    {
      id: 4,
      title: "Hostel Cleanliness Drive",
      date: "November 12, 2025",
      description: "All students are encouraged to participate in the cleanliness campaign organized by the hostel committee.",
    },
  ]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 m-10">
      {/* Header */}
      <h1 className="text-4xl font-bold text-center text-blue-700 mb-10">
        📢 Hostel Notice Board
      </h1>

      {/* Notice List */}
      <div className="max-w-4xl mx-auto space-y-6 m-10">
        {notices.map((notice) => (
          <div
            key={notice.id}
            className="bg-white shadow-lg rounded-xl p-6 border-l-4 border-blue-600 hover:shadow-xl transition"
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-2xl font-semibold text-gray-800">
                {notice.title}
              </h2>
              <span className="text-sm text-gray-500 italic">
                {notice.date}
              </span>
            </div>
            <p className="text-gray-600">{notice.description}</p>
          </div>
        ))}
      </div>

      {/* Back Button */}
      <div className="text-center mt-10">
        <a
          href="/"
          className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          ← Back to Home
        </a>
      </div>
    </div>
  );
}
