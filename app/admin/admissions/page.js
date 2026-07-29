"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { auth } from "../../../firebase";
import { useRole, ROLE } from "../../lib/role";

import {
  ADMISSION_STATUS,
  STATUS_LABEL,
  STATUS_STYLE,
  watchAllAdmissions,
  approveAdmission,
  rejectAdmission,
  reopenAdmission,
} from "../../lib/admissions";

const BLOCKS = ["A Block", "B Block", "C Block", "D Block"];

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
        STATUS_STYLE[status] || "bg-slate-100 text-slate-700 ring-slate-200"
      }`}
    >
      {STATUS_LABEL[status] || status}
    </span>
  );
}

/* Gate is cosmetic — firestore.rules is what actually protects the data and
   must keep doing so. This exists so a student who lands on the URL gets a
   straight answer instead of a wall of permission-denied, and so the
   listener is never opened on their behalf at all.

   The queue lives in its own component below rather than behind an early
   return in one function: an early return would still have run the
   useEffect that opens the listener, since hooks execute before any JSX is
   returned. Not mounting the child is what actually prevents the read. */
export default function AdminAdmissionsPage() {
  const { status, role } = useRole();

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="h-8 w-64 animate-pulse rounded bg-slate-100" />
        <div className="mt-6 space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  if (status === "signed-out" || role !== ROLE.ADMIN) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="text-lg font-semibold text-slate-900">
          {status === "signed-out"
            ? "Sign in to continue"
            : "This page is for hostel staff"}
        </p>
        <p className="mt-2 text-sm text-slate-500">
          {status === "signed-out"
            ? "You need to be signed in as an administrator."
            : "Your account doesn't have administrator access."}
        </p>
        <a
          href={status === "signed-out" ? "/login" : "/dashboard"}
          className="mt-5 inline-block rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          {status === "signed-out" ? "Sign in" : "Back to dashboard"}
        </a>
      </div>
    );
  }

  return <AdmissionsQueue />;
}

function AdmissionsQueue() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  // Defaults to pending: the queue the warden opens this page to clear.
  const [filter, setFilter] = useState(ADMISSION_STATUS.PENDING);
  const [active, setActive] = useState(null); // row open in the review panel
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    const unsub = watchAllAdmissions(
      (data) => {
        setRows(data);
        setLoading(false);
      },
      (e) => {
        console.error(e);
        setError(
          e.code === "permission-denied"
            ? "Your account can't read admissions. Check that firestore.rules is deployed and your role is admin."
            : "Couldn't load applications."
        );
        setLoading(false);
      }
    );
    return unsub; // without this the listener survives navigation and leaks
  }, []);

  const counts = useMemo(
    () =>
      rows.reduce(
        (acc, r) => ({ ...acc, [r.status]: (acc[r.status] || 0) + 1 }),
        {}
      ),
    [rows]
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter !== "all" && r.status !== filter) return false;
      if (!q) return true;
      return [r.name, r.email, r.rollNo, r.course]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [rows, filter, search]);

  const handleApprove = async (row, roomNo, hostelBlock) => {
    setBusyId(row.id);
    try {
      await approveAdmission(row, {
        roomNo,
        hostelBlock,
        adminUid: auth.currentUser?.uid,
      });
      // Same trim+uppercase approveAdmission applies, so the toast can't
      // report a room string that differs from what was written.
      toast.success(
        `${row.name || "Student"} confirmed in ${roomNo.trim().toUpperCase()}.`
      );
      setActive(null);
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Could not approve.");
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (row, reason) => {
    setBusyId(row.id);
    try {
      await rejectAdmission(row, { reason, adminUid: auth.currentUser?.uid });
      toast.info("Application marked not approved.");
      setActive(null);
    } catch (e) {
      console.error(e);
      toast.error("Could not reject.");
    } finally {
      setBusyId(null);
    }
  };

  /* Needs the same catch as approve/reject. reopenAdmission's batch calls
     update() on users/{uid}, which throws outright if that doc is missing —
     without a catch the button just stops spinning, the row visibly stays
     approved, and the only trace is an unhandled rejection in the console. */
  const handleReopen = async (row) => {
    setBusyId(row.id);
    try {
      await reopenAdmission(row);
      toast.info("Moved back to pending.");
      setActive(null);
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Could not reopen.");
    } finally {
      setBusyId(null);
    }
  };

  const TABS = [
    { key: ADMISSION_STATUS.PENDING, label: "Pending" },
    { key: ADMISSION_STATUS.APPROVED, label: "Approved" },
    { key: ADMISSION_STATUS.REJECTED, label: "Rejected" },
    { key: "all", label: "All" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Admission Applications</h1>
        <p className="mt-1 text-sm text-slate-500">
          {counts.pending
            ? `${counts.pending} waiting on your decision.`
            : "Nothing waiting on you."}
        </p>
      </header>

      {/* Tabs carry live counts, so the queue depth is visible without clicking */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {TABS.map((t) => {
          const n = t.key === "all" ? rows.length : counts[t.key] || 0;
          const on = filter === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                on
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
              }`}
            >
              {t.label}
              <span className={`ml-1.5 ${on ? "text-slate-300" : "text-slate-400"}`}>
                {n}
              </span>
            </button>
          );
        })}

        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, email, roll no…"
          className="ml-auto w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-slate-400 sm:w-64"
        />
      </div>

      {error && (
        <div className="rounded-lg bg-rose-50 p-4 text-sm text-rose-800 ring-1 ring-rose-200">
          {error}
        </div>
      )}

      {loading && !error && (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-slate-100" />
          ))}
        </div>
      )}

      {/* An empty table with no message reads as "broken" — say which it is */}
      {!loading && !error && visible.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center">
          <p className="font-medium text-slate-700">
            {rows.length === 0
              ? "No applications yet."
              : filter === "all"
              ? "No applications match."
              : `No ${filter} applications match.`}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {rows.length === 0
              ? "They'll appear here the moment a student submits the form."
              : "Try a different tab or clear the search."}
          </p>
        </div>
      )}

      {!loading && visible.length > 0 && (
        <ul className="space-y-2">
          {visible.map((row) => {
            const open = active?.id === row.id;
            return (
              <li
                key={row.id}
                className="rounded-xl bg-white ring-1 ring-slate-200 transition hover:ring-slate-300"
              >
                <div className="flex flex-wrap items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-semibold text-slate-900">
                        {row.name || "Unnamed applicant"}
                      </p>
                      <StatusBadge status={row.status} />
                    </div>
                    <p className="mt-0.5 truncate text-sm text-slate-500">
                      {row.email}
                      {row.rollNo ? ` · ${row.rollNo}` : ""}
                      {row.roomNo ? ` · Room ${row.roomNo}` : ""}
                    </p>
                  </div>

                  <button
                    onClick={() => setActive(open ? null : row)}
                    className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                  >
                    {open ? "Close" : "Review"}
                  </button>
                </div>

                {open && (
                  /* Keyed so switching rows remounts the panel. Its inputs are
                     seeded from row in useState and never resync, so without
                     this the room and block carry over from the row reviewed
                     before. */
                  <ReviewPanel
                    key={row.id}
                    row={row}
                    busy={busyId === row.id}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onReopen={handleReopen}
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* Expands in place rather than opening a modal: the warden compares the
   application against the room list, and a modal hides the rest of the
   queue while they do it. */
function ReviewPanel({ row, busy, onApprove, onReject, onReopen }) {
  const [roomNo, setRoomNo] = useState(row.roomNo || "");
  const [block, setBlock] = useState(row.hostelBlock || "");
  const [reason, setReason] = useState("");
  const [rejecting, setRejecting] = useState(false);

  const decided = row.status !== ADMISSION_STATUS.PENDING;

  const FIELDS = [
    ["Roll number", row.rollNo],
    ["Phone", row.phone && `+91 ${row.phone}`],
    ["Course", row.course],
    ["Year", row.year],
    ["Blood group", row.bloodGroup],
    ["Guardian", row.guardianName],
    ["Emergency contact", row.guardianPhone && `+91 ${row.guardianPhone}`],
    ["Home address", row.homeAddress],
  ].filter(([, v]) => v);

  return (
    <div className="border-t border-slate-100 p-4">
      <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
        {FIELDS.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs uppercase tracking-wide text-slate-400">{label}</dt>
            <dd className="text-sm text-slate-800">{value}</dd>
          </div>
        ))}
      </dl>

      {row.status === ADMISSION_STATUS.REJECTED && row.rejectionReason && (
        <p className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-800">
          Reason given: {row.rejectionReason}
        </p>
      )}

      {decided ? (
        <div className="mt-5 flex items-center gap-3">
          <p className="text-sm text-slate-500">
            {STATUS_LABEL[row.status]}
            {row.roomNo ? ` · Room ${row.roomNo}` : ""}
          </p>
          <button
            onClick={() => onReopen(row)}
            disabled={busy}
            className="ml-auto text-sm font-medium text-slate-500 underline hover:text-slate-800 disabled:opacity-50"
          >
            {busy ? "Undoing…" : "Undo decision"}
          </button>
        </div>
      ) : rejecting ? (
        <div className="mt-5 space-y-3">
          <label className="block text-sm font-medium text-slate-700">
            Reason (the student sees this)
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              maxLength={200}
              placeholder="No vacancy in the requested block."
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
            />
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => onReject(row, reason)}
              disabled={busy}
              className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
            >
              {busy ? "Saving…" : "Confirm rejection"}
            </button>
            <button
              onClick={() => setRejecting(false)}
              disabled={busy}
              className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-5 flex flex-wrap items-end gap-3">
          <label className="text-sm font-medium text-slate-700">
            Block
            <select
              value={block}
              onChange={(e) => setBlock(e.target.value)}
              disabled={busy}
              className="mt-1 block rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
            >
              <option value="">—</option>
              {BLOCKS.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium text-slate-700">
            Room
            <input
              value={roomNo}
              onChange={(e) => setRoomNo(e.target.value.toUpperCase())}
              placeholder="B-214"
              maxLength={10}
              disabled={busy}
              className="mt-1 block w-28 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
            />
          </label>

          <button
            onClick={() => onApprove(row, roomNo, block)}
            disabled={busy || !roomNo.trim()}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            // Disabled until a room is entered: approving without one leaves
            // the student "Confirmed" with nowhere to sleep.
          >
            {busy ? "Approving…" : "Approve & assign"}
          </button>

          <button
            onClick={() => setRejecting(true)}
            disabled={busy}
            className="rounded-lg px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-50"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
}
