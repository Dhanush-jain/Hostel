"use client";
import React, { useState } from "react";
import Footer from "../footer/page";

const rulesData = [
  {
    title: "1. General Conduct",
    content: [
      "Maintain discipline and good behavior within the hostel premises.",
      "Respect hostel staff, wardens, and fellow residents.",
      "No loud music, shouting, or disturbances after 10 PM.",
      "Keep your room and surroundings clean at all times."
    ],
  },
  {
    title: "2. Room Allotment and Maintenance",
    content: [
      "Room allocation is done by the warden; swapping rooms requires permission.",
      "Any damage to hostel property will be charged to the responsible student.",
      "Avoid sticking posters or writing on walls.",
      "Report maintenance issues immediately to the hostel office."
    ],
  },
  {
    title: "3. Entry, Exit, and Curfew Rules",
    content: [
      "Hostel gates close at 9:30 PM sharp.",
      "Students going out must record their details in the outing register.",
      "Late entries without permission may result in penalties.",
      "Visitors are allowed only during visiting hours with prior permission."
    ],
  },
  {
    title: "4. Mess and Food Regulations",
    content: [
      "Mess timings must be strictly followed.",
      "Food should not be taken outside the mess hall.",
      "Wastage of food is discouraged.",
      "Complaints about food must be reported to the mess committee."
    ],
  },
  {
    title: "5. Prohibited Activities",
    content: [
      "Smoking, alcohol, and drugs are strictly prohibited.",
      "Ragging or harassment in any form is a punishable offense.",
      "Gambling or betting inside hostel premises is banned.",
      "Possession of weapons or dangerous items is not allowed."
    ],
  },
  {
    title: "6. Leave and Absence Policy",
    content: [
      "Inform the warden before leaving the hostel for more than one day.",
      "Parents/guardians should confirm leave officially.",
      "Unauthorized absence may lead to disciplinary action."
    ],
  },
  {
    title: "7. Fees and Payments",
    content: [
      "Hostel and mess fees must be paid before the due date.",
      "Late payment will attract penalties or cancellation of room.",
      "No refunds for short stays unless approved by the warden."
    ],
  },
  {
    title: "8. Emergency and Safety",
    content: [
      "Follow all fire safety and evacuation rules.",
      "Report suspicious activities immediately to authorities.",
      "Emergency contact numbers are displayed on hostel notice boards."
    ],
  },
 
];

const RulesPage = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
    <div className="min-h-screen bg-gray-50 flex justify-center py-10 px-4 mt-20">
      <div className="max-w-3xl w-full bg-white shadow-xl rounded-2xl p-6">
        <h1 className="text-3xl font-bold text-center text-indigo-600 mb-6">
          Hostel Rules & Regulations
        </h1>

        {rulesData.map((rule, index) => (
          <div
          key={index}
          className="border-b border-gray-200 mb-2 last:border-none"
          >
            <button
              onClick={() => toggleAccordion(index)}
              className="w-full flex justify-between items-center py-3 text-left"
              >
              <span className="text-lg font-semibold text-gray-800">
                {rule.title}
              </span>
              <span
                className={`text-indigo-600 text-2xl font-bold transform transition-transform duration-300 ${
                  openIndex === index ? "rotate-180" : "rotate-0"
                }`}
                >
                ⌃
              </span>
            </button>

            {/* Smooth transition effect */}
            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out ${
                openIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <ul className="pl-5 pb-3 list-disc text-gray-700 space-y-1">
                {rule.content.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}

        <div className="text-center mt-8">
          
        </div>
      </div>
    </div>
    <Footer/>
</>
  );
};

export default RulesPage;
