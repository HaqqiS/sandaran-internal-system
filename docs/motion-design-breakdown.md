# Motion Design Breakdown — Yurdaer Mimarlık Website
> Video: `Recording_2026-04-29_111923.mp4`
> Resolusi: 1726 × 972 px | Frame Rate: 30 fps | Durasi: ~59 detik | Format: H.264 MP4

---

## IDENTITAS BRAND

| Elemen | Detail |
|---|---|
| **Nama Studio** | Yurdaer Mimarlık |
| **Tagline Visual** | "WE DESIGN · WE BUILD · WE MERGE THE WHOLE PROCESS INTO ONE" |
| **Lokasi** | Merdivenköy Mah. Merdivenköy Cad. 33/37 – Kadıköy / İstanbul |
| **Berdiri** | Sejak 2010 |
| **Copyright** | ©2024 Yurdaer Mimarlık |
| **Design By** | FOL |
| **Sosial Media** | Instagram, LinkedIn |
| **Website Tag** | Awwwards Honors (badge teal vertikal di kanan layar) |

---

## PALET WARNA (Color Tokens)

| Nama | HEX (Estimasi) | Digunakan Pada |
|---|---|---|
| **White** | `#FFFFFF` | Background section 1, 2, 6, 17 |
| **Near-Black** | `#1A1A1A` | Teks heading utama (hitam bold) |
| **Deep Teal** | `#0D4A52` | Section "WE MERGE THE WHOLE PROCESS", objek 3D, footer logo |
| **Periwinkle Blue** | `#7B8ED8` | Section "SINCE 2010 / BASED IN ISTANBUL" |
| **Sky Blue** | `#ADD8E6` | Section statistik proyek (museums, airports, restaurants) |
| **Warm Beige / Off-white** | `#EFEDE6` | Section "WE LOVE WHAT WE DO" |
| **Dark Olive Green** | `#3B4A2F` | Section "EVERYTHING – WE DESIGN AND BUILD" |
| **Espresso Brown** | `#2E1008` | Section "KNOWLEDGE" |
| **Navy Dark Blue** | `#0B0E2D` | Section "KNOWLEDGE & PRECISION IS" |
| **Light Blue (Footer)** | `#C9E8F0` | Footer background |
| **Teal Accent** | `#2ABFB3` | Badge "W. Honors" di sisi kanan |
| **Red/Orange** | Warna aktual foto | Section foto museum merah (interior stairs) |

---

## TIPOGRAFI

### Font Utama
- **Style**: Sans-serif geometrik modern, weight bervariasi (Light hingga Black)
- **Karakter**: Huruf kapital semua (ALL CAPS), tracking normal-to-wide
- **Ukuran**: Sangat besar — headline mengisi hampir penuh lebar layar
- **Warna Teks**: Berubah sesuai background (hitam di atas putih, putih di atas gelap, dll.)

### Contoh Teks Spesifik per Section
| Section | Teks | Warna | Estimasi Font Size |
|---|---|---|---|
| Hero | `deFINED / reDEFINED` | Putih | ~200px |
| S2 | `WE DESIGN` | Hitam | ~180px |
| S3 | `WE BUILD` | Hitam | ~180px |
| S4 | `MERGE THE WHOLE PROCESS INTO ONE` | Putih | ~120px |
| S5 | `INGENUITY` | Putih | ~160px |
| S6 | `SINCE 2010` | Putih | ~180px |
| S7 | `BASED IN ISTANBUL` | Putih | ~160px |
| S8 | `WE HAVE WORKED IN` | Hitam | ~130px |
| S9 | `DIFFERENT COUNTRIES` | Biru Periwinkle | ~120px |
| S10 | `CREATING REAL ESTATE` | Hitam (tipis) | ~90px |
| S11 | `DESIGNING AND BUILDING IN MORE THAN` | Hitam | ~80px |
| S12 | `64 MUSEUMS / 13 AIRPORTS / 100+ RESTAURANTS & CAFES / PRIVATE RESIDENCES` | Biru teal (fade) | ~110px |
| S13 | `WE LOVE WHAT WE DO` | Olive Dark | ~140px |
| S14 | `KNOWLEDGE` | Peach / Salmon | ~130px |
| S15 | `& PRECISION IS` | Periwinkle pale | ~120px |
| S16 | `EVERYTHING – WE DESIGN AND BUILD` | Olive | ~120px |
| S17 | Project list (Ephesus Museum, Hagia Sophia, SEV American Collage, Hessa I Zekeriyaköy) | Hitam (light weight) | ~80px |

