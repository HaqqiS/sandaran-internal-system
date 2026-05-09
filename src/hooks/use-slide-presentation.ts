"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLenis } from "~/components/providers/smooth-scroll-provider";
import { ScrollTrigger } from "~/hooks/use-gsap-safe";

/**
 *   Observer mendeteksi INTENT (bukan position) dari:
 *     - Wheel / trackpad
 *     - Touch swipe
 *     - Keyboard ArrowDown/ArrowUp/PageDown/PageUp/Space
 *
 *   Intent → state machine (currentSlide, isAnimating)
 *   State → trigger animasi GSAP timeline yang sudah di-define di komponen
 *
 * Rasio 30/40/30 dikontrol via parameter `timing`:
 *   inDuration  = 30% → durasi animasi masuk
 *   holdDelay   = 40% → delay sebelum slide dinyatakan "settled"
 *   outDuration = 30% → durasi animasi keluar (dipanggil saat pindah slide)
 *
 * Kenapa tidak pakai scrub:
 *   Scrub terikat pada scroll position — hold hanya bisa disimulasikan
 *   dengan snap, tapi snap tidak pernah benar-benar "berhenti di tengah".
 *   Observer mendeteksi arah intent SEKALI lalu melepas kontrol ke timeline.
 *
 * @param totalSlides - Total jumlah slide/scene
 * @param timing - Kontrol durasi per-fase (detik)
 * @param onSlideChange - Callback saat slide berubah, terima (from, to, direction)
 */

export interface SlideTiming {
  /** Durasi animasi OUT (slide keluar), detik */
  outDuration: number;
  /** Durasi animasi IN (slide masuk), detik */
  inDuration: number;
  /**
   * Delay setelah animasi IN selesai sebelum Observer aktif lagi.
   * Ini adalah "hold" — waktu konten bisa dilihat tanpa risiko skip.
   * Rumus: totalCycleDuration = outDuration + inDuration + holdDelay
   */
  holdDelay: number;
}

export interface UseSlidePresentation {
  currentSlide: number;
  previousSlide: number | null;
  direction: "down" | "up" | null;
  isAnimating: boolean;
  goToNext: () => void;
  goToPrev: () => void;
  goToSlide: (index: number) => void;
}

const DEFAULT_TIMING: SlideTiming = {
  outDuration: 0.5, // 30% feel
  inDuration: 0.5, // 30% feel
  holdDelay: 0.8, // 40% feel — waktu "hold" setelah IN selesai
};

