"use client";

/**
 * NoiseOverlay — Menambahkan grain/noise tekstur yang fixed di layar.
 * Memberikan kesan premium dan analog pada desain digital.
 */
export function NoiseOverlay() {
  return (
    <div
      className="noise-overlay pointer-events-none fixed inset-0 z-[9997]"
      aria-hidden="true"
    />
  );
}
