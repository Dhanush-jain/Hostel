"use client";

import { FiUsers, FiHome, FiBell, FiBook, FiDollarSign } from "react-icons/fi";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  return (
    <div className="p-6 m-10">
      {/* Page Title */}
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Students */}
        <DashboardCard
          title="Total Students"
          value="120"
          icon={<FiUsers size={30} />}
          color="bg-blue-600"
        />

        {/* Rooms Filled */}
        <DashboardCard
          title="Rooms Filled"
          value="85 / 120"
          icon={<FiHome size={30} />}
          color="bg-green-600"
        />

        {/* Complaints */}
        <DashboardCard
          title="Active Complaints"
          value="14"
          icon={<FiBell size={30} />}
          color="bg-red-600"
        />

        {/* Mess Subscriptions */}
        <DashboardCard
          title="Mess Subscriptions"
          value="98"
          icon={<FiBook size={30} />}
          color="bg-yellow-600"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white shadow-md rounded-xl p-5 h-[300px]">
          <h2 className="font-semibold text-lg mb-4">Monthly Payments Overview</h2>
          <div className="flex items-center justify-center h-full text-gray-500">
            {/* Chart Placeholder */}
            Chart Component Here
          </div>
        </div>

        <div className="bg-white shadow-md rounded-xl p-5 h-[300px]">
          <h2 className="font-semibold text-lg mb-4">Student Growth</h2>
          <div className="flex items-center justify-center h-full text-gray-500">
            {/* Chart Placeholder */}
            Graph Component Here
          </div>
        </div>
      </div>

      {/* Recent Complaints + Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        
        {/* Recent Complaints */}
        <div className="bg-white shadow-md rounded-xl p-5">
          <h2 className="font-semibold text-lg mb-4">Recent Complaints</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b font-semibold">
                <th className="py-2">Student</th>
                <th className="py-2">Issue</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              <TableRow student="Rohan" issue="Water leakage" status="Pending" />
              <TableRow student="Priya" issue="Room cleaning" status="Resolved" />
              <TableRow student="Aditya" issue="Fan not working" status="In Progress" />
            </tbody>
          </table>
        </div>

        {/* Recent Payments */}
        <div className="bg-white shadow-md rounded-xl p-5">
          <h2 className="font-semibold text-lg mb-4">Recent Payments</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b font-semibold">
                <th className="py-2">Student</th>
                <th className="py-2">Amount</th>
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

/* ---------------------- Dashboard Card Component ---------------------- */
function DashboardCard({ title, value, icon, color }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="p-5 bg-white shadow-md rounded-xl flex justify-between items-center"
    >
      <div>
        <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
        <p className="text-3xl font-bold mt-1">{value}</p>
      </div>
      <div className={`p-4 rounded-full text-white ${color}`}>
        {icon}
      </div>
    </motion.div>
  );
}

/* ---------------------- Table Row Components ---------------------- */
function TableRow({ student, issue, status }) {
  return (
    <tr className="border-b last:border-none">
      <td className="py-2">{student}</td>
      <td className="py-2">{issue}</td>
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

function PaymentRow({ student, amount, date }) {
  return (
    <tr className="border-b last:border-none">
      <td className="py-2">{student}</td>
      <td className="py-2">{amount}</td>
      <td className="py-2">{date}</td>
    </tr>
  );
}
