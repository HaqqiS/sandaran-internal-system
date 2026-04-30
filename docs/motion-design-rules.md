# Motion Design Rules & Technical Specification
## Yurdaer Mimarlık — 4 Motion Patterns

> **Stack**: Next.js 15 · React 19 · GSAP 3.15 · `@gsap/react` · Lenis 1.3 · Motion (Framer Motion v12) · Tailwind CSS v4
> 
> Dokumen ini adalah **aturan wajib** yang harus diikuti saat mengimplementasikan motion di project ini. Setiap pattern memiliki: definisi, kapan digunakan, aturan teknis, dan contoh kode siap pakai.

---

## SETUP WAJIB SEBELUM MULAI

### 1. Lenis Smooth Scroll (Global Provider)

Lenis **harus** diinisialisasi di level root dan di-sync dengan GSAP ticker. Tanpa ini, semua scroll-based animation tidak akan berjalan mulus.

```tsx
// src/components/providers/smooth-scroll-provider.tsx
'use client'

import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,           // Durasi momentum scroll (detik)
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Expo ease-out
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 2.0,
    })

    lenisRef.current = lenis

    // WAJIB: sync Lenis dengan GSAP ticker
    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000)
    })
    gsap.ticker.lagSmoothing(0)

    return () => {
      lenis.destroy()
      gsap.ticker.remove((time) => lenis.raf(time * 1000))
    }
  }, [])

  return <>{children}</>
}
```

```tsx
// src/app/layout.tsx
import { SmoothScrollProvider } from '@/components/providers/smooth-scroll-provider'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <SmoothScrollProvider>
          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  )
}
```

### 2. GSAP Context Hook (Wajib untuk React 19)

Gunakan `useGSAP` dari `@gsap/react` — **jangan** gunakan `useEffect` biasa untuk GSAP animation. Ini mencegah memory leak dan animation stacking.

```tsx
// src/hooks/use-gsap-safe.ts
'use client'

import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'  // GSAP Club — opsional

gsap.registerPlugin(ScrollTrigger, SplitText)

export { useGSAP, gsap, ScrollTrigger }
```

### 3. Global Token Animasi

Definisikan semua nilai animasi sebagai konstanta. **Jangan hardcode angka** langsung di komponen.

```ts
// src/lib/motion-tokens.ts
export const MOTION = {
  // Durasi (detik)
  duration: {
    fast: 0.4,
    base: 0.6,
    slow: 0.8,
    verySlow: 1.2,
  },

  // Easing
  ease: {
    out: 'power2.out',           // Animasi masuk elemen
    in: 'power2.in',             // Animasi keluar elemen
    inOut: 'power2.inOut',       // Transisi background
    elastic: 'elastic.out(1, 0.5)', // Card settle/bounce
    expo: 'expo.out',            // Teks kinetic
  },

  // Stagger
  stagger: {
    char: 0.025,    // Per huruf (detik)
    word: 0.06,     // Per kata
    item: 0.08,     // Per list item
    card: 0.12,     // Per kartu
  },

  // Offset masuk (px)
  offset: {
    textY: 80,      // Teks slide dari bawah
    cardY: 120,     // Kartu slide dari bawah
    cardX: 60,      // Kartu slide dari samping
  },

  // Parallax speed factor (0 = ikut scroll penuh, 1 = tidak gerak sama sekali)
  parallax: {
    text: 0.3,      // Teks bergerak 30% lebih cepat dari scroll
    card: 0.15,     // Kartu bergerak 15% lebih cepat
    background: -0.1, // Background bergerak 10% lebih lambat (reverse)
  },

  // ScrollTrigger defaults
  trigger: {
    start: 'top 85%',    // Mulai animasi saat elemen 85% dari atas viewport
    end: 'bottom 15%',   // Selesai saat elemen 15% dari bawah
    scrubFast: 0.5,      // Scrub responsif
    scrubSmooth: 1.5,    // Scrub halus
  },
} as const
```

---

## MOTION 1 — SCROLLYTELLING

### Definisi
Narasi visual linear yang **seluruhnya dikendalikan posisi scroll**. User "membaca" cerita dengan scroll — bukan klik, bukan timer. Setiap section adalah satu "halaman" cerita.

### Kapan Digunakan
- Hero section dengan multiple messages berurutan
- About/story page
- Sequence statistik berurutan
- Setiap konten yang punya urutan naratif (A → B → C)

### Aturan Wajib

