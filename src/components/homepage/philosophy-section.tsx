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
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      if (reducedMotion || !containerRef.current || !textRef.current) return;

      const words = textRef.current.querySelectorAll(".word");

      // Animasikan opacity kata-per-kata yang di-scrub oleh scroll
      gsap.to(words, {
        opacity: 1,
        stagger: 0.1,
        ease: "none", // Harus "none" agar pergerakan scrub linear dengan scroll
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=1500", // Panjang jarak scroll untuk membaca teks ini
          pin: true,
          scrub: MOTION.trigger.scrubSmooth,
        },
      });
    },
    { scope: containerRef, dependencies: [reducedMotion] },
  );

  // Helper untuk memecah teks menjadi elemen <span> per kata
  const splitWords = (text: string) => {
    return text.split(" ").map((word, i) => (
      <span
        // biome-ignore lint/suspicious/noArrayIndexKey: Static text array, index is safe for keys
        key={`${word}-${i}`}
        // Kita gunakan whitespace-pre-wrap dan tidak perlu margin-right manual
        // asalkan kita pisah dengan spasi (lihat return di bawah)
        className="word inline-block opacity-15 will-change-opacity"
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
      {/* Container teks agar memiliki batas lebar yang estetik */}
      <div className="max-w-[85vw] md:max-w-[70vw] lg:max-w-[60vw]">
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
