"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";
import {
  ADMISSION_STATUS,
  STATUS_LABEL,
  watchAllAdmissions as watchMyAdmissions,
} from "../lib/admissions";

export default function AdmissionStatus() {
  const [row, setRow] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubDoc;

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      unsubDoc?.();

      if (!user) {
        setLoading(false);
        return;
      }

      unsubDoc = watchMyAdmissions(
        user.uid,
        (rows) => {
          setRow(rows[0] || null);
          setLoading(false);
        },
        (e) => {
          console.error(e);
          setLoading(false);
        }
      );
    });

    return () => {
      unsubAuth();
      unsubDoc?.();
    };
  }, []);

  if (loading)
    return <div className="h-24 animate-pulse rounded-xl bg-slate-100" />;

  if (!row) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center">
        <p className="font-medium text-slate-700">
          No hostel application yet
        </p>

        <a
          href="/admissions"
          className="mt-2 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Apply for a room
        </a>
      </div>
    );
  }

  const TONE = {
    pending: "bg-amber-50 ring-amber-200",
    approved: "bg-emerald-50 ring-emerald-200",
    rejected: "bg-rose-50 ring-rose-200",
  };

  return (
    <div
      className={`rounded-xl p-6 ring-1 ${
        TONE[row.status] || "bg-slate-50 ring-slate-200"
      }`}
    >
      <p className="text-xs uppercase tracking-wide text-slate-500">
        Hostel admission
      </p>

      <p className="mt-1 text-xl font-bold text-slate-900">
        {STATUS_LABEL[row.status]}
      </p>

      {row.status === ADMISSION_STATUS.APPROVED && (
        <p className="mt-2 text-sm text-slate-700">
          Room <strong>{row.roomNo}</strong>
          {row.hostelBlock ? ` · ${row.hostelBlock}` : ""}. Collect your keys
          from the warden's office.
        </p>
      )}

      {row.status === ADMISSION_STATUS.PENDING && (
        <p className="mt-2 text-sm text-slate-700">
          The warden is reviewing your application. This page updates on its
          own.
        </p>
      )}

      {row.status === ADMISSION_STATUS.REJECTED && (
        <p className="mt-2 text-sm text-slate-700">
          {row.rejectionReason}
        </p>
      )}
    </div>
  );
}