| # | Aturan | Detail |
|---|---|---|
| 1 | **Satu section = satu pesan** | Jangan gabungkan 2 pesan berbeda dalam 1 section scroll |
| 2 | **Pin sebelum animate** | Section pinned dulu di viewport, baru kontennya bergerak |
| 3 | **Progress linear** | Urutan animasi harus mengikuti urutan scroll — tidak boleh ada elemen yang muncul sebelum trigger-nya |
| 4 | **Tidak ada autoplay** | Tidak boleh ada animasi yang jalan sendiri tanpa trigger scroll |
| 5 | **scrub wajib** | Semua animasi scrollytelling harus pakai `scrub: true` atau `scrub: number` — bukan `trigger` biasa |
| 6 | **Scroll height cukup** | Section pinned harus memiliki height minimal `100vh × jumlah_step` |

### Implementasi: Scroll-Pinned Section (Pattern Statistik)

```tsx
// src/components/motion/scrollytelling-section.tsx
'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MOTION } from '@/lib/motion-tokens'

gsap.registerPlugin(ScrollTrigger)

interface Step {
  label: string
  value: string
}

interface ScrollytellingProps {
  steps: Step[]
  height?: string // CSS height dari wrapper — default '500vh'
}

export function ScrollytellingSection({ steps, height = '500vh' }: ScrollytellingProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const stepsRef = useRef<HTMLDivElement[]>([])

  useGSAP(() => {
    const wrapper = wrapperRef.current
    const sticky = stickyRef.current
    if (!wrapper || !sticky) return

    // Timeline utama — scrub ke scroll
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: wrapper,
        start: 'top top',
        end: 'bottom bottom',
        scrub: MOTION.trigger.scrubSmooth,
        pin: sticky,           // Pin sticky element
        pinSpacing: false,     // Jangan tambah spacing ekstra
      },
    })

    // Animasi tiap step
    stepsRef.current.forEach((step, i) => {
      if (!step) return
      const isLast = i === stepsRef.current.length - 1

      // Masuk
      tl.fromTo(
        step,
        { opacity: 0, y: MOTION.offset.textY },
        { opacity: 1, y: 0, duration: 1, ease: MOTION.ease.out },
        i === 0 ? 0 : `>-0.2` // overlap sedikit dengan step sebelumnya
      )

      // Keluar (kecuali step terakhir)
      if (!isLast) {
        tl.to(
          step,
          { opacity: 0, y: -MOTION.offset.textY, duration: 0.8, ease: MOTION.ease.in },
          `>+0.5`
        )
      }
    })
  }, { scope: wrapperRef })

  return (
    // Wrapper: tinggi total menentukan berapa lama user scroll di section ini
    <div ref={wrapperRef} style={{ height }}>
      {/* Sticky container: tetap di viewport selama scroll */}
      <div
        ref={stickyRef}
        className="sticky top-0 h-screen flex items-center justify-center overflow-hidden"
      >
        {steps.map((step, i) => (
          <div
            key={step.label}
            ref={(el) => { if (el) stepsRef.current[i] = el }}
            className="absolute inset-0 flex flex-col items-center justify-center opacity-0"
          >
            <p className="text-sm uppercase tracking-widest text-neutral-500 mb-4">
              {step.label}
            </p>
            <h2 className="text-[clamp(4rem,12vw,10rem)] font-black uppercase leading-none text-center">
              {step.value}
            </h2>
          </div>
        ))}
      </div>
    </div>
  )
}
```

```tsx
// Contoh penggunaan:
<ScrollytellingSection
  height="600vh"
  steps={[
    { label: 'Museums', value: '64' },
    { label: 'Airports', value: '13' },
    { label: 'Restaurants & Cafes', value: '100+' },
    { label: 'School Campuses', value: '11' },
    { label: 'Private Residences', value: '∞' },
  ]}
/>
```

### Implementasi: Section Transition (Background Wipe)

```tsx
// src/components/motion/section-wipe.tsx
'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MOTION } from '@/lib/motion-tokens'

gsap.registerPlugin(ScrollTrigger)

interface SectionWipeProps {
  bgColor: string         // Warna background section baru (Tailwind class atau hex)
  children: React.ReactNode
  className?: string
}

export function SectionWipe({ bgColor, children, className }: SectionWipeProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const section = sectionRef.current
    const overlay = overlayRef.current
    if (!section || !overlay) return

    // Overlay naik dari bawah menutupi section sebelumnya
    gsap.fromTo(
      overlay,
      { yPercent: 100 },
      {
        yPercent: 0,
        ease: 'none', // Linear — tied to scroll
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',     // Mulai saat section menyentuh bawah viewport
          end: 'top top',          // Selesai saat section di atas viewport
          scrub: MOTION.trigger.scrubFast,
        },
      }
    )
  }, { scope: sectionRef })

  return (
    <section ref={sectionRef} className={`relative ${className}`}>
      {/* Overlay wipe dari bawah */}
      <div
        ref={overlayRef}
        className="absolute inset-0 z-0"
        style={{ backgroundColor: bgColor }}
      />
      {/* Konten di atas overlay */}
      <div className="relative z-10">{children}</div>
    </section>
  )
}
```

