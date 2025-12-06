"use client";

import Link from "next/link";
import Footer from "../footer/page";
import Navbar from "../navbar/page";

export default function MessPage() {
  const features = [
    {
      title: "Mess Admission",
      description: "Apply for hostel mess admission online.",
      link: "/mess/admission",
      color: "bg-blue-100",
    },
    {
      title: "Mess Timetable",
      description: "Check the weekly mess schedule.",
      link: "/mess/timetable",
      color: "bg-green-100",
    },
    {
      title: "Vote for Food",
      description: "Vote for your favorite dish for tomorrow!",
      link: "/mess/voting",
      color: "bg-pink-100",
    },
    {
      title: "Meal Subscription & Payments",
      description: "Subscribe to meal plans and track your mess payments.",
      link: "/mess/meal-subscription",
      color: "bg-yellow-100",
    },
    {
      title: "Attendance & Entry System",
      description: "Mark your daily mess attendance and view entry logs.",
      link: "/mess/attendance",
      color: "bg-purple-100",
    },
  ];

  return (
    <>
    <Navbar/>
    <div className="p-8 m-6 mt-10 w-full">
      <h1 className="text-3xl font-bold text-center mb-8">
        🍽️ Hostel Mess Management
      </h1>

      <div className="flex flex-col gap-6">
        {features.map((f, i) => (
          <Link
          key={i}
          href={f.link}
          className={`${f.color} w-full block p-6 rounded-xl shadow-md hover:shadow-xl transition transform hover:scale-[1.01]`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold mb-2">{f.title}</h2>
                <p className="text-gray-700">{f.description}</p>
              </div>
              <button className="mt-4 sm:mt-0 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Open
              </button>
            </div>
          </Link>
        ))}
      </div>
    </div>
<Footer/>    
</>
  );
}
