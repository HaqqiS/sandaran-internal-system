"use client";

import { useEffect, useState } from "react";

/**
 * useReducedMotion — Deteksi preferensi aksesibilitas user.
 *
 * Returns `true` jika user mengaktifkan "Reduce motion" di OS settings.
 * Semua komponen animasi utama WAJIB check hook ini dan skip animasi
 * jika `true`.
 *
 * Referensi: docs/motion-design-rules.md § RULES PERFORMA & AKSESIBILITAS
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);

    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return reduced;
}
