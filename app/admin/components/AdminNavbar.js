"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { 
  FiHome, FiUsers, FiClipboard, FiBook, FiBell, FiSettings, FiMenu, FiX,
  FiFileText, FiUserCheck, FiDollarSign
} from "react-icons/fi";

export default function AdminNavbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", path: "/admin", icon: <FiHome /> },
    { name: "Students", path: "/admin/students", icon: <FiUsers /> },
    { name: "Room Allocation", path: "/admin/rooms", icon: <FiClipboard /> },
    { name: "Mess Management", path: "/admin/mess", icon: <FiBook /> },
    { name: "Complaints", path: "/admin/complaints", icon: <FiBell /> },
    { name: "Notices", path: "/admin/notices", icon: <FiFileText /> },
    { name: "Payments", path: "/admin/payments", icon: <FiDollarSign /> },
    { name: "Guard Attendance", path: "/admin/guard", icon: <FiUserCheck /> },
    { name: "Settings", path: "/admin/settings", icon: <FiSettings /> },
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-gray-900 text-white">
        <h1 className="text-xl font-bold">Admin Panel</h1>
        <button onClick={() => setOpen(!open)}>
          {open ? <FiX size={26} /> : <FiMenu size={26} />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed lg:static z-50 top-0 left-0 h-full bg-gray-900 text-white w-64 
          p-5 transition-transform duration-300 
          ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <h2 className="text-2xl font-bold mb-8 hidden lg:block">
          Admin Panel
        </h2>

        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const active = pathname === item.path;

            return (
              <Link
                key={item.name}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-[15px]
                  transition-all duration-200
                  ${
                    active
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-gray-300 hover:bg-gray-700"
                  }
                `}
                onClick={() => setOpen(false)}
              >
                <span className="text-xl">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 lg:hidden"
          onClick={() => setOpen(false)}
        ></div>
      )}
    </>
  );
}
