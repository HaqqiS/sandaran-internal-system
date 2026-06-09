import type { DailyReport, DailyReportTask } from "generated/prisma";

export interface DummyDailyReport extends Omit<DailyReport, "createdAt"> {
  tasks: Omit<DailyReportTask, "id" | "reportId" | "createdAt" | "updatedAt">[];
}

export const DUMMY_REPORTS: DummyDailyReport[] = [
  {
    id: "rep_sadara_1",
    projectId: "proj_sadara_boutique",
    userId: "user_mandor_1",
    slug: "laporan-harian-2026-06-08",
    reportDate: new Date("2026-06-08T00:00:00.000Z"),
    taskDescription: "Pekerjaan plesteran dinding lobi utama lantai 1 dan instalasi perkabelan ceiling.",
    progressPercent: 45,
    issues: "Pengiriman semen sempat terlambat 2 jam, namun pekerjaan tetap dapat diselesaikan sesuai target harian.",
    weather: "Cerah",
    totalWorkers: 8,
    location: "Lobi Utama Lantai 1",
    tasks: [
      {
        taskName: "Plesteran dinding area resepsionis",
        workerCount: 5,
        progress: 60,
        notes: "Menggunakan semen instan.",
      },
      {
        taskName: "Instalasi jalur kabel lampu ceiling",
        workerCount: 3,
        progress: 30,
        notes: "Material kabel konduit cukup.",
      },
    ],
  },
  {
    id: "rep_sadara_2",
    projectId: "proj_sadara_boutique",
    userId: "user_mandor_1",
    slug: "laporan-harian-2026-06-09",
    reportDate: new Date("2026-06-09T00:00:00.000Z"),
    taskDescription: "Melanjutkan plesteran dinding lobi utama dan memulai pemasangan rangka hollow untuk plafon lobi.",
    progressPercent: 55,
    issues: "Hujan deras di siang hari, pengerjaan area luar (paving pintu masuk) ditunda.",
    weather: "Hujan",
    totalWorkers: 10,
    location: "Lobi Utama & Drop Off",
    tasks: [
      {
        taskName: "Penyelesaian plesteran dinding",
        workerCount: 4,
        progress: 90,
        notes: "Siap acian besok.",
      },
      {
        taskName: "Pemasangan rangka hollow plafon",
        workerCount: 4,
        progress: 40,
        notes: "Perlu tambahan hollow 4x4.",
      },
      {
        taskName: "Persiapan landasan paving",
        workerCount: 2,
        progress: 10,
        notes: "Terhenti karena hujan.",
      },
    ],
  },
  {
    id: "rep_ba_house_1",
    projectId: "proj_ba_house",
    userId: "user_mandor_2",
    slug: "laporan-harian-ba-house-2026-04-10",
    reportDate: new Date("2026-04-10T00:00:00.000Z"),
    taskDescription: "Pembersihan akhir (final clean up) seluruh ruangan, pengecatan finishing dinding interior, dan pemasangan saklar lampu.",
    progressPercent: 100,
    issues: "Tidak ada masalah, semua pekerjaan selesai tepat waktu.",
    weather: "Cerah",
    totalWorkers: 6,
    location: "Seluruh Area Rumah",
    tasks: [
      {
        taskName: "Pengecatan finishing/touch up interior",
        workerCount: 3,
        progress: 100,
        notes: "Menggunakan cat Jotun interior.",
      },
      {
        taskName: "Pemasangan saklar dan stop kontak",
        workerCount: 1,
        progress: 100,
        notes: "Merk Panasonic matte black.",
      },
      {
        taskName: "Pembersihan sisa material & debu konstruksi",
        workerCount: 2,
        progress: 100,
        notes: "Siap untuk serah terima.",
      },
    ],
  },
];
