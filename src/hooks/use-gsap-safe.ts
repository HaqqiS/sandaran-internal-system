"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * use-gsap-safe — Re-export terpusat untuk GSAP + useGSAP.
 *
 * Rules: "Gunakan useGSAP dari @gsap/react — jangan gunakan useEffect biasa
 *         untuk GSAP animation. Ini mencegah memory leak dan animation stacking."
 *
 * Pattern ini memastikan plugin ter-register dan selector context (scope)
 * selalu di-handle dengan benar.
 */

// Register plugins once
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger, useGSAP };
