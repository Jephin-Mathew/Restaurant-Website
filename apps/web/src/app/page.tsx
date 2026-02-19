import Image from "next/image";
import Link from "next/link";

function ArrowCircle() {
  return (
    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-black/45 border border-white/15">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M9 18L15 12L9 6"
          stroke="rgba(255,255,255,0.85)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function HomeNav() {
  return (
    <div className="absolute top-6 left-6 z-20">
      <div className="flex items-center gap-4 rounded-2xl border border-white/12 bg-black/40 backdrop-blur px-4 py-2">
        <button
          className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-black/40 border border-white/10"
          aria-label="Open menu"
          type="button"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M4 7H20M4 12H20M4 17H20"
              stroke="rgba(255,255,255,0.85)"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <Link href="/" className="text-white/90 tracking-wide font-semibold">
          QITCHEN
        </Link>

        <nav className="hidden sm:flex items-center gap-5 text-[12px] tracking-[0.18em] text-white/70">
          <Link href="/menu" className="hover:text-white/90 transition">
            MENU
          </Link>
          <Link href="/about" className="hover:text-white/90 transition">
            ABOUT
          </Link>
          <Link
            href="/reservation"
            className="inline-flex items-center justify-center rounded-xl border border-white/14 bg-black/25 px-4 py-2 hover:bg-black/35 transition text-white/80"
          >
            BOOK A TABLE
          </Link>
        </nav>
      </div>
    </div>
  );
}

function SocialDots() {
  return (
    <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2">
      {["ig", "fb", "x"].map((k) => (
        <span
          key={k}
          className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-black/35 border border-white/12"
        >
          <span className="w-3 h-3 rounded-full bg-white/60" />
        </span>
      ))}
    </div>
  );
}

function RightCard({
  href,
  imgSrc,
  label,
}: {
  href: string;
  imgSrc: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="group relative rounded-3xl overflow-hidden border border-white/10 bg-black/35 h-[210px] md:h-[240px]"
    >
      <Image
        src={imgSrc}
        alt={label}
        fill
        className="object-cover opacity-90 group-hover:scale-[1.02] transition-transform duration-300"
        priority={false}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/10" />

      <div className="absolute bottom-5 right-5 flex items-center gap-3">
        <div className="text-[11px] tracking-[0.22em] text-white/80">{label}</div>
        <ArrowCircle />
      </div>
    </Link>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black">
      <div className="mx-auto max-w-[1400px] px-4 md:px-10 pt-10 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-stretch">
          {/* LEFT HERO */}
          <section className="relative rounded-[28px] overflow-hidden border border-white/10 bg-black/40 min-h-[520px] lg:min-h-[720px]">
            <Image
              src="/home/hero.jpg"
              alt="Home hero"
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/10" />

            {/* <HomeNav /> */}

            <div className="absolute left-8 bottom-16 z-20">
              <div className="text-[#e8dcc2] text-6xl md:text-7xl leading-[0.95] tracking-[0.06em] font-light">
                SUSHI
                <br />
                SENSATION
              </div>
            </div>

            <SocialDots />
          </section>

          {/* RIGHT STACK */}
          <aside className="relative rounded-[28px] overflow-hidden border border-white/10 bg-black/35 p-4 md:p-5">
            <div className="grid gap-4">
              <RightCard href="/menu" imgSrc="/home/card-menu.jpg" label="MENU" />
              <RightCard
                href="/reservation"
                imgSrc="/home/card-reservation.jpg"
                label="RESERVATION"
              />
              <RightCard
                href="/about"
                imgSrc="/home/card-restaurant.jpg"
                label="OUR RESTAURANT"
              />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
