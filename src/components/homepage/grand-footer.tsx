"use client";

import { IconArrowRight } from "@tabler/icons-react";
import Link from "next/link";

export function GrandFooter() {
  return (
    <footer
      // Wrapper luar ini berfungsi sebagai ruang scroll (spacer) dan area pemotongan (clipping).
      // Menggunakan clip-path menciptakan stacking context baru sehingga elemen `fixed` di dalamnya
      // HANYA terlihat jika pengguna men-scroll ke area wrapper ini.
      className="relative h-[80vh] w-full bg-[var(--hp-bg-surface)] text-[var(--hp-fg)]"
      style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
    >
      {/* Konten aktual footer ini "dipaku" (fixed) di bagian bawah layar. */}
      {/* Namun karena dibatasi oleh clip-path dari div induknya, ia baru terungkap perlahan 
          seolah-olah konten di atasnya sedang digeser seperti tirai. */}
      <div className="fixed bottom-0 left-0 flex h-[80vh] w-full flex-col justify-between px-[5vw] pb-10 pt-20">
        {/* Main CTA */}
        <div className="flex flex-col items-center justify-center flex-1 text-center">
          <p
            className="mb-6 text-sm font-bold uppercase tracking-widest opacity-60"
            style={{ color: "var(--hp-clay)" }}
          >
            What&apos;s Next?
          </p>
          <h2
            className="mb-12 max-w-4xl text-5xl font-medium tracking-tight md:text-7xl lg:text-8xl"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Have a project in mind?
          </h2>

          <Link
            href="mailto:hello@astalokadesign.com"
            className="group flex items-center gap-4 rounded-full border border-[var(--hp-border)] px-8 py-4 md:px-10 md:py-5 transition-colors duration-300 hover:bg-[var(--hp-fg)] hover:text-[var(--hp-ink)]"
          >
            <span
              className="text-xl font-medium"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              Let&apos;s Talk
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--hp-clay)] text-white transition-transform duration-300 group-hover:scale-110">
              <IconArrowRight
                size={20}
                className="transition-transform duration-300 group-hover:-rotate-45"
              />
            </div>
          </Link>
        </div>

        {/* Bottom Metadata */}
        <div className="flex flex-col items-center justify-between border-t border-[var(--hp-border)] pt-8 md:flex-row">
          <div className="mb-4 flex gap-8 md:mb-0 text-sm opacity-60 font-mono">
            <Link
              href="#"
              className="hover:text-[var(--hp-clay)] transition-colors"
            >
              Instagram
            </Link>
            <Link
              href="#"
              className="hover:text-[var(--hp-clay)] transition-colors"
            >
              LinkedIn
            </Link>
            <Link
              href="#"
              className="hover:text-[var(--hp-clay)] transition-colors"
            >
              Behance
            </Link>
          </div>

          <div className="text-sm opacity-40 font-mono">
            &copy; {new Date().getFullYear()} Astaloka Design. All Rights
            Reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
