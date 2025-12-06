"use client";

import { useState } from "react";
import Image from "next/image";
import Navbar from "../navbar/page";
import { useRouter } from "next/navigation";

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
  const router = useRouter();


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

    router.push("/rooms");
  };

  return (
    <>
    <Navbar/>
      <div className=" mx-auto my-10 max-w-3xl rounded-xl bg-white p-8 shadow-lg">
        <h1 className="mb-4 text-3xl font-bold text-gray-800">
          Admission Overview
        </h1>
        <p className="mb-2 text-gray-700">
          Our hostel offers safe, comfortable, and affordable accommodation for
          students who require a secure place to stay during their academic
          year.
        </p>
        <p className="mb-6 text-gray-700">
          Admission is given on a first-come, first-served basis, subject to
          eligibility, availability of seats, and verification of documents.
        </p>

        <h2 className="mb-3 text-2xl font-semibold text-gray-800">
          Eligibility
        </h2>
        <ul className="mb-6 list-disc space-y-2 pl-6 text-gray-700">
          <li>
            Applicants must be enrolled in a recognised school, college, or
            university for the relevant academic year.
          </li>
          <li>
            Priority is usually given to outstation students and those with a
            genuine need for hostel accommodation.
          </li>
          <li>
            All residents must agree to follow the hostel rules, code of
            conduct, and disciplinary policies.
          </li>
        </ul>

        <h2 className="mb-3 text-2xl font-semibold text-gray-800">
          Application Process
        </h2>
        <ol className="mb-6 list-decimal space-y-2 pl-6 text-gray-700">
          <li>
            Fill out the online hostel admission form with accurate personal,
            academic, and contact details.
          </li>
          <li>
            Upload or submit the required documents (ID proof,
            admission/bonafide letter, recent photograph, and any requested
            medical information).
          </li>
          <li>
            Pay the applicable admission and hostel fees within the notified
            deadline to confirm your seat.
          </li>
          <li>
            Admission will be confirmed only after fee payment and approval by
            the hostel administration.
          </li>
        </ol>

        <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-900">
          <p className="font-medium">Note:</p>
          <p>
            Seats are limited, so students are encouraged to apply as early as
            possible for the upcoming session.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl w-full bg-white shadow-lg rounded-2xl p-4 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3 text-center">
          Explore Our Hostel Rooms in 360°
        </h2>

        {/* 360° View using iframe */}
        <div className="w-full aspect-video rounded-xl overflow-hidden shadow-md border">
          <iframe
            src="https://momento360.com/e/u/783e19781ba344389e53796046426f68?utm_campaign=embed&utm_source=other&heading=0&pitch=0&field-of-view=75&size=medium&display-plan=true"
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
                  className="w-176 p-2 border-1 rounded-md text-black"
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
              Select Room
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