---

## LAYOUT & UI TETAP (Persistent Elements)

### Navbar
- **Posisi**: Fixed top
- **Logo**: Kiri atas — ikon modular berbentuk grid hitam (mirip pixel art bangunan bertingkat, ~60px)
- **Menu**: Kanan atas — teks `MENU` di dalam border kotak tipis, ~14px, uppercase
- **Background Navbar**: Transparan (mengikuti background section yang aktif)
- **Perubahan Warna Logo**: Logo berubah warna (hitam → putih) sesuai background gelap/terang

### Badge Awwwards
- **Posisi**: Fixed kanan layar, vertikal
- **Bentuk**: Tab/label teal (`#2ABFB3`), teks `W. Honors` rotasi 90° ke bawah
- **Ukuran**: ~40px lebar × ~160px tinggi

---

## BREAKDOWN SCENE-BY-SCENE

---

### 🎬 SCENE 1 — Hero: Full-bleed Architectural Photo + Text Exit
**Waktu**: 0:00 – 0:01  
**Background**: Full-screen foto render arsitektur (rumah modern bergaya kontemporer, suasana sore/dusk, langit lavender)

**Elemen UI**:
- Logo (putih/abu) — kiri atas
- Badge Awwwards — kanan
- Teks `deFINED / reDEFINED` — pojok kanan bawah, ukuran raksasa, sedang **bergerak keluar** (scroll/slide)

**Motion**:
- Saat scene dimulai, halaman sedang dalam posisi **scroll ke bawah**
- Foto bergerak ke **atas** (parallax scroll, foto lebih lambat dari teks)
- Teks `deFINED / reDEFINED` bergerak ke **atas** dengan kecepatan lebih tinggi dari foto → efek parallax berlapis
- Transisi ke scene 2: foto menyusut dan mendapat **border radius** (rounded corners ~16px), lalu mengecil menjadi kartu terapung di tengah layar

---

### 🎬 SCENE 2 — Foto Menyusut + Teks "WE DESIGN" Muncul
**Waktu**: 0:01 – 0:02.5  
**Background**: Putih bersih

**Elemen**:
- Foto arsitektur sama seperti scene 1 TAPI kini berubah menjadi **kartu persegi dengan rounded corners** (~16px radius), posisi tengah layar, ukuran ~60% lebar
- Teks `WE DESIGN` — di atas foto, uppercase hitam besar, sedang **muncul dari bawah layar** ke posisinya

**Motion Detail**:
- Foto: **scale-down** sambil mendapat border radius — durasi ~0.5 detik, easing ease-out
- Teks `WE DESIGN`: slide dari **bawah ke atas**, melewati posisi tengah, kemudian **terus naik ke atas** meninggalkan layar (karena scroll lanjut)
- Foto kartu juga mulai **naik** seiring scroll

---

### 🎬 SCENE 3 — Foto Naik + Teks "WE BUILD" Muncul dari Bawah
**Waktu**: 0:02.5 – 0:04  
**Background**: Putih

**Elemen**:
- Foto kartu bergerak ke atas (masih bergerak naik)
- Teks `WE BUILD` muncul dari bawah layar, bergerak naik

**Motion Detail**:
- Sama dengan mekanisme scene 2 — **teks slide-up from bottom**, foto terus naik
- Teks `WE BUILD` saat muncul: setiap huruf muncul dari bawah dengan slight **stagger** (beda delay ~30ms per huruf) — efek seperti huruf tumbuh satu per satu

---

### 🎬 SCENE 4 — Transisi ke Background Teal Gelap + "MERGE THE WHOLE PROCESS INTO ONE"
**Waktu**: 0:04 – 0:09  
**Background**: Dari putih → **Deep Teal `#0D4A52`** (background baru muncul dari bawah layar)

**Elemen**:
- Background teal masuk dari bawah (wipe dari bawah ke atas)
- Foto kartu arsitektur terus naik, keluar dari viewport
- Objek 3D abstrak (menara/kolom bangunan berbentuk modular, berwarna teal gelap dengan highlight metalik) **muncul dari bawah**, berputar/bergerak naik di tengah layar
- Teks `MERGE THE WHOLE PROCESS INTO ONE` — teks putih besar, muncul dari **kiri dan kanan secara bersamaan** (dua baris: "MERGE THE WHOLE PROCESS" dari kiri, "INTO ONE" dari kanan)

