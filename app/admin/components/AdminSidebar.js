
import Link from "next/link";

export default function AdminSidebar() {
  const links = [
    { name: "Dashboard", path: "/admin" },
    { name: "Students", path: "/admin/students" },
    { name: "Admissions", path: "/admin/admissions" },
    { name: "Rooms", path: "/admin/bookedrooms" },
    { name: "Mess", path: "/admin/mess" },
    { name: "Payments", path: "/admin/payments" },
    { name: "Complaints", path: "/admin/complaints" },
  ];

  return (
    <div className="w-64 bg-white shadow-lg p-4">
      <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
      <nav className="flex flex-col gap-3">
        {links.map((item) => (
          <Link
            key={item.name}
            href={item.path}
            className="p-2 hover:bg-gray-200 rounded"
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}
