import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/admin" className="tracking-widest font-semibold">
            ADMIN
          </Link>

          <nav className="flex items-center gap-6 text-sm text-neutral-200">
            <Link href="/admin/menu" className="hover:text-white">
              Menu
            </Link>
            <Link href="/admin/blogs" className="hover:text-white">
              Blog
            </Link>
            <Link href="/admin/reservations" className="hover:text-white">
              Reservations
            </Link>
            <Link href="/admin/opening-hours" className="hover:text-white">
              Opening Hours
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">{children}</main>
    </div>
  );
}