**Motion Detail**:
- Objek 3D: berputar pada sumbu Y ~15–20 derajat saat naik (easing ease-in-out)
- Teks: **slide dari luar layar kiri dan kanan** secara simetris, durasi ~0.6 detik
- Teks dan objek 3D **overlap** secara depth — objek 3D tampak "menembus" teks (layer mixing)

---

### 🎬 SCENE 5 — Objek 3D Berubah + Teks "INGENUITY"
**Waktu**: 0:09 – 0:12  
**Background**: Deep Teal

**Elemen**:
- Objek 3D baru (lebih kecil, berbentuk 3 blok miring/tilted) di area tengah-atas
- Teks `INGENUITY` — putih, ukuran ~160px, posisi kiri atas, bold, muncul dari bawah
- Di bawah section teal, background baru muncul: **Periwinkle Blue** (`#7B8ED8`)

**Motion**:
- Objek 3D lama (kolom) **naik keluar** dari viewport
- Objek 3D baru (blok miring) masuk dari bawah, parallax lebih lambat dari teks
- Teks `INGENUITY` slide dari bawah, settle di posisi atas

---

### 🎬 SCENE 6 — Background Periwinkle + "SINCE 2010 / BASED IN ISTANBUL"
**Waktu**: 0:12 – 0:18  
**Background**: Periwinkle Blue (`#7B8ED8`)

**Elemen**:
- Teks putih ukuran sangat besar:
  - Baris 1: `SINCE` (kiri) + `2010` (kanan)
  - Baris 2: `BASED` (kiri)
  - Baris 3: `IN` (kiri) + `ISTANBUL` (kanan)
- Ikon owl kecil hitam (logo Awwwards atau partner) muncul di tengah antara "SINCE" dan "2010"
- Section putih mulai muncul dari bawah dengan elemen kartu foto baru

**Motion**:
- Teks: setiap baris slide dari luar layar dengan arah berbeda:
  - `SINCE` → dari kiri
  - `2010` → dari kanan
  - `BASED IN` → dari kiri
  - `ISTANBUL` → dari kanan
- Stagger antar baris: ~100ms
- Saat scroll lanjut, teks bergerak naik dengan parallax

---

### 🎬 SCENE 7 — Section Putih + Foto Kartu Miring + "WE HAVE WORKED IN"
**Waktu**: 0:18 – 0:21  
**Background**: Putih

**Elemen**:
- Foto proyek (bangunan komersial modern, eksterior dengan pohon besar) dalam format **kartu persegi dengan border radius**, posisi kiri layar, **sedikit miring/rotasi ~10° searah jarum jam**
- Teks `WE HAVE WORKED IN` — hitam, ukuran besar, posisi kanan layar, muncul dari bawah

**Motion Detail**:
- Kartu foto: muncul dari bawah layar sisi kiri, slight rotation **tilt** ~8–12°
- Kartu foto: saat muncul, ada efek **3D card flip partial** — seolah kartu datang dari belakang/bawah
- Teks: slide dari bawah kanan

---

### 🎬 SCENE 8 — Background Periwinkle Light + World Map + "DIFFERENT COUNTRIES"
**Waktu**: 0:21 – 0:24  
**Background**: Periwinkle Light (`#D0D5F0`)

**Elemen**:
- World map berbentuk **dot matrix / pixel dots** berwarna putih di atas background biru-ungu
- Dot-dot berwarna **merah, hijau, oranye, biru** tersebar di peta menandai lokasi proyek di berbagai negara
- Kartu foto (interior bangunan) di sisi kanan atas, miring ~-8°
- Teks `DIFFERENT COUNTRIES` — biru bold besar, posisi bawah layar

**Motion**:
- Peta dunia: **fade in** dari transparan, muncul dengan sedikit scale-up dari 95% → 100%
- Dot marker: muncul secara **stagger random** (bukan serentak), seperti pin jatuh di peta
- Teks `DIFFERENT COUNTRIES`: slide dari bawah, bold, warna biru sama dengan background gelap

---

### 🎬 SCENE 9 — White Section + Kartu Foto + "CREATING REAL ESTATE"
**Waktu**: 0:24 – 0:27  
**Background**: Putih

