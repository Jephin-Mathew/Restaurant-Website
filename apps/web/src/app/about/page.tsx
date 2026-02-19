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

function TopNav() {
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
            href="/reservations"
            className="inline-flex items-center justify-center rounded-xl border border-white/14 bg-black/25 px-4 py-2 hover:bg-black/35 transition text-white/80"
          >
            BOOK A TABLE
          </Link>
        </nav>
      </div>
    </div>
  );
}

function AwardCard({ title }: { title: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/35 px-6 py-6 text-center">
      <div className="text-white/70 text-[10px] tracking-[0.35em] mb-3">★★★★★</div>
      <div className="text-white/80 text-[13px] tracking-[0.22em]">{title}</div>
      <div className="text-white/35 text-[10px] tracking-[0.18em] mt-2">
        BEST STEAK HOUSE <br /> PRAGUE
      </div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black">
      <div className="mx-auto max-w-[1400px] px-4 md:px-10 pt-10 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_760px] gap-6 items-stretch">
        
          <section className="relative rounded-[28px] overflow-hidden border border-white/10 bg-black/40 min-h-[520px] lg:min-h-[720px]">
            <Image
              src="/about/hero.jpg"
              alt="About hero"
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/20" />
            {/* <TopNav /> */}

            <div className="absolute left-10 bottom-14 z-20">
              <div className="text-[#e8dcc2] text-6xl md:text-7xl tracking-[0.10em] font-light">
                ABOUT
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-black/35 p-4 md:p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
              <div className="rounded-3xl border border-white/10 bg-black/35 p-7 min-h-[220px] flex flex-col justify-between">
                <div>
                  <div className="text-white/85 text-2xl md:text-3xl tracking-[0.08em] font-light">
                    SUSHI ARTISTRY <br /> REDEFINED
                  </div>
                  <p className="mt-6 text-white/45 text-sm leading-relaxed max-w-[360px]">
                    Where culinary craftsmanship meets modern elegance. Indulge in the finest
                    sushi, expertly curated to elevate your dining experience.
                  </p>
                </div>
              </div>

    
              <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-black/35 min-h-[220px]">
                <Image
                  src="/about/top-right.jpg"
                  alt="Restaurant interior"
                  fill
                  className="object-cover opacity-95"
                />
                <div className="absolute inset-0 bg-black/10" />
              </div>

              {/* Awards row */}
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                <AwardCard title="TRIP ADVISOR" />
                <AwardCard title="MICHELIN GUIDE" />
                <AwardCard title="STAR DINING" />
              </div>

              {/* Bottom-left image */}
              <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-black/35 min-h-[260px]">
                <Image
                  src="/about/bottom-left.jpg"
                  alt="Chefs cooking"
                  fill
                  className="object-cover opacity-95"
                />
                <div className="absolute inset-0 bg-black/10" />
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/35 p-7 min-h-[260px] flex flex-col justify-between">
                <div>
                  <div className="text-center text-white/60 text-[12px] tracking-[0.28em] mb-6">
                    —&nbsp;&nbsp;OUR STORY&nbsp;&nbsp;—
                  </div>

                  <p className="text-white/45 text-sm leading-relaxed">
                    Founded with a passion for culinary excellence, Qitchen&apos;s journey began in the
                    heart of Prague. Over years, it evolved into a haven for sushi enthusiasts,
                    celebrated for its artful mastery and devotion to redefining gastronomy.
                  </p>
                </div>
              </div>

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
