"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { gsap, useGSAP } from "~/hooks/use-gsap-safe";
import { useReducedMotion } from "~/hooks/use-reduced-motion";
import { cn } from "~/lib/utils";

const SERVICES = [
  {
    id: "s1",
    num: "01",
    title: "Architecture",
    description:
      "Designing spaces that harmonize with their environment and stand the test of time.",
    image: "/Projects B A House 1.jpg",
  },
  {
    id: "s2",
    num: "02",
    title: "Interior Design",
    description:
      "Crafting intimate atmospheres that evoke emotion and inspire everyday living.",
    image: "/Sadara Bouteique Resort 2.jpg",
  },
  {
    id: "s3",
    num: "03",
    title: "Landscaping",
    description:
      "Blurring the lines between indoors and out through lush, thoughtful green spaces.",
    image: "/Sekar Tunjung House 1.jpg",
  },
  {
    id: "s4",
    num: "04",
    title: "Custom Furniture",
    description:
      "Bespoke pieces tailored to fit perfectly within your unique spatial narrative.",
    image: "/Projects B A House 1.jpg", // Menggunakan aset yang sudah ada
  },
];

export function ExpertiseSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  const [activeService, setActiveService] = useState<number | null>(null);
  const reducedMotion = useReducedMotion();

  // Reference untuk menyimpan fungsi GSAP quickTo agar super ringan (60fps)
  const xTo = useRef<gsap.QuickToFunc | null>(null);
  const yTo = useRef<gsap.QuickToFunc | null>(null);

  useGSAP(
    () => {
      if (reducedMotion || !followerRef.current) return;

      // Inisialisasi agar container gambar benar-benar terpusat pada kursor
      gsap.set(followerRef.current, { xPercent: -50, yPercent: -50 });

      // quickTo: cara GSAP yang paling teroptimasi untuk mengupdate koordinat secara terus-menerus
      xTo.current = gsap.quickTo(followerRef.current, "x", {
        duration: 0.6,
        ease: "power3.out",
      });
      yTo.current = gsap.quickTo(followerRef.current, "y", {
        duration: 0.6,
        ease: "power3.out",
      });
    },
    { scope: containerRef, dependencies: [reducedMotion] },
  );

  const handlePointerMove = (e: React.PointerEvent) => {
    if (reducedMotion || !xTo.current || !yTo.current) return;

    // Kirim titik koordinat kursor ke fungsi GSAP quickTo
    xTo.current(e.clientX);
    yTo.current(e.clientY);
  };

  return (
    <section
      ref={containerRef}
      className="relative w-full overflow-hidden bg-[var(--hp-bg)] px-[5vw] py-32 text-[var(--hp-fg)]"
      onPointerMove={handlePointerMove}
    >
      {/* Header */}
      <div className="mb-20 flex flex-col justify-between gap-8 border-b border-[var(--hp-border)] pb-8 md:flex-row md:items-end">
        <h2
          className="text-4xl font-medium tracking-tight md:text-6xl"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Our Expertise
        </h2>
        <p className="max-w-md text-lg opacity-60">
          A holistic approach to spatial design, from the structural shell down
          to the finest tactile details.
        </p>
      </div>

      {/* Services List Wrapper */}
      <div
        className="relative z-10 flex w-full flex-col"
        onPointerLeave={() => setActiveService(null)}
      >
        {SERVICES.map((service, idx) => {
          // Logika untuk meredupkan item lain jika ada item yang sedang di-hover
          const isHovered = activeService === idx;
          const isFaded = activeService !== null && !isHovered;

          return (
            <div
              key={service.id}
              className={cn(
                "group flex cursor-pointer items-center justify-between border-b border-[var(--hp-border)] py-8 transition-all duration-500",
                isFaded ? "opacity-30" : "opacity-100",
              )}
              onPointerEnter={() => setActiveService(idx)}
            >
              {/* Sisi Kiri: Nomor & Judul Layanan */}
              <div className="flex items-baseline gap-8 transition-transform duration-500 ease-out group-hover:translate-x-8">
                <span className="text-sm font-mono tracking-widest opacity-50">
                  {service.num}
                </span>
                <h3
                  className="text-3xl font-light uppercase tracking-tight transition-colors duration-500 group-hover:text-[var(--hp-clay)] md:text-5xl lg:text-7xl"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  {service.title}
                </h3>
              </div>

              {/* Sisi Kanan: Deskripsi (Disembunyikan di mobile agar bersih) */}
              <div className="hidden max-w-sm text-right text-sm opacity-60 transition-transform duration-500 ease-out group-hover:-translate-x-8 md:block">
                {service.description}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Image Cursor Follower (Hanya tampil jika user tidak memakai fitur "Reduced Motion") */}
      {!reducedMotion && (
        <div
          ref={followerRef}
          className="pointer-events-none fixed left-0 top-0 z-50 h-[30vh] min-h-[250px] w-[25vw] min-w-[200px] overflow-hidden"
          style={{
            // React state menangani fade dan scale (GSAP menangani X & Y)
            opacity: activeService !== null ? 1 : 0,
            transform: `scale(${activeService !== null ? 1 : 0.8})`,
            transition: "opacity 0.4s ease, transform 0.4s ease",
          }}
        >
          {SERVICES.map((service, idx) => (
            <div
              key={service.id}
              className={cn(
                "absolute inset-0 h-full w-full transition-opacity duration-500",
                activeService === idx ? "opacity-100" : "opacity-0",
              )}
            >
              <Image
                src={service.image}
                alt={service.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 0vw, 25vw"
                priority // Tambahkan priority agar gambar placeholder cepat dimuat saat mouse bergerak cepat
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