**Elemen**:
- Dua kartu foto berbeda:
  - Kanan atas: interior dapur/dining area rumah modern, kartu sedikit miring ~-5°
  - Kiri bawah: eksterior apartemen bata merah, kartu miring ~+8°
- Teks `CREATING REAL ESTATE` — hitam, weight light/thin, ukuran medium, posisi tengah

**Motion**:
- Kartu foto kanan muncul dari kanan atas, sliding masuk dengan rotasi
- Kartu foto kiri muncul dari bawah kiri
- Teks slide naik dari bawah
- Kedua kartu mengikuti **parallax speed berbeda** saat scroll (kartu kiri lebih lambat)

---

### 🎬 SCENE 10 — "DESIGNING AND BUILDING IN MORE THAN" + Statistik
**Waktu**: 0:27 – 0:33  
**Background**: Putih → Sky Blue (`#ADD8E6`)

**Elemen**:
- Teks `DESIGNING AND BUILDING IN MORE THAN` — hitam medium, tengah layar
- Background berubah ke Sky Blue saat scroll
- Teks statistik bertumpuk dengan **opacity berlapis** (teks lama fade-out, teks baru fade-in):
  - `64 MUSEUMS`
  - `13 AIRPORTS`
  - `100+ RESTAURANTS & CAFES`
  - `PRIVATE RESIDENCES`
  - (diimplisikan: lebih banyak lagi)
- Setiap statistik disertai **kartu foto kecil** yang muncul di posisi berbeda (kanan atas, kiri bawah, dll.)
- Kartu foto: airport lounge, interior modern, eksterior perkantoran

**Motion**:
- Teks statistik: setiap item **slide naik dan fade** (push-up transition)
- Saat satu teks aktif, teks sebelumnya bergerak naik dengan opacity menurun (ghost effect)
- Kartu foto masing-masing statistik: muncul dari sisi berbeda dengan rotasi kecil

---

### 🎬 SCENE 11 — Background Beige + "WE LOVE WHAT WE DO"
**Waktu**: 0:33 – 0:36  
**Background**: Warm Beige/Off-white (`#EFEDE6`)

**Elemen**:
- Teks `WE LOVE WHAT WE DO` — dark olive/charcoal, dua baris, ukuran sangat besar (~140px)
- Foto proyek (eksterior bangunan bertekstur batu putih/beige dengan elemen arsitektur Mediterania) muncul dari bawah di bagian bawah layar

**Motion**:
- Teks: **kinetic typography split** — setiap kata muncul dari bawah dengan stagger ~80ms
- Khusus efek unik: saat muncul, huruf-huruf tampak **distorted/stretched secara vertikal** sesaat sebelum settle ke bentuk normal (efek elastic typeface)
- Foto: slide naik dari bawah layar

---

### 🎬 SCENE 12 — Full-bleed Foto Hijau + Kartu Detail
**Waktu**: 0:36 – 0:39  
**Background**: Full-bleed foto interior museum (kaca-kaca bertingkat, tanaman hijau) + background solid **Dark Green** (`#2A4A1C`)

**Elemen**:
- Foto interior museum berbingkai (kartu persegi dengan shadow) — posisi tengah layar
- Background hijau gelap mengelilingi kartu
- Transisi ke section berikutnya melalui scroll vertikal

**Motion**:
- Foto kartu: **zoom in subtle** (scale 1.0 → 1.05) saat di viewport
- Background hijau: wipe dari bawah ke atas

---

### 🎬 SCENE 13 — Background Espresso Brown + "KNOWLEDGE" + Grid Lines
**Waktu**: 0:39 – 0:42  
**Background**: Espresso Brown (`#2E1008`)

**Elemen**:
- Teks `KNOWLEDGE` — peach/salmon muda, ukuran besar, font weight thin/light, posisi tengah horizontal
- **Grid lines**: garis-garis vertikal dan horizontal tipis berwarna salmon/peach yang membentuk grid overlay di seluruh layar (~4 kolom, 3 baris) — efek architectural blueprint

**Motion**:
- Grid lines: **draw-on animation** — garis muncul secara bertahap dari titik tengah ke luar (seperti digambar)
- Teks `KNOWLEDGE`: fade in di atas grid, sedikit offset ke kiri saat pertama muncul lalu **slide ke posisi center**
- Durasi scene: ~2–3 detik (lebih lambat, contemplative)

---