---

## MOTION 2 — KINETIC TYPOGRAPHY

### Definisi
Teks sebagai elemen motion utama — huruf, kata, atau baris bergerak masuk/keluar secara dramatis mengikuti scroll. Teks **bukan dekorasi**, teks **adalah animasinya**.

### Kapan Digunakan
- Heading besar di hero section
- Tagline atau statement kuat (1–5 kata)
- Teks yang berisi pesan utama sebuah section
- **Jangan** gunakan untuk body text, label, atau teks kecil

### Aturan Wajib

| # | Aturan | Detail |
|---|---|---|
| 1 | **Hanya ALL CAPS** | Kinetic typography hanya untuk teks uppercase |
| 2 | **Font size minimal 10vw** | Di bawah itu bukan kinetic, itu heading biasa |
| 3 | **Stagger per karakter atau per kata** | Semua huruf/kata punya delay berbeda, bukan muncul serentak |
| 4 | **Satu arah masuk, satu arah keluar** | Masuk dari bawah → keluar ke atas. Konsisten di seluruh halaman |
| 5 | **Overflow hidden di container** | Selalu wrap dengan `overflow: hidden` agar teks tidak terlihat sebelum animasi |
| 6 | **Tidak boleh overlap dengan elemen lain** | Jika terpaksa overlap, gunakan `mix-blend-mode: difference` |
| 7 | **Clip-path untuk teks per-baris** | Gunakan clip-path reveal, bukan fade murni |

### Implementasi: Kinetic Text Component

```tsx
// src/components/motion/kinetic-text.tsx
'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MOTION } from '@/lib/motion-tokens'

gsap.registerPlugin(ScrollTrigger)

type AnimateBy = 'chars' | 'words' | 'lines'

interface KineticTextProps {
  text: string
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
  animateBy?: AnimateBy
  className?: string
  triggerStart?: string
  direction?: 'up' | 'down' | 'left' | 'right'
  scrub?: boolean | number      // false = trigger biasa, number = scrub value
  delay?: number
}

export function KineticText({
  text,
  as: Tag = 'h2',
  animateBy = 'words',
  className = '',
  triggerStart = MOTION.trigger.start,
  direction = 'up',
  scrub = false,
  delay = 0,
}: KineticTextProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const getFromVars = () => {
    const base = { opacity: 0 }
    switch (direction) {
      case 'up':    return { ...base, y: MOTION.offset.textY }
      case 'down':  return { ...base, y: -MOTION.offset.textY }
      case 'left':  return { ...base, x: MOTION.offset.cardX }
      case 'right': return { ...base, x: -MOTION.offset.cardX }
    }
  }

  useGSAP(() => {
    const container = containerRef.current
    if (!container) return

    let targets: Element[]

    if (animateBy === 'chars') {
      // Split per huruf menggunakan CSS spans
      const el = container.querySelector('[data-text]')
      if (!el) return
      const chars = el.textContent?.split('') ?? []
      el.innerHTML = chars
        .map((c) => `<span class="inline-block" style="overflow:hidden"><span class="char inline-block">${c === ' ' ? '&nbsp;' : c}</span></span>`)
        .join('')
      targets = Array.from(container.querySelectorAll('.char'))
    } else if (animateBy === 'words') {
      const el = container.querySelector('[data-text]')
      if (!el) return
      const words = el.textContent?.split(' ') ?? []
      el.innerHTML = words
        .map((w) => `<span class="inline-block overflow-hidden"><span class="word inline-block">${w}</span></span>&nbsp;`)
        .join('')
      targets = Array.from(container.querySelectorAll('.word'))
    } else {
      // lines — animate seluruh elemen sekaligus
      targets = [container.querySelector('[data-text]')!].filter(Boolean)
    }

    gsap.fromTo(
      targets,
      getFromVars(),
      {
        opacity: 1,
        x: 0,
        y: 0,
        duration: MOTION.duration.base,
        ease: MOTION.ease.expo,
        stagger: animateBy === 'chars'
          ? MOTION.stagger.char
          : animateBy === 'words'
          ? MOTION.stagger.word
          : 0,
        delay,
        scrollTrigger: {
          trigger: container,
          start: triggerStart,
          toggleActions: scrub ? undefined : 'play none none reverse',
          scrub: scrub || false,
        },
      }
    )
  }, { scope: containerRef })

  return (
    <div ref={containerRef} className={`overflow-hidden ${className}`}>
      <Tag data-text="" className="block">
        {text}
      </Tag>
    </div>
  )
}
```

### Implementasi: Multi-line Split Reveal (Clip Path)

