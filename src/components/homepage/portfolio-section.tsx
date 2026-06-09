"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "~/hooks/use-gsap-safe";
import { useReducedMotion } from "~/hooks/use-reduced-motion";

const PROJECTS = [
  {
    id: "p1",
    title: "B A House",
    category: "Residential",
    year: "2023",
    image: "/Projects B A House 1.jpg",
  },
  {
    id: "p2",
    title: "Sadara Boutique Resort",
    category: "Hospitality",
    year: "2024",
    image: "/Sadara Bouteique Resort 2.jpg",
  },
  {
    id: "p3",
    title: "Sekar Tunjung House",
    category: "Residential",
    year: "2024",
    image: "/Sekar Tunjung House 1.jpg",
  },
];

export function PortfolioSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      if (reducedMotion || !containerRef.current || !trackRef.current) return;

      const track = trackRef.current;

      // Hitung total jarak yang perlu di-scroll: lebar track dikurangi lebar viewport
      const getScrollAmount = () => -(track.scrollWidth - window.innerWidth);

      // Tween horizontal scroll
      const tween = gsap.to(track, {
        x: getScrollAmount,
        ease: "none",
      });

      // Buat ScrollTrigger untuk membungkus tween ini
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: () => `+=${getScrollAmount() * -1}`,
        pin: true,
        animation: tween,
        scrub: 1, // 1 detik lag agar scroll terasa smooth (smooth scrubbing)
        invalidateOnRefresh: true, // Hitung ulang nilai saat resize window
      });

      // Animasi Parallax pada gambar di dalam slider
      // Membutuhkan `containerAnimation` agar tersinkronisasi dengan scroll horizontal
      const projectCards = track.querySelectorAll(".project-card");
      projectCards.forEach((card) => {
        const img = card.querySelector(".portfolio-image-inner");
        gsap.fromTo(
          img,
          { xPercent: -8 }, // Mulai digeser ke kiri (batas aman overflow gambar)
          {
            xPercent: 8, // Bergeser ke kanan
            ease: "none",
            scrollTrigger: {
              trigger: card, // Trigger parallax adalah card proyeknya, BUKAN containernya
              start: "left right", // Mulai saat card masuk dari kanan layar
              end: "right left", // Selesai saat card keluar di kiri layar
              containerAnimation: tween, // KUNCI: hubungkan dengan timeline horizontal
              scrub: true,
            },
          },
        );
      });
    },
    { scope: containerRef, dependencies: [reducedMotion] },
  );

  return (
    <section
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden bg-[var(--hp-bg)]"
    >
      {/* Track yang akan bergeser ke kiri */}
      <div
        ref={trackRef}
        className="flex h-full w-max flex-nowrap items-center px-[10vw]"
      >
        {/* Intro Text Card di awal */}
        <div className="flex h-full w-[80vw] flex-col justify-center px-8 md:w-[50vw]">
          <h2
            className="font-black uppercase leading-none tracking-tight"
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: "var(--text-display-lg)",
              color: "var(--hp-fg)",
            }}
          >
            Selected
            <br />
            Works
          </h2>
          <p
            className="mt-6 max-w-sm text-lg leading-relaxed opacity-80"
            style={{ color: "var(--hp-fg-muted)" }}
          >
            A curated collection of our most passionate endeavors. Spaces
            designed to evoke emotion and inspire everyday living.
          </p>
        </div>

        {/* List of Projects */}
        {PROJECTS.map((project, index) => (
          <div
            key={project.id}
            className="project-card relative flex h-[70vh] w-[85vw] flex-col justify-center px-[4vw] md:w-[60vw]"
          >
            {/* Image Wrapper */}
            <div className="relative h-full w-full overflow-hidden rounded-sm">
              <div className="portfolio-image-inner absolute inset-0 h-full w-[120%] -left-[10%]">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  sizes="(max-width: 768px) 85vw, 60vw"
                  className="object-cover"
                />
              </div>

              {/* Overlay gradient agar teks lebih terbaca */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
            </div>

            {/* Project Info */}
            <div className="absolute bottom-10 left-[4vw] right-[4vw] flex items-end justify-between px-8 text-white">
              <div>
                <div className="mb-2 flex items-center gap-4 text-xs font-bold uppercase tracking-widest opacity-80">
                  <span>0{index + 1}</span>
                  <div className="h-px w-8 bg-white/50" />
                  <span>{project.category}</span>
                </div>
                <h3
                  className="text-4xl md:text-5xl font-bold uppercase tracking-tight"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  {project.title}
                </h3>
              </div>
              <div className="text-sm font-mono tracking-widest opacity-80">
                {project.year}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
