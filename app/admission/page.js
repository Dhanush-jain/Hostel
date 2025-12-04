"use client";

import { useState } from "react";
import Image from "next/image";

export default function MessAdmission() {
  const [formData, setFormData] = useState({
    name: "",
    rollNo: "",
    department: "",
    year: "",
    phone: "",
    email: "",
    hostel: "",
    room: "",
  });

  const [feeReceipt, setFeeReceipt] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFeeReceipt(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Admission Form Data:", formData);
    console.log("Uploaded Fee Receipt:", feeReceipt);
    alert("Form submitted successfully (Firebase integration coming next!)");
  };

  return (
    <div className="min-h-screen m-10 bg-white text-white py-10 px-6 mt-20">
      <div className="max-w-3xl mx-auto bg-gray-200 text-black p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center">
          🏫 Hostel Admission Form
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Student Information Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full p-2 rounded-md border-1 text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">
                Roll Number
              </label>
              <input
                type="text"
                name="rollNo"
                placeholder="Enter your Roll No."
                value={formData.rollNo}
                onChange={handleChange}
                required
                className="w-full p-2 rounded-md border-1 text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">
                Department
              </label>
              <input
                type="text"
                name="department"
                placeholder="Enter your department"
                value={formData.department}
                onChange={handleChange}
                required
                className="w-full border-1 p-2 rounded-md text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">
                Year of Study
              </label>
              <input
                type="text"
                name="year"
                placeholder="Year"
                value={formData.year}
                onChange={handleChange}
                required
                className="w-full p-2 border-1 rounded-md text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                placeholder="+91"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full p-2 border-1 rounded-md text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">
                Email ID
              </label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full p-2 border-1 rounded-md text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">
                Hostel Name
              </label>
              <input
                type="text"
                name="hostel"
                placeholder="Enter hostel name"
                value={formData.hostel}
                onChange={handleChange}
                required
                className="w-full p-2 border-1 rounded-md text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">
                Room Number
              </label>
              <input
                type="text"
                name="room"
                placeholder="Enter room number"
                value={formData.room}
                onChange={handleChange}
                required
                className="w-full p-2 rounded-md border-1 text-black"
              />
            </div>
          </div>


          <div>
            <label className="block text-sm font-semibold mb-2">
              Upload College Fee Receipt
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              required
              className="block w-full text-sm text-gray-300
                         file:mr-4 file:py-2 file:px-4
                         file:rounded-md file:border-0
                         file:text-sm file:font-semibold
                         file:bg-blue-600 file:text-white
                         hover:file:bg-blue-700"
            />

            {preview && (
              <div className="mt-4">
                <p className="text-gray-300 mb-2">📸 Fee Receipt Preview:</p>
                <Image
                  src={preview}
                  alt="Fee Receipt Preview"
                  width={400}
                  height={300}
                  className="rounded-md border border-gray-700"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold"
          >
            Submit Admission Form
          </button>
        </form>
      </div>
    </div>
  );
}
