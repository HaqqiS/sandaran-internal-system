/**
 * Motion Design Tokens — Konstanta global untuk semua animasi GSAP.
 *
 * Rules: "Definisikan semua nilai animasi sebagai konstanta.
 *         Jangan hardcode angka langsung di komponen."
 *
 * Referensi: docs/motion-design-rules.md § SETUP WAJIB #3
 */
export const MOTION = {
  // Durasi (detik)
  duration: {
    fast: 0.4,
    base: 0.6,
    slow: 0.8,
    verySlow: 1.2,
  },

  // Easing — nama GSAP ease string
  ease: {
    out: "power2.out", // Animasi masuk elemen
    in: "power2.in", // Animasi keluar elemen
    inOut: "power2.inOut", // Transisi background
    elastic: "elastic.out(1, 0.5)", // Card settle/bounce
    expo: "expo.out", // Teks kinetic
    cubicIn: "power3.in", // Exit dramatis
    cubicOut: "power3.out", // Entry dramatis
  },

  // Stagger (detik delay antar elemen)
  stagger: {
    char: 0.025, // Per huruf
    word: 0.06, // Per kata
    item: 0.08, // Per list item
    card: 0.12, // Per kartu
  },

  // Offset masuk (px atau %)
  offset: {
    textY: 80, // Teks slide dari bawah (px)
    textYPercent: "110%", // Teks slide dari bawah (% — untuk overflow-hidden mask)
    textExitY: "-120%", // Teks keluar ke atas (%)
    cardY: 120, // Kartu slide dari bawah (px)
    cardX: 60, // Kartu slide dari samping (px)
  },

  // Parallax speed factor
  parallax: {
    text: 0.3, // Teks bergerak 30% lebih cepat dari scroll
    card: 0.15, // Kartu bergerak 15% lebih cepat
    background: -0.1, // Background bergerak 10% lebih lambat (reverse)
  },

  // ScrollTrigger defaults
  trigger: {
    start: "top 85%", // Mulai animasi saat elemen 85% dari atas viewport
    end: "bottom 15%", // Selesai saat elemen 15% dari bawah
    scrubFast: 0.5, // Scrub responsif
    scrubSmooth: 1.5, // Scrub halus
  },
} as const;
