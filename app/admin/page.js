"use client";

import { FiUsers, FiHome, FiBell, FiBook } from "react-icons/fi";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  return (
    <div className="p-4 sm:p-6 lg:p-10">
      {/* Page Title */}
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        <DashboardCard
          title="Total Students"
          value="120"
          icon={<FiUsers size={28} />}
          color="bg-blue-600"
        />

        <DashboardCard
          title="Rooms Filled"
          value="85 / 120"
          icon={<FiHome size={28} />}
          color="bg-green-600"
        />

        <DashboardCard
          title="Active Complaints"
          value="14"
          icon={<FiBell size={28} />}
          color="bg-red-600"
        />

        <DashboardCard
          title="Mess Subscriptions"
          value="98"
          icon={<FiBook size={28} />}
          color="bg-yellow-600"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-8">
        <div className="bg-white shadow-md rounded-xl p-4 sm:p-5 h-[260px] sm:h-[300px]">
          <h2 className="font-semibold text-lg mb-4">Monthly Payments Overview</h2>
          <div className="flex items-center justify-center h-full text-gray-500 text-sm sm:text-base">
            Chart Component Here
          </div>
        </div>

        <div className="bg-white shadow-md rounded-xl p-4 sm:p-5 h-[260px] sm:h-[300px]">
          <h2 className="font-semibold text-lg mb-4">Student Growth</h2>
          <div className="flex items-center justify-center h-full text-gray-500 text-sm sm:text-base">
            Graph Component Here
          </div>
        </div>
      </div>

      {/* Recent Complaints + Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-8">
        {/* Recent Complaints */}
        <div className="bg-white shadow-md rounded-xl p-4 sm:p-5 overflow-x-auto">
          <h2 className="font-semibold text-lg mb-4">Recent Complaints</h2>
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="text-left border-b font-semibold">
                <th className="py-2 pr-4">Student</th>
                <th className="py-2 pr-4">Issue</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              <TableRow student="Rohan" issue="Water leakage" status="Pending" />
              <TableRow student="Priya" issue="Room cleaning" status="Resolved" />
              <TableRow
                student="Aditya"
                issue="Fan not working"
                status="In Progress"
              />
            </tbody>
          </table>
        </div>

        {/* Recent Payments */}
        <div className="bg-white shadow-md rounded-xl p-4 sm:p-5 overflow-x-auto">
          <h2 className="font-semibold text-lg mb-4">Recent Payments</h2>
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="text-left border-b font-semibold">
                <th className="py-2 pr-4">Student</th>
                <th className="py-2 pr-4">Amount</th>
                <th className="py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              <PaymentRow student="Rahul" amount="₹2500" date="Dec 2, 2025" />
              <PaymentRow student="Neha" amount="₹3000" date="Dec 1, 2025" />
              <PaymentRow student="Karan" amount="₹2500" date="Nov 28, 2025" />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ------------------ Dashboard Card ------------------ */
function DashboardCard({ title, value, icon, color }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="p-4 sm:p-5 bg-white shadow-md rounded-xl flex justify-between items-center gap-4"
    >
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-700">
          {title}
        </h3>
        <p className="text-2xl sm:text-3xl font-bold mt-1">{value}</p>
      </div>

      <div className={`p-3 sm:p-4 rounded-full text-white ${color}`}>
        {icon}
      </div>
    </motion.div>
  );
}

/* ------------------ Table Row ------------------ */
function TableRow({ student, issue, status }) {
  return (
    <tr className="border-b last:border-none">
      <td className="py-2 pr-4">{student}</td>
      <td className="py-2 pr-4">{issue}</td>
      <td className="py-2">
        <span
          className={`px-3 py-1 rounded-full text-white text-xs ${
            status === "Resolved"
              ? "bg-green-600"
              : status === "Pending"
              ? "bg-red-600"
              : "bg-yellow-600"
          }`}
        >
          {status}
        </span>
      </td>
    </tr>
  );
}

/* ------------------ Payment Row ------------------ */
function PaymentRow({ student, amount, date }) {
  return (
    <tr className="border-b last:border-none">
      <td className="py-2 pr-4">{student}</td>
      <td className="py-2 pr-4">{amount}</td>
      <td className="py-2">{date}</td>
    </tr>
  );
}
