"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";

/**
 * Resolves the signed-in user plus their role from users/{uid}.
 *
 * Returns { user, role, ready }:
 *   ready === false → still checking; render nothing auth-dependent yet.
 *                     Treating this as "not an admin" would flash the
 *                     access-denied screen on every page load.
 *   role            → "admin" | "student" | null (null when signed out)
 */
export function useRole() {
  const [state, setState] = useState({ user: null, role: null, ready: false });

  useEffect(() => {
    // Guards against a setState after unmount if the getDoc is still in flight
    let alive = true;

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        if (alive) setState({ user: null, role: null, ready: true });
        return;
      }

      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (!alive) return;
        setState({
          user,
          // Missing doc or missing field both mean lowest privilege
          role: snap.exists() ? snap.data().role || "student" : "student",
          ready: true,
        });
      } catch (e) {
        console.error("Role lookup failed:", e);
        // Fail closed: if we can't read the role, assume the least privilege.
        // Never default to "admin" on error.
        if (alive) setState({ user, role: "student", ready: true });
      }
    });

    return () => {
      alive = false;
      unsub();
    };
  }, []);

  return state;
}