```tsx
// src/components/motion/split-reveal.tsx
'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MOTION } from '@/lib/motion-tokens'

gsap.registerPlugin(ScrollTrigger)

interface SplitRevealProps {
  lines: string[]              // Array of lines, each line animates separately
  className?: string
  lineClassName?: string
  staggerLines?: number        // Delay antar baris (detik)
  fromDirection?: 'left' | 'right' // Arah alternatif — odd lines kiri, even lines kanan
}

export function SplitReveal({
  lines,
  className = '',
  lineClassName = '',
  staggerLines = 0.1,
  fromDirection,
}: SplitRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const container = containerRef.current
    if (!container) return

    const lineEls = container.querySelectorAll('[data-line]')

    lineEls.forEach((line, i) => {
      const inner = line.querySelector('[data-line-inner]')
      if (!inner) return

      // Arah bergantian jika fromDirection aktif
      const xFrom = fromDirection
        ? (i % 2 === 0 ? -MOTION.offset.cardX : MOTION.offset.cardX)
        : 0

      gsap.fromTo(
        inner,
        {
          y: '110%',      // Mulai di bawah clip area
          x: xFrom,
          opacity: 0,
        },
        {
          y: '0%',
          x: 0,
          opacity: 1,
          duration: MOTION.duration.slow,
          ease: MOTION.ease.expo,
          delay: i * staggerLines,
          scrollTrigger: {
            trigger: container,
            start: MOTION.trigger.start,
            toggleActions: 'play none none reverse',
          },
        }
      )
    })
  }, { scope: containerRef })

  return (
    <div ref={containerRef} className={className}>
      {lines.map((line, i) => (
        // data-line: wrapper dengan overflow hidden = clip mask
        <div
          key={i}
          data-line=""
          className="overflow-hidden"
        >
          <div
            data-line-inner=""
            className={`block ${lineClassName}`}
          >
            {line}
          </div>
        </div>
      ))}
    </div>
  )
}
```

```tsx
// Contoh penggunaan:
<SplitReveal
  lines={['WE DESIGN', 'WE BUILD']}
  className="text-[15vw] font-black uppercase leading-[0.9]"
  fromDirection="left"
  staggerLines={0.12}
/>
```

### Implementasi dengan Motion (Framer Motion v12) — Alternatif untuk teks ringan

```tsx
// src/components/motion/animated-word.tsx
'use client'

import { motion } from 'motion'

interface AnimatedWordProps {
  text: string
  className?: string
}

// Gunakan ini untuk teks kecil atau saat tidak butuh ScrollTrigger
export function AnimatedWord({ text, className }: AnimatedWordProps) {
  const words = text.split(' ')

  return (
    <span className={`inline-flex flex-wrap gap-x-[0.25em] overflow-hidden ${className}`}>
      {words.map((word, i) => (
        <span key={i} className="overflow-hidden inline-block">
          <motion.span
            className="inline-block"
            initial={{ y: '110%', opacity: 0 }}
            whileInView={{ y: '0%', opacity: 1 }}
            viewport={{ once: true, margin: '-10% 0px' }}
            transition={{
              duration: 0.6,
              ease: [0.25, 0.46, 0.45, 0.94],
              delay: i * 0.06,
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  )
}
```

---

## MOTION 3 — PARALLAX SCROLLING

### Definisi
Elemen bergerak dengan kecepatan berbeda-beda saat scroll. Menciptakan ilusi kedalaman (depth) dan spatial awareness. Selalu ada minimal **3 layer** dengan kecepatan berbeda.

### Kapan Digunakan
- Hero section dengan foto background
- Section dengan foto floating card dan teks
- Setiap section yang punya foreground + background berbeda
- Transisi antar section (section baru muncul dari bawah dengan kecepatan berbeda)

### Lapisan Kecepatan (Speed Layers)

```
Layer 1 — TEKS (tercepat)       → scrollSpeed: 1.3× natural scroll
Layer 2 — KARTU / UI CARD       → scrollSpeed: 1.0× natural scroll (normal)
Layer 3 — BACKGROUND FOTO       → scrollSpeed: 0.7× natural scroll (lebih lambat)
Layer 4 — BACKGROUND COLOR      → scrollSpeed: 0× (fixed/sticky)
```

### Aturan Wajib

| # | Aturan | Detail |
|---|---|---|
| 1 | **Minimal 3 layer** | Setiap section parallax harus punya minimal 3 layer kecepatan berbeda |
| 2 | **Scrub wajib linear** | Parallax harus `scrub: true` atau `scrub: number` — tidak boleh ada easing di parallax |
| 3 | **will-change: transform** | Semua elemen parallax wajib punya CSS `will-change: transform` untuk GPU acceleration |
| 4 | **Tidak boleh overflow** | Container parallax harus `overflow: hidden` agar foto tidak keluar bounds |
| 5 | **Foto diperbesar** | Foto background harus 120–130% height container agar ada ruang gerak saat parallax |
| 6 | **Kartu foto: rotasi konsisten** | Kartu dari kiri: `rotate: +8deg`, kartu dari kanan: `rotate: -8deg` |

