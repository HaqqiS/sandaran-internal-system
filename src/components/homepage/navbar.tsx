"use client";

import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { OAuthButtons } from "~/components/shared/oauth-buttons";
import { Button } from "~/components/ui/button";
import type { Session } from "~/server/better-auth/client";
import { authClient } from "~/server/better-auth/client";

// ─── Data ─────────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: "About", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "Contact", href: "/contact" },
] as const;

const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://instagram.com" },
  { label: "LinkedIn", href: "https://linkedin.com" },
] as const;

// ─── Architectural Decoration (Desktop only) ───────────────────────────────────
// Animated floor-plan grid — scaleY build-up ala construction timeline.

function ArchitecturalGrid({ isVisible }: { isVisible: boolean }) {
  return (
    <div
      className="absolute right-0 top-0 bottom-0 hidden lg:flex items-center justify-center"
      style={{ width: "45%" }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 380 420"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-[380px]"
        style={{ opacity: 0.3 }}
      >
        <title>Architectural Grid</title>

        {/* Kolom kiri — stagger delay 0 */}
        <motion.g
          initial={{ scaleY: 0, originY: "100%" }}
          animate={isVisible ? { scaleY: 1 } : { scaleY: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: EASE_CUBIC }}
          style={{ transformOrigin: "0 100%" }}
        >
          <rect
            x="0"
            y="0"
            width="118"
            height="200"
            stroke="var(--hp-accent)"
            strokeWidth="1"
          />
          <rect
            x="0"
            y="210"
            width="118"
            height="210"
            stroke="var(--hp-accent)"
            strokeWidth="1"
          />
        </motion.g>

        {/* Kolom tengah — stagger delay 0.12 */}
        <motion.g
          initial={{ scaleY: 0 }}
          animate={isVisible ? { scaleY: 1 } : { scaleY: 0 }}
          transition={{ duration: 0.7, delay: 0.42, ease: EASE_CUBIC }}
          style={{ transformOrigin: "128px 420px" }}
        >
          <rect
            x="128"
            y="0"
            width="118"
            height="280"
            stroke="var(--hp-accent)"
            strokeWidth="1"
          />
          <rect
            x="128"
            y="290"
            width="118"
            height="130"
            stroke="var(--hp-accent)"
            strokeWidth="1"
          />
        </motion.g>

        {/* Kolom kanan — stagger delay 0.24 */}
        <motion.g
          initial={{ scaleY: 0 }}
          animate={isVisible ? { scaleY: 1 } : { scaleY: 0 }}
          transition={{ duration: 0.7, delay: 0.54, ease: EASE_CUBIC }}
          style={{ transformOrigin: "256px 420px" }}
        >
          <rect
            x="256"
            y="0"
            width="118"
            height="130"
            stroke="var(--hp-accent)"
            strokeWidth="1"
          />
          <rect
            x="256"
            y="140"
            width="118"
            height="280"
            stroke="var(--hp-accent)"
            strokeWidth="1"
          />
        </motion.g>

        {/* Titik intersection — muncul setelah grid selesai */}
        <motion.g
          initial={{ opacity: 0, scale: 0 }}
          animate={
            isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }
          }
          transition={{ duration: 0.3, delay: 0.9, ease: "easeOut" }}
          style={{ transformOrigin: "center" }}
        >
          <circle cx="128" cy="200" r="3" fill="var(--hp-accent)" />
          <circle cx="246" cy="200" r="3" fill="var(--hp-accent)" />
          <circle cx="128" cy="290" r="3" fill="var(--hp-accent)" />
          <circle cx="246" cy="130" r="3" fill="var(--hp-accent)" />
        </motion.g>
      </svg>
    </div>
  );
}

// ─── Full-Screen Menu Overlay ─────────────────────────────────────────────────

// Nav links: stagger container
const menuContainerVariants = {
  closed: { transition: { staggerChildren: 0.05, staggerDirection: -1 } },
  open: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

// Cast bezier array sebagai tuple agar TypeScript tidak error
const EASE_CUBIC: [number, number, number, number] = [0.76, 0, 0.24, 1];

// Curtain reveal — teks muncul dari bawah seperti tirai terangkat
const menuItemVariants = {
  closed: {
    y: "110%",
    opacity: 0,
    transition: { duration: 0.4, ease: EASE_CUBIC },
  },
  open: {
    y: "0%",
    opacity: 1,
    transition: { duration: 0.65, ease: EASE_CUBIC },
  },
};

interface MenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  session: Session | null;
}

