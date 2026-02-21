import Image from "next/image";
import Link from "next/link";
import { fetchOpeningHours } from "@/lib/api";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function TopNav() {
  return (
    <div className="absolute top-6 left-6 z-20">
      <div className="flex items-center gap-4 rounded-2xl border border-white/12 bg-black/40 backdrop-blur px-4 py-2">
        <Link href="/" className="text-white font-semibold tracking-wide">
          QITCHEN
        </Link>

        <nav className="hidden sm:flex items-center gap-5 text-[12px] tracking-[0.18em] text-white/70">
          <Link href="/menu" className="hover:text-white transition">
            MENU
          </Link>
          <Link href="/about" className="hover:text-white transition">
            ABOUT
          </Link>
          <Link
            href="/reservations"
            className="px-4 py-2 rounded-xl border border-white/15 bg-black/25 hover:bg-black/40 transition"
          >
            BOOK A TABLE
          </Link>
        </nav>
      </div>
    </div>
  );
}

export default async function ContactPage() {
  const data = await fetchOpeningHours();
  const hours = data.hours || [];

  return (
    <main className="min-h-screen bg-black">
      <div className="mx-auto max-w-[1400px] px-4 md:px-10 pt-10 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_760px] gap-6">

          {/* ================= LEFT HERO ================= */}
          <section className="relative rounded-[28px] overflow-hidden border border-white/10 min-h-[720px]">
            <Image
              src="/contact/hero.jpg"
              alt="Contact hero"
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/20" />
            {/* <TopNav /> */}

            <div className="absolute left-10 bottom-14 text-[#e8dcc2] text-6xl tracking-[0.1em] font-light">
              CONTACT
            </div>
          </section>

          {/* ================= RIGHT GRID ================= */}
          <section className="rounded-[28px] border border-white/10 bg-black/35 p-4 md:p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Opening Hours */}
              <div className="rounded-3xl border border-white/10 bg-black/35 p-7 md:col-span-2">
                <div className="text-center text-white/70 tracking-[0.25em] text-sm mb-6">
                  — OPENING HOURS —
                </div>

                <div className="space-y-3 text-sm text-white/60">
                  {hours.map((h: any) => (
                    <div
                      key={h.dayOfWeek}
                      className="flex justify-between border-b border-white/5 pb-2"
                    >
                      <span>{DAYS[h.dayOfWeek]}</span>
                      <span>
                        {h.isClosed
                          ? "Closed"
                          : `${h.openTime} - ${h.closeTime}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Image Gallery */}
              <div className="grid grid-cols-2 gap-4 md:col-span-2">
                <div className="relative h-[140px] rounded-2xl overflow-hidden border border-white/10">
                  <Image src="/contact/img1.jpg" fill alt="" className="object-cover" />
                </div>
                <div className="relative h-[140px] rounded-2xl overflow-hidden border border-white/10">
                  <Image src="/contact/img2.jpg" fill alt="" className="object-cover" />
                </div>
                <div className="relative h-[140px] rounded-2xl overflow-hidden border border-white/10">
                  <Image src="/contact/img3.jpg" fill alt="" className="object-cover" />
                </div>
                <div className="relative h-[140px] rounded-2xl overflow-hidden border border-white/10">
                  <Image src="/contact/img4.jpg" fill alt="" className="object-cover" />
                </div>
              </div>

              {/* Map */}
              <div className="rounded-3xl overflow-hidden border border-white/10 md:col-span-2">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3925.938500992902!2d76.35497957543245!3d10.266539089852918!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba7ef6fe83cb609%3A0xa2b72269240d53cf!2sWoxro!5e0!3m2!1sen!2sin!4v1771506094378!5m2!1sen!2sin"
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  loading="lazy"
                ></iframe>
              </div>

              {/* Contact Details */}
              <div className="rounded-3xl border border-white/10 bg-black/35 p-7 md:col-span-2">
                <div className="text-center text-white/70 tracking-[0.25em] text-sm mb-6">
                  — GET IN TOUCH —
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-white/60 text-sm">
                  <div>
                    <div className="mb-4">
                      <div className="text-white/40 mb-1">ADDRESS</div>
                      23 Greenfield Avenue<br />
                      Prague 120 00
                    </div>

                    <div className="mb-4">
                      <div className="text-white/40 mb-1">PHONE</div>
                      +49 1234 567890
                    </div>

                    <div>
                      <div className="text-white/40 mb-1">EMAIL</div>
                      email@example.com
                    </div>
                  </div>

                  <div className="flex items-end gap-4 text-white/40">
                    <span>Instagram</span>
                    <span>Facebook</span>
                    <span>Twitter</span>
                  </div>
                </div>
              </div>

              {/* Footer strip */}
              <div className="md:col-span-2 rounded-3xl border border-white/10 bg-black/35 px-8 py-4 text-xs text-white/45 flex items-center justify-center gap-6">
                <span>By Pavel Gola</span>
                <span>◆</span>
                <span>Licensing</span>
                <span>◆</span>
                <span>Styleguide</span>
              </div>

            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
