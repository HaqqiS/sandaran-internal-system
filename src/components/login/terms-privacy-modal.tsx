"use client";

import { IconFileText, IconShieldCheck } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] flex flex-col p-5 gap-3">
        <DialogHeader className="space-y-1 text-left border-b pb-3">
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            {activeTab === "terms" ? (
              <IconFileText size={18} className="text-primary" />
            ) : (
              <IconShieldCheck size={18} className="text-primary" />
            )}
            <span>Legal & Kebijakan Internal</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Standar kepatuhan & privasi operasional Sandaran Home Living
          </DialogDescription>
        </DialogHeader>

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

        {/* Scrollable Document Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain pr-2 text-xs leading-relaxed text-muted-foreground space-y-4 max-h-[50vh]">
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
                  Setiap tindakan yang dilakukan menggunakan akun Anda
                  sepenuhnya merupakan tanggung jawab Anda. Seluruh pengguna,
                  baik internal maupun pihak ketiga, diwajibkan untuk:
                </p>
                <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                  <li>
                    Menggunakan sistem semata-mata untuk kepentingan
                    operasional, proyek, dan bisnis Sandaran Home Living.
                  </li>
                  <li>
                    Memastikan data yang diinput (seperti progres pengerjaan,
                    laporan proyek, dll) akurat dan sesuai dengan kondisi di
                    lapangan.
                  </li>
                  <li>
                    Segera melaporkan kepada administrator jika mencurigai
                    adanya penggunaan akun oleh pihak yang tidak bertanggung
                    jawab.
                  </li>
                </ul>
              </div>

              <div className="space-y-1">
                <h4 className="font-semibold text-xs text-foreground">
                  3. Kerahasiaan Data (Confidentiality)
                </h4>
                <p className="text-muted-foreground">
                  Seluruh informasi di dalam sistem ini, termasuk data klien,
                  rancangan desain, detail operasional proyek, dan informasi
                  internal lainnya adalah Rahasia Perusahaan. Pengguna dilarang
                  mengunduh, menyalin, menyebarkan, atau menggunakan data
                  tersebut untuk kepentingan pribadi atau pihak lain di luar
                  lingkup kerja sama dengan Sandaran Home Living.
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-semibold text-xs text-foreground">
                  4. Pemantauan Sistem
                </h4>
                <p className="text-muted-foreground">
                  Manajemen Sandaran Home Living berhak memantau dan mencatat
                  semua aktivitas pengguna di dalam sistem untuk memastikan
                  kelancaran operasional dan mencegah kebocoran data.
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-semibold text-xs text-foreground">
                  5. Pelanggaran dan Sanksi
                </h4>
                <p className="text-muted-foreground">
                  Penyalahgunaan data atau pelanggaran terhadap ketentuan ini
                  dapat mengakibatkan pencabutan hak akses secara langsung.
                  Manajemen berhak menjatuhkan sanksi berupa teguran, pemutusan
                  hubungan kerja (untuk karyawan internal), pemutusan kontrak
                  kerja sama (untuk pekerja lepas/pihak ketiga), hingga menempuh
                  jalur hukum apabila ditemukan kerugian materiil atau imateriil
                  bagi perusahaan.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3.5 text-foreground/90">
              <h3 className="font-bold text-sm text-foreground">
                Kebijakan Privasi Sistem Internal Sandaran Home Living
              </h3>

              <div className="space-y-1">
                <h4 className="font-semibold text-xs text-foreground">
                  1. Pengumpulan Data
                </h4>
                <p className="text-muted-foreground">
                  Dalam pengoperasian Sandaran Internal System, kami
                  mengumpulkan data teknis dan operasional yang meliputi:
                </p>
                <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                  <li>
                    <strong className="text-foreground">
                      Data Profil Pengguna:
                    </strong>{" "}
                    Nama, peran/divisi, dan informasi kontak (berlaku untuk
                    karyawan, freelancer, maupun pihak ketiga).
                  </li>
                  <li>
                    <strong className="text-foreground">Log Aktivitas:</strong>{" "}
                    Catatan waktu akses (login/logout), modifikasi data
                    (penambahan, perubahan, penghapusan data), alamat IP, dan
                    jenis perangkat yang digunakan.
                  </li>
                  <li>
                    <strong className="text-foreground">
                      Data Operasional:
                    </strong>{" "}
                    File, laporan, atau media yang diunggah pengguna ke dalam
                    sistem terkait dengan proyek.
                  </li>
                </ul>
                <p className="rounded bg-muted/60 p-2 text-[11px] text-muted-foreground italic border-l-2 border-primary">
                  Catatan: Sistem ini tidak melakukan pengumpulan data geolokasi
                  (pelacakan lokasi fisik) pengguna dari perangkat yang
                  digunakan.
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-semibold text-xs text-foreground">
                  2. Penggunaan Data
                </h4>
                <p className="text-muted-foreground">
                  Data yang dikumpulkan secara eksklusif digunakan untuk:
                </p>
                <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                  <li>
                    Memonitor progres proyek dan kelancaran operasional harian
                    Sandaran Home Living.
                  </li>
                  <li>
                    Menjaga keamanan jaringan dan integritas sistem dari akses
                    yang tidak sah.
                  </li>
                  <li>
                    Keperluan audit, investigasi insiden, dan evaluasi
                    kinerja/pekerjaan.
                  </li>
                </ul>
              </div>

              <div className="space-y-1">
                <h4 className="font-semibold text-xs text-foreground">
                  3. Masa Penyimpanan Data (Retention) dan Keamanan
                </h4>
                <p className="text-muted-foreground">
                  Semua data disimpan di dalam infrastruktur yang dikelola oleh
                  Sandaran Home Living dengan kontrol akses berbasis peran
                  (RBAC). Data log aktivitas pengguna dan riwayat operasional
                  akan disimpan selama periode 2 (dua) hingga 3 (tiga) tahun.
                  Setelah periode tersebut, data log dapat dihapus secara
                  permanen atau diarsipkan secara tertutup sesuai dengan
                  kebijakan pembersihan data perusahaan.
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-semibold text-xs text-foreground">
                  4. Pembagian Data
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

        <DialogFooter className="pt-2 border-t mt-1">
          <Button
            type="button"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto h-8 text-xs font-semibold"
          >
            Saya Mengerti
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
