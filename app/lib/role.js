"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../../firebase";

export const ROLE = {
  ADMIN: "admin",
  STUDENT: "student",
};

/* Single source of truth for "who is this and what may they see".

   Subscribed, not read once: a role change (or the initial write by
   ensureUserProfile racing a fast login) would otherwise leave the UI
   showing the wrong surface until a manual refresh.

   Absent role field defaults to STUDENT. Failing closed matters — an
   unreadable user doc must not be mistaken for an admin. */
export function useRole() {
  const [state, setState] = useState({
    status: "loading", // "loading" | "signed-out" | "ready"
    user: null,
    role: null,
  });

  useEffect(() => {
    let unsubDoc;

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      unsubDoc?.();
      unsubDoc = undefined;

      if (!user) {
        setState({ status: "signed-out", user: null, role: null });
        return;
      }

      unsubDoc = onSnapshot(
        doc(db, "users", user.uid),
        (snap) => {
          setState({
            status: "ready",
            user,
            role: snap.data()?.role || ROLE.STUDENT,
          });
        },
        (e) => {
          console.error("Role lookup failed:", e);
          setState({ status: "ready", user, role: ROLE.STUDENT });
        }
      );
    });

    return () => {
      unsubAuth();
      unsubDoc?.();
    };
  }, []);

  return state;
}

export function useIsAdmin() {
  const { status, role } = useRole();
  return { ready: status !== "loading", isAdmin: role === ROLE.ADMIN };
}
