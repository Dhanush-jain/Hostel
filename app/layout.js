import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LenisProvider from "./lenis/lenisprovider";
import LayoutShell from "./components/LayoutShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/* Only possible because this file is a server component again. */
export const metadata = {
  title: {
    default: "GIT Hostel Management",
    template: "%s · GIT Hostel",
  },
  description:
    "Hostel rooms, mess subscription, attendance and student profiles for GIT.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LenisProvider />
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
