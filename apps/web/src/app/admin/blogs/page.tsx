"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { adminFetchBlogs, adminDeleteBlog } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { useRouter } from "next/navigation";

type BlogRow = {
  id: number;
  title: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED";
  updatedAt: string;
  publishedAt?: string | null;
};

export default function AdminBlogsPage() {
  const [rows, setRows] = useState<BlogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const token = useMemo(() => getToken(), []);
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.push("/admin/login");
      return;
    }

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await adminFetchBlogs(token);
        setRows(data);
      } catch (e: any) {
        setError(e?.message || "Failed to load blogs");
      } finally {
        setLoading(false);
      }
    })();
  }, [token, router]);

  async function onDelete(id: number) {
    if (!confirm("Delete this blog?")) return;

    try {
      setBusyId(id);
      setError(null);
      await adminDeleteBlog(token || "", id);
      setRows((prev) => prev.filter((b) => b.id !== id));
    } catch (e: any) {
      setError(e?.message || "Delete failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Blogs</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Create, publish, and manage blog posts.
          </p>
        </div>

        <Link
          href="/admin/blogs/new"
          className="rounded-xl bg-white text-black px-5 py-3 font-semibold hover:opacity-90 transition"
        >
          + New Post
        </Link>
      </div>

      {error && (
        <div className="text-sm text-red-200 bg-red-950/40 border border-red-900 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-sm text-neutral-300">Loading posts...</div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-6 text-neutral-300">
          No blog posts yet. Create your first post.
        </div>
      ) : (
        <div className="overflow-auto rounded-2xl border border-neutral-800 bg-neutral-900/20">
          <table className="min-w-full text-sm">
            <thead className="bg-neutral-900/60 text-neutral-200">
              <tr>
                <th className="text-left px-4 py-3">Title</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Updated</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="text-neutral-200">
              {rows.map((b) => (
                <tr key={b.id} className="border-t border-neutral-800">
                  <td className="px-4 py-3">
                    <div className="font-medium">{b.title}</div>
                    <div className="text-xs text-neutral-400">{b.slug}</div>
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs border ${
                        b.status === "PUBLISHED"
                          ? "border-emerald-700 text-emerald-200 bg-emerald-950/30"
                          : "border-neutral-700 text-neutral-200 bg-neutral-950/30"
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-neutral-300">
                    {new Date(b.updatedAt).toLocaleString()}
                  </td>

                  <td className="px-4 py-3 text-right space-x-3">
                    <Link
                      href={`/admin/blogs/${b.id}`}
                      className="underline underline-offset-4"
                    >
                      Edit
                    </Link>

                    <button
                      onClick={() => onDelete(b.id)}
                      disabled={busyId === b.id}
                      className="underline underline-offset-4 opacity-90 hover:opacity-100 disabled:opacity-40"
                    >
                      {busyId === b.id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