function MenuOverlay({ isOpen, onClose, session }: MenuOverlayProps) {
  const pathname = usePathname();

  // Lock body scroll saat overlay terbuka
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="menu-overlay"
          className="fixed inset-0 z-9998 flex flex-col overflow-hidden"
          style={{ backgroundColor: "var(--hp-bg-surface)" }}
          initial={{ clipPath: "inset(0 0 100% 0)" }}
          animate={{ clipPath: "inset(0 0 0% 0)" }}
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.65, ease: EASE_CUBIC }}
        >
          {/* Decorative architectural grid — kanan layar, desktop only */}
          <ArchitecturalGrid isVisible={true} />

          {/* Konten overlay — full height flex column */}
          <div className="relative z-10 flex flex-1 flex-col px-8 pb-10 pt-28 md:px-16 lg:px-20">
            {/* Nav links — kiri tengah, vertical */}
            <motion.nav
              className="flex flex-1 flex-col justify-center"
              variants={menuContainerVariants}
              initial="closed"
              animate="open"
              exit="closed"
              aria-label="Menu utama"
            >
              <ul className="flex flex-col gap-0">
                {NAV_LINKS.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <li
                      key={link.href}
                      className="overflow-hidden border-b"
                      style={{ borderColor: "var(--hp-border)" }}
                    >
                      {/*
                        overflow-hidden pada <li> + translateY dari 110% → 0%
                        menciptakan efek curtain reveal yang premium.
                        Teks seolah-olah muncul dari balik garis separator.
                      */}
                      <motion.div variants={menuItemVariants}>
                        <Link
                          href={link.href}
                          onClick={onClose}
                          className="group relative flex items-center py-4 lg:py-6"
                          aria-current={isActive ? "page" : undefined}
                        >
                          <span
                            className="relative font-black uppercase leading-none tracking-[-0.02em] lg:w-1/2"
                            style={{
                              fontSize: "var(--text-display-lg)",
                              color: isActive
                                ? "var(--hp-accent)"
                                : "var(--hp-fg)",
                            }}
                          >
                            {link.label}

                            {/*
                              Underline accent yang grow dari kiri saat hover.
                              Diposisikan absolute di bawah teks.
                            */}
                            <span
                              className="absolute bottom-0 left-0 h-[2px] w-0 bg-[var(--hp-accent)] transition-all duration-300 group-hover:w-full"
                              aria-hidden="true"
                            />
                          </span>

                          {/* Desktop only index number: 01, 02, ... */}
                          <span
                            className="ml-auto hidden font-mono text-[10px] uppercase tracking-widest md:block"
                            style={{ color: "var(--hp-fg-muted)" }}
                          >
                            0{NAV_LINKS.indexOf(link) + 1}
                          </span>
                        </Link>
                      </motion.div>
                    </li>
                  );
                })}
              </ul>

              {/* Auth section — sementara dipindah ke sini */}
              <motion.div
                variants={menuItemVariants}
                className="mt-12 flex flex-col items-start gap-6 border-t pt-10"
                style={{ borderColor: "var(--hp-border)" }}
              >
                {session ? (
                  <div className="flex flex-col gap-6 w-full">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                        Authenticated as
                      </span>
                      <span className="text-lg font-bold">
                        {session.user?.name}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      <Link href="/dashboard" onClick={onClose}>
                        <Button className="rounded-full px-8">Dashboard</Button>
                      </Link>
                      <Button
                        variant="outline"
                        className="rounded-full px-8"
                        onClick={async () => {
                          await authClient.signOut();
                          onClose();
                        }}
                      >
                        Sign Out
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                      Login to access dashboard
                    </span>
                    <OAuthButtons />
                  </div>
                )}
              </motion.div>
            </motion.nav>

            {/* Footer — social links di bawah */}
            <motion.div
              className="flex items-center justify-between"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ delay: 0.65, duration: 0.45, ease: EASE_CUBIC }}
            >
              {/* Social links */}
              <nav aria-label="Social media" className="flex gap-8">
                {SOCIAL_LINKS.map((social) => (
                  <a
                    key={social.href}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative text-xs font-semibold uppercase tracking-[0.2em] transition-colors duration-300"
                    style={{ color: "var(--hp-fg-muted)" }}
                  >
                    {social.label}
                    {/* Underline social hover */}
                    <span
                      className="absolute bottom-[-2px] left-0 h-px w-0 transition-all duration-300 group-hover:w-full"
                      style={{ backgroundColor: "var(--hp-fg-muted)" }}
                      aria-hidden="true"
                    />
                  </a>
                ))}
              </nav>

              {/* Tagline kecil — hanya desktop */}
              <p
                className="hidden text-xs uppercase tracking-[0.15em] lg:block"
                style={{ color: "var(--hp-fg-subtle)" }}
              >
                Interior Design Studio
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

