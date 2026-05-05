"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { createContext, useContext, useEffect, useRef } from "react";

// Register ScrollTrigger once at module level
gsap.registerPlugin(ScrollTrigger);

interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

interface LenisContextValue {
  stop: () => void;
  start: () => void;
}

const LenisContext = createContext<LenisContextValue>({
  stop: () => {},
  start: () => {},
});

export function useLenis() {
  return useContext(LenisContext);
}

/**
 * SmoothScrollProvider — Lenis smooth scroll + GSAP ScrollTrigger sync.
 *
 * Integrasi:
 *   1. Lenis.on('scroll') → ScrollTrigger.update()
 *   2. gsap.ticker → lenis.raf() (mengganti manual RAF loop)
 *   3. lagSmoothing(0) agar tidak ada frame skipping
 *
 * Ini memastikan semua animasi scroll-driven (pin, scrub, parallax)
 * berjalan sync dengan Lenis smooth scroll.
 *
 * Expose stop()/start() via useLenis() hook agar Dialog/Drawer dapat
 * menonaktifkan Lenis saat terbuka (mencegah halaman ikut ter-scroll).
 */
export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - 2 ** (-10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      touchMultiplier: 2,
    });

    lenisRef.current = lenis;

    // Sync Lenis scroll events → GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    // Gunakan GSAP ticker sebagai RAF loop (bukan manual requestAnimationFrame)
    // Ini memastikan Lenis dan GSAP selalu di frame yang sama.
    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000); // gsap ticker time dalam detik, lenis perlu ms
    };
    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  const contextValue: LenisContextValue = {
    stop: () => lenisRef.current?.stop(),
    start: () => lenisRef.current?.start(),
  };

  return (
    <LenisContext.Provider value={contextValue}>
      {children}
    </LenisContext.Provider>
  );
}
