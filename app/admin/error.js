// app/admin/error.js
"use client";

export default function AdminError({ error, reset }) {
  return (
    <div className="p-8">
      <h2 className="text-lg font-semibold">Couldn't load this page.</h2>
      <p className="mt-1 text-sm text-slate-600">
        {error?.code === "permission-denied"
          ? "Your account doesn't have access to this data."
          : "Something went wrong."}
      </p>
      <button onClick={reset} className="mt-4 underline">Try again</button>
    </div>
  );
}
