"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const nav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/reservations", label: "Reservations" },
  { href: "/admin/opening-hours", label: "Opening Hours" },
  { href: "/admin/menu", label: "Menu" },
  { href: "/admin/blogs", label: "Blogs" },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  function logout() {
    localStorage.removeItem("admin_token");
    router.replace("/admin/login");
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
          {/* Sidebar */}
          <aside className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 h-fit sticky top-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xs text-neutral-400">Qitchen</div>
                <div className="text-lg font-semibold tracking-wide">Admin</div>
              </div>
              <span className="text-[10px] px-2 py-1 rounded-full border border-neutral-700 text-neutral-300">
                Secure
              </span>
            </div>

            <nav className="space-y-1">
              {nav.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      "block rounded-xl px-3 py-2 text-sm transition",
                      active
                        ? "bg-white text-black font-semibold"
                        : "text-neutral-200 hover:bg-neutral-800/60",
                    ].join(" ")}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-6 pt-4 border-t border-neutral-800">
              <button
                onClick={logout}
                className="w-full rounded-xl border border-neutral-700 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-800/60 transition"
              >
                Logout
              </button>
            </div>
          </aside>

          {/* Main */}
          <section className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-6">
            {children}
          </section>
        </div>
      </div>
    </div>
  );
}
