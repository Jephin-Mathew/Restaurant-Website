"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetchReservations } from "@/lib/api";

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-neutral-700 bg-neutral-900 px-2.5 py-1 text-xs text-neutral-200">
      {children}
    </span>
  );
}

export default function AdminReservationsPage() {
  const router = useRouter();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.replace("/admin/login");
      return;
    }

    adminFetchReservations(token)
      .then(setRows)
      .catch((e) => setError(e?.message || "Failed"))
      .finally(() => setLoading(false));
  }, [router]);

  const stats = useMemo(() => {
    const total = rows.length;
    const confirmed = rows.filter((r) => r.status === "CONFIRMED").length;
    return { total, confirmed };
  }, [rows]);

  if (loading) return <div className="text-sm text-neutral-300">Loading reservations...</div>;
  if (error) return <div className="text-sm text-red-300">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Reservations</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Latest bookings submitted from the website.
          </p>
        </div>

        <div className="flex gap-2">
          <Badge>Total: {stats.total}</Badge>
          <Badge>Confirmed: {stats.confirmed}</Badge>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-6 text-sm text-neutral-300">
          No reservations yet.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/20">
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-neutral-900/60 text-neutral-200">
                <tr className="border-b border-neutral-800">
                  <th className="text-left px-4 py-3 font-medium">Name</th>
                  <th className="text-left px-4 py-3 font-medium">Phone</th>
                  <th className="text-left px-4 py-3 font-medium">Date</th>
                  <th className="text-left px-4 py-3 font-medium">Slot</th>
                  <th className="text-left px-4 py-3 font-medium">Guests</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-neutral-900/40 transition">
                    <td className="px-4 py-3">{r.name}</td>
                    <td className="px-4 py-3 text-neutral-300">{r.phone}</td>
                    <td className="px-4 py-3 text-neutral-300">
                      {new Date(r.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-neutral-200">
                        {r.slotStart} – {r.slotEnd}
                      </span>
                    </td>
                    <td className="px-4 py-3">{r.partySize}</td>
                    <td className="px-4 py-3">
                      <span
                        className={[
                          "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border",
                          r.status === "CONFIRMED"
                            ? "bg-emerald-950/40 border-emerald-900 text-emerald-200"
                            : "bg-neutral-900 border-neutral-700 text-neutral-200",
                        ].join(" ")}
                      >
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
