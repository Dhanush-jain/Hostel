import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";

import { db } from "../../firebase";

/* One admission per student, moving pending → approved | rejected.
   Referenced through these constants everywhere so the string literal
   appears once — a typo in a filter still fails silently at runtime, but
   there's only one place to get it wrong. */

export const ADMISSION_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

export const STATUS_LABEL = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

/* Badge classes for the admin queue, keyed by the same status strings as
   STATUS_LABEL so a label and its colour can't drift apart.

   Background, text, and ring *colour* only — StatusBadge supplies
   `ring-1 ring-inset` itself. Written as literals rather than composed at
   runtime because Tailwind scans source text; a class name built by string
   concatenation produces no CSS at all. */
export const STATUS_STYLE = {
  pending: "bg-amber-100 text-amber-800 ring-amber-200",
  approved: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  rejected: "bg-rose-100 text-rose-800 ring-rose-200",
};

function millis(timestamp) {
  return timestamp?.toMillis?.() ?? 0;
}

export async function submitAdmission(user, form, receiptDataUrl) {
  const existing = await getActiveAdmission(user.uid);

  if (existing) {
    throw new Error(
      existing.status === ADMISSION_STATUS.APPROVED
        ? "Your admission is already confirmed."
        : "You already have an application under review."
    );
  }

  /* The receipt rides along in the document as a data URL. Firestore caps a
     document at ~1 MiB, so the caller compresses first — a full-resolution
     phone photo will blow the limit and the write fails. */
  return addDoc(collection(db, "admissions"), {
    ...form,
    uid: user.uid,
    email: user.email || "",
    receiptDataUrl: receiptDataUrl || "",
    status: ADMISSION_STATUS.PENDING,
    appliedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/* Blocks a second application while one is pending or approved.
   Check-then-write, so two fast submits can both pass — the duplicate shows
   up in the warden's queue rather than corrupting anything, and they can
   reject one. A Cloud Function is the only real fix. */
async function getActiveAdmission(uid) {
  const snap = await getDocs(
    query(collection(db, "admissions"), where("uid", "==", uid))
  );
  const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return (
    rows.find((r) => r.status === ADMISSION_STATUS.APPROVED) ||
    rows.find((r) => r.status === ADMISSION_STATUS.PENDING) ||
    null
  );
}

/**
 * Live feed of every application, newest first. Admin-only by rules.
 * Returns the unsubscribe function — call it in useEffect cleanup or the
 * listener leaks across navigations.
 *
 * Sorted in JS, not with orderBy(): Firestore excludes documents missing
 * the ordered field, so an admission written without appliedAt would be
 * invisible in the queue rather than merely out of order.
 */
export function watchAllAdmissions(onData, onError) {
  return onSnapshot(
    collection(db, "admissions"),
    (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      rows.sort((a, b) => millis(b.appliedAt) - millis(a.appliedAt));
      onData(rows);
    },
    onError
  );
}

/**
 * Live feed of one student's applications.
 * The where() clause is mandatory, not an optimisation: rules filter
 * documents, not queries, so an unconstrained read of this collection is
 * rejected outright for a non-admin.
 */
export function watchMyAdmissions(uid, onData, onError) {
  return onSnapshot(
    query(collection(db, "admissions"), where("uid", "==", uid)),
    (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      rows.sort((a, b) => millis(b.appliedAt) - millis(a.appliedAt));
      onData(rows);
    },
    onError
  );
}

/* Every decision writes both the admission and users/{uid} in one batch, so
   the two can never disagree — a half-applied approval would read
   "Confirmed" with no room and leave no trace of what went wrong.

   update(), not set(merge:true), on the user doc: a merge-set against a
   missing document is a create, and the create rule requires
   request.auth.uid == uid — an admin writing another student's doc would be
   denied and take the whole batch down with it. update() on a missing doc
   fails too, but for a legible reason. users/{uid} always exists here,
   since ensureUserProfile runs at login and registration. */
function applyDecision(batch, admission, { admissionPatch, userPatch }) {
  batch.update(doc(db, "admissions", admission.id), {
    ...admissionPatch,
    updatedAt: serverTimestamp(),
  });
  batch.update(doc(db, "users", admission.uid), {
    ...userPatch,
    updatedAt: serverTimestamp(),
  });
}

/** Approve an application and place the student in a room. */
export async function approveAdmission(admission, { roomNo, hostelBlock, adminUid }) {
  const room = roomNo?.trim().toUpperCase();
  if (!room) throw new Error("Assign a room before approving.");

  const batch = writeBatch(db);
  applyDecision(batch, admission, {
    admissionPatch: {
      status: ADMISSION_STATUS.APPROVED,
      roomNo: room,
      hostelBlock: hostelBlock || "",
      decidedAt: serverTimestamp(),
      decidedBy: adminUid || "",
      rejectionReason: "",
    },
    /* Mirrored onto the user doc so the dashboard and profile can show the
       room without joining against admissions on every page. */
    userPatch: {
      roomNo: room,
      hostelBlock: hostelBlock || "",
      admissionStatus: ADMISSION_STATUS.APPROVED,
    },
  });
  await batch.commit();
}

/** Reject, with a reason the student actually sees. */
export async function rejectAdmission(admission, { reason, adminUid }) {
  const batch = writeBatch(db);
  applyDecision(batch, admission, {
    admissionPatch: {
      status: ADMISSION_STATUS.REJECTED,
      rejectionReason: reason?.trim() || "No reason given.",
      decidedAt: serverTimestamp(),
      decidedBy: adminUid || "",
    },
    /* Clears the room. Rejecting a previously-approved student otherwise
       left them holding an allocation the warden had already taken back,
       and the room would look occupied to nobody's benefit.
       "" rather than deleteField() so the profile form's inputs stay
       controlled — undefined would flip them to uncontrolled mid-render. */
    userPatch: {
      roomNo: "",
      hostelBlock: "",
      admissionStatus: ADMISSION_STATUS.REJECTED,
    },
  });
  await batch.commit();
}

/** Undo a decision — wardens misclick. */
export async function reopenAdmission(admission) {
  const batch = writeBatch(db);
  applyDecision(batch, admission, {
    admissionPatch: {
      status: ADMISSION_STATUS.PENDING,
      roomNo: "",
      hostelBlock: "",
      rejectionReason: "",
      decidedAt: null,
      decidedBy: "",
    },
    // Frees the room again, same reasoning as reject.
    userPatch: {
      roomNo: "",
      hostelBlock: "",
      admissionStatus: ADMISSION_STATUS.PENDING,
    },
  });
  await batch.commit();
}
