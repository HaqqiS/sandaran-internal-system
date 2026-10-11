"use client";

import { IconFileText, IconShieldCheck } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { ResponsiveFormDialog } from "~/components/shared/responsive-form-dialog";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";

interface TermsPrivacyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: "terms" | "privacy";
}

export function TermsPrivacyModal({
  open,
  onOpenChange,
  defaultTab = "terms",
}: TermsPrivacyModalProps) {
  const [activeTab, setActiveTab] = useState<"terms" | "privacy">(defaultTab);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  return (
    <ResponsiveFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Legal & Kebijakan Internal"
      description="Standar kepatuhan & privasi operasional Sandaran Home Living"
      cancelLabel="Saya Mengerti"
      showCancelOnly
      dialogClassName="sm:max-w-xl"
    >
      <div className="space-y-4">
        {/* Tab Selector */}
        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as "terms" | "privacy")}
          className="w-full shrink-0"
        >
          <TabsList className="grid w-full grid-cols-2 h-9">
            <TabsTrigger
              value="terms"
              className="text-xs font-semibold gap-1.5"
            >
              <IconFileText size={14} />
              <span>Ketentuan Layanan</span>
            </TabsTrigger>
            <TabsTrigger
              value="privacy"
              className="text-xs font-semibold gap-1.5"
            >
              <IconShieldCheck size={14} />
              <span>Kebijakan Privasi</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Document Content */}
        <div className="text-xs leading-relaxed text-muted-foreground space-y-4">
          {activeTab === "terms" ? (
            <div className="space-y-3.5 text-foreground/90">
              <h3 className="font-bold text-sm text-foreground">
                Ketentuan Penggunaan Sistem Internal Sandaran Home Living
              </h3>

              <div className="space-y-1">
                <h4 className="font-semibold text-xs text-foreground">
                  1. Akses dan Otorisasi
                </h4>
                <p className="text-muted-foreground">
                  Sistem ini (Sandaran Internal System) merupakan hak milik
                  eksklusif Sandaran Home Living. Akses diberikan terbatas
                  kepada karyawan internal, pekerja lepas (freelance), dan pihak
                  ketiga/vendor yang telah diberikan otorisasi resmi oleh
                  manajemen. Kredensial masuk (username dan password) bersifat
                  sangat rahasia dan dilarang keras untuk dibagikan,
                  dipinjamkan, atau dialihkan kepada pihak mana pun yang tidak
                  memiliki hak akses.
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-semibold text-xs text-foreground">
                  2. Tanggung Jawab Pengguna
                </h4>
                <p className="text-muted-foreground">
                  Setiap pengguna bertanggung jawab penuh atas segala aktivitas,
                  perubahan status proyek, input logistik, transaksi keuangan,
                  dan pelaporan harian yang dilakukan menggunakan akun
                  masing-masing. Pengguna wajib memastikan bahwa seluruh data
                  yang dimasukkan adalah akurat, faktual, dan dapat
                  dipertanggungjawabkan kebenarannya.
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-semibold text-xs text-foreground">
                  3. Kerahasiaan Data & Desain Proyek
                </h4>
                <p className="text-muted-foreground">
                  Seluruh dokumen konstruksi, gambar denah 2D/3D, spesifikasi
                  material, kalkulasi anggaran biaya (RAB), dan dokumen tender
                  yang tersimpan di dalam sistem merupakan rahasia dagang
                  perusahaan. Mengunduh, menyebarluaskan, mengambil tangkapan
                  layar (screenshot) tanpa izin tertulis, atau memanfaatkan data
                  tersebut untuk kepentingan pribadi maupun pihak ketiga di luar
                  lingkup pekerjaan resmi adalah pelanggaran berat dan tunduk
                  pada sanksi hukum yang berlaku.
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-semibold text-xs text-foreground">
                  4. Logistik dan Dana Operasional
                </h4>
                <p className="text-muted-foreground">
                  Pencatatan pengeluaran barang keluar (OUT) maupun barang masuk
                  (IN) wajib diverifikasi sesuai kondisi fisik aktual di
                  lapangan. Setiap pengajuan dana darurat (Emergency Fund) harus
                  disertai nota/bukti transaksi otentik dan akan melalui proses
                  tinjauan berjenjang oleh tim Finance atau Administrator.
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-semibold text-xs text-foreground">
                  5. Pemutusan Akses & Audit Jejak Aktivitas
                </h4>
                <p className="text-muted-foreground">
                  Manajemen berhak menonaktifkan akun sewaktu-waktu apabila
                  ditemukan indikasi penyalahgunaan wewenang, kelalaian dalam
                  pelaporan, atau pelanggaran disiplin kerja. Setiap aksi di
                  dalam sistem dicatat dalam log audit yang dapat dipantau oleh
                  tim Executive dan Administrator untuk keperluan akuntabilitas.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3.5 text-foreground/90">
              <h3 className="font-bold text-sm text-foreground">
                Kebijakan Privasi & Perlindungan Data Internal
              </h3>

              <div className="space-y-1">
                <h4 className="font-semibold text-xs text-foreground">
                  1. Informasi yang Kami Kumpulkan
                </h4>
                <p className="text-muted-foreground">
                  Sistem mengumpulkan data profil pengguna berupa Nama Lengkap,
                  Nomor WhatsApp/HP aktif, Alamat Email resmi, foto profil,
                  riwayat sesi masuk (IP address, peramban, dan waktu akses),
                  serta riwayat unggahan dokumen proyek yang Anda lakukan.
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-semibold text-xs text-foreground">
                  2. Tujuan Penggunaan Data
                </h4>
                <p className="text-muted-foreground">
                  Data yang dikumpulkan semata-mata digunakan untuk: (a)
                  identifikasi dan autentikasi otorisasi hak akses pengguna, (b)
                  komunikasi operasional proyek via WhatsApp/Email resmi, (c)
                  distribusi tugas proyek sesuai divisi (Supervisor, Arsitek,
                  Keuangan, Logistik), dan (d) pencatatan riwayat
                  pertanggungjawaban kerja harian (Daily Reports).
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-semibold text-xs text-foreground">
                  3. Keamanan Penyimpanan Data
                </h4>
                <p className="text-muted-foreground">
                  Kata sandi akun dienkripsi menggunakan algoritma hashing
                  standar industri dan tidak dapat dibaca oleh staf umum. Berkas
                  foto dokumentasi serta dokumen lampiran disimpan pada
                  infrastruktur penyimpanan awan (cloud storage) terproteksi
                  dengan kontrol hak akses yang ketat.
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-semibold text-xs text-foreground">
                  4. Pembagian Data kepada Pihak Ketiga
                </h4>
                <p className="text-muted-foreground">
                  Data di dalam sistem ini dijaga kerahasiaannya dan tidak akan
                  dijual, disewakan, atau dibagikan kepada entitas lain di luar
                  manajemen Sandaran Home Living, kecuali diwajibkan oleh proses
                  penegakan hukum yang sah.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ResponsiveFormDialog>
  );
}
