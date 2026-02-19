"use client";
import Link from "next/link";
import { clearToken } from "../lib/auth";
import { useRouter } from "next/navigation";

export default function AdminNav() {
  const router = useRouter();

  return (
    <div className="flex items-center gap-4 p-4 border-b border-white/10 bg-black/40">
      <Link href="/admin" className="font-semibold">Admin</Link>
      <Link href="/admin/menu" className="opacity-80 hover:opacity-100">Menu</Link>
      <Link href="/admin/opening-hours" className="opacity-80 hover:opacity-100">Opening Hours</Link>
      <Link href="/admin/blogs" className="opacity-80 hover:opacity-100">Blogs</Link>
      <Link href="/admin/reservations" className="opacity-80 hover:opacity-100">Reservations</Link>

      <button
        className="ml-auto text-sm opacity-80 hover:opacity-100"
        onClick={() => {
          clearToken();
          router.push("/admin/login");
        }}
      >
        Logout
      </button>
    </div>
  );
}