### 🎬 SCENE 14 — Dark Navy + "& PRECISION IS" + Grid + Foto Industrial
**Waktu**: 0:42 – 0:45  
**Background**: Dark Navy Blue (`#0B0E2D`)

**Elemen**:
- Teks `& PRECISION IS` — pale periwinkle, ukuran besar, posisi atas
- Grid lines serupa scene 13, kini warna garis sangat tipis pale blue
- Foto interior industrial (plafon exposed ductwork, pabrik modern) — full bleed dari bawah, masuk saat scroll

**Motion**:
- Background wipe: dari espresso brown → navy blue
- Teks slide dari atas kanan
- Foto industrial: **parallax dari bawah**, bergerak lebih lambat dari teks saat scroll

---

### 🎬 SCENE 15 — Background Olive + "EVERYTHING – WE DESIGN AND BUILD"
**Waktu**: 0:45 – 0:48  
**Background**: Dark Olive Green (`#3B4A2F`)

**Elemen**:
- Teks dua baris:
  - `EVERYTHING` — ukuran besar, ujung kiri terpotong layar (overflow kiri)
  - `WE DESIGN AND BUILD` — ukuran besar, ujung kanan terpotong layar (overflow kanan)
- Background olive menggantikan navy
- Foto proyek merah/oranye (interior tangga merah mencolok dari museum) muncul dari bawah

**Motion**:
- Teks: **horizontal scroll overflow** — seolah teks lebih panjang dari layar, sebagian terpotong di kiri dan kanan
- Saat scroll, teks bergerak dari kanan ke kiri (ticker-like motion) OR posisi teks sudah fixed tapi hanya sebagian terlihat

---

### 🎬 SCENE 16 — Full-Bleed Foto Interior Merah (Museum Tangga)
**Waktu**: 0:48 – 0:51  
**Background**: Foto interior dominan merah (tangga merah, dinding merah, museum)

**Elemen**:
- Foto full bleed
- Bar gelap tipis di atas (dark header bar) dengan logo putih
- Navigation dots kecil di kanan bawah (2 titik putih = indikator slide/kartu)
- Sedikit terlihat: teks `( smile icon / kurva )` di kiri atas

**Motion**:
- Foto dengan **Ken Burns effect** (slow zoom in) atau parallax subtle
- Foto mengambil hampir seluruh viewport (minus header)

---

### 🎬 SCENE 17 — White Section + Project List (Marquee/Scroll)
**Waktu**: 0:51 – 0:55  
**Background**: Putih

**Elemen**:
- Daftar proyek dalam format **vertikal list**, setiap item full-width dengan **divider line** tipis antara item:
  - `EPHESUS EXPERIENCE MUSEUM`
  - `SEV AMERICAN COLLAGE ÇEKMEKÖY`
  - `HAGIA SOPHIA DIGITAL EXPERIENCE`
  - `HESSA I ZEKERİYAKÖY`
  - (dan lebih banyak)
- Font: sangat tipis (weight 100–200), uppercase, ukuran besar (~80px), tracking wide
- Teks sedikit terpotong di kanan (overflow)

**Motion**:
- List **bergerak naik** saat scroll (push-up list reveal)
- Setiap item muncul dengan **fade + translate-Y** saat masuk viewport
- Divider lines muncul dengan **draw-from-left** animation

---

### 🎬 SCENE 18 — Client Logo Grid
**Waktu**: 0:55 – 0:57  
**Background**: Putih

**Elemen**:
- Grid logo klien, satu baris terlihat:
  - TAV Construction
  - Vialand
  - BTA
  - Bilintur
  - Sağlık ve Eğitim Vakfı SEV 1968
  - DEM Experts of Experience
- Semua logo hitam pada background putih
- Grid dipisahkan oleh garis vertikal tipis (border kanan setiap kolom)

**Motion**:
- Logo: **fade in secara stagger** dari kiri ke kanan (delay ~50ms per logo)
- Grid line: muncul bersamaan dengan logo

---

### 🎬 SCENE 19 — Footer
**Waktu**: 0:57 – 0:59  
**Background**: Light Blue (`#C9E8F0`)

