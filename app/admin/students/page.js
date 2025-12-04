"use client";

import { useState } from "react";
import { FiPlus, FiSearch, FiEdit, FiTrash2, FiEye } from "react-icons/fi";
import { motion } from "framer-motion";

export default function StudentsPage() {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [students, setStudents] = useState([
    { id: 1, name: "Rohan Sharma", email: "rohan@gmail.com", room: "A-102", phone: "9876543210" },
    { id: 2, name: "Sneha Agarwal", email: "sneha@gmail.com", room: "B-204", phone: "9123456789" },
    { id: 3, name: "Karan Patel", email: "karan@gmail.com", room: "C-303", phone: "9988776655" },
  ]);

  // New Student State
  const [newStudent, setNewStudent] = useState({
    name: "",
    email: "",
    room: "",
    phone: "",
  });

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const addStudent = () => {
    if (!newStudent.name || !newStudent.email || !newStudent.room || !newStudent.phone) {
      alert("All fields are required!");
      return;
    }

    setStudents([
      ...students,
      { id: Date.now(), ...newStudent }
    ]);

    setNewStudent({ name: "", email: "", room: "", phone: "" });
    setShowModal(false);
  };

  return (
    <div className="p-6 m-10">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Student Management</h1>

        {/* Add Student Btn */}
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 px-4 py-2 text-white rounded-lg hover:bg-blue-700"
        >
          <FiPlus size={18} /> Add Student
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center bg-white shadow-md p-3 rounded-lg mb-5 w-full sm:w-1/3">
        <FiSearch size={20} className="text-gray-500" />
        <input
          type="text"
          placeholder="Search student..."
          className="ml-2 w-full outline-none"
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Students Table */}
      <div className="overflow-x-auto bg-white shadow-md rounded-xl">
        <table className="w-full text-sm">
          <thead className="bg-gray-200">
            <tr className="text-left">
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Room</th>
              <th className="py-3 px-4">Phone</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredStudents.map((student) => (
              <motion.tr
                key={student.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-b"
              >
                <td className="py-3 px-4">{student.name}</td>
                <td className="py-3 px-4">{student.email}</td>
                <td className="py-3 px-4">{student.room}</td>
                <td className="py-3 px-4">{student.phone}</td>

                <td className="py-3 px-4">
                  <div className="flex gap-3">

                    {/* View */}
                    <button className="text-blue-600 hover:scale-110 transition">
                      <FiEye size={18} />
                    </button>

                    {/* Edit */}
                    <button className="text-yellow-600 hover:scale-110 transition">
                      <FiEdit size={18} />
                    </button>

                    {/* Delete */}
                    <button
                      className="text-red-600 hover:scale-110 transition"
                      onClick={() =>
                        setStudents(students.filter((s) => s.id !== student.id))
                      }
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}

            {filteredStudents.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-5 text-gray-500">
                  No students found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ------------------- Add Student Modal ------------------- */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-96 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Add New Student</h2>

            <div className="grid gap-3">
              <input
                className="border p-2 rounded"
                type="text"
                placeholder="Full Name"
                value={newStudent.name}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, name: e.target.value })
                }
              />

              <input
                className="border p-2 rounded"
                type="email"
                placeholder="Email"
                value={newStudent.email}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, email: e.target.value })
                }
              />

              <input
                className="border p-2 rounded"
                type="text"
                placeholder="Room No."
                value={newStudent.room}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, room: e.target.value })
                }
              />

              <input
                className="border p-2 rounded"
                type="text"
                placeholder="Phone Number"
                value={newStudent.phone}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, phone: e.target.value })
                }
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-5">
              <button
                className="px-4 py-2 bg-gray-300 rounded-lg"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>

              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                onClick={addStudent}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