### Implementasi: Parallax Container (Multi-layer)

```tsx
// src/components/motion/parallax-section.tsx
'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Image from 'next/image'
import { MOTION } from '@/lib/motion-tokens'

gsap.registerPlugin(ScrollTrigger)

interface ParallaxSectionProps {
  imageSrc: string
  imageAlt: string
  heading: string
  subheading?: string
  bgColor?: string
}

export function ParallaxSection({
  imageSrc,
  imageAlt,
  heading,
  subheading,
  bgColor = '#ffffff',
}: ParallaxSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const bgImageRef = useRef<HTMLDivElement>(null)   // Layer 3 — paling lambat
  const cardRef = useRef<HTMLDivElement>(null)       // Layer 2 — normal
  const textRef = useRef<HTMLDivElement>(null)       // Layer 1 — paling cepat

  useGSAP(() => {
    const section = sectionRef.current
    if (!section) return

    const st = {
      trigger: section,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true, // Linear — tidak ada easing
    }

    // Layer 3: Background foto bergerak paling lambat (parallax up, tapi lambat)
    if (bgImageRef.current) {
      gsap.fromTo(
        bgImageRef.current,
        { yPercent: -10 },       // Mulai sedikit di atas
        { yPercent: 10, ...{ scrollTrigger: st } } // Bergerak ke bawah relatif
      )
    }

    // Layer 2: Card bergerak normal (tidak ada parallax ekstra)
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { yPercent: 5 },
        { yPercent: -5, ...{ scrollTrigger: st } }
      )
    }

    // Layer 1: Teks bergerak paling cepat (parallax ke atas lebih agresif)
    if (textRef.current) {
      gsap.fromTo(
        textRef.current,
        { yPercent: 15 },
        { yPercent: -15, ...{ scrollTrigger: st } }
      )
    }
  }, { scope: sectionRef })

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen overflow-hidden"
      style={{ backgroundColor: bgColor }}
    >
      {/* Layer 3: Background foto */}
      <div
        ref={bgImageRef}
        className="absolute inset-0 w-full"
        style={{
          height: '130%',       // 130% untuk ruang parallax
          top: '-15%',
          willChange: 'transform',
        }}
      >
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Layer 2: Floating card */}
      <div
        ref={cardRef}
        className="absolute right-[10%] top-[20%]"
        style={{ willChange: 'transform' }}
      >
        <FloatingCard imageSrc={imageSrc} rotation={-8} />
      </div>

      {/* Layer 1: Teks (paling cepat) */}
      <div
        ref={textRef}
        className="relative z-20 flex items-end h-screen pb-16 px-8"
        style={{ willChange: 'transform' }}
      >
        <div>
          {subheading && (
            <p className="text-sm uppercase tracking-widest mb-4 opacity-60">{subheading}</p>
          )}
          <h2 className="text-[clamp(4rem,10vw,8rem)] font-black uppercase leading-none">
            {heading}
          </h2>
        </div>
      </div>
    </section>
  )
}
```

### Implementasi: Floating Card dengan Rotation

```tsx
// src/components/motion/floating-card.tsx
'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Image from 'next/image'
import { MOTION } from '@/lib/motion-tokens'

gsap.registerPlugin(ScrollTrigger)

interface FloatingCardProps {
  imageSrc: string
  imageAlt?: string
  rotation?: number         // Derajat rotasi (+ = searah jam, - = berlawanan)
  width?: number            // px
  height?: number           // px
  entryFrom?: 'left' | 'right' | 'bottom'
  parallaxIntensity?: number // 0–30 — seberapa jauh kartu bergerak saat parallax
}

export function FloatingCard({
  imageSrc,
  imageAlt = '',
  rotation = 8,
  width = 480,
  height = 360,
  entryFrom = 'bottom',
  parallaxIntensity = 20,
}: FloatingCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const card = cardRef.current
    if (!card) return

    // Entry animation
    const fromX = entryFrom === 'left' ? -MOTION.offset.cardX : entryFrom === 'right' ? MOTION.offset.cardX : 0
    const fromY = entryFrom === 'bottom' ? MOTION.offset.cardY : 0

    gsap.fromTo(
      card,
      {
        opacity: 0,
        x: fromX,
        y: fromY,
        rotate: rotation * 1.5,  // Mulai dengan rotasi lebih besar, settle ke rotasi final
        scale: 0.92,
      },
      {
        opacity: 1,
        x: 0,
        y: 0,
        rotate: rotation,
        scale: 1,
        duration: MOTION.duration.slow,
        ease: MOTION.ease.elastic, // Bounce settle
        scrollTrigger: {
          trigger: card,
          start: MOTION.trigger.start,
          toggleActions: 'play none none reverse',
        },
      }
    )

    // Parallax movement saat scroll
    gsap.to(card, {
      y: -parallaxIntensity,
      ease: 'none',
      scrollTrigger: {
        trigger: card,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    })
  }, { scope: cardRef })

  return (
    <div
      ref={cardRef}
      className="relative overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.15)]"
      style={{
        width,
        height,
        borderRadius: '14px',
        willChange: 'transform',
      }}
    >
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        className="object-cover"
      />
    </div>
  )
}
```

