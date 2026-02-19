// /Users/jephin/Node js/restaurant/apps/web/src/app/reservation/page.tsx
"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { createReservation, fetchSlots } from "@/lib/api";

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={[
        "w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3",
        "outline-none focus:border-white/40 placeholder:text-white/35",
        props.className || "",
      ].join(" ")}
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={[
        "w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3",
        "outline-none focus:border-white/40 text-white",
        props.className || "",
      ].join(" ")}
    />
  );
}

export default function ReservationPage() {
  const [date, setDate] = useState(todayISO());
  const [slots, setSlots] = useState<any[]>([]);
  const [time, setTime] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [guests, setGuests] = useState(2);

  const [msg, setMsg] = useState<string | null>(null);
  const [msgType, setMsgType] = useState<"success" | "error" | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function loadSlots(d: string) {
    setLoadingSlots(true);
    try {
      const data = await fetchSlots(d);
      setSlots(data.slots || []);
      setTime("");
    } catch (e: any) {
      setSlots([]);
      setMsg(e?.message || "Failed to load time slots");
      setMsgType("error");
    } finally {
      setLoadingSlots(false);
    }
  }

  useEffect(() => {
    // clear message when changing date
    setMsg(null);
    setMsgType(null);
    loadSlots(date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  async function submit() {
    setMsg(null);
    setMsgType(null);

    try {
      setSubmitting(true);

      const res = await createReservation({
        name,
        phone,
        email,
        guests,
        date,
        time,
      });

      // ✅ success message (green)
      setMsg(res?.message || "Reservation confirmed");
      setMsgType("success");

      // ✅ reset form after success (keep date)
      setName("");
      setPhone("");
      setEmail("");
      setGuests(2);
      setTime("");

      // ✅ reload slots to reflect new availability
      await loadSlots(date);
    } catch (e: any) {
      setMsg(e?.message || "Reservation failed");
      setMsgType("error");
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit = !!name && !!phone && !!guests && !!date && !!time && !submitting;

  return (
    <main className="min-h-screen pt-24 px-4 md:px-10">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* LEFT STATIC HERO */}
          <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/40 min-h-[520px]">
            <Image
              src="/Reservation_hero_image.jpg"
              alt="Book a table"
              fill
              className="object-cover opacity-95"
              priority
            />
            <div className="absolute inset-0 bg-black/25" />
            <div className="absolute bottom-10 left-10">
              <div className="text-5xl md:text-6xl tracking-[0.18em] font-light leading-tight">
                BOOK
                <br />
                A TABLE
              </div>
            </div>
          </div>

          {/* RIGHT FORM PANEL */}
          <div className="rounded-2xl border border-white/10 bg-black/40 min-h-[520px] overflow-hidden">
            {/* Title block */}
            <div className="px-10 pt-10 text-center">
              <div className="flex items-center justify-center gap-4 text-white/90">
                <span className="h-px w-10 bg-white/30" />
                <h1 className="text-2xl md:text-3xl tracking-[0.30em] font-medium">
                  RESERVATION
                </h1>
                <span className="h-px w-10 bg-white/30" />
              </div>

              <p className="mt-3 text-sm text-white/60 max-w-md mx-auto">
                Secure your spot at Qitchen, where exceptional sushi and a remarkable dining experience await.
              </p>
            </div>

            {/* Form */}
            <div className="px-8 md:px-12 py-10">
              <div className="max-w-xl mx-auto space-y-4">
                <Input
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />

                <Input
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                />

                <Input
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input
                    type="number"
                    min={1}
                    placeholder="Guests"
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                  />

                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />

                  <Select value={time} onChange={(e) => setTime(e.target.value)}>
                    <option value="">
                      {loadingSlots ? "Loading..." : "Time"}
                    </option>
                    {slots.map((s) => (
                      <option key={s.start} value={s.start} disabled={!s.isAvailable}>
                        {s.start} - {s.end} ({s.availableSeats} seats)
                      </option>
                    ))}
                  </Select>
                </div>

                <button
                  onClick={submit}
                  disabled={!canSubmit}
                  className={[
                    "w-full mt-2 rounded-xl py-3 font-medium tracking-widest",
                    "bg-[#e8dcc2] text-black hover:opacity-95 transition",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                  ].join(" ")}
                >
                  {submitting ? "RESERVING..." : "RESERVE"}
                </button>

                {msg ? (
                  <div
                    className={[
                      "text-sm pt-2 text-center font-medium",
                      msgType === "success" ? "text-emerald-400" : "",
                      msgType === "error" ? "text-red-300" : "text-white/70",
                    ].join(" ")}
                  >
                    {msg}
                  </div>
                ) : null}
              </div>
            </div>

            {/* Footer bar */}
            <div className="border-t border-white/10 px-8 py-4 text-xs text-white/50 flex items-center justify-center gap-6">
              <span>By Pavel Gola</span>
              <span>◆</span>
              <span>Licensing</span>
              <span>◆</span>
              <span>Styleguide</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