// ─── Navbar Utama ─────────────────────────────────────────────────────────────

/**
 * HomepageNavbar — Fixed navbar ala Yurdaer Mimarlik.
 *
 * Behavior:
 * - Transparan di atas hero, glassmorphism saat scroll
 * - Logo kiri, tombol MENU / CLOSE (text only) kanan
 * - Klik MENU → full-screen overlay dengan stagger nav links
 * - Scroll lock saat overlay terbuka
 */
export function HomepageNavbar({ session }: { session: Session | null }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 60);
  });

  return (
    <>
      {/* Navbar bar */}
      {/*
        z-index header dinaikkan ke 9999 saat menu open agar button CLOSE
        tidak tertutup oleh MenuOverlay (z-[9998]).
      */}
      <motion.header
        className="fixed top-0 left-0 right-0 flex items-center justify-between px-8 md:px-16 lg:px-20"
        style={{
          height: "72px",
          zIndex: menuOpen ? 9999 : 9997,
        }}
        animate={{
          backgroundColor:
            scrolled && !menuOpen ? "var(--hp-glass-bg)" : "transparent",
          backdropFilter:
            scrolled && !menuOpen ? "blur(var(--hp-glass-blur))" : "blur(0px)",
          borderBottom:
            scrolled && !menuOpen
              ? "1px solid var(--hp-border)"
              : "1px solid transparent",
        }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        {/* Logo / Brand */}
        <Link
          href="/"
          className="flex items-center gap-3"
          aria-label="Astaloka — Beranda"
          onClick={() => setMenuOpen(false)}
        >
          <LogoMark />
          <div className="flex flex-col leading-none">
            <span
              className="text-sm font-black uppercase tracking-[0.08em]"
              style={{ color: "var(--hp-fg)" }}
            >
              Astaloka
            </span>
            <span
              className="text-[10px] font-medium uppercase tracking-[0.2em]"
              style={{ color: "var(--hp-fg-muted)" }}
            >
              Interior Design
            </span>
          </div>
        </Link>

        {/* Tombol MENU / CLOSE — text only, tanpa icon */}
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
          className="min-h-11 min-w-11 px-3 text-xs font-semibold uppercase tracking-[0.18em] transition-opacity duration-200 hover:opacity-60"
          style={{
            color: "var(--hp-fg)",
            border: "1px solid var(--hp-border)",
          }}
        >
          {menuOpen ? "Close" : "Menu"}
        </button>
      </motion.header>

      {/* Full-screen menu overlay */}
      <MenuOverlay
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        session={session}
      />
    </>
  );
}

// ─── LogoMark SVG ─────────────────────────────────────────────────────────────
// Geometric columns ala arsitektur — mirip logo referensi dari screenshot.
// Ganti dengan SVG logo asli Astaloka.

function LogoMark() {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* 3 kolom vertikal — ala kolom arsitektur */}
      <rect
        x="2"
        y="4"
        width="8"
        height="28"
        rx="0"
        fill="var(--hp-accent)"
        opacity="0.9"
      />
      <rect
        x="14"
        y="10"
        width="8"
        height="22"
        rx="0"
        fill="var(--hp-accent)"
        opacity="0.7"
      />
      <rect
        x="26"
        y="2"
        width="8"
        height="32"
        rx="0"
        fill="var(--hp-accent)"
        opacity="0.5"
      />
    </svg>
  );
}
