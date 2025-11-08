"use client";
import { useState } from "react";

export default function MessAdmission() {
  const [form, setForm] = useState({ name: "", roll: "", room: "", date: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Admission submitted for ${form.name}`);
    setForm({ name: "", roll: "", room: "", date: "" });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 flex flex-col items-center">
      {/* 🔹 Header Section */}
      <div className="max-w-3xl bg-white shadow-lg rounded-2xl p-6 mb-8 text-center">
        <h1 className="text-3xl font-bold text-indigo-600 mb-2">Hostel Mess Admission</h1>
        <p className="text-gray-600">
          Welcome to our hostel mess! Enjoy healthy and hygienic meals served daily.  
          Please complete the form below to register for the mess facility.
        </p>
      </div>

      {/* 🔹 360° Image Section */}
      <div className="max-w-3xl w-full bg-white shadow-lg rounded-2xl p-4 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3 text-center">Explore Our Mess Hall in 360°</h2>

        {/* 360° View using iframe */}
        <div className="w-full aspect-video rounded-xl overflow-hidden shadow-md border">
          <iframe
            src="https://momento360.com/e/u/45b66e9cedea4b4492c50c99acff6475?utm_campaign=embed&utm_source=other&heading=0&pitch=0&field-of-view=44.8&size=medium&display-plan=true"
            title="Mess Hall 360 View"
            width="100%"
            height="100%"
            allowFullScreen
            className="rounded-xl"
          ></iframe>
        </div>

        <p className="text-sm text-gray-500 mt-2 text-center">
          You can click and drag to look around the mess in 360° view.
        </p>
      </div>

      {/* 🔹 Mess Admission Form */}
      <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-6">
        <h2 className="text-2xl font-bold mb-4 text-center text-indigo-600">Mess Admission Form</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
            required
          />
          <input
            name="roll"
            placeholder="Roll Number"
            value={form.roll}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
            required
          />
          <input
            name="room"
            placeholder="Room Number"
            value={form.room}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
            required
          />
          <input
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
            required
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white w-full p-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Submit Admission
          </button>
        </form>
      </div>
    </div>
  );
}
