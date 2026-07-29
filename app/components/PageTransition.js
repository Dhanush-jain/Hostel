"use client";

import { usePathname } from "next/navigation";

/* Keying the wrapper on pathname forces React to remount the subtree on
   every route change, which restarts the CSS entrance animation. */
export default function PageTransition({ children }) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="page-transition">
      {children}
    </div>
  );
}
