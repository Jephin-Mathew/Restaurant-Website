"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { adminLogin } from "../../../lib/api";
import { setToken } from "../../../lib/auth";

function setAdminCookie(token: string) {
  const maxAge = 60 * 60 * 24 * 7; // 7 days
  document.cookie = `admin_token=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; samesite=lax`;
}

export default function LoginClient() {
  const [email, setEmail] = useState("admin@restaurant.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/admin";

  async function submit() {
    setError(null);
    setLoading(true);
    try {
      const data = await adminLogin({ email, password });

      setToken(data.token);
      setAdminCookie(data.token);

      router.replace(nextPath);
    } catch (e: any) {
      setError(e?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4"
      >
        <h1 className="text-2xl tracking-widest">ADMIN LOGIN</h1>

        <input
          className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          autoComplete="email"
        />

        <input
          className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoComplete="current-password"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[#e8dcc2] text-black py-3 font-medium disabled:opacity-60"
        >
          {loading ? "LOGGING IN..." : "LOGIN"}
        </button>

        {error && <div className="text-sm opacity-80">{error}</div>}
      </form>
    </main>
  );
}