**Elemen**:
- Kiri atas: Navigation links — `ABOUT`, `PROJECTS`, `CONTACT` (vertikal, hitam, font medium)
- Tengah: Logo besar Yurdaer Mimarlık (versi besar dari ikon grid/pixel, teal gelap)
- Kanan atas: Alamat — `MERDİVENKÖY MAH. MERDİVENKÖY CAD. 33/37 – KADIKÖY/İSTANBUL`
- Kiri bawah: `INSTAGRAM` + `LINKEDIN`
- Kanan bawah: `TERMS OF USE | PRIVACY POLICY` + `©2024 YURDAER MİMARLIK | ALL RIGHTS RESERVED`
- Pojok kiri bawah: `DESIGN BY FOL`

**Motion**:
- Footer: **fade in** dari bawah
- Logo besar: **scale-up** dari 0.8 → 1.0 saat footer masuk viewport

---

## MEKANISME ANIMASI GLOBAL

### 1. Scroll-Driven Animation (Core Mechanic)
Seluruh animasi digerakkan oleh **scroll position** — bukan trigger klik/hover.
- Library yang kemungkinan digunakan: **GSAP ScrollTrigger** atau **Lenis + custom JS**
- Smooth scroll: ada smooth scroll momentum (tidak hard-scroll) — konsisten dengan **Lenis.js** atau **locomotive-scroll**

### 2. Parallax Berlapis (Multi-Layer Parallax)
Setiap section memiliki minimal **3 layer parallax**:
- Layer 1 (paling cepat): Teks / Typography
- Layer 2 (sedang): Kartu foto / UI card
- Layer 3 (paling lambat): Background color / foto full-bleed
- Faktor kecepatan estimasi: teks 1.5×, kartu 1.0×, background 0.6×

### 3. Section Transition System
**Dua jenis transisi** antar section:
1. **Wipe dari Bawah**: Background baru naik dari bawah layar, menutupi background lama — digunakan untuk perubahan warna drastis (putih → teal, teal → periwinkle, dll.)
2. **Dissolve/Fade dengan Overlap**: Elemen lama fade-out sambil elemen baru fade-in, terjadi saat scroll di zona overlap antara dua section

### 4. Typography Kinetic System
Semua teks menggunakan pola yang sama:
- **Masuk**: Teks slide dari bawah (translateY: +80px → 0px) + fade (opacity: 0 → 1)
- **Keluar**: Teks slide ke atas (translateY: 0 → -80px) + fade (opacity: 1 → 0)
- **Easing**: Cubic-bezier seperti `cubic-bezier(0.25, 0.46, 0.45, 0.94)` (ease-out smooth)
- **Stagger per huruf/kata**: ~30–80ms delay antar elemen

### 5. Image Card System
Foto ditampilkan dalam **"floating card"** dengan karakteristik:
- Border radius: ~12–16px
- Box shadow: `0 20px 60px rgba(0,0,0,0.15)`
- Slight rotation (tilt): ±5° hingga ±15°
- Ukuran: ~40–60% lebar viewport
- Posisi: asimetris (kiri, kanan, tengah — tidak pernah full-bleed kecuali di section khusus)
- Entry animation: slide dari bawah + slight rotation settle (masuk sedikit lebih miring, lalu settle ke rotasi final)

### 6. 3D Object Behavior
Objek 3D (menara modular, blok arsitektur) di Section 4–5:
- Render style: **Matte dark teal dengan specular highlight putih**
- Gerakan: rotate Y-axis saat scroll + translate Y ke atas
- Tidak bisa diinteraksi user (bukan Three.js realtime — kemungkinan **video loop atau Spline embedded**)

### 7. Color Sequencing
Urutan warna background mengikuti pola yang disengaja (color storytelling):
```
Putih → Putih → Putih → Deep Teal → Periwinkle → Putih → Periwinkle Light → 
Putih → Sky Blue → Beige → Dark Green → Espresso Brown → Navy → Olive → 
Merah (foto) → Putih → Light Blue (footer)
```
Setiap warna mencerminkan "mood" konten section-nya.

---

## EASING & TIMING REFERENCE

| Animasi | Duration | Easing | Notes |
|---|---|---|---|
| Teks slide masuk | 0.6s | ease-out cubic | Dari bawah +80px |
| Teks slide keluar | 0.4s | ease-in cubic | Ke atas -80px |
| Background wipe | 0.8s | ease-in-out | Full viewport height |
| Kartu foto masuk | 0.7s | ease-out cubic | + rotation settle |
| Kartu foto rotasi settle | 0.3s | spring/bounce | Akhir animasi |
| Grid lines draw-on | 1.2s | linear | SVG stroke-dashoffset |
| Logo fade stagger | 0.4s per item | ease | 50ms stagger |
| 3D object rotate | scroll-bound | ease-in-out | Per px scroll |
| Section background wipe | scroll-bound | linear | Tied ke scroll position |
| Footer scale-up | 0.5s | ease-out | On intersection |

