"use client";
import React from "react";
import { FaFacebook, FaInstagram, FaLinkedin, FaEnvelope, FaPhone } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-gray-200 py-10 mt-10">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 sm:grid-cols-2 gap-8">

        {/* Branding Section */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-3">🏠 Hostel Management System</h2>
          <p className="text-gray-300 text-sm">
            Streamline hostel admissions, mess management, and student records all in one unified platform.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="/" className="hover:text-blue-300 transition">Home</a></li>
            <li><a href="/admission" className="hover:text-blue-300 transition">Admission</a></li>
            <li><a href="/mess" className="hover:text-blue-300 transition">Mess & Meals</a></li>
            <li><a href="/rules" className="hover:text-blue-300 transition">Rules & Regulations</a></li>
            <li><a href="/contact" className="hover:text-blue-300 transition">Contact</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Contact Us</h3>
          <ul className="space-y-2 text-sm">
            <li><FaEnvelope className="inline mr-2 text-blue-300" /> gitcollege@git.edu</li>
            <li><FaPhone className="inline mr-2 text-blue-300" /> +91 98765 43210</li>
            <li><span className="text-blue-300">📍</span> GIT Hostel, College Campus, Belgavi, India</li>
          </ul>
        </div>

        {/* Social & Newsletter */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Stay Connected</h3>
          <div className="flex space-x-4 mb-4">
            <a href="#" className="hover:text-blue-400 transition"><FaFacebook size={20} /></a>
            <a href="#" className="hover:text-blue-400 transition"><FaInstagram size={20} /></a>
            <a href="#" className="hover:text-blue-400 transition"><FaLinkedin size={20} /></a>
          </div>
          <p className="text-sm mb-2">Subscribe for updates:</p>
          <div className="flex">
            <input
              type="email"
              placeholder="Your email"
              className="p-2 rounded-l-md w-full text-gray-800 focus:outline-none"
            />
            <button className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-r-md text-white text-sm">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-blue-700 mt-8 pt-4 text-center text-sm text-gray-400">
        © 2025 Hostel Management System | All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;
