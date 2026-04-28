"use client";

import Lenis from "lenis";
import { useEffect, useRef } from "react";

interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

/**
 * SmoothScrollProvider — wraps the app dengan Lenis smooth scroll.
 *
 * Lenis akan menambahkan class `lenis` dan `lenis-smooth` ke <html>,
 * yang di-handle oleh CSS reset di globals.css (html.lenis { height: auto }).
 *
 * Untuk integrasi GSAP ScrollTrigger, gunakan:
 *   ScrollTrigger.normalizeScroll(true)
 *   lenis.on('scroll', ScrollTrigger.update)
 *   gsap.ticker.add((time) => lenis.raf(time * 1000))
 *   gsap.ticker.lagSmoothing(0)
 *
 * Catatan: komponen ini hanya aktif di halaman yang menggunakan layout
 * dengan SmoothScrollProvider. Halaman internal/dashboard tidak terpengaruh
 * karena mereka punya layout sendiri.
 */
export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      // Durasi scroll — 1.2 terasa natural, naikkan ke 1.5 untuk lebih smooth
      duration: 1.2,
      // Easing exponential ala web portfolio premium
      easing: (t: number) => Math.min(1, 1.001 - 2 ** (-10 * t)),
      // Orientasi scroll
      orientation: "vertical",
      // Gesture orientation (untuk touchpad horizontal)
      gestureOrientation: "vertical",
      // Smooth wheel
      smoothWheel: true,
      // Touch multiplier untuk mobile feel
      touchMultiplier: 2,
    });

    lenisRef.current = lenis;

    // RAF loop — Lenis perlu dipanggil setiap frame
    let animationFrameId: number;

    function raf(time: number) {
      lenis.raf(time);
      animationFrameId = requestAnimationFrame(raf);
    }

    animationFrameId = requestAnimationFrame(raf);

    // Cleanup saat unmount / route change
    return () => {
      cancelAnimationFrame(animationFrameId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}
