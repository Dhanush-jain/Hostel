"use client";
import React from "react";
import Link from "next/link";
import Footer from "./footer/page";

export default function Home() {
  return (
    <>
    
    <div className="min-h-screen flex flex-col">
   
     <section className="bg-[url('https://images.unsplash.com/photo-1503676260728-1c00da094a0b')] bg-cover bg-center h-[85vh] flex flex-col justify-center items-center text-white text-center">
  <div className="backdrop-blur-lg bg-white/10 p-6 rounded-lg shadow-xl">
    <h2 className="text-5xl font-bold mb-4">Welcome to Our Hostel</h2>
    <p className="text-xl mb-6">
      Your Home Away From Home – Safe, Clean & Comfortable Living for Students
    </p>
    <Link
      href="/admission"
      className="bg-blue-500 px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
    >
      Apply Now
    </Link>
  </div>
</section>


      {/* ---------------- ABOUT SECTION ---------------- */}
      <section id="about" className="py-12 bg-gray-50 text-center">
        <h2 className="text-3xl font-bold mb-4">About Our Hostel</h2>
        <p className="max-w-2xl mx-auto text-gray-600">
          We provide high-quality accommodation for students, complete with hygienic food, Wi-Fi access, and round-the-clock security.
        </p>

        <div className="mt-8 grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="bg-white shadow p-6 rounded-xl">
            <h3 className="text-xl font-semibold mb-2">🏡 Comfortable Rooms</h3>
            <p>Spacious and well-maintained rooms designed for convenience.</p>
          </div>
          <div className="bg-white shadow p-6 rounded-xl">
            <h3 className="text-xl font-semibold mb-2">🍽️ Hygienic Food</h3>
            <p>Nutritious meals served daily in our clean mess facility.</p>
          </div>
          <div className="bg-white shadow p-6 rounded-xl">
            <h3 className="text-xl font-semibold mb-2">🛡️ Safe Environment</h3>
            <p>24/7 security and a peaceful atmosphere for all residents.</p>
          </div>
        </div>
      </section>

      {/* ---------------- QUICK LINKS ---------------- */}
      <section id="links" className="py-10 bg-white">
        <h2 className="text-3xl font-bold text-center mb-8">Quick Access</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            { title: "Admission Form", link: "/admission" },
            { title: "Mess Subscription", link: "/mess" },
            { title: "Notice Board", link: "/notice-board" },
            { title: "Rules & Regulations", link: "/rules" },
            { title: "Complaint Section", link: "/contact" },
            { title: "Contact Us", link: "/contact" },
          ].map((item, index) => (
            <Link
              key={index}
              href={item.link}
              className="bg-blue-100 p-6 rounded-xl text-center shadow hover:bg-blue-200 transition"
            >
              <h3 className="text-xl font-semibold text-blue-700">{item.title}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------------- NOTICE BOARD ---------------- */}
      <section id="notices" className="py-12 bg-gray-50">
        <h2 className="text-3xl font-bold text-center mb-6">Latest Notices</h2>
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="font-semibold">🗓️ Hostel Fees Due - 15th Nov</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="font-semibold">🍛 Updated Mess Menu for This Week</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="font-semibold">⚙️ Wi-Fi Maintenance on Saturday</p>
          </div>
        </div>
        <div className="text-center mt-6">
          <Link href="/notice-board" className="text-blue-600 hover:underline font-medium">
            View All Notices →
          </Link>
        </div>
      </section>



    
    </div>
    <Footer/>
    </>
  );
}
