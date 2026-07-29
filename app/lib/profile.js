import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";

/* ------------------------------------------------------------------
   Single source of truth for the profile form. Add a field here and
   it appears in the dashboard, counts toward completeness, and gets
   validated — no other file to touch.

   `role` is deliberately absent: it is not form-editable, and
   firestore.rules rejects any client write that changes it.
   ------------------------------------------------------------------ */
export const PROFILE_FIELDS = [
  {
    key: "name",
    label: "Full Name",
    type: "text",
    required: true,
    placeholder: "Rahul Sharma",
    maxLength: 60,
    validate: (v) => v.trim().length >= 3 || "Name must be at least 3 characters",
  },
  {
    key: "phone",
    label: "Phone Number",
    type: "tel",
    required: true,
    prefix: "+91",
    placeholder: "9876543210",
    maxLength: 10,
    validate: (v) =>
      /^[6-9]\d{9}$/.test(v) || "Enter a valid 10-digit Indian mobile number",
  },
  {
    key: "collegeId",
    label: "College ID",
    type: "text",
    required: true,
    placeholder: "GIT2026CS014",
    maxLength: 24,
    transform: (v) => v.toUpperCase(),
  },
  {
    key: "rollNo",
    label: "Roll Number",
    type: "text",
    required: true,
    placeholder: "21CS1042",
    maxLength: 20,
    transform: (v) => v.toUpperCase(),
    validate: (v) =>
      /^[A-Z0-9-]{4,20}$/.test(v) || "Letters, numbers and dashes only",
  },
  {
    key: "hostelBlock",
    label: "Hostel Block",
    type: "select",
    options: ["A Block", "B Block", "C Block", "D Block"],
  },
  {
    key: "roomNo",
    label: "Room Number",
    type: "text",
    placeholder: "B-214",
    maxLength: 10,
    transform: (v) => v.toUpperCase(),
  },
  {
    key: "course",
    label: "Course / Branch",
    type: "text",
    placeholder: "B.Tech Computer Science",
    maxLength: 60,
  },
  {
    key: "year",
    label: "Year of Study",
    type: "select",
    options: ["1st Year", "2nd Year", "3rd Year", "4th Year"],
  },
  {
    key: "bloodGroup",
    label: "Blood Group",
    type: "select",
    options: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
  },
  {
    key: "guardianName",
    label: "Guardian Name",
    type: "text",
    placeholder: "Parent / guardian full name",
    maxLength: 60,
  },
  {
    key: "guardianPhone",
    label: "Emergency Contact",
    type: "tel",
    prefix: "+91",
    placeholder: "9876543210",
    maxLength: 10,
    validate: (v) =>
      /^[6-9]\d{9}$/.test(v) || "Enter a valid 10-digit Indian mobile number",
  },
  {
    key: "homeAddress",
    label: "Home Address",
    type: "textarea",
    placeholder: "House no, street, city, state, PIN",
    maxLength: 200,
  },
];

/** Blank profile — every key present so React inputs stay controlled. */
export const emptyProfile = () =>
  PROFILE_FIELDS.reduce((acc, f) => ({ ...acc, [f.key]: "" }), {});

/* Trim, then apply the field's transform. Validation and saving both go
   through this, so a value can never pass one and fail the other —
   validating the raw string meant a lowercase "21cs1042" was rejected by
   rollNo's uppercase-only pattern that transform() would have satisfied. */
function normalizeField(field, value) {
  const raw = String(value ?? "").trim();
  return field.transform && raw ? field.transform(raw) : raw;
}

/** Percentage of fields filled in. Drives the completeness meter. */
export function profileCompleteness(profile) {
  const filled = PROFILE_FIELDS.filter((f) =>
    String(profile?.[f.key] ?? "").trim()
  ).length;
  return Math.round((filled / PROFILE_FIELDS.length) * 100);
}

/** Validate the whole form. Returns { fieldKey: "message" }, empty if clean. */
export function validateProfile(profile) {
  const errors = {};
  PROFILE_FIELDS.forEach((f) => {
    const value = normalizeField(f, profile?.[f.key]);
    if (f.required && !value) {
      errors[f.key] = `${f.label} is required`;
      return;
    }
    // Optional-but-filled fields still get validated; empty ones are skipped.
    if (value && f.validate) {
      const res = f.validate(value);
      if (res !== true) errors[f.key] = res;
    }
  });
  return errors;
}

/**
 * Read users/{uid}, creating it if absent. Called on register AND on login,
 * so accounts made before this feature existed get a doc instead of an
 * empty dashboard.
 *
 * An existing doc is returned untouched — no write, so this is safe to call
 * for the warden. Writing role:"student" back over an admin doc would be
 * rejected by the update rule anyway and would lock them out of login.
 *
 * Returns { created, ...profile } so callers can branch on role without a
 * second read.
 */
export async function ensureUserProfile(user, seed = {}) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    // Legacy docs predate the role field; treat them as students. It can't
    // be backfilled from here — the update rule requires the incoming role
    // to equal the stored one, and null never equals "student". Fix those
    // in the console or with the Admin SDK.
    const data = snap.data();
    return { created: false, id: snap.id, role: "student", ...data };
  }

  const fresh = {
    ...emptyProfile(),
    ...seed,
    uid: user.uid,
    email: user.email || "",
    name: seed.name || user.displayName || "",
    // Last word on role, so a caller passing seed.role can't self-promote.
    // The create rule also demands exactly this value.
    role: "student",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(ref, fresh);
  return { created: true, id: user.uid, ...fresh };
}

/** Persist edits. Only whitelisted keys are written — email, uid, role and
    createdAt are never overwritten from the client form.

    Keys absent from `profile` are left alone rather than blanked, so a
    partial save like { roomNo: "B-214" } updates one field instead of
    clearing the other eleven. */
export async function saveUserProfile(uid, profile) {
  const source = profile ?? {};

  const payload = PROFILE_FIELDS.reduce((acc, f) => {
    if (!Object.prototype.hasOwnProperty.call(source, f.key)) return acc;
    acc[f.key] = normalizeField(f, source[f.key]);
    return acc;
  }, {});

  await setDoc(
    doc(db, "users", uid),
    { ...payload, updatedAt: serverTimestamp() },
    { merge: true }
  );
  return payload;
}