### Implementasi dengan Motion (Framer Motion v12) — Untuk parallax ringan

```tsx
// src/components/motion/parallax-element.tsx
'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion'

interface ParallaxElementProps {
  children: React.ReactNode
  speed?: number        // Negatif = lebih lambat, Positif = lebih cepat
  className?: string
}

// Gunakan ini untuk elemen tunggal yang butuh parallax sederhana
// tanpa setup ScrollTrigger penuh
export function ParallaxElement({ children, speed = 0.2, className }: ParallaxElementProps) {
  const ref = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  // Konversi progress 0–1 ke pixel movement
  const y = useTransform(scrollYProgress, [0, 1], [`${speed * -100}px`, `${speed * 100}px`])

  return (
    <motion.div ref={ref} style={{ y, willChange: 'transform' }} className={className}>
      {children}
    </motion.div>
  )
}
```

---

## MOTION 4 — PIN SCROLLING / SCROLL-PINNED SECTIONS

### Definisi
Section yang **terkunci (pinned)** di viewport sementara user terus scroll. Konten di dalamnya berubah/beranimasi berdasarkan progress scroll. Menciptakan efek "scroll dalam scroll".

### Kapan Digunakan
- Section dengan multiple messages/steps yang ingin ditampilkan bergantian
- Statistik/angka yang berganti satu per satu
- Sequence foto yang berganti dengan background tetap
- Section "WE DESIGN → WE BUILD → WE BUILD" style
- Kapanpun kamu ingin user "berhenti" di satu area sebelum lanjut scroll

### Aturan Wajib

| # | Aturan | Detail |
|---|---|---|
| 1 | **Height wrapper = 100vh × (jumlah_step + 1)** | Formula: `(steps.length + 1) * 100vh` |
| 2 | **Sticky inner = 100vh** | Inner element harus tepat `height: 100vh` |
| 3 | **Scrub selalu smooth** | Gunakan `scrub: 1.5` — bukan `scrub: true` agar tidak terlalu responsif |
| 4 | **pinSpacing: false** | Wajib. Hindari GSAP menambahkan padding otomatis yang merusak layout |
| 5 | **Refresh ScrollTrigger** | Setelah content load/resize, panggil `ScrollTrigger.refresh()` |
| 6 | **Anticipate pin** | Tambahkan `anticipatePin: 1` pada ScrollTrigger untuk mencegah jump |
| 7 | **Satu pin per halaman** | Jangan overlap 2 pinned section — jaga gap minimal 100vh antara keduanya |

### Implementasi: Pin Scroll Section (Lengkap)