---

## STRUKTUR HTML/CSS YANG DISARANKAN UNTUK CLONE

```
<body>
  <!-- Fixed UI -->
  <nav class="navbar fixed">
    <div class="logo"><!-- SVG pixel grid icon --></div>
    <button class="menu-btn">MENU</button>
  </nav>
  <div class="awwwards-badge fixed right">W. Honors</div>

  <!-- Sections -->
  <section class="hero full-bleed"><!-- Foto + deFINED text --></section>
  <section class="we-design white-bg"><!-- Foto card shrink + WE DESIGN --></section>
  <section class="we-build white-bg"><!-- WE BUILD --></section>
  <section class="merge teal-bg"><!-- 3D Object + MERGE THE WHOLE PROCESS --></section>
  <section class="ingenuity teal-bg"><!-- INGENUITY + periwinkle transition --></section>
  <section class="since periwinkle-bg"><!-- SINCE 2010 BASED IN ISTANBUL --></section>
  <section class="countries white-bg"><!-- WE HAVE WORKED IN --></section>
  <section class="countries-map periwinkle-light-bg"><!-- World map dots + DIFFERENT COUNTRIES --></section>
  <section class="real-estate white-bg"><!-- CREATING REAL ESTATE + dual cards --></section>
  <section class="stats sky-blue-bg"><!-- Animated statistics counter --></section>
  <section class="love beige-bg"><!-- WE LOVE WHAT WE DO --></section>
  <section class="gallery green-bg"><!-- Full-bleed museum photo --></section>
  <section class="knowledge brown-bg"><!-- KNOWLEDGE + grid lines --></section>
  <section class="precision navy-bg"><!-- & PRECISION IS + industrial photo --></section>
  <section class="everything olive-bg"><!-- EVERYTHING WE DESIGN AND BUILD --></section>
  <section class="museum-hero red-photo"><!-- Interior red stairs --></section>
  <section class="projects white-bg"><!-- Project list --></section>
  <section class="clients white-bg"><!-- Client logos grid --></section>
  <footer class="light-blue-bg"><!-- Footer --></footer>
</body>
```

---

## TECH STACK YANG DISARANKAN UNTUK CLONE

| Kebutuhan | Rekomendasi |
|---|---|
| Smooth scroll | **Lenis.js** |
| Scroll animation | **GSAP + ScrollTrigger** |
| Parallax multi-layer | **GSAP ScrollTrigger** (scrub: true) |
| 3D object | **Spline.design** (embed) atau pre-rendered video loop |
| Typography split | **GSAP SplitText** atau **splitting.js** |
| World map dots | Custom **SVG** atau **canvas** |
| Card rotation entry | **GSAP fromTo** + rotation |
| Framework | **Next.js** atau **Astro** + vanilla JS |

---

## CATATAN PENTING UNTUK REPRODUKSI

1. **Teks overflow**: Beberapa teks sengaja **terpotong di tepi layar** — ini disengaja, bukan bug. Overflow: hidden di container, teks ukuran > 100vw.
2. **Foto kartu miring**: Rotasi kartu bukan random — ada pola: kartu dari kiri berotasi positif (+), kartu dari kanan berotasi negatif (-).
3. **Warna teks adaptif**: Logo dan teks berubah warna otomatis berdasarkan background section — gunakan **CSS mix-blend-mode: difference** atau JavaScript intersection observer untuk toggle class.
4. **Statistik bertumpuk**: Section statistik (museums, airports, dll.) bukan carousel biasa — menggunakan **scroll-pinned section** di mana background pinned dan teks berganti setiap scroll segment.
5. **Badge Awwwards**: Fixed di kanan layar sepanjang scroll, warna badge selalu `#2ABFB3` teal.
6. **Cursor**: Kursor standar (panah default browser) — tidak ada custom cursor.

---

*Dokumen dibuat berdasarkan analisis frame-by-frame video Recording_2026-04-29_111923.mp4*
*Total frame dianalisis: 30 frame (setiap 1.5–3 detik sepanjang 59 detik)*