export function useSlidePresentation(
  totalSlides: number,
  targetRef: React.RefObject<HTMLElement | null>,
  timing: Partial<SlideTiming> = {},
  onSlideChange?: (from: number, to: number, direction: "down" | "up") => void,
): UseSlidePresentation {
  const lenis = useLenis();
  const t = { ...DEFAULT_TIMING, ...timing };

  const [currentSlide, setCurrentSlide] = useState(0);
  const [previousSlide, setPreviousSlide] = useState<number | null>(null);
  const [direction, setDirection] = useState<"down" | "up" | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Ref untuk nilai terkini agar Observer closure tidak stale
  const stateRef = useRef({ currentSlide: 0, isAnimating: false });

  const navigate = useCallback(
    (dir: "down" | "up") => {
      // Guard: jangan interrupt animasi yang sedang berjalan
      if (stateRef.current.isAnimating) return;

      const current = stateRef.current.currentSlide;
      const next =
        dir === "down"
          ? Math.min(current + 1, totalSlides - 1)
          : Math.max(current - 1, 0);

      // Guard: sudah di ujung
      if (next === current) return;

      // Update state
      stateRef.current.isAnimating = true;
      stateRef.current.currentSlide = next;

      setIsAnimating(true);
      setPreviousSlide(current);
      setDirection(dir);
      setCurrentSlide(next);

      onSlideChange?.(current, next, dir);

      // Total lock duration = outDuration + inDuration + holdDelay
      // Setelah ini, Observer aktif lagi (slide berikutnya bisa dipicu)
      const lockDuration = (t.outDuration + t.inDuration + t.holdDelay) * 1000;

      const timer = setTimeout(() => {
        stateRef.current.isAnimating = false;
        setIsAnimating(false);
      }, lockDuration);

      return () => clearTimeout(timer);
    },
    [totalSlides, t.outDuration, t.inDuration, t.holdDelay, onSlideChange],
  );

  const goToNext = useCallback(() => navigate("down"), [navigate]);
  const goToPrev = useCallback(() => navigate("up"), [navigate]);

  const goToSlide = useCallback(
    (index: number) => {
      const current = stateRef.current.currentSlide;
      if (index === current || stateRef.current.isAnimating) return;
      const dir = index > current ? "down" : "up";
      navigate(dir);
      // Override currentSlide langsung
      stateRef.current.currentSlide = index;
      setCurrentSlide(index);
    },
    [navigate],
  );

  // Setup GSAP Observer & Lenis Lock
  useEffect(() => {
    if (!targetRef?.current) return;

    let observer: ReturnType<typeof ScrollTrigger.observe> | null = null;

    const enableObserver = () => {
      if (observer) observer.enable();
      lenis?.stop(); // Lock scroll using Lenis
      document.body.style.overflow = "hidden"; // Full native scroll lock
    };

    const disableObserver = () => {
      if (observer) observer.disable();
      lenis?.start(); // Unlock scroll using Lenis
      document.body.style.overflow = ""; // Unlock native scroll
    };

    // Observer untuk mendeteksi intent
    observer = ScrollTrigger.observe({
      target: window,
      type: "wheel,touch,pointer",
      wheelSpeed: -1,
      tolerance: 10,
      preventDefault: true,
      onDown: () => {
        const current = stateRef.current.currentSlide;
        if (current === 0) {
          disableObserver();
        } else {
          navigate("up");
        }
      },
      onUp: () => {
        const current = stateRef.current.currentSlide;
        if (current === totalSlides - 1) {
          disableObserver();
        } else {
          navigate("down");
        }
      },
    });

    // Mulai dengan observer aktif & scroll terkunci
    enableObserver();

    // ScrollTrigger HANYA untuk mendeteksi saat user scroll balik (up) dari portfolio
    const pinTrigger = ScrollTrigger.create({
      trigger: targetRef.current,
      start: "bottom bottom", // Ketika bagian bawah Hero Section menyentuh bagian bawah layar
      onEnterBack: () => {
        // Saat user scroll naik dari portfolio dan Hero Section mulai terlihat utuh
        // Kunci lagi scroll-nya dan pindah ke slide terakhir
        stateRef.current.currentSlide = totalSlides - 1;
        setCurrentSlide(totalSlides - 1);
        enableObserver();
      },
    });

    // Keyboard support
    const handleKey = (e: KeyboardEvent) => {
      if (!observer?.isEnabled) return;

      if (["ArrowDown", "PageDown", " "].includes(e.key)) {
        e.preventDefault();
        const current = stateRef.current.currentSlide;
        if (current === totalSlides - 1) disableObserver();
        else navigate("down");
      }
      if (["ArrowUp", "PageUp"].includes(e.key)) {
        e.preventDefault();
        const current = stateRef.current.currentSlide;
        if (current === 0) disableObserver();
        else navigate("up");
      }
    };

    window.addEventListener("keydown", handleKey);

    return () => {
      observer?.kill();
      pinTrigger.kill();
      window.removeEventListener("keydown", handleKey);
      // Pastikan scroll terbuka saat unmount
      lenis?.start();
    };
  }, [navigate, totalSlides, targetRef, lenis]);

  return {
    currentSlide,
    previousSlide,
    direction,
    isAnimating,
    goToNext,
    goToPrev,
    goToSlide,
  };
}
