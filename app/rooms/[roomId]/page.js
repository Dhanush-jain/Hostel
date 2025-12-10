"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams, useParams} from "next/navigation";

export default function RoomPage() {
   const router = useRouter();

  // ✅ Get dynamic route params
  const params = useParams();
  const roomId = params?.roomId;  // safe access

  // ✅ Get query string params
  const searchParams = useSearchParams();
  const studentId = searchParams?.get("student");
  // 🔑 CORRECTION: If 'roomId' is missing in URL, currentRoomId will be null
  const initialRoomId = searchParams?.get("roomId"); 
  const [currentRoomId, setCurrentRoomId] = useState(initialRoomId);
  const [bunks, setBunks] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const demoRooms = {
      101: ["free", "occupied", "free", "free"],
      102: ["free", "free"],
      103: ["occupied", "occupied", "free"],
    };

    const bedData = demoRooms[roomId] || null;
    if (!bedData) return;

    const grouped = [];
    for (let i = 0; i < bedData.length; i += 2) {
      grouped.push({
        upper: bedData[i],
        lower: bedData[i + 1] || "free",
      });
    }

    setBunks(grouped);
  }, [roomId]);

  if (!bunks.length)
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Room Not Found</h1>
      </div>
    );

  const select = (bunkIndex, type) => {
    if (bunks[bunkIndex][type] === "occupied") return;
    setSelected({ bunkIndex, type });
  };

  // 🔥 API CALL FUNCTION
  const confirmRoom = async () => {
    if (!selected) return;

    if (!studentId) {
      alert("Student ID not found! Please complete admission first.");
      return;
    }

    const bedName = selected.type === "upper" ? "Upper" : "Lower";

    try {
      const res = await fetch("http://localhost:5000/api/rooms/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId, // now using URL param
          room: roomId,
          bed: bedName,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Room allocated successfully!");
        router.push("/"); // redirect to home/dashboard
      } else {
        alert("Failed to allocate room");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Server error");
    }
  };

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-6">Room {roomId} — Choose Your Bed</h1>

      <div className="grid grid-cols-2 gap-10">
        {bunks.map((bunk, index) => (
          <div key={index} className="p-6 bg-gray-100 rounded-xl shadow-lg border">
            <h2 className="font-bold mb-3">Bunk {index + 1}</h2>

            {/* UPPER BED */}
            <div
              onClick={() => select(index, "upper")}
              className={`p-4 rounded-lg border text-center cursor-pointer mb-3 transition ${
                bunk.upper === "occupied"
                  ? "bg-red-500 text-white cursor-not-allowed"
                  : selected?.bunkIndex === index && selected?.type === "upper"
                  ? "bg-blue-500 text-white scale-105"
                  : "bg-green-400 text-white hover:bg-green-500"
              }`}
            >
              🛏 Upper Bed
            </div>

            {/* LOWER BED */}
            <div
              onClick={() => select(index, "lower")}
              className={`p-4 rounded-lg border text-center cursor-pointer transition ${
                bunk.lower === "occupied"
                  ? "bg-red-500 text-white cursor-not-allowed"
                  : selected?.bunkIndex === index && selected?.type === "lower"
                  ? "bg-blue-500 text-white scale-105"
                  : "bg-green-400 text-white hover:bg-green-500"
              }`}
            >
              🛏 Lower Bed
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="mt-10 text-center">
          <button
            onClick={confirmRoom}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg shadow-md hover:bg-blue-700 transition"
          >
            Confirm {selected.type} Bed in Bunk {selected.bunkIndex + 1}
          </button>
        </div>
      )}
    </div>
  );
}