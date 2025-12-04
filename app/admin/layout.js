"use client";

import AdminSidebar from "./components/AdminSidebar";
// import AdminNavbar from "./components/AdminNavbar";

export default function AdminLayout({ children }) {
  return (
    <div className="flex w-full min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1">
        {/* <AdminNavbar /> */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
