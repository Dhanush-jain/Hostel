"use client";
import { useState } from "react";
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import Footer from "../footer/page";
import Navbar from "../navbar/page";

export default function ContactPage() {
  // State for complaint form
  const [form, setForm] = useState({ name: "", room: "", complaint: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Complaint submitted by ${form.name}`);
    // Here, you can later connect to Firebase or your backend API
    setForm({ name: "", room: "", complaint: "" });
  };

  return (
    <>
    <Navbar/>
    <div className="min-h-screen bg-gray-50 py-12 px-6 md:px-16 mt-10">
      {/* Title */}
      <h1 className="text-3xl font-bold text-center text-blue-800 mb-8">
        Contact & Communication Hub
      </h1>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Left: Contact Info & Complaint Section */}
        <div className="bg-white shadow-md rounded-xl p-6">
          <h2 className="text-2xl font-semibold mb-4 text-blue-700">Contact Details</h2>
          <ul className="space-y-3 text-gray-700">
            <li><FaMapMarkerAlt className="inline mr-2 text-blue-500" /> GIT Hostel, College Campus, Belgavi, India</li>
            <li><FaPhone className="inline mr-2 text-blue-500" /> +91 98765 43210</li>
            <li><FaEnvelope className="inline mr-2 text-blue-500" /> hosteladmin@git.edu</li>
          </ul>

          {/* Complaint Form */}
          <h2 className="text-xl font-semibold mt-8 mb-4 text-blue-700">Complaint Section</h2>
          <p className="text-sm text-gray-500 mb-4">
            Register your complaints here. It will be directly forwarded to the hostel admin.
          </p>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={form.name}
              onChange={handleChange}
              className="w-full border p-2 rounded-md focus:outline-blue-400"
              required
              />
            <input
              type="text"
              name="room"
              placeholder="Room Number"
              value={form.room}
              onChange={handleChange}
              className="w-full border p-2 rounded-md focus:outline-blue-400"
              required
            />
            <textarea
              name="complaint"
              placeholder="Write your complaint..."
              rows="4"
              value={form.complaint}
              onChange={handleChange}
              className="w-full border p-2 rounded-md focus:outline-blue-400"
              required
              />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
              >
              Submit Complaint
            </button>
          </form>
        </div>

        {/* Right: Notice Board */}
        <div className="bg-white shadow-md rounded-xl p-6">
          <h2 className="text-2xl font-semibold mb-4 text-blue-700">Notice Board 📰</h2>
          <p className="text-sm text-gray-500 mb-4">
            Stay updated with the latest hostel announcements and events.
          </p>

          <div className="space-y-3">
            <div className="border-l-4 border-blue-600 pl-3">
              <h3 className="font-semibold text-blue-800">📅 10 Nov 2025</h3>
              <p className="text-gray-700 text-sm">Hostel mess will remain closed on Sunday for maintenance.</p>
            </div>

            <div className="border-l-4 border-blue-600 pl-3">
              <h3 className="font-semibold text-blue-800">🏆 8 Nov 2025</h3>
              <p className="text-gray-700 text-sm">Clean Room Competition announced — winners will get meal coupons!</p>
            </div>

            <div className="border-l-4 border-blue-600 pl-3">
              <h3 className="font-semibold text-blue-800">🧾 5 Nov 2025</h3>
              <p className="text-gray-700 text-sm">Submit mess fee receipts before 15th Nov to avoid late charges.</p>
            </div>
          </div>

          <button className="mt-6 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
            View All Notices
          </button>
        </div>
      </div>
    </div>
    <Footer/>
</>
  );
}
