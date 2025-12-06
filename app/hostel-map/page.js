"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { useState } from "react";
import * as THREE from "three";

export default function HostelMap() {
  const [selectedRoom, setSelectedRoom] = useState(null);

  return (
    <div className="w-full h-screen bg-gray-900">
      <Canvas camera={{ position: [15, 20, 25], fov: 50 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 10, 5]} intensity={1} />

        {/* Hostel Floor Blueprint */}
        <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[40, 40]} />
          <meshStandardMaterial color="#3a3a3a" />
        </mesh>

        {/* Rooms Grid */}
        <Rooms setSelectedRoom={setSelectedRoom} />

        <OrbitControls />
      </Canvas>

      {/* Room Popup */}
      {selectedRoom && (
        <div className="fixed top-5 right-5 bg-white p-4 rounded-lg shadow-xl w-96 h-[500px] overflow-auto">
          <button
            onClick={() => setSelectedRoom(null)}
            className="float-right px-3 py-1 bg-red-500 text-white rounded"
          >
            X
          </button>
          <h2 className="text-xl font-bold mb-3">
            Room {selectedRoom.id} Layout
          </h2>
          <Room3DView roomId={selectedRoom.id} />
        </div>
      )}
    </div>
  );
}

function Rooms({ setSelectedRoom }) {
  const rooms = [];

  // Generate 12 rooms (3 rows x 4 cols)
  let id = 101;
  for (let x = -10; x <= 10; x += 7) {
    for (let z = -10; z <= 10; z += 7) {
      rooms.push({ id: id++, position: [x, 0.5, z] });
    }
  }

  return (
    <>
      {rooms.map((room) => (
        <RoomBox key={room.id} room={room} setSelectedRoom={setSelectedRoom} />
      ))}
    </>
  );
}

function RoomBox({ room, setSelectedRoom }) {
  const [hovered, setHovered] = useState(false);

  return (
    <mesh
      position={room.position}
      onClick={() => setSelectedRoom(room)}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <boxGeometry args={[5, 3, 5]} />
      <meshStandardMaterial color={hovered ? "#00bcd4" : "#1e90ff"} />

      {/* Room Number */}
      <Html position={[0, 2, 0]}>
        <div className="text-sm font-bold text-white">{room.id}</div>
      </Html>
    </mesh>
  );
}

function Room3DView({ roomId }) {
  return (
    <div className="w-full h-96 bg-gray-200 rounded-md">
      <Canvas camera={{ position: [6, 5, 10], fov: 50 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 5]} intensity={1} />

        <RoomInterior />
        <BunkBeds />

        <OrbitControls />
      </Canvas>
    </div>
  );
}

function RoomInterior() {
  return (
    <mesh position={[0, 1.5, 0]}>
      <boxGeometry args={[8, 3, 8]} />
      <meshStandardMaterial
        color="#ffffff"
        transparent
        opacity={0.2}
        wireframe
      />
    </mesh>
  );
}

function BunkBeds() {
  const beds = [
    [-2, 0, -2],
    [2, 0, -2],
    [-2, 0, 2],
    [2, 0, 2],
  ];

  return (
    <>
      {beds.map((pos, i) => (
        <BunkBed key={i} position={pos} bedId={i + 1} />
      ))}
    </>
  );
}

function BunkBed({ position, bedId }) {
  const [selected, setSelected] = useState(false);

  return (
    <mesh
      position={position}
      onClick={() => setSelected(!selected)}
      onPointerOver={() => (document.body.style.cursor = "pointer")}
      onPointerOut={() => (document.body.style.cursor = "default")}
    >
      <boxGeometry args={[1.5, 2, 1]} />
      <meshStandardMaterial color={selected ? "green" : "gray"} />

      <Html position={[0, 1.5, 0]}>
        <div className="text-xs font-bold bg-white px-1 py-0.5 rounded">
          Bed {bedId}
        </div>
      </Html>
    </mesh>
  );
}
