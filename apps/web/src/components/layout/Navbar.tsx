import Link from "next/link";

const nav = [
  { href: "/menu", label: "MENU" },
  { href: "/about", label: "ABOUT" },
  { href: "/blog", label: "BLOG" },
];

export default function Navbar() {
  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
        <button
          className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-black/30"
          aria-label="Open menu"
        >
          ☰
        </button>

        <Link href="/" className="text-xl tracking-wide">
          QITCHEN
        </Link>

        <nav className="ml-6 hidden items-center gap-6 text-sm text-white/70 md:flex">
          {nav.map((i) => (
            <Link key={i.href} href={i.href} className="hover:text-white">
              {i.label}
            </Link>
          ))}
        </nav>
      </div>

      <Link
        href="/reservation"
        className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white/80 backdrop-blur hover:text-white"
      >
        BOOK A TABLE
      </Link>
    </header>
  );
}
