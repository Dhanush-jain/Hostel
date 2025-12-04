"use client";

import { useState } from "react";

const students = [
  { id: "S101", name: "Aman Sharma" },
  { id: "S102", name: "Priya Singh" },
  { id: "S103", name: "Kunal Verma" },
];

const blocks = ["A", "B", "C"];

const roomsData = {
  A: ["101", "102", "103"],
  B: ["201", "202"],
  C: ["301", "302"],
};

export default function AllocateRoom() {
  const [student, setStudent] = useState("");
  const [block, setBlock] = useState("");
  const [room, setRoom] = useState("");

  const handleSubmit = () => {
    if (!student || !block || !room) {
      alert("Please fill all fields");
      return;
    }

    alert(
      `Room allocated successfully!\n\nStudent: ${
        students.find((s) => s.id === student).name
      }\nBlock: ${block}\nRoom: ${room}`
    );
  };

  return (
    <div className="p-6 max-w-3xl m-10">
      <h1 className="text-3xl font-bold mb-6">Allocate Room</h1>

      <div className="bg-white shadow p-6 rounded-xl space-y-4">
        <div>
          <label className="font-semibold">Student</label>
          <select
            className="w-full border p-2 rounded-md mt-1"
            onChange={(e) => setStudent(e.target.value)}
          >
            <option value="">Select Student</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-semibold">Block</label>
          <select
            className="w-full border p-2 rounded-md mt-1"
            onChange={(e) => setBlock(e.target.value)}
          >
            <option value="">Select Block</option>
            {blocks.map((b) => (
              <option key={b} value={b}>
                Block {b}
              </option>
            ))}
          </select>
        </div>

        {block && (
          <div>
            <label className="font-semibold">Room</label>
            <select
              className="w-full border p-2 rounded-md mt-1"
              onChange={(e) => setRoom(e.target.value)}
            >
              <option value="">Select Room</option>
              {roomsData[block].map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
        >
          Allocate Room
        </button>
      </div>
    </div>
  );
}
