import Link from "next/link";

export default function SiteNav() {
  return (
    <div className="fixed top-6 left-6 z-50">
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

          <Link href="/contact" className="hover:text-white/90 transition">
            CONTACT
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