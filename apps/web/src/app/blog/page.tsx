import Link from "next/link";
import Image from "next/image";
import { fetchPublishedBlogs, normalizeAssetUrl } from "@/lib/api";

type BlogItem = {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  coverImage?: string | null;
  publishedAt?: string | null;
};

export default async function BlogPage() {
  const blogs: BlogItem[] = await fetchPublishedBlogs();

  return (
    <main className="min-h-screen pt-24 px-4 md:px-10">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* LEFT STATIC HERO */}
          <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/40 min-h-[640px]">
            <Image
              src="/blog-hero.jpg"
              alt="Blog hero"
              fill
              className="object-cover opacity-95"
              priority
            />
            <div className="absolute inset-0 bg-black/25" />
            <div className="absolute bottom-10 left-10">
              <div className="text-6xl tracking-[0.18em] font-light">BLOG</div>
            </div>
          </div>

          {/* RIGHT LIST PANEL */}
          <div className="rounded-2xl border border-white/10 bg-black/40 min-h-[640px] overflow-hidden">
            <div className="px-10 pt-10 text-center">
              <div className="flex items-center justify-center gap-4 text-white/90">
                <span className="h-px w-10 bg-white/30" />
                <h1 className="text-xl md:text-2xl tracking-[0.22em] font-medium">
                  BEHIND THE SCENES <br /> &amp; LATEST NEWS
                </h1>
                <span className="h-px w-10 bg-white/30" />
              </div>
            </div>

            <div className="px-6 md:px-10 py-10">
              {blogs.length === 0 ? (
                <div className="text-sm text-white/60">No posts yet.</div>
              ) : (
                <div className="space-y-8">
                  {blogs.map((b) => {
                    const img = normalizeAssetUrl(b.coverImage);

                    return (
                      <Link
                        key={b.id}
                        href={`/blog/${encodeURIComponent(b.slug)}`}
                        className="group grid grid-cols-[120px_1fr] gap-6 items-start"
                      >
                        <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5 w-[120px] h-[90px]">
                          {img ? (
                            // Using plain <img> to avoid Next remote image config issues
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={img}
                              alt={b.title}
                              className="w-full h-full object-cover group-hover:scale-[1.02] transition"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full bg-white/5" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="text-[11px] tracking-widest text-white/40 mb-2">
                            {b.publishedAt
                              ? new Date(b.publishedAt).toDateString()
                              : "—"}
                          </div>

                          <div className="text-sm md:text-base tracking-widest text-white/90 uppercase">
                            {b.title}
                          </div>

                          {b.excerpt ? (
                            <div className="text-xs text-white/50 mt-2 line-clamp-2">
                              {b.excerpt}
                            </div>
                          ) : null}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="border-t border-white/10 px-8 py-4 text-xs text-white/50 flex items-center justify-center gap-6">
              <span>By Pavel Gola</span>
              <span>◆</span>
              <span>Licensing</span>
              <span>◆</span>
              <span>Styleguide</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
