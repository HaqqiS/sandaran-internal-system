# 💬 Fase 4: Modernisasi Chat Komentar (`@reui/c-message-*`)

> **File:** `docs/plans/04-conversation-and-comments.md`  
> **Status:** ⚪ Menunggu Fase 1  
> **Dependensi:** Fase 1 (`01-registry-and-primitives.md`)  
> **Target File:**
> - [`src/components/comment/comment-list.tsx`](file:///d:/Haqqi%20Sukmara/NextJS/sandaran-internal-system/src/components/comment/comment-list.tsx)
> - [`src/components/comment/comment-item.tsx`](file:///d:/Haqqi%20Sukmara/NextJS/sandaran-internal-system/src/components/comment/comment-item.tsx)
> - [`src/components/comment/comment-form.tsx`](file:///d:/Haqqi%20Sukmara/NextJS/sandaran-internal-system/src/components/comment/comment-form.tsx)
> - Komponen Primitif:
>   - [`src/components/ui/message.tsx`](file:///d:/Haqqi%20Sukmara/NextJS/sandaran-internal-system/src/components/ui/message.tsx)
>   - [`src/components/ui/bubble.tsx`](file:///d:/Haqqi%20Sukmara/NextJS/sandaran-internal-system/src/components/ui/bubble.tsx)

---

## 🎯 1. Sasaran & Masalah yang Diselesaikan

1. **Pengalaman Percakapan Dua Sisi (Two-Sided Chat)**: Mengubah tampilan list komentar yang datar menjadi alur percakapan modern layaknya aplikasi pesan enterprise (Notion/Linear/Slack).
2. **Pemanfaatan Komponen Primitif Standar**: Mengadopsi pola `@reui/c-message-1` menggunakan komponen primitif `Message` dan `Bubble` yang telah disiapkan di Fase 1.
3. **Visibilitas Peran Anggota Proyek**: Menampilkan badge peran pengguna (`ADMIN`, `ARCHITECT`, `SUPERVISOR`, `FINANCE`) secara konsisten pada setiap balon pesan.
4. **Sentuhan Mobile Touch**: Memastikan tombol kirim dan tombol hapus mudah ditekan di layar HP (`min-h-11`).

---

## 💬 2. Spesifikasi Tampilan Pesan

```
[Kiri: Pesan Rekan / Stakeholder]
(Avatar) Wayan [SUPERVISOR]
+-------------------------------------------------------+
| Besok pagi pengecoran kolom zona barat siap dimulai. |
+-------------------------------------------------------+
14.20 WITA • 5 menit yang lalu

                                [Kanan: Pesan Sendiri]
              +---------------------------------------+
              | Baik, pastikan kubus beton uji siap.  | [🗑️]
              +---------------------------------------+
                              14.22 WITA • Baru saja (Avatar)
```

### 2.1 Pesan Sendiri (`isAuthor === true`)
- **Penataan**: `align="end"` (rata kanan).
- **Balon Chat**: Menggunakan `<Bubble variant="default">` warna `bg-primary text-primary-foreground` dengan radius kurva modern `rounded-2xl rounded-br-xs`.
- **Aksi Hapus**: Tombol hapus ikon tempat sampah dengan touch target `min-h-11 min-w-11` di mobile, terintegrasi dengan `ConfirmDeleteDialog`.
- **Avatar**: Tampil di pojok kanan bawah atau avatar mini yang rapi.

### 2.2 Pesan Rekan Proyek (`isAuthor === false`)
- **Penataan**: `align="start"` (rata kiri).
- **Avatar & Header**: Avatar di kiri (`MessageAvatar`), diikuti nama pengirim tebal dan `Badge` role (`ADMIN`, `ARCHITECT`, `SUPERVISOR`, `CLIENT`).
- **Balon Chat**: Menggunakan `<Bubble variant="muted">` atau `border` dengan sudut `rounded-2xl rounded-bl-xs` untuk membedakan dengan jelas.
- **Timestamp**: Waktu relatif menggunakan format Indonesia (`id` locale).

---

## 🛠️ 3. Rencana Teknis Implementasi

1. **Refaktor `src/components/comment/comment-item.tsx`**:
   - Ganti markup custom flex dengan `<Message align={isAuthor ? "end" : "start"}>`.
   - Bungkus konten teks dengan `<MessageContent>` dan `<Bubble>`.
   - Rapikan dialog konfirmasi hapus agar tidak memicu layout shift.
2. **Penyempurnaan `src/components/comment/comment-list.tsx`**:
   - Gunakan `<MessageGroup>` sebagai pembungkus daftar chat.
   - Pertahankan auto-scroll ke dasar list saat komentar baru masuk.
   - Sempurnakan tampilan skeleton loading agar menyerupai bentuk balon chat dua sisi.
3. **Penyempurnaan `src/components/comment/comment-form.tsx`**:
   - Pastikan input komentar memiliki keyboard shortcut `Ctrl+Enter` / `Cmd+Enter` untuk submit cepat di desktop.
   - Di mobile, tombol kirim memiliki ukuran sentuh minimum 44px dan disabled saat input kosong.

---

## 🧪 4. Kriteria Keberhasilan & Verifikasi

- [ ] Balon chat sendiri berada di kanan dengan warna primary, balon orang lain di kiri dengan warna muted.
- [ ] Badge role (`ADMIN`, `SUPERVISOR`, dll.) muncul jelas pada komentar orang lain.
- [ ] Menghapus komentar sendiri memunculkan dialog konfirmasi dan berhasil menghapus via tRPC.
- [ ] Input komentar baru otomatis menambahkan chat di bagian bawah dan me-scroll tampilan ke bawah.
- [ ] Kontras warna teks di dalam balon chat lolos uji WCAG AA di light mode dan dark mode.
- [ ] `pnpm typecheck` dan `pnpm biome check` lulus tanpa error.
