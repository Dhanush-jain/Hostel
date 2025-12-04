"use client"; // add this so we can use usePathname()

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./navbar/page";
import { usePathname } from "next/navigation";
import Footer from "./footer/page";
import LenisProvider from "./lenis/lenisprovider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export default function RootLayout({ children }) {
  const pathname = usePathname();

  // Add any routes where you want to hide the navbar
  const hideNavbarRoutes = ["/login", "/register"];
  const shouldHideNavbar = hideNavbarRoutes.includes(pathname);

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {!shouldHideNavbar && <Navbar />}
        {children}
        <LenisProvider/>
       
      </body>
    </html>
  );
}
