"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

// ─── HeroSection ───────────────────────────────────────────────────────────────

/**
 * HeroSection — Scrollytelling dengan GSAP ScrollTrigger.
 *
 * Arsitektur:
 *   Container ini memiliki height 100dvh dan di-pin selama 300vh tambahan.
 *   Total scroll = 400vh. Viewport tetap diam di layar,
 *   animasi di dalam berputar mengikuti scroll progress.
 *
 * 3 Scene (masing-masing ~33% scroll):
 *   Scene 1: Foto full-bleed + "CRAFTED SPACES" kanan bawah → keluar ke atas
 *   Scene 2: Foto menyusut jadi kartu + "WE DESIGN" muncul dari bawah → keluar
 *   Scene 3: "WE BUILD" muncul dari bawah dengan stagger
 *
 * Teknik:
 *   1. Scrollytelling — scroll memajukan narasi visual
 *   2. Kinetic Typography — teks masuk/keluar dramatis per-baris
 *   3. Multi-layer Parallax — foto/teks bergerak kecepatan berbeda
 *   4. Pin Scrolling — viewport terkunci selama 400vh
 */
export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // ── Initial States ────────────────────────────────────────────────
      // Scene 2 & 3 text mulai tersembunyi (y:110% di dalam overflow-hidden)
      gsap.set(".design-line", { y: "110%" });
      gsap.set(".build-line", { y: "110%" });

      // ── Master Timeline ───────────────────────────────────────────────
      // scrub: 1 → 1 detik smoothing delay
      // pin: true → containerRef di-pin selama scroll
      // end: "+=300%" → 300vh tambahan = total 400vh
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=300%",
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        },
      });

      // ── Labels ────────────────────────────────────────────────────────
      tl.addLabel("scene1", 0);
      tl.addLabel("scene2", 1);
      tl.addLabel("scene3", 2);

      // ══════════════════════════════════════════════════════════════════
      //  SCENE 1 (position 0 → 1): CRAFTED SPACES exit + Photo shrink
      // ══════════════════════════════════════════════════════════════════

      // Scroll indicator hilang cepat
      tl.to(
        ".hero-scroll-indicator",
        { autoAlpha: 0, duration: 0.08 },
        "scene1",
      );

      // Meta info kiri bawah fade out
      tl.to(".hero-meta", { autoAlpha: 0, duration: 0.12 }, "scene1");

      // "CRAFTED" dan "SPACES" bergerak keluar ke atas (layer cepat)
      tl.to(
        ".crafted-line",
        {
          y: "-120%",
          stagger: 0.04,
          duration: 0.35,
          ease: "power3.in",
        },
        "scene1",
      );

      // Foto: parallax lambat ke atas + scale down + border radius
      tl.to(
        ".hero-photo",
        {
          y: "-5%",
          scale: 0.65,
          borderRadius: "16px",
          duration: 0.7,
          ease: "power2.inOut",
        },
        "scene1+=0.1",
      );

      // Overlay jadi lebih gelap saat foto menyusut
      tl.to(
        ".hero-overlay",
        {
          opacity: 0.92,
          duration: 0.5,
        },
        "scene1+=0.2",
      );

      // ══════════════════════════════════════════════════════════════════
      //  SCENE 2 (position 1 → 2): WE DESIGN enter/exit + Photo exit
      // ══════════════════════════════════════════════════════════════════

      // "WE DESIGN" teks masuk dari bawah
      tl.to(
        ".design-line",
        {
          y: "0%",
          stagger: 0.05,
          duration: 0.2,
          ease: "power3.out",
        },
        "scene2",
      );

      // Foto kartu terus naik, keluar viewport
      tl.to(
        ".hero-photo",
        {
          y: "-140%",
          duration: 0.5,
          ease: "power2.in",
        },
        "scene2",
      );

      // "WE DESIGN" teks keluar ke atas
      tl.to(
        ".design-line",
        {
          y: "-120%",
          stagger: 0.04,
          duration: 0.2,
          ease: "power3.in",
        },
        "scene2+=0.6",
      );

      // ══════════════════════════════════════════════════════════════════
      //  SCENE 3 (position 2 → 3): WE BUILD enter + hold
      // ══════════════════════════════════════════════════════════════════

      // "WE BUILD" teks masuk dari bawah, stagger lebih lambat (dramatis)
      tl.to(
        ".build-line",
        {
          y: "0%",
          stagger: 0.06,
          duration: 0.25,
          ease: "power3.out",
        },
        "scene3",
      );

      // Di akhir scene, subtle fade untuk transisi ke section berikutnya
      tl.to(
        ".build-line",
        {
          y: "-30%",
          opacity: 0.2,
          stagger: 0.03,
          duration: 0.15,
        },
        "scene3+=0.75",
      );
    },
    { scope: containerRef },
  );

  return (
    <div ref={containerRef} className="relative h-dvh w-full overflow-hidden">
      {/* ── Layer 0: Solid Dark Background ───────────────────────────────
          Terlihat saat foto menyusut menjadi kartu (Scene 2+)
      */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "var(--hp-bg)" }}
      />

      {/* ── Layer 1: Photo + Overlay (hero-photo) ─────────────────────────
          Wrapper ini yang di-animate: scale, borderRadius, y.
          Di dalamnya: next/image + gradient overlay.
      */}
      <div
        className="hero-photo absolute inset-0 overflow-hidden will-change-transform"
        style={{ transformOrigin: "center center" }}
      >
        <Image
          src="/Sadara Bouteique Resort 1.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Dark gradient overlay — heavy, terutama di bottom untuk teks */}
        <div
          className="hero-overlay absolute inset-0"
          style={{
            opacity: 0.7,
            background: `linear-gradient(
              to bottom,
              rgba(0,6,12,0.65) 0%,
              rgba(0,6,12,0.40) 30%,
              rgba(0,6,12,0.55) 60%,
              rgba(0,6,12,0.88) 100%
            )`,
          }}
        />
      </div>

      {/* ── Layer 2: Scene 1 — "CRAFTED / SPACES" ────────────────────────
          Posisi: kanan bawah, ukuran raksasa.
          Tiap baris di-wrap overflow-hidden, inner div di-animate y.
      */}
      <div className="absolute bottom-0 right-0 w-full pb-12 pr-6 text-right md:pr-14 lg:pr-20">
        <div className="overflow-hidden">
          <div
            className="crafted-line will-change-transform font-black uppercase"
            style={{
              fontSize: "var(--text-hero-display)",
              lineHeight: "0.88",
              letterSpacing: "-0.04em",
              color: "var(--hp-fg)",
            }}
          >
            Crafted
          </div>
        </div>
        <div className="overflow-hidden">
          <div
            className="crafted-line will-change-transform font-black uppercase"
            style={{
              fontSize: "var(--text-hero-display)",
              lineHeight: "0.88",
              letterSpacing: "-0.04em",
              color: "var(--hp-fg)",
            }}
          >
            Spaces
          </div>
        </div>
      </div>

      {/* ── Layer 3: Scene 2 — "WE DESIGN" ───────────────────────────────
          Posisi: center viewport. Mulai hidden (y: 110%).
      */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <div className="overflow-hidden">
          <div
            className="design-line will-change-transform font-black uppercase"
            style={{
              fontSize: "var(--text-hero-display)",
              lineHeight: "0.88",
              letterSpacing: "-0.04em",
              color: "var(--hp-fg)",
            }}
          >
            We Design
          </div>
        </div>
      </div>

      {/* ── Layer 4: Scene 3 — "WE BUILD" ────────────────────────────────
          Posisi: center viewport. Mulai hidden (y: 110%).
      */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <div className="overflow-hidden">
          <div
            className="build-line will-change-transform font-black uppercase"
            style={{
              fontSize: "var(--text-hero-display)",
              lineHeight: "0.88",
              letterSpacing: "-0.04em",
              color: "var(--hp-fg)",
            }}
          >
            We Build
          </div>
        </div>
      </div>

      {/* ── Meta: bottom-left studio info ─────────────────────────────── */}
      <div className="hero-meta absolute bottom-10 left-6 flex flex-col gap-1 md:left-14 lg:left-20">
        <span
          className="text-[10px] font-semibold uppercase tracking-[0.22em]"
          style={{ color: "var(--hp-fg-muted)" }}
        >
          Interior Design Studio
        </span>
        <span
          className="text-[10px] uppercase tracking-[0.18em]"
          style={{ color: "var(--hp-fg-subtle)" }}
        >
          Bali, Indonesia
        </span>
      </div>

      {/* ── Scroll Indicator ─────────────────────────────────────────── */}
      <div className="hero-scroll-indicator absolute bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2">
        <span
          className="text-[9px] font-semibold uppercase tracking-[0.3em]"
          style={{ color: "var(--hp-fg-subtle)" }}
        >
          Scroll
        </span>
        <div
          className="relative h-10 w-px overflow-hidden"
          style={{ backgroundColor: "var(--hp-border-strong)" }}
        >
          <div
            className="absolute top-0 h-3 w-full animate-pulse"
            style={{ backgroundColor: "var(--hp-accent)" }}
          />
        </div>
      </div>
    </div>
  );
}
