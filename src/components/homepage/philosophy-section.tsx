"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "~/hooks/use-gsap-safe";
import { useReducedMotion } from "~/hooks/use-reduced-motion";
import { MOTION } from "~/lib/motion-tokens";

const PHILOSOPHY_TEXT =
  "We believe that space shapes behavior. Our approach combines natural elements with brutalist honesty to create timeless environments that evoke emotion and inspire everyday living.";

export function PhilosophySection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const watermarkRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      if (reducedMotion || !containerRef.current || !textRef.current) return;

      const words = textRef.current.querySelectorAll(".word");

      // 1. Animasi Teks Reveal (Scrub)
      gsap.to(words, {
        opacity: 0.9,
        stagger: 0.4,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=1500",
          pin: true,
          scrub: MOTION.trigger.scrubSmooth,
        },
      });

      // 2. Animasi Parallax Watermark (Horizontal)
      if (watermarkRef.current) {
        gsap.fromTo(
          watermarkRef.current,
          { x: "25vw" }, // Posisi awal: tergeser ke kanan (menampilkan ASTALOK)
          {
            x: "-25vw", // Posisi akhir: tergeser ke kiri (menampilkan STALOKA)
            ease: "none",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top top", // Sinkron dengan awal reveal teks
              end: "+=1500", // Sinkron dengan durasi reveal teks
              scrub: true,
            },
          },
        );
      }
    },
    { scope: containerRef, dependencies: [reducedMotion] },
  );

  // Helper untuk memecah teks menjadi elemen <span> per kata
  const splitWords = (text: string) => {
    return text.split(" ").map((word, i) => (
      <span
        // biome-ignore lint/suspicious/noArrayIndexKey: Static text array, index is safe for keys
        key={`${word}-${i}`}
        className="word inline-block opacity-20 will-change-opacity"
      >
        {word}&nbsp;
      </span>
    ));
  };

  return (
    <section
      ref={containerRef}
      className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-[var(--hp-bg)] px-[5vw]"
    >
      {/* --- Lapisan Dekorasi --- */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {/* Architectural Grid (Background Dasar) */}
        <div
          className="absolute inset-0 opacity-[0.15]" // Dinaikkan signifikan agar terlihat jelas
          style={{
            backgroundImage: `radial-gradient(var(--hp-fg) 1.5px, transparent 1.5px)`,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Large Watermark Typography (Parallax) */}
        <div
          ref={watermarkRef}
          className="absolute inset-0 flex items-center justify-center"
        >
          <span
            className="select-none text-[25vw] font-black leading-none opacity-[0.08] will-change-transform" // Dinaikkan signifikan
            style={{
              fontFamily: "var(--font-playfair)",
              color: "var(--hp-fg)",
            }}
          >
            ASTALOKA
          </span>
        </div>

        {/* Efek Tirai (Fading Edges) */}
        <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-[var(--hp-bg)] to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-[var(--hp-bg)] to-transparent" />
      </div>

      {/* Container teks agar memiliki batas lebar yang estetik */}
      <div className="relative z-10 max-w-[85vw] md:max-w-[70vw] lg:max-w-[60vw]">
        {/* Label kecil di atas teks utama */}
        <div
          className="mb-8 flex items-center gap-4 text-xs font-bold uppercase tracking-widest opacity-50"
          style={{ color: "var(--hp-fg)" }}
        >
          <div className="h-px w-8 bg-current" />
          <span>Our Philosophy</span>
        </div>

        {/* Teks tipografi raksasa */}
        <h2
          ref={textRef}
          className="text-3xl font-medium leading-[1.3] tracking-tight md:text-5xl lg:text-6xl"
          style={{ fontFamily: "var(--font-sans)", color: "var(--hp-fg)" }}
        >
          {splitWords(PHILOSOPHY_TEXT)}
        </h2>
      </div>
    </section>
  );
}
