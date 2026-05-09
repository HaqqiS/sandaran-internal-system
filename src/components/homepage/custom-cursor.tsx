"use client";

import { useEffect, useRef } from "react";
import { gsap } from "~/hooks/use-gsap-safe";

/**
 * CustomCursor — Dot + Ring cursor yang mengikuti mouse dengan GSAP.
 * Menggunakan mix-blend-mode: difference agar terlihat premium di semua background.
 */
export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const ring = ringRef.current;
    if (!cursor || !ring) return;

    // Sembunyikan kursor bawaan (fallback jika .cursor-none gagal)
    document.body.style.cursor = "none";

    const onMouseMove = (e: MouseEvent) => {
      // Dot tracking (lebih cepat)
      gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.1,
        ease: "power2.out",
        overwrite: "auto",
      });

      // Ring tracking (sedikit delay / lagging effect)
      gsap.to(ring, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.5,
        ease: "power2.out",
        overwrite: "auto",
      });
    };

    const onMouseDown = () => {
      gsap.to(cursor, { scale: 0.8, duration: 0.2 });
      gsap.to(ring, { scale: 1.4, opacity: 0.8, duration: 0.2 });
    };

    const onMouseUp = () => {
      gsap.to(cursor, { scale: 1, duration: 0.2 });
      gsap.to(ring, { scale: 1, opacity: 0.5, duration: 0.2 });
    };

    const onHoverEnter = () => {
      // Ring expands and gets thicker
      gsap.to(ring, {
        scale: 2,
        borderWidth: "2px",
        opacity: 0.8,
        duration: 0.4,
        ease: "power3.out",
      });
      // Dot stays small but ensures it doesn't block the element (invert mode handles visibility)
      gsap.to(cursor, {
        scale: 1.2,
        duration: 0.4,
        ease: "power3.out",
      });
    };

    const onHoverLeave = () => {
      gsap.to(ring, {
        scale: 1,
        borderWidth: "1px",
        opacity: 0.5,
        duration: 0.4,
        ease: "power3.out",
      });
      gsap.to(cursor, {
        scale: 1,
        duration: 0.4,
        ease: "power3.out",
      });
    };

    // Attach listeners
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);

    // Hover detection for interactive elements
    const interactives = document.querySelectorAll(
      'a, button, [role="button"], .cursor-pointer',
    );
    interactives.forEach((el) => {
      el.addEventListener("mouseenter", onHoverEnter);
      el.addEventListener("mouseleave", onHoverLeave);
    });

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      interactives.forEach((el) => {
        el.removeEventListener("mouseenter", onHoverEnter);
        el.removeEventListener("mouseleave", onHoverLeave);
      });
      document.body.style.cursor = "auto";
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999]">
      {/* Follow Ring */}
      <div
        ref={ringRef}
        className="fixed left-0 top-0 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--hp-clay)] mix-blend-difference will-change-transform"
      />
      {/* Center Dot */}
      <div
        ref={cursorRef}
        className="fixed left-0 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--hp-clay)] mix-blend-difference will-change-transform"
      />
    </div>
  );
}
