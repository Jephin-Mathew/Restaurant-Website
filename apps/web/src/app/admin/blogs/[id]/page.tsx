"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { adminFetchBlogById, adminUpdateBlog, normalizeAssetUrl } from "@/lib/api";
import { getToken } from "@/lib/auth";

export default function AdminBlogEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const token = getToken();

  const id = Number(params.id);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");

  const [coverImage, setCoverImage] = useState<string>(""); 
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [removeCover, setRemoveCover] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) {
      router.push("/admin/login");
      return;
    }
    if (!Number.isFinite(id)) return;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const b = await adminFetchBlogById(token || "", id);

        setTitle(b.title || "");
        setSlug(b.slug || "");
        setExcerpt(b.excerpt || "");
        setContent(b.content || "");
        setStatus(b.status || "DRAFT");
        setCoverImage(b.coverImage || "");
      } catch (e: any) {
        setError(e?.message || "Failed to load blog");
      } finally {
        setLoading(false);
      }
    })();
  }, [token, id, router]);

  async function save() {
    try {
      setSaving(true);
      setError(null);

      const fd = new FormData();
      fd.append("title", title);
      if (slug.trim()) fd.append("slug", slug.trim());
      fd.append("excerpt", excerpt);
      fd.append("content", content);
      fd.append("status", status);

      if (coverFile) fd.append("cover", coverFile);
      if (removeCover) fd.append("removeCover", "true");

      const updated = await adminUpdateBlog(token || "", id, fd);

      // keep UI consistent
      setCoverImage(updated.coverImage || "");
      setCoverFile(null);
      setRemoveCover(false);

      router.push("/admin/blogs");
    } catch (e: any) {
      setError(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (!Number.isFinite(id)) return <div className="text-sm text-red-200">Invalid blog id.</div>;
  if (loading) return <div className="text-sm text-neutral-300">Loading...</div>;

  const coverPreview = coverFile
    ? URL.createObjectURL(coverFile)
    : normalizeAssetUrl(coverImage);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Edit Blog Post</h1>
        <p className="text-sm text-neutral-400 mt-1">Update and publish.</p>
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
          placeholder="Slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        />

        <div className="space-y-2">
          <div className="text-sm text-neutral-300">Cover Image</div>

          {coverPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverPreview}
              alt="Cover preview"
              className="w-full max-w-xl rounded-xl border border-white/10 object-cover"
            />
          ) : (
            <div className="text-xs text-neutral-500">No cover image</div>
          )}

          <input
            type="file"
            accept="image/*"
            className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3"
            onChange={(e) => {
              setCoverFile(e.target.files?.[0] || null);
              setRemoveCover(false);
            }}
          />

          <label className="flex items-center gap-2 text-sm text-neutral-300">
            <input
              type="checkbox"
              checked={removeCover}
              onChange={(e) => {
                setRemoveCover(e.target.checked);
                if (e.target.checked) setCoverFile(null);
              }}
            />
            Remove cover image
          </label>
        </div>

        <textarea
          className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 min-h-[80px]"
          placeholder="Excerpt"
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
            onClick={save}
            disabled={saving}
            className="rounded-xl bg-[#e8dcc2] text-black px-6 py-3 font-semibold disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
