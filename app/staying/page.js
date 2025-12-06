"use client";
import { useState, useEffect } from "react";

// Dummy Data (Later can come from API)
const ROOM_DATA = {
  room101: {
    roomNumber: "101",
    type: "3 Seater",
    beds: [
      { id: "bed1", label: "Bed 1", occupied: false },
      { id: "bed2", label: "Bed 2", occupied: true },
      { id: "bed3", label: "Bed 3", occupied: false },
    ],
  },

  room102: {
    roomNumber: "102",
    type: "2 Seater",
    beds: [
      { id: "bed1", label: "Bed 1", occupied: false },
      { id: "bed2", label: "Bed 2", occupied: false },
    ],
  },
};

export default function BedSelection({ params }) {
  const { roomId } = params;

  const [room, setRoom] = useState(null);
  const [selectedBed, setSelectedBed] = useState(null);

  useEffect(() => {
    // Load dummy room data
    if (ROOM_DATA[roomId]) {
      setRoom(ROOM_DATA[roomId]);
    }
  }, [roomId]);

  if (!room)
    return (
      <div className="p-6 text-center text-red-500 text-xl">
        ⚠ Room not found
      </div>
    );

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* Room Header */}
      <h1 className="text-3xl font-bold mb-3">
        Room {room.roomNumber} – {room.type}
      </h1>
      <p className="text-gray-600 mb-6">
        Select an available bed from below:
      </p>

      {/* Bed Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {room.beds.map((bed) => (
          <button
            key={bed.id}
            disabled={bed.occupied}
            onClick={() => setSelectedBed(bed.id)}
            className={`
              p-6 rounded-xl border-2 text-center text-lg font-semibold transition
              ${
                bed.occupied
                  ? "bg-red-200 border-red-400 cursor-not-allowed"
                  : selectedBed === bed.id
                  ? "bg-green-300 border-green-700"
                  : "bg-green-100 border-green-400 hover:bg-green-200"
              }
            `}
          >
            {bed.label}
            {bed.occupied && <div className="text-xs mt-1">(Occupied)</div>}
          </button>
        ))}
      </div>

      {/* Selected Bed */}
      {selectedBed && (
        <div className="p-5 bg-blue-50 border border-blue-200 rounded-xl text-center">
          <h2 className="text-xl font-bold mb-2">Selected Bed</h2>
          <p className="text-lg">
            ✅ You selected <strong>{selectedBed}</strong>
          </p>

          {/* Confirm Button */}
          <button
            onClick={() => alert(`Bed ${selectedBed} booked successfully!`)}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Confirm Booking
          </button>
        </div>
      )}
    </div>
  );
}
