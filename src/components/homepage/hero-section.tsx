"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "~/hooks/use-gsap-safe";
import { useReducedMotion } from "~/hooks/use-reduced-motion";
import { useSlidePresentation } from "~/hooks/use-slide-presentation";

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

  const { currentSlide } = useSlidePresentation(3, containerRef, {
    outDuration: 0.6,
    inDuration: 0.8,
    holdDelay: 0.5,
  });

  const tl = useRef<gsap.core.Timeline | null>(null);

  useGSAP(
    () => {
      if (reducedMotion) return;

      // ── Initial States ────────────────────────────────────────────────
      gsap.set(".design-line-top .char, .build-line-top .char", {
        y: "-110%",
        opacity: 0,
      });
      gsap.set(".design-line-bottom .char, .build-line-bottom .char", {
        y: "110%",
        opacity: 0,
      });
      gsap.set(".hero-blob", { opacity: 0, scale: 0.8 });

      // ── Master Timeline (Discrete Transitions) ────────────────────────
      tl.current = gsap.timeline({ paused: true });

      tl.current.addLabel("scene0", 0);

      // ══════════════════════════════════════════════════════════════════
      //  TRANSITION: Scene 0 → Scene 1
      // ══════════════════════════════════════════════════════════════════
      tl.current.to(
        ".hero-scroll-indicator",
        { autoAlpha: 0, duration: 0.4 },
        "scene0",
      );
      tl.current.to(".hero-meta", { autoAlpha: 0, duration: 0.4 }, "scene0");

      // Crafted Spaces exit DOWN
      tl.current.to(
        ".crafted-line .char",
        {
          y: "120%",
          opacity: 0,
          stagger: 0.05,
          duration: 0.8,
          ease: "power2.inOut",
        },
        "scene0+=0.2",
      );

      // Foto: shrink ke tengah
      tl.current.to(
        ".hero-photo",
        {
          scale: 0.55,
          borderRadius: "40% 60% 70% 30% / 50% 40% 60% 50%",
          duration: 1.2,
          ease: "power3.inOut",
          force3D: true, // force3D is valid string or boolean. using boolean here.
        },
        "scene0",
      );

      tl.current.to(
        ".hero-overlay",
        { opacity: 0.9, duration: 0.8 },
        "scene0+=0.2",
      );

      tl.current.to(
        ".hero-blob",
        {
          opacity: 0.08,
          scale: 1,
          duration: 1.2,
          ease: "power2.out",
        },
        "scene0",
      );

      // 1. Text Top Enter (We Design)
      tl.current.to(
        ".design-line-top .char",
        {
          y: "0%",
          opacity: 1,
          stagger: 0.05,
          duration: 0.8,
          ease: "power2.out",
        },
        "scene0+=0.8",
      );

      // 2. Text Bottom Enter
      tl.current.to(
        ".design-line-bottom .char",
        {
          y: "0%",
          opacity: 1,
          stagger: 0.05,
          duration: 0.8,
          ease: "power2.out",
        },
        "scene0+=1.0",
      );

      tl.current.addLabel("scene1");

      // ══════════════════════════════════════════════════════════════════
      //  TRANSITION: Scene 1 → Scene 2
      // ══════════════════════════════════════════════════════════════════

      // We Design Exit
      tl.current.to(
        ".design-line-top .char",
        {
          y: "-120%",
          opacity: 0,
          stagger: 0.04,
          duration: 0.6,
          ease: "power2.in",
        },
        "scene1",
      );
      tl.current.to(
        ".design-line-bottom .char",
        {
          y: "120%",
          opacity: 0,
          stagger: 0.04,
          duration: 0.6,
          ease: "power2.in",
        },
        "scene1+=0.2",
      );

      // We Build Enter
      tl.current.to(
        ".build-line-top .char",
        {
          y: "0%",
          opacity: 1,
          stagger: 0.06,
          duration: 0.8,
          ease: "power2.out",
        },
        "scene1+=0.6",
      );
      tl.current.to(
        ".build-line-bottom .char",
        {
          y: "0%",
          opacity: 1,
          stagger: 0.06,
          duration: 0.8,
          ease: "power2.out",
        },
        "scene1+=0.8",
      );

      tl.current.addLabel("scene2");
    },
    { scope: containerRef, dependencies: [reducedMotion] },
  );

  // Jalankan animasi transisi setiap kali currentSlide berubah
  useGSAP(
    () => {
      if (!tl.current || reducedMotion) return;

      tl.current.tweenTo(`scene${currentSlide}`, {
        duration: 1.2, // durasi total perpindahan disesuaikan dengan in/out duration hook
        ease: "power2.inOut",
      });
    },
    { dependencies: [currentSlide, reducedMotion] },
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
