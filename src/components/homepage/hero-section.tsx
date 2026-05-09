"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "~/hooks/use-gsap-safe";
import { useReducedMotion } from "~/hooks/use-reduced-motion";
import { MOTION } from "~/lib/motion-tokens";

/**
 * HeroSection — Scrollytelling dengan GSAP ScrollTrigger.
 * Premium update: Menggunakan Playfair Display & Syne.
 */
export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  // Helper untuk membungkus setiap karakter agar bisa di-animate per huruf
  const splitText = (text: string) => {
    return text.split("").map((char, i) => (
      // biome-ignore lint/suspicious/noArrayIndexKey: static content
      <span key={i} className="char inline-block whitespace-pre">
        {char}
      </span>
    ));
  };

  useGSAP(
    () => {
      if (reducedMotion || !containerRef.current) return;

      // ── Initial States ────────────────────────────────────────────────
      gsap.set(".design-line-top .char, .build-line-top .char", {
        y: MOTION.offset.textExitY,
        opacity: 0,
      });
      gsap.set(".design-line-bottom .char, .build-line-bottom .char", {
        y: MOTION.offset.textYPercent,
        opacity: 0,
      });
      gsap.set(".hero-blob", { opacity: 0, scale: 0.8 });

      // ── Master Timeline (Scrubbed Transitions) ────────────────────────
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=5000", // Diperpanjang agar scroll sangat mulus dan lega
          pin: true,
          scrub: MOTION.trigger.scrubSmooth,
          markers: process.env.NODE_ENV === "development",
          snap: {
            snapTo: "labelsDirectional",
            duration: { min: 0.3, max: 0.8 },
            delay: 0.1, // Tunggu user benar-benar berhenti scroll
            ease: MOTION.ease.out,
          },
        },
      });

      // Label scene0 (posisi awal)
      tl.addLabel("scene0", 0.0);

      // ══════════════════════════════════════════════════════════════════
      //  TRANSITION: Scene 0 → Scene 1
      // ══════════════════════════════════════════════════════════════════
      const t1 = 0.5; // Beri ruang scroll 0.5s sebelum animasi mulai

      tl.to(
        ".hero-scroll-indicator",
        { autoAlpha: 0, duration: MOTION.duration.fast },
        t1,
      );
      tl.to(".hero-meta", { autoAlpha: 0, duration: MOTION.duration.fast }, t1);

      // Crafted Spaces exit DOWN
      tl.to(
        ".crafted-line .char",
        {
          y: "120%",
          opacity: 0,
          stagger: { each: 0.04, from: "start" },
          duration: MOTION.duration.base,
          ease: MOTION.ease.cubicIn,
        },
        t1,
      );

      // Foto & Background
      tl.to(
        ".hero-photo",
        {
          scale: 0.55,
          borderRadius: "40% 60% 70% 30% / 50% 40% 60% 50%",
          duration: MOTION.duration.verySlow,
          ease: MOTION.ease.inOut,
          force3D: true,
        },
        t1,
      );
      tl.to(
        ".hero-overlay",
        { opacity: 0.9, duration: MOTION.duration.slow },
        t1 + 0.2,
      );
      tl.to(
        ".hero-blob",
        {
          opacity: 0.08,
          scale: 1,
          duration: MOTION.duration.verySlow,
          ease: MOTION.ease.out,
        },
        t1,
      );

      // We Design Enter (Mulai terlihat penuh sekitar ~2.6s)
      tl.to(
        ".design-line-top .char",
        {
          y: "0%",
          opacity: 1,
          stagger: { each: 0.05, from: "start" },
          duration: MOTION.duration.base,
          ease: MOTION.ease.expo,
        },
        t1 + 0.6,
      );
      tl.to(
        ".design-line-bottom .char",
        {
          y: "0%",
          opacity: 1,
          stagger: { each: 0.05, from: "start" },
          duration: MOTION.duration.base,
          ease: MOTION.ease.expo,
        },
        t1 + 0.8,
      );

      // Label scene1 diletakkan di TENGAH area statis (antara 2.6s - 3.8s)
      // sehingga saat user disnap, mereka punya ruang scroll aman tanpa langsung memicu animasi
      tl.addLabel("scene1", 3.2);

      // ══════════════════════════════════════════════════════════════════
      //  TRANSITION: Scene 1 → Scene 2
      // ══════════════════════════════════════════════════════════════════
      const t2 = 3.8; // Animasi keluar We Design dimulai

      // We Design Exit
      tl.to(
        ".design-line-top .char",
        {
          y: MOTION.offset.textExitY,
          opacity: 0,
          stagger: { each: 0.04, from: "start" },
          duration: MOTION.duration.fast,
          ease: MOTION.ease.cubicIn,
        },
        t2,
      );
      tl.to(
        ".design-line-bottom .char",
        {
          y: "120%",
          opacity: 0,
          stagger: { each: 0.04, from: "start" },
          duration: MOTION.duration.fast,
          ease: MOTION.ease.cubicIn,
        },
        t2 + 0.2,
      );

      // We Build Enter (Mulai terlihat penuh sekitar ~5.8s)
      tl.to(
        ".build-line-top .char",
        {
          y: "0%",
          opacity: 1,
          stagger: { each: 0.05, from: "start" },
          duration: MOTION.duration.base,
          ease: MOTION.ease.expo,
        },
        t2 + 0.6,
      );
      tl.to(
        ".build-line-bottom .char",
        {
          y: "0%",
          opacity: 1,
          stagger: { each: 0.05, from: "start" },
          duration: MOTION.duration.base,
          ease: MOTION.ease.expo,
        },
        t2 + 0.8,
      );

      // Label scene2 diletakkan di TENGAH area statis (antara 5.8s - 7.5s)
      tl.addLabel("scene2", 6.6);

      // Paksa timeline memiliki durasi ekstra di ujung (padding) sebesar hampir 1 detik
      // Ini mencegah Portfolio langsung tertarik naik jika user tidak sengaja scroll sedikit
      tl.to({}, { duration: 0.9 });
    },
    { scope: containerRef, dependencies: [reducedMotion] },
  );

  return (
    <div
      ref={containerRef}
      className="relative h-dvh w-full overflow-hidden hp-bg"
    >
      {/* ── Layer 0: Background Blobs ─────────────────────────────────── */}
      <div
        className="hero-blob absolute right-[-5vw] top-1/2 h-[60vw] w-[60vw] max-w-[800px] -translate-y-1/2 rounded-full border border-[var(--hp-clay)]/10"
        style={{
          background:
            "radial-gradient(circle at 40% 40%, var(--hp-clay), transparent 70%)",
          opacity: 0.1,
          filter: "blur(60px)",
        }}
      />

      {/* ── Layer 1: Photo Wrapper (Persistent in center) ───────────────── */}
      <div
        className="hero-photo absolute inset-0 m-auto overflow-hidden flex items-center justify-center"
        style={{
          width: "100%",
          height: "100%",
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
        <div
          className="hero-overlay absolute inset-0"
          style={{
            opacity: 0.6,
            background: `linear-gradient(
              to bottom,
              rgba(10,7,4,0.4) 0%,
              rgba(10,7,4,0) 50%,
              rgba(10,7,4,0.8) 100%
            )`,
          }}
        />
      </div>

      {/* ── Layer 2: Scene 0 — "CRAFTED / SPACES" ──────────────────────── */}
      {/* Diperkecil dan dipindahkan ke pojok agar tidak terlalu menutup gambar */}
      <div className="absolute inset-0 flex flex-col justify-end pb-12 pr-6 text-right md:pr-14 lg:pr-20 z-20">
        <div className="overflow-hidden">
          <h1
            className="crafted-line font-black uppercase tracking-display"
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: "var(--text-display-2xl)", // Diperkecil dari hero-display
              lineHeight: "0.85",
              color: "var(--hp-sand)",
            }}
          >
            {splitText("Crafted")}
          </h1>
        </div>
        <div className="overflow-hidden mt-[-0.1em]">
          <h1
            className="crafted-line font-black uppercase tracking-display italic"
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: "var(--text-display-2xl)",
              lineHeight: "0.85",
              color: "var(--hp-clay)",
            }}
          >
            {splitText("Spaces")}
          </h1>
        </div>
      </div>

      {/* ── Layer 3: Scene 1 — "WE DESIGN" (Top/Bottom) ────────────────── */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-between py-[12vh] text-center z-20">
        <div className="overflow-hidden">
          <div
            className="design-line-top font-black uppercase tracking-display"
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: "var(--text-display-xl)",
              lineHeight: "0.9",
              color: "var(--hp-sand)",
            }}
          >
            {splitText("We Design")}
          </div>
        </div>
        <div className="overflow-hidden">
          <div
            className="design-line-bottom font-medium lowercase tracking-wide italic"
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: "var(--text-display-md)",
              color: "var(--hp-clay)",
            }}
          >
            {splitText("with intention")}
          </div>
        </div>
      </div>

      {/* ── Layer 4: Scene 2 — "WE BUILD" (Top/Bottom) ────────────────── */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-between py-[12vh] text-center z-20">
        <div className="overflow-hidden">
          <div
            className="build-line-top font-black uppercase tracking-display"
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: "var(--text-display-xl)",
              lineHeight: "0.9",
              color: "var(--hp-sand)",
            }}
          >
            {splitText("We Build")}
          </div>
        </div>
        <div className="overflow-hidden">
          <div
            className="build-line-bottom font-medium lowercase tracking-wide italic"
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: "var(--text-display-md)",
              color: "var(--hp-clay)",
            }}
          >
            {splitText("your dreams")}
          </div>
        </div>
      </div>

      {/* ── Meta: bottom-left studio info ─────────────────────────────── */}
      <div className="hero-meta absolute bottom-10 left-6 flex flex-col gap-2 md:left-14 lg:left-20 z-30">
        <span
          className="text-[10px] font-bold uppercase tracking-[0.4em]"
          style={{ fontFamily: "var(--font-mono)", color: "var(--hp-clay)" }}
        >
          Studio Astaloka
        </span>
        <div className="h-px w-8 bg-[var(--hp-clay)]/30" />
        <span
          className="text-[9px] uppercase tracking-[0.2em]"
          style={{
            fontFamily: "var(--font-mono)",
            color: "var(--hp-fg-muted)",
          }}
        >
          Interior Design / Architecture
        </span>
      </div>

      {/* ── Scroll Indicator ─────────────────────────────────────────── */}
      <div className="hero-scroll-indicator absolute bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3 z-30">
        <span
          className="text-[9px] font-bold uppercase tracking-[0.4em]"
          style={{
            fontFamily: "var(--font-mono)",
            color: "var(--hp-fg-subtle)",
          }}
        >
          Explore
        </span>
        <div className="relative h-12 w-px overflow-hidden bg-[var(--hp-border-strong)]">
          <div className="absolute top-0 h-4 w-full animate-bounce bg-[var(--hp-clay)]" />
        </div>
      </div>
    </div>
  );
}
