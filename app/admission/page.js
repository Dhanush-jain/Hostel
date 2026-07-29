"use client";

import { useState, useEffect } from "react";
import Navbar from "../navbar/page";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";
import {
  ADMISSION_STATUS,
  STATUS_LABEL,
  submitAdmission,
  watchMyAdmissions,
} from "../lib/admissions";
import { compressToDataUrl } from "../lib/receipts";

export default function MessAdmission() {
  const [formData, setFormData] = useState({
    name: "",
    rollNo: "",
    department: "",
    year: "",
    phone: "",
    email: "",
    hostel: "",
  });

  const [feeReceipt, setFeeReceipt] = useState(null);
  const [preview, setPreview] = useState(null);
  const [user, setUser] = useState(null);
  const [existing, setExisting] = useState(null);
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  /* Firestore rules require the doc's uid to match the caller, so an
     application can't be filed anonymously. Email is prefilled from the
     Auth record rather than typed — the two disagreeing is a support ticket
     waiting to happen. */
  useEffect(() => {
    let unsubDoc;
    const unsubAuth = onAuthStateChanged(auth, (current) => {
      unsubDoc?.();
      setUser(current);

      if (!current) {
        setChecking(false);
        return;
      }

      setFormData((p) => ({
        ...p,
        email: current.email || p.email,
        name: p.name || current.displayName || "",
      }));

      unsubDoc = watchMyAdmissions(
        current.uid,
        (rows) => {
          setExisting(rows[0] || null);
          setChecking(false);
        },
        (e) => {
          console.error("Admission lookup failed:", e);
          setChecking(false);
        }
      );
    });

    return () => {
      unsubAuth();
      unsubDoc?.();
    };
  }, []);

  // Object URLs are held by the browser until revoked; without this a few
  // receipt previews leak the whole file into memory.
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    /* Generous cap — compressToDataUrl downscales before any write, so a
       3 MB phone photo is fine. This only rejects absurd inputs. */
    if (file.size > 10 * 1024 * 1024) {
      setError("That image is too large. Please pick one under 10 MB.");
      return;
    }
    setError("");
    setFeeReceipt(file);
    setPreview((old) => {
      if (old) URL.revokeObjectURL(old);
      return URL.createObjectURL(file);
    });
  };

  const handleSubmit = async (e) => {
    /* preventDefault and validation FIRST, then the async work. Doing any of
       this after an await lets the browser's native submit fire and reload
       the page mid-request. */
    e.preventDefault();
    setError("");

    if (!user) {
      setError("Please sign in before applying.");
      return router.push("/login");
    }
    if (!/^[6-9]\d{9}$/.test(formData.phone.trim())) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }
    if (!feeReceipt) {
      setError("Please attach your fee receipt.");
      return;
    }

    setBusy(true);
    try {
      /* Compressed in the browser before the write: Firestore caps a
         document at 1 MiB, and a raw phone photo is several times that. */
      const receiptDataUrl = await compressToDataUrl(feeReceipt);

      await submitAdmission(
        user,
        {
          name: formData.name.trim(),
          rollNo: formData.rollNo.trim().toUpperCase(),
          department: formData.department.trim(),
          // Mirrored as `course` too, because that's the key the admin review
          // panel and lib/profile.js both use.
          course: formData.department.trim(),
          year: formData.year.trim(),
          phone: formData.phone.trim(),
          hostel: formData.hostel.trim(),
        },
        receiptDataUrl
      );

      /* Straight to the dashboard, where AdmissionStatus shows "Under
         review" and flips to the assigned room the moment the warden
         approves — no /rooms step, since the warden allocates. */
      router.push("/dashboard");
    } catch (err) {
      console.error("Submit Error:", err);
      setError(
        err.code === "permission-denied"
          ? "Your account isn't allowed to apply. Contact the hostel office."
          : err.message || "Something went wrong. Please try again."
      );
      // Only cleared on failure — on success we're navigating away, and
      // resetting would flash the button back mid-redirect.
      setBusy(false);
    }
  };

  /* ---------- Already applied: show status instead of a blank form ----------
     Re-rendering the form here invites a duplicate submission that
     submitAdmission would only reject after the compression had already run. */
  const blocked =
    existing?.status === ADMISSION_STATUS.PENDING ||
    existing?.status === ADMISSION_STATUS.APPROVED;

  return (
    <>
      <Navbar />
      <div className=" mx-auto my-10 max-w-3xl rounded-xl bg-white p-8 shadow-lg">
        <h1 className="mb-4 text-3xl font-bold text-gray-800">
          Admission Overview
        </h1>
        <p className="mb-2 text-gray-700">
          Our hostel offers safe, comfortable, and affordable accommodation for
          students who require a secure place to stay during their academic
          year.
        </p>
        <p className="mb-6 text-gray-700">
          Admission is given on a first-come, first-served basis, subject to
          eligibility, availability of seats, and verification of documents.
        </p>

        <h2 className="mb-3 text-2xl font-semibold text-gray-800">
          Eligibility
        </h2>
        <ul className="mb-6 list-disc space-y-2 pl-6 text-gray-700">
          <li>
            Applicants must be enrolled in a recognised school, college, or
            university for the relevant academic year.
          </li>
          <li>
            Priority is usually given to outstation students and those with a
            genuine need for hostel accommodation.
          </li>
          <li>
            All residents must agree to follow the hostel rules, code of
            conduct, and disciplinary policies.
          </li>
        </ul>

        <h2 className="mb-3 text-2xl font-semibold text-gray-800">
          Application Process
        </h2>
        <ol className="mb-6 list-decimal space-y-2 pl-6 text-gray-700">
          <li>
            Fill out the online hostel admission form with accurate personal,
            academic, and contact details.
          </li>
          <li>
            Upload or submit the required documents (ID proof,
            admission/bonafide letter, recent photograph, and any requested
            medical information).
          </li>
          <li>
            Pay the applicable admission and hostel fees within the notified
            deadline to confirm your seat.
          </li>
          <li>
            Admission will be confirmed only after fee payment and approval by
            the hostel administration.
          </li>
        </ol>

        <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-900">
          <p className="font-medium">Note:</p>
          <p>
            Seats are limited, so students are encouraged to apply as early as
            possible for the upcoming session.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl w-full bg-white shadow-lg rounded-2xl p-4 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3 text-center">
          Explore Our Hostel Rooms in 360°
        </h2>

        {/* 360° View using iframe */}
        <div className="w-full aspect-video rounded-xl overflow-hidden shadow-md border">
          <iframe
            src="https://momento360.com/e/u/783e19781ba344389e53796046426f68?utm_campaign=embed&utm_source=other&heading=0&pitch=0&field-of-view=75&size=medium&display-plan=true"
            title="Mess Hall 360 View"
            width="100%"
            height="100%"
            allowFullScreen
            className="rounded-xl"
          ></iframe>
        </div>

        <p className="text-sm text-gray-500 mt-2 text-center">
          You can click and drag to look around the mess in 360° view.
        </p>
      </div>

      <div className="min-h-screen m-10 bg-white text-white py-10 px-6 mt-20">
        <div className="max-w-3xl mx-auto bg-gray-200 text-black p-8 rounded-2xl shadow-lg">
          <h1 className="text-3xl font-bold mb-6 text-center">
            🏫 Hostel Admission Form
          </h1>

          {checking ? (
            <div className="h-40 animate-pulse rounded-xl bg-gray-300" />
          ) : !user ? (
            <div className="rounded-xl bg-white p-8 text-center">
              <p className="font-semibold text-gray-800">
                Sign in to apply for a hostel room
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Your application is tied to your account so you can track it.
              </p>
              <button
                onClick={() => router.push("/login")}
                className="mt-4 rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700"
              >
                Sign in
              </button>
            </div>
          ) : blocked ? (
            <div className="rounded-xl bg-white p-8 text-center">
              <p className="text-sm uppercase tracking-wide text-gray-400">
                Your application
              </p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {STATUS_LABEL[existing.status]}
              </p>
              <p className="mt-2 text-sm text-gray-600">
                {existing.status === ADMISSION_STATUS.APPROVED
                  ? `Room ${existing.roomNo}${
                      existing.hostelBlock ? ` · ${existing.hostelBlock}` : ""
                    }. Collect your keys from the warden's office.`
                  : "The warden is reviewing it. You'll see the result on your dashboard."}
              </p>
              <button
                onClick={() => router.push("/dashboard")}
                className="mt-4 rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700"
              >
                Go to dashboard
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {existing?.status === ADMISSION_STATUS.REJECTED && (
                <div className="rounded-lg bg-rose-50 p-4 text-sm text-rose-900">
                  <p className="font-semibold">
                    Your previous application wasn&apos;t approved.
                  </p>
                  <p className="mt-1">{existing.rejectionReason}</p>
                  <p className="mt-1">You can apply again below.</p>
                </div>
              )}

              {error && (
                <div
                  role="alert"
                  className="rounded-lg bg-rose-100 p-3 text-sm font-medium text-rose-800"
                >
                  {error}
                </div>
              )}

              {/* Student Information Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={busy}
                    className="w-full p-2 rounded-md border-1 text-black disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Roll Number
                  </label>
                  <input
                    type="text"
                    name="rollNo"
                    placeholder="Enter your Roll No."
                    value={formData.rollNo}
                    onChange={handleChange}
                    required
                    disabled={busy}
                    className="w-full p-2 rounded-md border-1 text-black disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    name="department"
                    placeholder="Enter your department"
                    value={formData.department}
                    onChange={handleChange}
                    required
                    disabled={busy}
                    className="w-full border-1 p-2 rounded-md text-black disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Year of Study
                  </label>
                  <input
                    type="text"
                    name="year"
                    placeholder="Year"
                    value={formData.year}
                    onChange={handleChange}
                    required
                    disabled={busy}
                    className="w-full p-2 border-1 rounded-md text-black disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    disabled={busy}
                    className="w-full p-2 border-1 rounded-md text-black disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Email ID{" "}
                    <span className="text-xs font-normal text-gray-500">
                      (from your account)
                    </span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    readOnly
                    disabled
                    className="w-full cursor-not-allowed bg-gray-100 p-2 border-1 rounded-md text-gray-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold mb-1">
                    Hostel Name
                  </label>
                  <input
                    type="text"
                    name="hostel"
                    placeholder="Enter hostel name"
                    value={formData.hostel}
                    onChange={handleChange}
                    required
                    disabled={busy}
                    className="w-full p-2 border-1 rounded-md text-black disabled:opacity-60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Upload College Fee Receipt
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                  disabled={busy}
                  className="block w-full text-sm text-gray-700
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-600 file:text-white
                hover:file:bg-blue-700"
                />
                <p className="mt-1 text-xs text-gray-500">
                  JPG or PNG. Large photos are compressed automatically.
                </p>

                {preview && (
                  <div className="mt-4">
                    <p className="text-gray-700 mb-2">
                      📸 Fee Receipt Preview:
                    </p>
                    {/* Plain img, not next/image: blob: URLs aren't a
                        configured remote pattern and next/image rejects them
                        in production builds. */}
                    <img
                      src={preview}
                      alt="Fee Receipt Preview"
                      width={400}
                      className="rounded-md border border-gray-400"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={busy}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {busy ? "Submitting…" : "Submit Application"}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
