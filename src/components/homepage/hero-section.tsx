"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "~/hooks/use-gsap-safe";
import { useReducedMotion } from "~/hooks/use-reduced-motion";
import { MOTION } from "~/lib/motion-tokens";

// ─── HeroSection ───────────────────────────────────────────────────────────────

/**
 * HeroSection — Scrollytelling dengan GSAP ScrollTrigger.
 *
 * Arsitektur:
 *   Container 100dvh di-pin selama 300vh tambahan (total 400vh scroll).
 *   Viewport tetap diam di layar, animasi di dalam berjalan mengikuti
 *   scroll progress (0 → 1).
 *
 * 3 Scene (masing-masing ~33% scroll):
 *   Scene 1: Foto full-bleed + "CRAFTED SPACES" kanan bawah → keluar ke atas
 *   Scene 2: Foto menyusut jadi kartu + "WE DESIGN" muncul → keluar
 *   Scene 3: "WE BUILD" muncul dengan stagger
 *
 * Teknik (sesuai motion-design-rules.md):
 *   1. Scrollytelling — scroll memajukan narasi visual
 *   2. Kinetic Typography — teks masuk/keluar dramatis per-baris
 *   3. Multi-layer Parallax — foto/teks bergerak kecepatan berbeda
 *   4. Pin Scrolling — viewport terkunci selama 400vh
 *
 * Tokens: Semua angka animasi dari MOTION (src/lib/motion-tokens.ts).
 * A11y: Skip GSAP setup jika user prefers reduced motion.
 */
export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      // A11y: jika user minta reduced motion, skip semua animasi scroll-driven
      if (reducedMotion) return;

      // ── Initial States ────────────────────────────────────────────────
      gsap.set(".design-line", { y: MOTION.offset.textYPercent });
      gsap.set(".build-line", { y: MOTION.offset.textYPercent });

      // ── Master Timeline ───────────────────────────────────────────────
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=300%",
          pin: true,
          scrub: MOTION.trigger.scrubSmooth,
          anticipatePin: 1,
        },
      });

      // ── Labels ────────────────────────────────────────────────────────
      tl.addLabel("scene1", 0);
      tl.addLabel("scene2", 1);
      tl.addLabel("scene3", 2);

      // ══════════════════════════════════════════════════════════════════
      //  SCENE 1 (0 → 1): CRAFTED SPACES exit + Photo shrink
      // ══════════════════════════════════════════════════════════════════

      // Scroll indicator + meta fade out cepat
      tl.to(
        ".hero-scroll-indicator",
        { autoAlpha: 0, duration: 0.08 },
        "scene1",
      );
      tl.to(".hero-meta", { autoAlpha: 0, duration: 0.12 }, "scene1");

      // "CRAFTED" dan "SPACES" bergerak keluar ke atas
      tl.to(
        ".crafted-line",
        {
          y: MOTION.offset.textExitY,
          stagger: MOTION.stagger.word,
          duration: MOTION.duration.base,
          ease: MOTION.ease.cubicIn,
        },
        "scene1",
      );

      // Foto: parallax lambat + scale down + border radius (menjadi kartu)
      tl.to(
        ".hero-photo",
        {
          y: "-5%",
          scale: 0.65,
          borderRadius: "16px",
          duration: MOTION.duration.slow,
          ease: MOTION.ease.inOut,
          force3D: true,
        },
        "scene1+=0.1",
      );

      // Overlay jadi lebih gelap saat foto menyusut
      tl.to(
        ".hero-overlay",
        { opacity: 0.92, duration: MOTION.duration.base },
        "scene1+=0.2",
      );

      // ══════════════════════════════════════════════════════════════════
      //  SCENE 2 (1 → 2): WE DESIGN enter/exit + Photo exit
      // ══════════════════════════════════════════════════════════════════

      // "WE DESIGN" masuk dari bawah
      tl.to(
        ".design-line",
        {
          y: "0%",
          stagger: MOTION.stagger.word,
          duration: MOTION.duration.fast,
          ease: MOTION.ease.cubicOut,
        },
        "scene2",
      );

      // Foto kartu terus naik, keluar viewport
      tl.to(
        ".hero-photo",
        {
          y: "-140%",
          duration: MOTION.duration.base,
          ease: MOTION.ease.in,
          force3D: true,
        },
        "scene2",
      );

      // "WE DESIGN" keluar ke atas
      tl.to(
        ".design-line",
        {
          y: MOTION.offset.textExitY,
          stagger: MOTION.stagger.word,
          duration: MOTION.duration.fast,
          ease: MOTION.ease.cubicIn,
        },
        "scene2+=0.6",
      );

      // ══════════════════════════════════════════════════════════════════
      //  SCENE 3 (2 → 3): WE BUILD enter + hold
      // ══════════════════════════════════════════════════════════════════

      // "WE BUILD" masuk dari bawah, stagger lebih lambat (dramatis)
      tl.to(
        ".build-line",
        {
          y: "0%",
          stagger: MOTION.stagger.item,
          duration: MOTION.duration.base,
          ease: MOTION.ease.cubicOut,
        },
        "scene3",
      );

      // Di akhir scene, subtle fade untuk transisi ke section berikutnya
      tl.to(
        ".build-line",
        {
          y: "-30%",
          opacity: 0.2,
          stagger: MOTION.stagger.char,
          duration: MOTION.duration.fast,
        },
        "scene3+=0.75",
      );
    },
    { scope: containerRef, dependencies: [reducedMotion] },
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
          Foto height 130% + top -15% untuk ruang gerak parallax.
          GSAP handles will-change via force3D: true (bukan CSS permanen).
      */}
      <div
        className="hero-photo absolute inset-x-0 overflow-hidden"
        style={{
          height: "130%",
          top: "-15%",
          transformOrigin: "center center",
        }}
      >
        <Image
          src="/Sadara Bouteique Resort 1.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Dark gradient overlay */}
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
          overflow-hidden wrapper = clip mask (motion-design-rules rule #5).
      */}
      <div className="absolute bottom-0 right-0 w-full pb-12 pr-6 text-right md:pr-14 lg:pr-20">
        <div className="overflow-hidden">
          <div
            className="crafted-line font-black uppercase"
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
            className="crafted-line font-black uppercase"
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
          Posisi: center viewport. Initial hidden (y: 110% via gsap.set).
      */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <div className="overflow-hidden">
          <div
            className="design-line font-black uppercase"
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
          Posisi: center viewport. Initial hidden (y: 110% via gsap.set).
      */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <div className="overflow-hidden">
          <div
            className="build-line font-black uppercase"
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