```tsx
// src/components/motion/pin-section.tsx
'use client'

import { useRef, useLayoutEffect } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MOTION } from '@/lib/motion-tokens'

gsap.registerPlugin(ScrollTrigger)

interface PinStep {
  id: string
  content: React.ReactNode
}

interface PinSectionProps {
  steps: PinStep[]
  backgroundColor?: string
  overlap?: number   // 0–1, berapa bagian step berikutnya sudah muncul sebelum step ini pergi
}

export function PinSection({
  steps,
  backgroundColor = '#ffffff',
  overlap = 0.2,
}: PinSectionProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const stepRefs = useRef<HTMLDivElement[]>([])
  const tlRef = useRef<gsap.core.Timeline | null>(null)

  // Height total = (jumlah step + 1) × 100vh
  const totalHeight = `${(steps.length + 1) * 100}vh`

  useGSAP(() => {
    const wrapper = wrapperRef.current
    const sticky = stickyRef.current
    if (!wrapper || !sticky) return

    // Set semua step ke invisible dulu kecuali step pertama
    stepRefs.current.forEach((step, i) => {
      if (!step) return
      gsap.set(step, {
        opacity: i === 0 ? 1 : 0,
        y: i === 0 ? 0 : MOTION.offset.textY,
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      })
    })

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: wrapper,
        start: 'top top',
        end: 'bottom bottom',
        scrub: MOTION.trigger.scrubSmooth,
        pin: sticky,
        pinSpacing: false,
        anticipatePin: 1,     // Prevent jump saat pin aktif
        // Debug: uncomment baris ini untuk melihat marker
        // markers: process.env.NODE_ENV === 'development',
      },
    })

    tlRef.current = tl

    // Animasi setiap step
    steps.forEach((_, i) => {
      const current = stepRefs.current[i]
      const next = stepRefs.current[i + 1]
      if (!current) return

      // Keluar step sekarang
      if (next) {
        // Step saat ini fade + slide keluar
        tl.to(
          current,
          {
            opacity: 0,
            y: -MOTION.offset.textY,
            duration: 1 - overlap,
            ease: MOTION.ease.in,
          },
          `step${i}+=0.5`
        )

        // Step berikutnya masuk (dengan overlap)
        tl.fromTo(
          next,
          { opacity: 0, y: MOTION.offset.textY },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: MOTION.ease.out,
          },
          `step${i}+=${1 - overlap}`
        )

        // Label untuk timing referensi
        tl.addLabel(`step${i + 1}`, '>')
      }

      // Pause sejenak di setiap step (tambah durasi kosong)
      tl.to({}, { duration: 1.5 })
    })
  }, { scope: wrapperRef })

  // Refresh ScrollTrigger saat window resize
  useLayoutEffect(() => {
    const handleResize = () => {
      ScrollTrigger.refresh()
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div
      ref={wrapperRef}
      style={{ height: totalHeight }}
      className="relative"
    >
      {/* Sticky container */}
      <div
        ref={stickyRef}
        className="sticky top-0 h-screen w-full overflow-hidden"
        style={{ backgroundColor }}
      >
        {/* Steps container — relative untuk absolute positioning tiap step */}
        <div className="relative h-full w-full">
          {steps.map((step, i) => (
            <div
              key={step.id}
              ref={(el) => { if (el) stepRefs.current[i] = el }}
            >
              {step.content}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

```tsx
// Contoh penggunaan:
<PinSection
  backgroundColor="#0D4A52"
  steps={[
    {
      id: 'design',
      content: (
        <div className="text-white text-center">
          <p className="text-sm tracking-widest mb-4 opacity-60">WHAT WE DO</p>
          <h2 className="text-[12vw] font-black uppercase">WE DESIGN</h2>
        </div>
      ),
    },
    {
      id: 'build',
      content: (
        <div className="text-white text-center">
          <p className="text-sm tracking-widest mb-4 opacity-60">WHAT WE DO</p>
          <h2 className="text-[12vw] font-black uppercase">WE BUILD</h2>
        </div>
      ),
    },
    {
      id: 'merge',
      content: (
        <div className="text-white text-center">
          <p className="text-sm tracking-widest mb-4 opacity-60">WHAT WE DO</p>
          <h2 className="text-[10vw] font-black uppercase leading-none">
            WE MERGE<br />THE WHOLE<br />PROCESS
          </h2>
        </div>
      ),
    },
  ]}
/>
```

### Implementasi: Progress Indicator untuk Pin Section

```tsx
// src/components/motion/pin-progress.tsx
'use client'

import { useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface PinProgressProps {
  totalSteps: number
  triggerSelector: string  // CSS selector dari wrapper pin section
}

export function PinProgress({ totalSteps, triggerSelector }: PinProgressProps) {
  const [activeStep, setActiveStep] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    Array.from({ length: totalSteps }).forEach((_, i) => {
      ScrollTrigger.create({
        trigger: triggerSelector,
        start: `${(i / totalSteps) * 100}% top`,
        end: `${((i + 1) / totalSteps) * 100}% top`,
        onEnter: () => setActiveStep(i),
        onEnterBack: () => setActiveStep(i),
      })
    })
  })

  return (
    <div
      ref={containerRef}
      className="fixed right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2"
    >
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div
          key={i}
          className="w-1.5 rounded-full transition-all duration-300"
          style={{
            height: activeStep === i ? '32px' : '8px',
            backgroundColor: activeStep === i ? 'currentColor' : 'rgba(0,0,0,0.2)',
          }}
        />
      ))}
    </div>
  )
}
```

---

## KOMBINASI: Cara Menggabungkan 4 Motion

Gunakan urutan ini sebagai template structure halaman:

```tsx
// src/app/page.tsx
import { SectionWipe } from '@/components/motion/section-wipe'
import { KineticText } from '@/components/motion/kinetic-text'
import { SplitReveal } from '@/components/motion/split-reveal'
import { ParallaxSection } from '@/components/motion/parallax-section'
import { FloatingCard } from '@/components/motion/floating-card'
import { PinSection } from '@/components/motion/pin-section'
import { ScrollytellingSection } from '@/components/motion/scrollytelling-section'

