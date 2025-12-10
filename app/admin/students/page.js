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

    setStudents([...students, { id: Date.now(), ...newStudent }]);
    setNewStudent({ name: "", email: "", room: "", phone: "" });
    setShowModal(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10 w-full">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Student Management</h1>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-lg text-white hover:bg-blue-700 w-full md:w-auto justify-center"
        >
          <FiPlus size={18} />
          Add Student
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="w-full sm:w-2/3 md:w-1/2 lg:w-1/3 mb-5">
        <div className="flex items-center bg-white shadow-md p-3 rounded-lg">
          <FiSearch size={20} className="text-gray-500" />
          <input
            type="text"
            placeholder="Search student..."
            className="ml-3 w-full outline-none text-sm sm:text-base"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* TABLE WRAPPER */}
      <div className="w-full overflow-x-auto bg-white shadow-md rounded-xl">
        <table className="w-full min-w-[700px] text-xs sm:text-sm">
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
                  <div className="flex gap-4">
                    <button className="text-blue-600 hover:scale-110 transition">
                      <FiEye size={18} />
                    </button>

                    <button className="text-yellow-600 hover:scale-110 transition">
                      <FiEdit size={18} />
                    </button>

                    <button
                      onClick={() =>
                        setStudents(students.filter((s) => s.id !== student.id))
                      }
                      className="text-red-600 hover:scale-110 transition"
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

      {/* ---------- ADD STUDENT MODAL ---------- */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">

          <div className="bg-white w-full max-w-sm sm:max-w-md p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Add New Student</h2>

            <div className="grid gap-3">
              <input
                type="text"
                placeholder="Full Name"
                className="border p-2 rounded w-full"
                value={newStudent.name}
                onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
              />

              <input
                type="email"
                placeholder="Email"
                className="border p-2 rounded w-full"
                value={newStudent.email}
                onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
              />

              <input
                type="text"
                placeholder="Room No."
                className="border p-2 rounded w-full"
                value={newStudent.room}
                onChange={(e) => setNewStudent({ ...newStudent, room: e.target.value })}
              />

              <input
                type="text"
                placeholder="Phone Number"
                className="border p-2 rounded w-full"
                value={newStudent.phone}
                onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
              />
            </div>

            {/* MODAL BUTTONS */}
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
