import Image from "next/image";
import { notFound } from "next/navigation";
import { fetchPublishedBlogBySlug, normalizeAssetUrl } from "@/lib/api";

type Params = { slug: string };

export default async function BlogPostPage({
  params,
}: {
  params: Params | Promise<Params>;
}) {
  const { slug } = await Promise.resolve(params);

  const post = await fetchPublishedBlogBySlug(slug);
  if (!post) return notFound();

  const img = normalizeAssetUrl(post.coverImage);

  return (
    <main className="min-h-screen pt-24 px-4 md:px-10">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* LEFT IMAGE */}
          <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/40 min-h-[720px]">
            {img ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={img}
                alt={post.title}
                className="w-full h-full object-cover opacity-95"
              />
            ) : (
              <Image
                src="/blog-hero.jpg"
                alt="Blog"
                fill
                className="object-cover opacity-80"
                priority
              />
            )}
            <div className="absolute inset-0 bg-black/20" />
          </div>

          {/* RIGHT CONTENT */}
          <div className="rounded-2xl border border-white/10 bg-black/40 min-h-[720px] overflow-hidden">
            <div className="px-10 pt-12">
              <div className="text-[11px] tracking-widest text-white/40 text-center">
                {post.publishedAt
                  ? new Date(post.publishedAt).toDateString()
                  : "—"}
              </div>

              <h1 className="mt-6 text-3xl md:text-4xl tracking-[0.08em] text-white/90 text-center">
                {post.title}
              </h1>

              {post.excerpt ? (
                <div className="mt-10 text-sm tracking-widest text-white/60 uppercase">
                  {post.excerpt}
                </div>
              ) : null}
            </div>

            <div className="px-10 py-10 text-white/55 text-sm leading-relaxed">
              <div style={{ whiteSpace: "pre-wrap" }}>{post.content}</div>
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
