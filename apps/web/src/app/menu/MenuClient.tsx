"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type MenuItem = {
  id: number;
  name: string;
  description?: string | null;
  price: any;
  imageUrl?: string | null;
};

type MenuCategory = {
  id: number;
  name: string;
  items: MenuItem[];
};

function normalizeImage(url?: string | null) {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;

  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) return url;

  // if stored as "/uploads/xxx.jpg"
  return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
}

export default function MenuClient({ categories }: { categories: MenuCategory[] }) {
  const safeCats = categories || [];
  const [activeId, setActiveId] = useState<number>(safeCats[0]?.id ?? 0);

  const activeCat = useMemo(
    () => safeCats.find((c) => c.id === activeId) || safeCats[0],
    [safeCats, activeId]
  );

  return (
    <div className="w-full h-full rounded-2xl border border-white/10 bg-black/40 overflow-hidden">
      {/* Top category tabs */}
      <div className="flex items-center justify-center gap-3 px-6 py-5 border-b border-white/10">
        {safeCats.map((c) => {
          const active = c.id === activeCat?.id;
          return (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className={[
                "px-4 py-2 rounded-lg text-xs tracking-widest border transition",
                active
                  ? "bg-white text-black border-white"
                  : "bg-transparent text-white border-white/20 hover:border-white/60",
              ].join(" ")}
            >
              {c.name.toUpperCase()}
            </button>
          );
        })}
      </div>

      {/* Category title */}
      <div className="px-10 pt-8">
        <div className="flex items-center justify-center gap-6 text-white/90">
          <span className="h-px w-10 bg-white/30" />
          <h2 className="text-2xl tracking-[0.35em] font-medium">
            {activeCat?.name?.toUpperCase()}
          </h2>
          <span className="h-px w-10 bg-white/30" />
        </div>
      </div>

      {/* Items */}
      <div className="px-10 py-8">
        <div className="space-y-6">
          {(activeCat?.items || []).map((item) => {
            const img = normalizeImage(item.imageUrl);

            return (
              <div
                key={item.id}
                className="flex items-start justify-between gap-6 border-b border-white/10 pb-6"
              >
                <div className="flex items-start gap-4 min-w-0">
                  {/* Thumbnail */}
                  <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-white/5 border border-white/10 shrink-0">
                    {img ? (
                      <Image
                        src={img}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                        unoptimized
                      />
                    ) : null}
                  </div>

                  {/* Name + desc */}
                  <div className="min-w-0">
                    <div className="text-sm tracking-widest uppercase truncate">
                      {item.name}
                    </div>
                    {item.description ? (
                      <div className="text-xs text-white/60 mt-1 line-clamp-2 max-w-[520px]">
                        {item.description}
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Price */}
                <div className="text-sm tracking-widest shrink-0">
                  ₹{Number(item.price).toFixed(0)}
                </div>
              </div>
            );
          })}

          {(activeCat?.items || []).length === 0 ? (
            <div className="text-sm text-white/60">No items in this category.</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
