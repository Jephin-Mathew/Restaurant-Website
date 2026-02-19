"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { adminCreateBlog } from "@/lib/api";
import { getToken } from "@/lib/auth";

export default function AdminBlogNewPage() {
  const router = useRouter();
  const token = getToken();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) router.push("/admin/login");
  }, [token, router]);

  async function submit() {
    try {
      setSaving(true);
      setError(null);

      const fd = new FormData();
      fd.append("title", title);
      if (slug.trim()) fd.append("slug", slug.trim());
      if (excerpt.trim()) fd.append("excerpt", excerpt.trim());
      fd.append("content", content);
      fd.append("status", status);
      if (coverFile) fd.append("cover", coverFile); 

      const created = await adminCreateBlog(token || "", fd);
      router.push(`/admin/blogs/${created.id}`);
    } catch (e: any) {
      setError(e?.message || "Failed to create blog");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">New Blog Post</h1>
        <p className="text-sm text-neutral-400 mt-1">Create a new post.</p>
      </div>

      {error && (
        <div className="text-sm text-red-200 bg-red-950/40 border border-red-900 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      <div className="grid gap-4 max-w-3xl">
        <input
          className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3"
          placeholder="Slug (optional)"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        />

        <div className="space-y-2">
          <div className="text-sm text-neutral-300">Cover Image (upload)</div>
          <input
            type="file"
            accept="image/*"
            className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3"
            onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
          />
          {coverFile ? (
            <div className="text-xs text-neutral-400">Selected: {coverFile.name}</div>
          ) : null}
        </div>

        <textarea
          className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 min-h-[80px]"
          placeholder="Excerpt (optional)"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
        />

        <textarea
          className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 min-h-[260px]"
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <div className="flex items-center gap-3">
          <select
            className="rounded-xl bg-black/40 border border-white/10 px-4 py-3"
            value={status}
            onChange={(e) => setStatus(e.target.value as "DRAFT" | "PUBLISHED")}
          >
            <option value="DRAFT">DRAFT</option>
            <option value="PUBLISHED">PUBLISHED</option>
          </select>

          <button
            onClick={submit}
            disabled={saving || !title.trim() || !content.trim()}
            className="rounded-xl bg-[#e8dcc2] text-black px-6 py-3 font-semibold disabled:opacity-60"
          >
            {saving ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
