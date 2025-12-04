"use client";

import { useState } from "react";
import Link from "next/link";

export default function RoomAllocationDashboard() {
  const [filterBlock, setFilterBlock] = useState("");

  const allocatedRooms = [
    { student: "Aman Sharma", block: "A", room: "101" },
    { student: "Priya Singh", block: "B", room: "201" },
  ];

  const filteredData = filterBlock
    ? allocatedRooms.filter((item) => item.block === filterBlock)
    : allocatedRooms;

  return (
    <div className="p-6 m-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Room Allocation</h1>

        <Link
          href="/admin/room-allocation/allocate"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Allocate New Room
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-4 flex gap-4">
        <select
          className="border p-2 rounded-md"
          onChange={(e) => setFilterBlock(e.target.value)}
        >
          <option value="">All Blocks</option>
          <option value="A">Block A</option>
          <option value="B">Block B</option>
          <option value="C">Block C</option>
        </select>
      </div>

      {/* Allocated Table */}
      <div className="bg-white rounded-xl shadow p-4">
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Student</th>
              <th className="p-2 border">Block</th>
              <th className="p-2 border">Room</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.map((item, index) => (
              <tr className="text-center" key={index}>
                <td className="p-2 border">{item.student}</td>
                <td className="p-2 border">{item.block}</td>
                <td className="p-2 border">{item.room}</td>
              </tr>
            ))}

            {filteredData.length === 0 && (
              <tr>
                <td colSpan="3" className="p-4 text-gray-500">
                  No data found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
    
  );
}
