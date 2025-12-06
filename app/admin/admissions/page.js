"use client";

import { useEffect, useState } from "react";
import { db } from "@/firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
} from "firebase/firestore";

export default function AdmissionsPage() {
  const [data, setData] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchAdmissions();
  }, [statusFilter]);

  async function fetchAdmissions() {
    let q;

    if (statusFilter === "all") {
      q = collection(db, "admissions");
    } else {
      q = query(
        collection(db, "admissions"),
        where("status", "==", statusFilter)
      );
    }

    const snap = await getDocs(q);
    let arr = [];
    snap.forEach((doc) => arr.push({ id: doc.id, ...doc.data() }));
    setData(arr);
  }

  const updateStatus = async (id, status) => {
    await updateDoc(doc(db, "admissions", id), { status: status });
    fetchAdmissions();
  };

  const filtered = data.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Admission Applications</h1>

      {/* Search + Filter */}
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by name..."
          className="border p-2 rounded w-64"
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border p-2 rounded"
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* TABLE */}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>

        <tbody>
          {filtered.map((row) => (
            <tr key={row.id}>
              <td className="border p-2">{row.name}</td>
              <td className="border p-2">{row.email}</td>
              <td className="border p-2">{row.status}</td>

              <td className="border p-2 flex gap-2">
                <button
                  onClick={() => updateStatus(row.id, "approved")}
                  className="bg-green-600 text-white px-3 py-1 rounded"
                >
                  Approve
                </button>

                <button
                  onClick={() => updateStatus(row.id, "rejected")}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
