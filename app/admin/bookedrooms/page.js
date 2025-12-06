"use client";

import { useEffect, useState } from "react";
import { db } from "@/firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";

export default function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [roomNumber, setRoomNumber] = useState("");
  const [capacity, setCapacity] = useState("");

  useEffect(() => {
    fetchRooms();
  }, []);

  async function fetchRooms() {
    const snap = await getDocs(collection(db, "rooms"));
    const arr = [];
    snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
    setRooms(arr);
  }

  async function addRoom() {
    await addDoc(collection(db, "rooms"), {
      roomNumber,
      capacity: Number(capacity),
      occupied: 0,
      available: Number(capacity),
      status: "available",
    });

    setRoomNumber("");
    setCapacity("");
    fetchRooms();
  }

  const markFull = async (id) => {
    await updateDoc(doc(db, "rooms", id), { status: "full" });
    fetchRooms();
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Rooms Management</h1>

      {/* ADD ROOM */}
      <div className="mb-5 flex gap-3">
        <input
          type="text"
          placeholder="Room No"
          value={roomNumber}
          onChange={(e) => setRoomNumber(e.target.value)}
          className="border p-2 rounded"
        />

        <input
          type="number"
          placeholder="Capacity"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          className="border p-2 rounded"
        />

        <button
          onClick={addRoom}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </div>

      {/* ROOM TABLE */}
      <table className="w-full border">
        <thead className="bg-gray-200">
          <tr>
            <th className="border p-2">Room No</th>
            <th className="border p-2">Capacity</th>
            <th className="border p-2">Available</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>

        <tbody>
          {rooms.map((r) => (
            <tr key={r.id}>
              <td className="border p-2">{r.roomNumber}</td>
              <td className="border p-2">{r.capacity}</td>
              <td className="border p-2">{r.available}</td>
              <td className="border p-2">{r.status}</td>

              <td className="border p-2">
                <button
                  onClick={() => markFull(r.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Mark Full
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
