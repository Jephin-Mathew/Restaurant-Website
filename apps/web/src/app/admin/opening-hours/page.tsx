"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchOpeningHours, adminUpdateOpeningHours } from "@/lib/api";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function Input({
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { className?: string }) {
  return (
    <input
      {...props}
      className={[
        "w-full bg-black border border-neutral-700 rounded-lg px-3 py-2",
        "focus:outline-none focus:border-white",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className,
      ].join(" ")}
    />
  );
}

export default function AdminOpeningHoursPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);

  const [hours, setHours] = useState<any[]>([]);
  const [config, setConfig] = useState<any>({
    capacityPerSlot: 30,
    slotDurationMinutes: 60,
    maxPartySize: 10,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string>("");

  useEffect(() => {
    const t = localStorage.getItem("admin_token");
    if (!t) {
      router.replace("/admin/login");
      return;
    }
    setToken(t);

    fetchOpeningHours()
      .then((data) => {
        setHours(data.hours || []);
        setConfig(
          data.config || { capacityPerSlot: 30, slotDurationMinutes: 60, maxPartySize: 10 }
        );
      })
      .catch((e) => setMsg(e?.message || "Failed to load"))
      .finally(() => setLoading(false));
  }, [router]);

  const canSave = useMemo(() => hours.length === 7, [hours]);

  function updateHour(idx: number, patch: any) {
    setHours((prev) => prev.map((h, i) => (i === idx ? { ...h, ...patch } : h)));
  }

  async function onSave() {
    if (!token) return;
    setMsg("");
    try {
      setSaving(true);
      await adminUpdateOpeningHours(token, { hours, config });
      setMsg("Saved ✅");
    } catch (e: any) {
      setMsg(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="px-6 py-10">Loading...</div>;

  return (
    <div className="space-y-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Opening Hours</h1>
          <p className="text-sm text-neutral-400 mt-2">
            Configure weekly hours and reservation slot rules.
          </p>
        </div>

        <button
          onClick={onSave}
          disabled={!canSave || saving}
          className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {msg && (
        <div className="text-sm text-neutral-200 bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3">
          {msg}
        </div>
      )}

      {/* Reservation Config */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-5">
        <h2 className="text-xl font-semibold">Reservation Config</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="text-sm text-neutral-400">Capacity / Slot</div>
            <Input
              value={config.capacityPerSlot ?? 30}
              onChange={(e) =>
                setConfig({ ...config, capacityPerSlot: Number((e.target as HTMLInputElement).value) })
              }
              type="number"
              min={1}
            />
          </div>

          <div className="space-y-2">
            <div className="text-sm text-neutral-400">Slot Duration (min)</div>
            <Input
              value={config.slotDurationMinutes ?? 60}
              onChange={(e) =>
                setConfig({
                  ...config,
                  slotDurationMinutes: Number((e.target as HTMLInputElement).value),
                })
              }
              type="number"
              min={15}
              step={15}
            />
          </div>

          <div className="space-y-2">
            <div className="text-sm text-neutral-400">Max Party Size</div>
            <Input
              value={config.maxPartySize ?? 10}
              onChange={(e) =>
                setConfig({ ...config, maxPartySize: Number((e.target as HTMLInputElement).value) })
              }
              type="number"
              min={1}
            />
          </div>
        </div>
      </div>

      {/* Weekly Hours */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Weekly Hours</h2>
          {!canSave && <div className="text-sm text-red-400">Expected 7 days of data.</div>}
        </div>

        <div className="space-y-3">
          {hours.map((h, idx) => (
            <div
              key={h.id ?? idx}
              className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 border-t border-neutral-800 pt-4"
            >
              <div className="w-full sm:w-32 font-medium">{DAYS[h.dayOfWeek]}</div>

              <label className="flex items-center gap-2 text-sm text-neutral-200">
                <input
                  type="checkbox"
                  checked={!!h.isClosed}
                  onChange={(e) => updateHour(idx, { isClosed: e.target.checked })}
                  className="h-4 w-4 accent-white"
                />
                Closed
              </label>

              <div className="flex items-center gap-3">
                <Input
                  className="w-36"
                  type="time"
                  disabled={!!h.isClosed}
                  value={h.openTime || "10:00"}
                  onChange={(e) => updateHour(idx, { openTime: (e.target as HTMLInputElement).value })}
                />

                <span className="text-neutral-500">to</span>

                <Input
                  className="w-36"
                  type="time"
                  disabled={!!h.isClosed}
                  value={h.closeTime || "22:00"}
                  onChange={(e) =>
                    updateHour(idx, { closeTime: (e.target as HTMLInputElement).value })
                  }
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end pt-2">
          <button
            onClick={onSave}
            disabled={!canSave || saving}
            className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
