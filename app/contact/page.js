"use client";

import { useState } from "react";
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import Navbar from "../navbar/page";
import Footer from "../footer/page";
import { db } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    room: "",
    complaint: "",
  });

  // Handle input changes
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // Handle form submit
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      await addDoc(collection(db, "complaints"), {
        name: form.name,
        room: form.room,
        complaint: form.complaint,
        reply: "",
        status: "pending",
        timestamp: serverTimestamp(),
      });

      alert("Your complaint has been submitted!");

      setForm({ name: "", room: "", complaint: "" });
    } catch (err) {
      console.log(err);
      alert("Failed to submit complaint. Try again.");
    }

    setLoading(false);
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-100 py-12 px-6 md:px-16 mt-10">
        {/* Page Title */}
        <h1 className="text-3xl font-bold text-center text-blue-800 mb-10">
          Contact & Communication Hub
        </h1>

        <div className="grid md:grid-cols-2 gap-10">
          {/* CONTACT INFO + COMPLAINT SECTION */}
          <div className="bg-white shadow-lg rounded-xl p-6">
            <h2 className="text-2xl font-semibold mb-4 text-blue-700">
              Contact Details
            </h2>

            {/* Contact Details */}
            <ul className="space-y-3 text-gray-700 mb-8">
              <li>
                <FaMapMarkerAlt className="inline mr-2 text-blue-500" />
                GIT Hostel, College Campus, Belagavi, India
              </li>
              <li>
                <FaPhone className="inline mr-2 text-blue-500" />
                +91 98765 43210
              </li>
              <li>
                <FaEnvelope className="inline mr-2 text-blue-500" />
                hosteladmin@git.edu
              </li>
            </ul>

            {/* Complaint Form */}
            <h2 className="text-xl font-semibold mb-3 text-blue-700">
              Complaint Section
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Submit your complaint below. It will be forwarded directly to the hostel admin.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full border p-2 rounded-md focus:outline-blue-500"
              />

              <input
                type="text"
                name="room"
                placeholder="Room Number"
                value={form.room}
                onChange={handleChange}
                required
                className="w-full border p-2 rounded-md focus:outline-blue-500"
              />

              <textarea
                name="complaint"
                placeholder="Write your complaint..."
                rows={4}
                value={form.complaint}
                onChange={handleChange}
                required
                className="w-full border p-2 rounded-md focus:outline-blue-500"
              ></textarea>

              <button
                type="submit"
                disabled={loading}
                className={`w-full text-white py-2 rounded-md transition 
                ${loading ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700"}`}
              >
                {loading ? "Submitting..." : "Submit Complaint"}
              </button>
            </form>
          </div>

          {/* NOTICE BOARD */}
          <div className="bg-white shadow-lg rounded-xl p-6">
            <h2 className="text-2xl font-semibold mb-4 text-blue-700">
              Notice Board 📰
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Stay updated with the latest hostel announcements and notices.
            </p>

            {/* Notice List */}
            <div className="space-y-4">
              <div className="border-l-4 border-blue-600 pl-3">
                <h3 className="font-semibold text-blue-800">📅 10 Nov 2025</h3>
                <p className="text-gray-700 text-sm">
                  Hostel mess will remain closed on Sunday due to maintenance.
                </p>
              </div>

              <div className="border-l-4 border-blue-600 pl-3">
                <h3 className="font-semibold text-blue-800">🏆 8 Nov 2025</h3>
                <p className="text-gray-700 text-sm">
                  Clean Room Competition announced — exciting prizes for winners!
                </p>
              </div>

              <div className="border-l-4 border-blue-600 pl-3">
                <h3 className="font-semibold text-blue-800">🧾 5 Nov 2025</h3>
                <p className="text-gray-700 text-sm">
                  Submit mess fee receipts before 15th Nov to avoid late fees.
                </p>
              </div>
            </div>

            <button className="mt-6 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
              View All Notices
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
