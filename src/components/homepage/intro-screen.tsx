"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

/**
 * IntroScreen — Full-screen loading animation ala Yurdaer Mimarlik.
 *
 * Timeline:
 *  0ms    → Screen muncul (dark overlay full viewport)
 *  0ms    → Logo fade-in + scale up dari 0.85 → 1.0
 *  600ms  → Counter/progress bar berjalan
 *  1800ms → setDone(true) dipanggil
 *  1800ms → AnimatePresence trigger exit:
 *             - overlay slide UP (clipPath inset 0% → 100%)
 *             - durasi exit: 800ms
 *  2600ms → IntroScreen unmount, homepage fully visible
 *
 * Layoutnya:
 *  - Background solid dark (#000a12)
 *  - Brand name besar di tengah (word-by-word stagger)
 *  - Progress bar tipis di bawah
 *  - Angka counter 00 → 100 di pojok kiri bawah
 *  - Tagline kecil di pojok kanan bawah
 */

interface IntroScreenProps {
  /** Brand name yang ditampilkan — default: "SANDARAN" */
  brandName?: string;
  /** Tagline kecil di pojok kanan bawah */
  tagline?: string;
  /** Durasi dalam ms sebelum fade-out dimulai — default: 1800 */
  duration?: number;
}

export function IntroScreen({
  brandName = "SANDARAN",
  tagline = "HOME LIVING",
  duration = 1800,
}: IntroScreenProps) {
  const [done, setDone] = useState(false);
  const [counter, setCounter] = useState(0);

  // Counter 0 → 100 dalam `duration` ms
  useEffect(() => {
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Easing agar counter tidak linear — terasa "memuat"
      const eased = 1 - (1 - progress) ** 3;
      setCounter(Math.round(eased * 100));

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        setDone(true);
      }
    };

    const frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [duration]);

  // Split brand name jadi array kata untuk stagger animation
  const words = brandName.split(" ");

  return (
    <AnimatePresence mode="wait">
      {!done && (
        <motion.div
          key="intro-screen"
          className="fixed inset-0 z-9999 flex flex-col items-center justify-center overflow-hidden"
          style={{ backgroundColor: "var(--hp-bg)" }}
          exit={{
            clipPath: "inset(0 0 100% 0)",
          }}
          transition={{
            duration: 0.8,
            ease: [0.76, 0, 0.24, 1] as [number, number, number, number],
          }}
        >
          {/* Brand name — word-by-word stagger */}
          <div className="flex flex-wrap items-center justify-center gap-x-[0.3em]">
            {words.map((word, i) => (
              <div key={word} className="overflow-hidden">
                <motion.span
                  className="block font-black uppercase"
                  style={{
                    fontSize: "var(--text-display-xl)",
                    letterSpacing: "var(--tracking-display)",
                    color: "var(--hp-fg)",
                    lineHeight: 1,
                  }}
                  initial={{ y: "110%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  transition={{
                    duration: 0.7,
                    delay: 0.1 + i * 0.12,
                    ease: [0.76, 0, 0.24, 1],
                  }}
                >
                  {word}
                </motion.span>
              </div>
            ))}
          </div>

          {/* Tagline kecil di bawah brand */}
          <div className="overflow-hidden mt-3">
            <motion.p
              className="uppercase font-medium tracking-[0.3em] text-sm"
              style={{ color: "var(--hp-fg-muted)" }}
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              transition={{
                duration: 0.6,
                delay: 0.35,
                ease: [0.76, 0, 0.24, 1],
              }}
            >
              {tagline}
            </motion.p>
          </div>

          {/* Progress bar — tipis di bagian bawah */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-px"
            style={{ backgroundColor: "var(--hp-border)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            {/* Bar yang bergerak */}
            <motion.div
              className="h-full origin-left"
              style={{ backgroundColor: "var(--hp-accent)" }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: counter / 100 }}
              transition={{ duration: 0.1, ease: "linear" }}
            />
          </motion.div>

          {/* Counter pojok kiri bawah */}
          <motion.div
            className="absolute bottom-6 left-6 font-mono text-xs tabular-nums"
            style={{ color: "var(--hp-fg-muted)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            {String(counter).padStart(2, "0")}
          </motion.div>

          {/* Tagline pojok kanan bawah */}
          <motion.div
            className="absolute bottom-6 right-6 text-xs uppercase tracking-[0.2em]"
            style={{ color: "var(--hp-fg-subtle)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            Interior Design
          </motion.div>

          {/* Garis dekoratif kiri & kanan — subtle vertical lines */}
          <motion.div
            className="absolute top-6 left-6 w-px origin-top"
            style={{
              height: "60px",
              backgroundColor: "var(--hp-border-strong)",
            }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: 0.4, duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
          />
          <motion.div
            className="absolute top-6 right-6 w-px origin-top"
            style={{
              height: "60px",
              backgroundColor: "var(--hp-border-strong)",
            }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: 0.4, duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
