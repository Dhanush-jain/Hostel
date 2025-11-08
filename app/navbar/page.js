'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/mess", label: "Mess Facility" },
  { href: "/rules", label: "Rules and regulation" },
  { href: "/admission", label: "Admission" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // ✅ Handle Firebase logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setOpen(false);
    }
  };

  // ✅ Automatically close menu on scroll
  useEffect(() => {
    const handleScroll = () => setOpen(false);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className="fixed w-full top-0 left-0 bg-gray-200 shadow-md z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-3">
        {/* Logo */}
        <div className="font-bold text-xl">
          <Link href="/" className="text-2xl">GIT</Link>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex gap-8 items-center">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-gray-700 hover:text-blue-600 transition"
            >
              {label}
            </Link>
          ))}
          {/* Logout button for desktop */}
          <button
            onClick={handleLogout}
            className="text-gray-700 hover:text-red-600 font-semibold transition"
          >
            Logout
          </button>
        </div>

        {/* Hamburger Button (Mobile) */}
        <button
          className="md:hidden flex flex-col gap-1.5"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <span
            className={`w-7 h-1 bg-gray-700 rounded transition-all duration-300 ${
              open ? "rotate-45 translate-y-2" : ""
            }`}
          ></span>
          <span
            className={`w-7 h-1 bg-gray-700 rounded transition-all duration-300 ${
              open ? "opacity-0" : ""
            }`}
          ></span>
          <span
            className={`w-7 h-1 bg-gray-700 rounded transition-all duration-300 ${
              open ? "-rotate-45 -translate-y-2" : ""
            }`}
          ></span>
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      <div
        className={`absolute top-full left-0 w-full bg-white shadow-xl flex flex-col md:hidden transition-all duration-500 overflow-hidden ${
          open ? "max-h-80 py-4" : "max-h-0 py-0"
        }`}
      >
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="px-4 py-3 text-gray-700 hover:text-blue-600 transition"
            onClick={() => setTimeout(() => setOpen(false), 200)} // smooth close
          >
            {label}
          </Link>
        ))}

        {/* ✅ Logout Button (Mobile) */}
        <button
          onClick={() => {
            handleLogout();
            setTimeout(() => setOpen(false), 200);
          }}
          className="px-4 py-3 text-gray-700 hover:text-red-600 text-left font-semibold transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
