"use client";

import { AnimatePresence } from "motion/react";
import { useState } from "react";
import { HeroSection } from "~/components/homepage/hero-section";
import { IntroScreen } from "~/components/homepage/intro-screen";
import { HomepageNavbar } from "~/components/homepage/navbar";

/**
 * HomepageShell — client wrapper untuk homepage.
 *
 * Alasannya: page.tsx adalah server component (ada getSession),
 * sementara IntroScreen & HomepageNavbar butuh useState/useEffect (client only).
 *
 * Dengan memisahkan shell ini, server component tetap bisa
 * fetch data di level atas, lalu shell menangani animasi client-side.
 *
 * Z-index layer:
 *  9999 → IntroScreen (paling atas, hanya saat loading)
 *  9998 → MenuOverlay (full-screen nav)
 *  9997 → HomepageNavbar bar
 */
export function HomepageShell({ children }: { children: React.ReactNode }) {
  const [introDone, setIntroDone] = useState(false);

  return (
    <>
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
      <HomepageNavbar />

      {/* Hero section — full viewport, parallax background */}
      <HeroSection />

      {/* Konten halaman utama — sections di bawah hero */}
      {children}
    </>
  );
}
