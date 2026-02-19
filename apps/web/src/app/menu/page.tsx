import Image from "next/image";
import { fetchMenu } from "@/lib/api";
import MenuClient from "./MenuClient";

export default async function MenuPage() {
  const data = await fetchMenu();

  return (
    <main className="min-h-screen pt-24 px-4 md:px-10">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* LEFT STATIC HERO */}
          <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/40 min-h-[520px]">
            <Image
              src="/menu-hero.png"
              alt="Menu hero"
              fill
              className="object-cover opacity-90"
              priority
            />
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute bottom-10 left-10">
              <div className="text-5xl md:text-6xl tracking-[0.25em] font-light">
                MENU
              </div>
            </div>
          </div>

          {/* RIGHT DYNAMIC MENU */}
          <div className="min-h-[520px]">
            <MenuClient categories={data.categories || []} />
          </div>
        </div>
      </div>
    </main>
  );
}
