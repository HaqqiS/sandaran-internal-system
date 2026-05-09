"use client";

import { AnimatePresence } from "motion/react";
import { useState } from "react";
import { CustomCursor } from "~/components/homepage/custom-cursor";
import { IntroScreen } from "~/components/homepage/intro-screen";
import { HomepageNavbar } from "~/components/homepage/navbar";
import { NoiseOverlay } from "~/components/homepage/noise-overlay";
import type { Session } from "~/server/better-auth/client";

/**
 * HomepageShell — client wrapper untuk homepage.
 *
 * Z-index layer:
 *  9999 → CustomCursor (paling atas)
 *  9998 → IntroScreen (hanya saat loading)
 *  9997 → NoiseOverlay (dibawah kursor, diatas konten)
 *  9996 → MenuOverlay (full-screen nav)
 *  9995 → HomepageNavbar bar
 */
export function HomepageShell({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  const [introDone, setIntroDone] = useState(false);

  return (
    <div className="cursor-none selection:bg-[var(--hp-clay)] selection:text-[var(--hp-ink)]">
      <CustomCursor />
      <NoiseOverlay />

      {/* Loading animation — muncul sekali saat halaman pertama dibuka */}
      <AnimatePresence mode="wait">
        {!introDone && (
          <IntroScreen
            brandName="ASTALOKA"
            tagline="INTERIOR DESIGN"
            duration={1800}
            onDone={() => setIntroDone(true)}
          />
        )}
      </AnimatePresence>

      {/* Fixed navbar — transparan di hero, glass saat scroll */}
      <HomepageNavbar session={session} />

      {/* Konten halaman utama */}
      <main className="relative z-10">{children}</main>
    </div>
  );
}