export default function HomePage() {
  return (
    <main>

      {/* HERO — Parallax full bleed */}
      <ParallaxSection
        imageSrc="/images/hero.jpg"
        imageAlt="Architecture hero"
        heading="ARCHITECTURE REDEFINED"
        bgColor="#ffffff"
      />

      {/* PIN SCROLL — WE DESIGN / WE BUILD sequence */}
      <PinSection
        backgroundColor="#0D4A52"
        steps={[...]}
      />

      {/* SCROLLYTELLING — Statistik berurutan */}
      <SectionWipe bgColor="#ADD8E6">
        <ScrollytellingSection
          height="500vh"
          steps={[
            { label: 'Museums', value: '64' },
            { label: 'Airports', value: '13' },
          ]}
        />
      </SectionWipe>

      {/* KINETIC TYPOGRAPHY — Statement tunggal */}
      <SectionWipe bgColor="#EFEDE6">
        <section className="min-h-screen flex items-center px-8">
          <SplitReveal
            lines={['WE LOVE', 'WHAT WE DO']}
            className="text-[12vw] font-black uppercase leading-[0.9]"
            fromDirection="left"
          />
        </section>
      </SectionWipe>

    </main>
  )
}
```

---

## RULES PERFORMA & AKSESIBILITAS

### Performa

```tsx
// 1. WAJIB: Reduce motion support
// src/hooks/use-reduced-motion.ts
import { useEffect, useState } from 'react'

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return reduced
}

// Cara pakai:
// const reduced = useReducedMotion()
// if (reduced) return // skip animasi
```

```tsx
// 2. WAJIB: Cleanup ScrollTrigger saat unmount
// Sudah di-handle otomatis oleh useGSAP({ scope: ref })
// Pastikan selalu pakai scope!

// 3. WAJIB: Batasi jumlah ScrollTrigger aktif
// Maksimal 15 ScrollTrigger per halaman
// Gunakan ScrollTrigger.getAll().length untuk monitor

// 4. WAJIB: will-change hanya saat animasi aktif
// Jangan set will-change permanen di semua elemen
// GSAP akan set/unset ini otomatis via force3D: 'auto'
gsap.set(element, { force3D: 'auto' }) // ✅ Benar
// bukan: element.style.willChange = 'transform' // ❌ Jangan permanen
```

### Aturan CSS Global

```css
/* src/app/globals.css */

/* Smooth scroll — Lenis yang handle, ini untuk fallback */
html {
  scroll-behavior: auto !important; /* Biarkan Lenis yang kontrol */
}

/* Overflow untuk section parallax */
.parallax-section {
  overflow: hidden;
}

/* Prevent layout shift saat pin */
.pin-wrapper {
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
}

/* Reduce motion global */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## CHECKLIST IMPLEMENTASI

Sebelum push ke production, verifikasi semua item berikut:

### Setup
- [ ] `SmoothScrollProvider` ada di `layout.tsx`
- [ ] `gsap.registerPlugin(ScrollTrigger)` ada di setiap file yang menggunakannya
- [ ] Semua GSAP animation menggunakan `useGSAP` (bukan `useEffect`)
- [ ] Semua `useGSAP` punya `scope` prop

### Scrollytelling
- [ ] Setiap section punya `scrub` aktif
- [ ] Tidak ada `toggleActions` pada scrollytelling (hanya pada trigger biasa)
- [ ] Height wrapper = `(steps.length + 1) * 100vh`

### Kinetic Typography
- [ ] Semua heading target pakai `overflow: hidden` di wrapper
- [ ] Font size minimal `10vw` atau `clamp(4rem, 10vw, 8rem)`
- [ ] Stagger ada di setiap multi-element text

### Parallax
- [ ] Semua elemen parallax punya `will-change: transform` (via `force3D: 'auto'`)
- [ ] Container foto punya `overflow: hidden`
- [ ] Foto background height `130%` container
- [ ] `scrub: true` — bukan `ease` pada parallax timeline

### Pin Scrolling
- [ ] `pinSpacing: false` aktif
- [ ] `anticipatePin: 1` aktif
- [ ] Height wrapper sesuai formula
- [ ] `ScrollTrigger.refresh()` dipanggil saat resize

### General
- [ ] `useReducedMotion` diimplementasikan di semua komponen animasi utama
- [ ] Tidak ada `console.log` dari ScrollTrigger markers di production
- [ ] Test di mobile — Lenis `touchMultiplier` sudah sesuai

---

*Stack versi terkunci: gsap@3.15.0 · @gsap/react@2.1.2 · lenis@1.3.23 · motion@12.38.0 · next@15.2.3 · react@19.0.0*
