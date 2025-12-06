"use client";
import { useRouter } from "next/navigation";

export default function HostelBlueprint() {
  const router = useRouter();

  // Dummy room list (replace with API later)
  const rooms = [
    { id: 101, floor: 1 },
    { id: 102, floor: 1 },
    { id: 103, floor: 1 },
    { id: 104, floor: 1 },
    { id: 201, floor: 2 },
    { id: 202, floor: 2 },
    { id: 203, floor: 2 },
  ];

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-6">Hostel Layout Map</h1>

      {/* FLOOR 1 */}
      <h2 className="text-xl font-semibold mb-3">Floor 1</h2>
      <div className="grid grid-cols-3 gap-6 mb-12">
        {rooms
          .filter((r) => r.floor === 1)
          .map((room) => (
            <div
              key={room.id}
              onClick={() => router.push(`/rooms/${room.id}`)}
              className="p-6 bg-gray-200 rounded-xl shadow-md border hover:bg-blue-300 cursor-pointer transition text-center font-semibold text-lg"
            >
              Room {room.id}
            </div>
          ))}
      </div>

      {/* FLOOR 2 */}
      <h2 className="text-xl font-semibold mb-3">Floor 2</h2>
      <div className="grid grid-cols-3 gap-6">
        {rooms
          .filter((r) => r.floor === 2)
          .map((room) => (
            <div
              key={room.id}
              onClick={() => router.push(`/rooms/${room.id}`)}
              className="p-6 bg-gray-200 rounded-xl shadow-md border hover:bg-blue-300 cursor-pointer transition text-center font-semibold text-lg"
            >
              Room {room.id}
            </div>
          ))}
      </div>
    </div>
  );
}
